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
    const childCenterX = childAbs.x + childW / 2;
    const childCenterY = childAbs.y + childH / 2;

    // LOGS DEBUG
    console.log("==DEBUG INSIDE CHECK==");
    console.log("parentNode:", parentNode.id, "abs:", parentAbs, "W:", parentW, "H:", parentH);
    console.log("childNode:", childNode.id, "abs:", childAbs, "center:", { x: childCenterX, y: childCenterY }, "W:", childW, "H:", childH);

    const inside =
        childCenterX > parentAbs.x &&
        childCenterX < parentAbs.x + parentW &&
        childCenterY > parentAbs.y &&
        childCenterY < parentAbs.y + parentH;

    console.log("IS INSIDE?", inside);

    return inside;
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
