import { Netmask } from "netmask"
import { TYPE_COMPUTER_NODE, TYPE_PRINTER_NODE, TYPE_ROUTER_NODE, TYPE_SERVER_NODE, TYPE_SUBNETWORK_NODE, TYPE_VPC_NODE } from "./constants";

const isValidCidr = (cidr) => {
    try { new Netmask(cidr); return true; } catch { return false; }
};

const parseCidr = (cidr) => {
    try { return new Netmask(cidr); } catch { return null; }
}

const within = (childCidr, parentCidr) => {
    const child = parseCidr(childCidr);
    const parent = parseCidr(parentCidr);
    if (!child || !parent) return false;
    return parent.contains(child.base) && parent.contains(child.broadcast);
};

const INSTANCE_TYPES = new Set([TYPE_COMPUTER_NODE, TYPE_PRINTER_NODE, TYPE_SERVER_NODE]);

const indexById = (arr) => {
    const m = new Map();
    arr.forEach(x => m.set(x.id, x));
    return m;
};

/**
 * Valida VPCs, Subnets, Routers e instancias.
 * Devuelve { errors: string[], warnings: string[] }
 */

export function validateTopology(nodes, edges) {
    const errors = [];
    const warnings = [];

    const vpcs = nodes.filter(n => n.type === TYPE_VPC_NODE);
    const subnets = nodes.filter(n => n.type === TYPE_SUBNETWORK_NODE);
    const routers = nodes.filter(n => n.type === TYPE_ROUTER_NODE);
    const instances = nodes.filter(n => INSTANCE_TYPES.has(n.type));

    const idToNode = indexById(nodes);
    const idToType = new Map(nodes.map(n => [n.id, n.type]));

    // VPC -> Set<routerId> (desde edges)
    const vpcToRouters = new Map();
    edges.forEach(e => {
        const sType = idToType.get(e.source);
        const tType = idToType.get(e.target);
        const isVpcRouter =
            (sType === TYPE_VPC_NODE && tType === TYPE_ROUTER_NODE) ||
            (sType === TYPE_ROUTER_NODE && tType === TYPE_VPC_NODE);
        if (!isVpcRouter) return;
        const vpcId = (sType === TYPE_VPC_NODE) ? e.source : e.target;
        const routerId = (sType === TYPE_ROUTER_NODE) ? e.source : e.target;
        if (!vpcToRouters.has(vpcId)) vpcToRouters.set(vpcId, new Set());
        vpcToRouters.get(vpcId).add(routerId);
    });

    // VPCs
    vpcs.forEach(v => {
        const name = v.data?.vpcName || v.data?.title || v.id;
        const cidr = (v.data?.cidrBlock && v.data?.prefixLength)
            ? `${v.data.cidrBlock}/${v.data.prefixLength}` : null;

        if (!cidr) errors.push(`VPC "${name}": falta CIDR (cidrBlock/prefixLength).`);
        else if (!isValidCidr(cidr)) errors.push(`VPC "${name}": CIDR inválido (${cidr}).`);
    });

    // Subnets: datos + pertenencia + containment
    subnets.forEach(s => {
        const sName = s.data?.subnetName || s.id;
        const vpcParent = idToNode.get(s.parentId);
        if (!vpcParent || vpcParent.type !== TYPE_VPC_NODE) {
            errors.push(`Subnet "${sName}": no tiene VPC padre (parentId inválido).`);
            return;
        }

        const vpcName = vpcParent.data?.vpcName || vpcParent.id;
        const vpcCidr = (vpcParent.data?.cidrBlock && vpcParent.data?.prefixLength)
            ? `${vpcParent.data.cidrBlock}/${vpcParent.data.prefixLength}` : null;

        if (!s.data?.cidrBlock) {
            errors.push(`Subnet "${sName}" en VPC "${vpcName}": falta CIDR.`);
            return;
        }
        if (!isValidCidr(s.data.cidrBlock)) {
            errors.push(`Subnet "${sName}" en VPC "${vpcName}": CIDR inválido (${s.data.cidrBlock}).`);
            return;
        }
        if (vpcCidr && !within(s.data.cidrBlock, vpcCidr)) {
            errors.push(`Subnet "${sName}" (${s.data.cidrBlock}) no está contenida en la VPC "${vpcName}" (${vpcCidr}).`);
        }
    });

    // Subnets: solapes por VPC
    const subnetsByVpc = new Map();
    subnets.forEach(s => {
        if (!subnetsByVpc.has(s.parentId)) subnetsByVpc.set(s.parentId, []);
        subnetsByVpc.get(s.parentId).push(s);
    });
    subnetsByVpc.forEach((list, vpcId) => {
        const vpcName = idToNode.get(vpcId)?.data?.vpcName || vpcId;
        for (let i = 0; i < list.length; i++) {
            for (let j = i + 1; j < list.length; j++) {
                const a = list[i], b = list[j];
                const ca = parseCidr(a.data?.cidrBlock);
                const cb = parseCidr(b.data?.cidrBlock);
                if (!ca || !cb) continue;
                const overlap = ca.contains(cb.base) || cb.contains(ca.base);
                if (overlap) {
                    errors.push(`Subnets solapadas en VPC "${vpcName}": "${a.data?.subnetName || a.id}" (${a.data?.cidrBlock}) ↔ "${b.data?.subnetName || b.id}" (${b.data?.cidrBlock}).`);
                }
            }
        }
    });

    // Routers / rutas
    routers.forEach(r => {
        const rName = r.data?.identifier || r.id;
        const routes = Array.isArray(r.data?.routeTable) ? r.data.routeTable : [];
        routes.forEach((rt, idx) => {
            const row = `Router "${rName}" ruta #${idx + 1}`;
            if (!rt.sourceVpcId) { errors.push(`${row}: falta sourceVpcId.`); return; }
            const srcVpc = idToNode.get(rt.sourceVpcId);
            if (!srcVpc || srcVpc.type !== TYPE_VPC_NODE) {
                errors.push(`${row}: sourceVpcId "${rt.sourceVpcId}" no corresponde a una VPC del canvas.`);
                return;
            }
            const connected = vpcToRouters.get(srcVpc.id);
            if (!connected || !connected.has(r.id)) {
                errors.push(`${row}: la VPC origen "${srcVpc.data?.vpcName || srcVpc.id}" no está conectada a este router.`);
            }
            if (!rt.destCidr || !isValidCidr(rt.destCidr)) {
                errors.push(`${row}: destCidr ausente o inválido (${rt.destCidr || 'n/a'}).`);
            }
            if (rt.destVpcId) {
                const dstVpc = idToNode.get(rt.destVpcId);
                if (!dstVpc || dstVpc.type !== TYPE_VPC_NODE) {
                    errors.push(`${row}: destVpcId "${rt.destVpcId}" no corresponde a una VPC del canvas.`);
                }
            }
        });
    });

    // Instancias (opcional): IP ∈ subnet
    instances.forEach(inst => {
        const subnet = idToNode.get(inst.parentId);
        if (!subnet || subnet.type !== TYPE_SUBNETWORK_NODE) return;
        const ip = inst.data?.ipAddress;
        const sCidr = subnet.data?.cidrBlock;
        if (!ip || !sCidr) return;
        const block = parseCidr(sCidr);
        if (block && !block.contains(ip)) {
            errors.push(`Instancia "${inst.data?.name || inst.id}": IP ${ip} no pertenece a la subnet ${sCidr}.`);
        }
    });

    return { errors, warnings };
}


/** Utils para agrupar */
export const groupSubnetsByVpc = (nodes, vpcId) =>
    nodes.filter(n => n.type === TYPE_SUBNETWORK_NODE && n.parentId === vpcId);


export const groupInstancesBySubnet = (nodes, subnetId) =>
    nodes.filter(n => n.parentId === subnetId);