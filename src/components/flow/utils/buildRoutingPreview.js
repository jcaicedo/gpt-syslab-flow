// src/components/flow/utils/buildRoutingPreview.js
import { TYPE_VPC_NODE, TYPE_ROUTER_NODE } from "../utils/constants";

/**
 * Construye un preview de tablas de ruteo por VPC a partir de nodes + edges.
 * - Intra-VPC => ruta 'local'
 * - Inter-VPC => entradas desde los routers conectados cuyo sourceVpcId === VPC
 */
export function buildRoutingPreview(nodes, edges) {
  const vpcs = nodes.filter(n => n.type === TYPE_VPC_NODE);
  const routers = nodes.filter(n => n.type === TYPE_ROUTER_NODE);

  const idToNode = new Map(nodes.map(n => [n.id, n]));
  const idToType = new Map(nodes.map(n => [n.id, n.type]));

  // VPC -> Set<routerId> a partir de edges
  const vpcToRouters = new Map();
  edges.forEach(e => {
    const sType = idToType.get(e.source);
    const tType = idToType.get(e.target);
    const isVpcRouter =
      (sType === TYPE_VPC_NODE && tType === TYPE_ROUTER_NODE) ||
      (sType === TYPE_ROUTER_NODE && tType === TYPE_VPC_NODE);
    if (!isVpcRouter) return;

    const vpcId    = (sType === TYPE_VPC_NODE)    ? e.source : e.target;
    const routerId = (sType === TYPE_ROUTER_NODE) ? e.source : e.target;

    if (!vpcToRouters.has(vpcId)) vpcToRouters.set(vpcId, new Set());
    vpcToRouters.get(vpcId).add(routerId);
  });

  // index de rutas por router (guardadas en router.data.routeTable)
  const routesByRouter = new Map();
  routers.forEach(r => {
    const entries = Array.isArray(r.data?.routeTable) ? r.data.routeTable : [];
    routesByRouter.set(r.id, entries);
  });

  // Preview por VPC
  const preview = {
    vpcs: vpcs.map(v => {
      const name = v.data?.vpcName || v.data?.title || v.id;
      const cidr =
        v.data?.cidrBlock && v.data?.prefixLength
          ? `${v.data.cidrBlock}/${v.data.prefixLength}`
          : null;

      const connectedRouters = Array.from(vpcToRouters.get(v.id) || []);
      const main = [];
      if (cidr) main.push({ dest_cidr: cidr, target: "local" });

      connectedRouters.forEach(rid => {
        const rNode = idToNode.get(rid);
        const rName = rNode?.data?.identifier || rNode?.data?.label || rid;
        const entries = routesByRouter.get(rid) || [];
        entries
          .filter(e => e.sourceVpcId === v.id)
          .forEach(e => {
            if (!e?.destCidr) return;
            main.push({
              dest_cidr: e.destCidr,
              target: rName,
              via_router_id: rid,
            });
          });
      });

      // Deduplicar por dest_cidr
      const seen = new Set();
      const mainDedup = main.filter(r => {
        if (seen.has(r.dest_cidr)) return false;
        seen.add(r.dest_cidr);
        return true;
      });

      return {
        id: v.id,
        name,
        region: v.data?.region,
        cidr,
        connectedRouters,
        main_route_table: mainDedup,
      };
    }),
  };

  return preview;
}
