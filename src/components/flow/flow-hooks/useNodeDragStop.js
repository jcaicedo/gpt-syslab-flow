import { useCallback } from 'react';
import { TYPE_VPC_NODE, TYPE_SUBNETWORK_NODE, restrictedNodes } from '../utils/constants';

function getAbsolutePosition(node, nodes) {
    let absX = node.position?.x || 0;
    let absY = node.position?.y || 0;
    let parentId = node.parentNode;
    while (parentId) {
        const parent = nodes.find(n => n.id === parentId);
        if (!parent || !parent.position) break;
        absX += parent.position.x;
        absY += parent.position.y;
        parentId = parent.parentNode;
    }
    return { x: absX, y: absY };
}

function isInsideParent(childNode, parentNode, nodes) {
    const childAbs = childNode.positionAbsolute || getAbsolutePosition(childNode, nodes);
    const parentAbs = getAbsolutePosition(parentNode, nodes);

    const parentW = parentNode.style?.width ?? parentNode.width ?? 0;
    const parentH = parentNode.style?.height ?? parentNode.height ?? 0;
    const childW = childNode.style?.width ?? childNode.width ?? 0;
    const childH = childNode.style?.height ?? childNode.height ?? 0;

    // Bordes del padre
    const px1 = parentAbs.x;
    const px2 = parentAbs.x + parentW;
    const py1 = parentAbs.y;
    const py2 = parentAbs.y + parentH;

    // Bordes del hijo
    const cx1 = childAbs.x;
    const cx2 = childAbs.x + childW;
    const cy1 = childAbs.y;
    const cy2 = childAbs.y + childH;

    // LOGS DEBUG
    console.log("==DEBUG INTERSECTION CHECK==");
    console.log("parent:", parentNode.id, "x1:", px1, "x2:", px2, "y1:", py1, "y2:", py2);
    console.log("child :", childNode.id, "x1:", cx1, "x2:", cx2, "y1:", cy1, "y2:", cy2);

    // Comprobar si se solapan
    const overlap = cx1 < px2 && cx2 > px1 && cy1 < py2 && cy2 > py1;
    console.log("INTERSECT/OVERLAP?", overlap);

    return overlap;
}


const useNodeDragStop = ({ nodes, setNodes }) => {
    return useCallback((evt, node) => {
        // SUBNETWORK SOLO DENTRO DE VPC
        if (node.type === TYPE_SUBNETWORK_NODE) {
            const vpcTarget = nodes.find((nd) =>
                nd.type === TYPE_VPC_NODE &&
                nd.position &&
                isInsideParent(node, nd, nodes)
            );
            if (vpcTarget && vpcTarget.position) {
                const vpcAbs = getAbsolutePosition(vpcTarget, nodes);
                const xOffset = node.positionAbsolute.x - vpcAbs.x;
                const yOffset = node.positionAbsolute.y - vpcAbs.y;
                setNodes((prevNodes) =>
                    prevNodes.map((n) =>
                        n.id === node.id
                            ? {
                                ...n,
                                parentNode: vpcTarget.id,
                                extent: 'parent',
                                position: { x: xOffset, y: yOffset }
                            }
                            : n
                    )
                );
            } else {
                alert('Las Subnets solo pueden estar dentro de una VPC');
            }
            return;
        }

        // INSTANCIAS SOLO DENTRO DE SUBNET
        if (restrictedNodes.includes(node.type)) {
            const subnetTarget = nodes.find((nd) =>
                nd.type === TYPE_SUBNETWORK_NODE &&
                nd.position &&
                isInsideParent(node, nd, nodes)
            );
            if (subnetTarget && subnetTarget.position) {
                const subnetAbs = getAbsolutePosition(subnetTarget, nodes);
                const xOffset = node.positionAbsolute.x - subnetAbs.x;
                const yOffset = node.positionAbsolute.y - subnetAbs.y;
                setNodes((prevNodes) =>
                    prevNodes.map((n) =>
                        n.id === node.id
                            ? {
                                ...n,
                                parentNode: subnetTarget.id,
                                extent: 'parent',
                                position: { x: xOffset, y: yOffset }
                            }
                            : n
                    )
                );
            } else {
                alert('Las instancias solo pueden estar dentro de una Subnet');
            }
            return;
        }

        // OTROS NODOS (routers, vpcs...) libres
    }, [nodes, setNodes]);
};

export default useNodeDragStop;
