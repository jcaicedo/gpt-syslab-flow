import { useState } from "react";
import axios from "axios";
import { TYPE_ROUTER_NODE, TYPE_SUBNETWORK_NODE } from "../utils/constants";
import { useContext } from "react";
import { LoadingFlowContext } from "../../../contexts/LoadingFlowContext";
import useCidrBlockVPCStore from "../store/cidrBlocksIp";
import { useAuth } from "../../../contexts/AuthContext";
import { Netmask } from "netmask";

const validateSubnetsCidrs = (subnetworkNodes) => {
  const invalidSubnets = [];

  subnetworkNodes.forEach(subnet => {
    const cidr = subnet.data?.cidrBlock;
    if (!cidr) {
      invalidSubnets.push({ name: subnet.data?.subnetName || subnet.id, reason: "CIDR missing" });
      return;
    }
    try {
      new Netmask(cidr);
    } catch (error) {
      invalidSubnets.push({ name: subnet.data?.subnetName || subnet.id, reason: "Invalid CIDR format" });
    }
  });

  return invalidSubnets;
};

const isRouteDestinationValid = (destinationCidr, subnets) => {
  return subnets.some(subnet => subnet.data?.cidrBlock === destinationCidr);
};

const getConnectedRouter = (subnetNode, routerNodes, edges) => {
  return routerNodes.find(router =>
    edges.some(edge =>
      (edge.source === router.id && edge.target === subnetNode.id) ||
      (edge.source === subnetNode.id && edge.target === router.id)
    )
  );
};




const useDeployNetwork = ({ nodes, edges }) => {



  const { user } = useAuth();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transformedData, setTransformedData] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const { setLoadingFlow } = useContext(LoadingFlowContext);
  const [cidrBlockVPC, prefixLength] = useCidrBlockVPCStore(state => [state.cidrBlockVPC, state.prefixLength]);

  const processJsonToCloud = () => {
    const routerNodes = nodes.filter(n => n.type === TYPE_ROUTER_NODE);
    const subnetworkNodes = nodes.filter(n => n.type === TYPE_SUBNETWORK_NODE);

    const invalidSubnets = validateSubnetsCidrs(subnetworkNodes);

    if (invalidSubnets.length > 0) {
      console.error("Subnets with invalid CIDRs detected:", invalidSubnets);
      const message = `Subredes inválidas:\n${invalidSubnets.map(sub => `${sub.name}: ${sub.reason}`).join("\n")}`;
      setErrorMessage(message);
      return;
    }

    if (!cidrBlockVPC || !prefixLength) {
      throw new Error("CIDR block and prefix length are required");
    }


    console.log("prefixLength", prefixLength);

    const vpc = {
      name: "awsdevvpc",
      cidr_block: `${cidrBlockVPC}/${prefixLength}`,
      internet_gateway: false,
      nat_gateway: {
        enabled: false,
        public_subnet: "",
        elastic_ip: ""
      },
      subnets: [],
      route_tables: []
    };

    const routerRouteTableMap = {}; // router ID → routeTableName

    // Procesar routers
    routerNodes.forEach((routerNode, index) => {


      const routeEntries = routerNode.data?.routeTable || [];
      console.log("routerNode routeTable:", routeEntries);
      const validRoutes = [];

      routeEntries.forEach((route, i) => {


        if (!isRouteDestinationValid(route.destinationCidrBlock, subnetworkNodes)) {
          console.warn(`Route ${route.destinationCidrBlock} does not match any existing subnet`);
          return;
        }


        validRoutes.push({
          name: `route-${i + 1}`,
          dest_cidr: route.destinationCidrBlock
        });
      });

      if (validRoutes.length > 0) {
        const routeTableName = routerNode.data?.routeTableName || `route-table-${index + 1}`;
        vpc.route_tables.push({
          name: routeTableName,
          routes: validRoutes
        });

        routerRouteTableMap[routerNode.id] = routeTableName;
      }

      if (routerNode.data?.internetGateway) {
        vpc.internet_gateway = true;
      }

      if (routerNode.data?.natGateway) {
        vpc.nat_gateway.enabled = true;
        vpc.nat_gateway.public_subnet = routerNode.data?.natGatewayPublicSubnet || "";
        vpc.nat_gateway.elastic_ip = routerNode.data?.natGatewayElasticIp || "";
      }
    });

    // Procesar subredes
    // subnetworkNodes.forEach((subnetNode) => {
    //   const connectedRouter = routerNodes.find(router =>
    //     edges.some(edge =>
    //       (edge.source === router.id && edge.target === subnetNode.id) ||
    //       (edge.source === subnetNode.id && edge.target === router.id)
    //     )
    //   );


    //   const routeTableName = connectedRouter ? routerRouteTableMap[connectedRouter.id] : "public";

    //   const subnet = {
    //     name: subnetNode.data.subnetName || `subnet-${subnetNode.id}`,
    //     cidr_block: subnetNode.data.cidrBlock,
    //     availability_zone: subnetNode.data.zone,
    //     public_ip: subnetNode.data.publicIp,
    //     route_table: routeTableName,
    //     instances: []
    //   };

    //   const instances = nodes.filter(node => node.parentId === subnetNode.id);
    //   instances.forEach(instance => {
    //     subnet.instances.push({
    //       id: instance.id,
    //       ami: instance.data.ami || "ami-default",
    //       instance_type: instance.data.instanceType,
    //       ip_address: instance.data.ipAddress,
    //       name: instance.data.name,
    //       ssh_access: instance.data.sshAccess
    //     });
    //   });

    //   vpc.subnets.push(subnet);
    // });

    subnetworkNodes.forEach((subnetNode) => {
      const connectedRouter = getConnectedRouter(subnetNode, routerNodes, edges);
      const routeTableName = connectedRouter ? routerRouteTableMap[connectedRouter.id] : "public";

      // Determinar con qué subredes NO tiene conexión
      const accessibleSubnets = subnetworkNodes.filter(other => {
        if (other.id === subnetNode.id) return false;
        const otherRouter = getConnectedRouter(other, routerNodes, edges);
        return connectedRouter && otherRouter && otherRouter.id === connectedRouter.id;
      });

      const deniedCidrs = subnetworkNodes
        .filter(n => !accessibleSubnets.includes(n) && n.id !== subnetNode.id)
        .map(n => n.data?.cidrBlock)
        .filter(cidr => !!cidr);


      const subnet = {
        name: subnetNode.data.subnetName || `subnet-${subnetNode.id}`,
        cidr_block: subnetNode.data.cidrBlock,
        availability_zone: subnetNode.data.zone,
        public_ip: subnetNode.data.publicIp,
        route_table: routeTableName,
        denied_cidrs: deniedCidrs,
        instances: []
      };

      const instances = nodes.filter(node => node.parentId === subnetNode.id);
      instances.forEach(instance => {
        subnet.instances.push({
          id: instance.id,
          ami: instance.data.ami || "ami-default",
          instance_type: instance.data.instanceType,
          ip_address: instance.data.ipAddress,
          name: instance.data.name,
          ssh_access: instance.data.sshAccess
        });
      });

      vpc.subnets.push(subnet);
    });


    setTransformedData({
      cloud: "aws",
      vpcs: [vpc]
    });

    setShowConfirmation(true);
  };

  const handleConfirmDeploy = async () => {
    setShowConfirmation(false);
    setLoadingFlow(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const url_api = user.settings.general.url_api_aws;
      await axios.post(url_api, transformedData);
      setLoadingFlow(false);
      setSuccessMessage("Deploy successful");
    } catch (error) {
      setLoadingFlow(false);
      setErrorMessage("Deploy failed. Please try again");
    }
  };

  const handleCancelDeploy = () => {
    setShowConfirmation(false);
    setTransformedData(null);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return {
    showConfirmation,
    transformedData,
    successMessage,
    errorMessage,
    processJsonToCloud,
    handleCancelDeploy,
    handleConfirmDeploy,
    handleCloseSnackbar
  };
};

export default useDeployNetwork;
