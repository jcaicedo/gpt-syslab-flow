import { useCallback } from 'react';
import { TYPE_VPC_NODE, TYPE_SUBNETWORK_NODE, restrictedNodes } from '../utils/constants';

// Función para obtener la posición absoluta de un nodo (canvas)
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

// Función robusta para detectar si el centro del hijo está dentro del padre
function isInsideParent(childNode, parentNode, nodes) {
    const childAbs = childNode.positionAbsolute || getAbsolutePosition(childNode, nodes);
    const parentAbs = getAbsolutePosition(parentNode, nodes);

    const parentW = parentNode.style?.width ?? parentNode.width ?? 0;
    const parentH = parentNode.style?.height ?? parentNode.height ?? 0;
    const childCenterX = childAbs.x + (childNode.width || 0) / 2;
    const childCenterY = childAbs.y + (childNode.height || 0) / 2;

    return (
        childCenterX > parentAbs.x &&
        childCenterX < parentAbs.x + parentW &&
        childCenterY > parentAbs.y &&
        childCenterY < parentAbs.y + parentH
    );
}

const useNodeDragStop = ({ nodes, setNodes }) => {
    return useCallback((evt, node) => {
        // ----------- SUBNETWORK SOLO DENTRO DE VPC -----------
        if (node.type === TYPE_SUBNETWORK_NODE) {
            const vpcTarget = nodes.find((nd) =>
                nd.type === TYPE_VPC_NODE &&
                nd.position &&
                isInsideParent(node, nd, nodes)
            );
            if (vpcTarget && vpcTarget.position) {
                // Nuevo offset relativo
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

        // ----------- INSTANCIAS SOLO DENTRO DE SUBNET -----------
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

        // Otros nodos (routers, vpcs...) libres
    }, [nodes, setNodes]);
};

export default useNodeDragStop;
