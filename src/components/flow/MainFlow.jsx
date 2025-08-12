/* eslint-disable react-hooks/exhaustive-deps */
import {
    Background,
    Controls,
    Panel,
    ReactFlow,
    useEdgesState,
    useNodesState,
    useReactFlow
} from "@xyflow/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { initialNodes } from './utils/initials-elements';

// mui
import {
    Alert,
    Box,
    Button,
    Card,
    Grid,
    Modal,
    Snackbar,
    Stack,
    Typography,
} from "@mui/material";
// import Modal from 'react-modal';
import '@xyflow/react/dist/style.css';
import '../../App.css';

//Custom compoonents and hooks
import SidebarFlow from './SidebarFlow';
import { useFlowState } from './flow-hooks/useFlowState';
import useNodeClick from './flow-hooks/useNodeClick';
import useNodeDrag from './flow-hooks/useNodeDrag';
import useNodeDragStart from './flow-hooks/useNodeDragStart';
import useNodeDragStop from './flow-hooks/useNodeDragStop';
import useRestoreFlow from './flow-hooks/useRestoreFlow';
import useSaveFlow from './flow-hooks/useSaveFlow';
import InstanceNodeForm from './forms/InstanceNodeForm';
import SubNetworkNodeForm from './forms/SubNetworkNodeForm';
import RouterNodeForm from './forms/RouterNodeForm';
import VPCNodeForm from './forms/VPCNodeForm';
import InstanceNode from "./node-types/InstanceNode";
import RouterNodeInstance from "./node-types/RouterNodeInstance";
import VPCNodeInstance from "./node-types/VPCNodeInstance";
import SubNetworkNodeInstance from './node-types/SubNetworkNodeInstance';
import useCidrBlockVPCStore from './store/cidrBlocksIp';
import useClickedNodeIdStore from './store/clickedNodeIdStore';

// Importar constantes
import {
    colorBgInstanceNode,
    colorsBgSubnetworksNodes,
    DB_AMI_LIST,
    flowKey,
    heightDefaultInstanceNode,
    heightDefaultInstanceRouter,
    heightDefaultSubNetworkNode,
    TYPE_COMPUTER_NODE,
    TYPE_DEFAULT_NODE,
    TYPE_PRINTER_NODE,
    TYPE_ROUTER_NODE,
    TYPE_SERVER_NODE,
    TYPE_SUBNETWORK_NODE,
    TYPE_VPC_NODE,
    widthDefaultInstanceNode,
    widthDefaultInstanceRouter,
    widthDefaultSubNetworkNode,
} from './utils/constants';

import { collection, getDocs } from "firebase/firestore";
import { NetworkProvider } from "../../contexts/NetworkNodesContext";
import { db } from "../../firebase/firebaseConfig";
import useDeployNetwork from "./flow-hooks/useDeployNetwork";
import RouteTableForm from "./forms/RouteTableForm";
import RouteTableFormFullScreen from "./forms/RouteTableFormFullScreen";
import getNodeTitle from "./utils/getNodeTitle";
import { LoadingFlowContext } from "../../contexts/LoadingFlowContext";
import { useContext } from "react";
import { useRestrictSubnetsInsideVPC } from "./flow-hooks/useRestrictSubnetsInsideVPC";
import useHandleDrop from "./flow-hooks/useHandleDrop";
import useRestrictMovement from "./flow-hooks/useRestrictMovement";




//const connectionLineStyle = { stroke: "white" };

const nodeTypes = {
    vpc: VPCNodeInstance,
    subnetwork: SubNetworkNodeInstance,
    router: RouterNodeInstance,
    computer: InstanceNode,
    printer: InstanceNode,
    server: InstanceNode
}


const restrictedNodes = [TYPE_DEFAULT_NODE, TYPE_COMPUTER_NODE, TYPE_PRINTER_NODE, TYPE_SERVER_NODE]


const makeRandomId = (length) => {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// eslint-disable-next-line no-unused-vars
let id = makeRandomId(10);

const getId = {
    nextId: () => makeRandomId(100),
    setId: (newId) => { id = newId; }
};





const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};


const connectionLineStyle = {
    strokeWidth: 3,
    stroke: 'black',
};

// eslint-disable-next-line react-refresh/only-export-components
function MainFlow() {
    const { vpcid } = useParams()

    const initialEdges = [];
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [restorationDone, setRestorationDone] = useState(false);
    const { loadingFlow } = useContext(LoadingFlowContext);
    useRestrictSubnetsInsideVPC()
    const reactFlow = useReactFlow();

    // eslint-disable-next-line no-unused-vars
    const [target, setTarget] = useState(null);
    const [amiList, setAmiList] = useState([])
    // eslint-disable-next-line no-unused-vars
    const [clickedNodeId, setClickedNodeId] = useClickedNodeIdStore(state => [state.clickedNodeId, state.setClickedNodeId])

    const [cidrBlockVPC, prefixLength, setCidrBlockVPC, setPrefixLength] = useCidrBlockVPCStore(state => [
        state.cidrBlockVPC,
        state.prefixLength,
        state.setCidrBlockVPC,
        state.setPrefixLength
    ]);


    // eslint-disable-next-line no-unused-vars
    const [nodeName, setNodeName] = useState("Node - 1")
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const { setViewport } = useReactFlow();

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null);

    const [openRouteTableFullScreen, setOpenRouteTableFullScreen] = useState(false);

    const { onDrop } = useHandleDrop(reactFlowInstance, setNodes);
    const { onNodeDragStop } = useRestrictMovement(reactFlowInstance, setNodes);

    // const [vpcData, setVPCData] = useState(null);

    const reactFlowWrapper = useRef(null);
    const dragRef = useRef(null);
    //const connectionCreated = useRef(true)

    const { isValidConnection, onConnectStart, onConnect, onConnectEnd } = useFlowState()

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);


    const onNodeClick = useNodeClick(setSelectedNode, setModalIsOpen, setOpenRouteTableFullScreen);


    const closeModal = () => {
        setModalIsOpen(false)
        setSelectedNode(null)
    }

    const saveNodeData = (data) => {
        console.log();
        
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === selectedNode.id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            ...data
                        }
                    }
                }
                return node
            })
        )

        onSaveFlow()
        closeModal()
    }

    const deleteNodeInstance = () => {

        setNodes((nds) => {
            const nodeToDelete = nds.find((node) => node.id === clickedNodeId);
            // console.log("nodeToDelete: ", nodeToDelete.type);

            if (!nodeToDelete) {
                // console.log("Node not found");
                return nds;
            }

            // ---- Borrado recursivo desde nodo tipo VPC ----
            if (nodeToDelete.type === TYPE_VPC_NODE) {

                //1. Encontrar todo los nodos subnets de la VPC
                const subnetworksToDelete = nds.filter((node) => node.parentNode === nodeToDelete.id && node.type === TYPE_SUBNETWORK_NODE);

                //2. Encuentra todas las Instancias e hijos de las subnets
                const subnetIds = subnetworksToDelete.map((subnet) => subnet.id);
                const instancesToDelete = nds.filter((node) => subnetIds.includes(node.parentNode));


                //3. Filtrar fuera: la VPC, sus Subnets y todas las Instancias hijas
                return nds.filter((n) =>
                    n.id !== nodeToDelete.id && // Quita la VPC
                    !subnetIds.includes(n.id) && // Quita las subnets hijas
                    !instancesToDelete.some((inst) => inst.id === n.id) // Quita instancias hijas de las subnets
                )
            }


            // ---- Borrado recursivo desde nodo tipo Subnet ----
            if (nodeToDelete.type === TYPE_SUBNETWORK_NODE) {
                // 1. Encuentra todas las Instancias dentro de la Subnet
                const instancesToDelete = nds.filter((n) => n.parentNode === nodeToDelete.id);
                // 2. Filtra fuera la Subnet y sus hijos
                return nds.filter(
                    (n) =>
                        n.id !== nodeToDelete.id &&
                        !instancesToDelete.some((inst) => inst.id === n.id)
                );
            }

            return nds.filter((node) => node.id !== clickedNodeId);

        })


        // setNodes((nds) => nds.filter((node) => node.id !== clickedNodeId))
        // // console.log(`Node with ID: ${clickedNodeId} has been deleted`);
        closeModal()

    }


    const onNodeDragStart = useNodeDragStart({ dragRef });
    const onNodeDrag = useNodeDrag({ nodes, setTarget, TYPE_SUBNETWORK_NODE });
    //const onNodeDragStop = useNodeDragStop({ nodes, setNodes, reactFlow, TYPE_SUBNETWORK_NODE, TYPE_VPC_NODE });
    const onSaveFlow = useSaveFlow({ reactFlowInstance, flowKey, vpcid });
    const onRestoreFlow = useRestoreFlow({ setNodes, setEdges, setViewport, flowKey, getId });

    const {
        showConfirmation,
        transformedData,
        processJsonToCloud,
        handleCancelDeploy,
        handleConfirmDeploy,
        successMessage,
        errorMessage,
        handleCloseSnackbar
    } = useDeployNetwork({ nodes, edges })

    useEffect(() => {


        return () => {
            // console.log("nodes useffect", nodes);
            // console.log("cidrBlockVPC: ", cidrBlockVPC);


        }
    }, [nodes])

    useEffect(() => {
        if (restorationDone) {
            // console.log("✅ CIDR restaurado:", cidrBlockVPC, prefixLength);
        }
    }, [restorationDone, cidrBlockVPC, prefixLength]);



    const fetchAmiList = async () => {
        try {
            const amiListCollection = collection(db, DB_AMI_LIST)
            const amiListSnapshot = await getDocs(amiListCollection)
            const amiListResponse = amiListSnapshot.docs.map(doc => ({
                id: doc.id, ...doc.data()
            }))
            // console.log("amiListResponse: ", amiListResponse);

            setAmiList(amiListResponse)
        } catch (error) {
            console.error('Error fetching AMI list:', error);
        }
    }

    useEffect(() => {
        const handleFlowRestore = async () => {
            fetchAmiList()
            await onRestoreFlow();
            setRestorationDone(true);
        }
        handleFlowRestore();
    }, [onRestoreFlow]);


    useEffect(() => {
        setNodes((nds) => nds.map((node) => {

            // console.log("Clicked Node ID in MainFlow:", clickedNodeId);
            if (node.id === clickedNodeId) {
                return {
                    ...node,
                    data: {
                        ...node.data,

                    }
                }
            }
            return node
        })

        )


    }, [clickedNodeId, nodeName, setNodes])


    // Función para restaurar los nodos a su estado inicial
    const restoreInitialNodes = () => {
        setNodes(initialNodes);
    };

    if (loadingFlow) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography variant="h6">🔄 Restaurando red... espera un momento</Typography>
            </Box>
        );
    }

    return (
        <NetworkProvider>
            <Grid container >
                <Grid item xs={12} sm={2} md={2}>

                    <Card
                        sx={{
                            height: { sm: "60vh" },
                            my: { xs: 1, sm: 0 },
                            borderRadius: { xs: 2, sm: "16px 0 0 16px" },
                        }}
                    >
                        <SidebarFlow />

                    </Card>
                </Grid>

                <Grid item xs={12} sm={10} md={10}>
                    <Card sx={{
                        width: "100%",
                        height: "100vh",
                        borderRadius: { xs: 2, sm: "0 16px 16px 0" },
                    }}
                        ref={reactFlowWrapper} >
                        <ReactFlow
                            nodes={nodes}
                            edges={edges.map(edge => ({ ...edge, style: connectionLineStyle }))}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onNodeClick={onNodeClick}
                            onConnect={(params) => onConnect(params, setEdges)}
                            onInit={setReactFlowInstance}
                            onDrop={onDrop}
                            onNodeDragStart={onNodeDragStart}
                            onNodeDrag={onNodeDrag}
                            onNodeDragStop={onNodeDragStop}
                            onDragOver={onDragOver}
                            snapToGrid
                            onConnectStart={onConnectStart}
                            onConnectEnd={onConnectEnd}
                            fitViewOptions={{
                                padding: 0.2,
                            }}
                            isValidConnection={(connection) => isValidConnection(connection, nodes)}
                            className="overview"
                            nodeTypes={nodeTypes}
                            nodeOrigin={[0, 0]}
                            style={{
                                backgroundColor: "#D3D2E5",
                            }}
                            connectionLineStyle={connectionLineStyle}
                        >

                            <Panel position="top-right">
                                <Stack spacing={1}>
                                    <Button onClick={onSaveFlow} variant="contained" color="secondary">
                                        Save
                                    </Button>
                                    <Button onClick={onRestoreFlow} variant="contained" color="warning">
                                        Restore
                                    </Button>
                                    <Button
                                        onClick={restoreInitialNodes}
                                        variant="contained"
                                        color="primary"
                                    >
                                        Restore To Initial
                                    </Button>
                                    <Button
                                        onClick={processJsonToCloud}
                                        variant="contained"
                                        color="primary"
                                    >
                                        Deploy Network
                                    </Button>
                                </Stack>
                            </Panel>

                            <Controls />
                            <Background variant="lines" />
                        </ReactFlow>
                    </Card>
                </Grid>

                <Modal
                    open={modalIsOpen}
                    onClose={closeModal}
                    aria-labelledby="parent-modal-title"
                    aria-describedby="parent-modal-description"
                >
                    <Box sx={{ ...style, width: 400 }}>


                        {selectedNode && restrictedNodes.includes(selectedNode.type) && (() => {
                            const parentSubnet = nodes.find(n => n.id === selectedNode.parentId);
                            const subnetCidr = parentSubnet?.data?.cidrBlock || "";

                            return (
                                <InstanceNodeForm
                                    nodeData={selectedNode.data}
                                    onSave={saveNodeData}
                                    cidrBlockVPC={subnetCidr}
                                    amiList={amiList}
                                    deleteNode={deleteNodeInstance}
                                />
                            );
                        })()}

                        {selectedNode && selectedNode.type === TYPE_SUBNETWORK_NODE && (
                            <SubNetworkNodeForm nodeData={selectedNode.data} onSave={saveNodeData} cidrBlockVPC={cidrBlockVPC} deleteNode={deleteNodeInstance} />
                        )}
                        {selectedNode && selectedNode.type === TYPE_ROUTER_NODE && (
                            <RouterNodeForm nodeData={selectedNode.data} onSave={saveNodeData} cidrBlockVPC={cidrBlockVPC} deleteNode={deleteNodeInstance} />
                        )}
                        {selectedNode && selectedNode.type === TYPE_VPC_NODE && (() => {

                            //1) VLAN CIDR maestro desde store
                            const vlanCidr = (cidrBlockVPC && prefixLength)
                                ? `${cidrBlockVPC}/${prefixLength}`
                                : "";
                            //2) CIDRs de otras VPC-hija (excluye la seleccionada)
                            const siblingVpcCidrs = nodes
                                .filter(n => n.type === TYPE_VPC_NODE && n.id !== selectedNode.id)
                                .map(n => {
                                    const base = n.data?.cidrBlock;
                                    const pref = n.data?.prefixLength;
                                    return base && pref ? `${base}/${pref}` : null;
                                }).filter(Boolean);

                            return (
                                <VPCNodeForm
                                    nodeData={selectedNode.data}
                                    onSave={saveNodeData}
                                    deleteNode={deleteNodeInstance}
                                    vlanCidr={vlanCidr}                 // <-- pasa VLAN CIDR
                                    siblingVpcCidrs={siblingVpcCidrs}   // <-- pasa lista de VPC CIDRs hermanas
                                />

                            )

                        })()}


                    </Box>
                </Modal>


                {selectedNode && (
                    <RouteTableFormFullScreen
                        openModalRouteTable={openRouteTableFullScreen}
                        handleOpenDialog={() => setOpenRouteTableFullScreen(false)}
                        node={selectedNode}
                        onSave={saveNodeData}
                    />
                )}


                {/* Modal to confirm deploy */}

                <Modal
                    open={showConfirmation}
                    onClose={handleCancelDeploy}
                    aria-labelledby="parent-modal-title"
                    aria-describedby="parent-modal-description"
                >
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '60%',
                        height: '70%',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        overflow: 'hidden',
                    }}>
                        <Typography id="confirm-deploy-modal-title" variant="h6" component="h2" >
                            Confirm Deployment
                        </Typography>
                        <Typography id="confirm-deploy-modal-description" sx={{ mt: 2 }}>
                            Are you sure you want to deploy the network with the following configuration?
                        </Typography>

                        <Box
                            sx={{
                                maxHeight: '75%',
                                overflowY: 'auto',
                                mt: 2,
                                border: '1px solid #ccc',
                                padding: 2,
                                height: '100%'
                            }}
                        >
                            <pre>{JSON.stringify(transformedData, null, 2)}</pre>
                        </Box>


                        <Stack mt={3} direction="row" spacing={2} xs={{ mt: 5 }} flexWrap="wrap">
                            <Button variant="contained" color="primary" onClick={handleConfirmDeploy}>
                                Confirm
                            </Button>
                            <Button variant="outlined" color="secondary" onClick={handleCancelDeploy}>
                                Cancel
                            </Button>
                        </Stack>

                    </Box>

                </Modal>


                <Snackbar
                    open={!!successMessage}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert
                        severity="success"
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        {successMessage}
                    </Alert>
                </Snackbar>
                <Snackbar
                    open={!!errorMessage} ç
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert
                        severity="error"
                    >
                        {errorMessage}
                    </Alert>
                </Snackbar>

            </Grid>
        </NetworkProvider>




    )
}

export default MainFlow