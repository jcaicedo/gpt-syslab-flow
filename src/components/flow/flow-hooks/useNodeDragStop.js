import { useCallback } from 'react';
import { TYPE_VPC_NODE, TYPE_SUBNETWORK_NODE } from '../utils/constants';
import { restrictedNodes } from '../utils/constants'; // instancias, printers, etc.

const useNodeDragStop = ({ nodes, setNodes, reactFlowInstance }) => {
    return useCallback((evt, node) => {
        // ----------- SUBNETWORK SOLO DENTRO DE VPC -----------
        if (node.type === TYPE_SUBNETWORK_NODE) {
            const parentId = node.parentNode || node.parentId;
            let vpcTarget = nodes.find((nd) => nd.id === parentId && nd.type === TYPE_VPC_NODE);

            if (!vpcTarget) {
                vpcTarget = nodes.find((nd) => {
                // Validación defensiva
                if (
                    typeof nd !== "object" ||
                    nd == null ||
                    nd.type !== TYPE_VPC_NODE ||
                    typeof nd.position !== "object" ||
                    nd.position == null
                ) {
                    return false;
                }

                const nodePosX = node.positionAbsolute?.x ?? node.position.x;
                const nodePosY = node.positionAbsolute?.y ?? node.position.y;

                const targetPosX = nd.positionAbsolute?.x ?? nd.position.x;
                const targetPosY = nd.positionAbsolute?.y ?? nd.position.y;

                // Validar bounds
                return (
                    nodePosX + (node.width || 0) / 2 > targetPosX &&
                    nodePosX + (node.width || 0) / 2 < targetPosX + (nd.style?.width || nd.width || 0) &&
                    nodePosY + (node.height || 0) / 2 > targetPosY &&
                    nodePosY + (node.height || 0) / 2 < targetPosY + (nd.style?.height || nd.height || 0)
                );
                });
            }

            if (vpcTarget && (vpcTarget.position || vpcTarget.positionAbsolute)) {
                const nodeAbsX = node.positionAbsolute?.x ?? node.position.x;
                const nodeAbsY = node.positionAbsolute?.y ?? node.position.y;
                const targetAbsX = vpcTarget.positionAbsolute?.x ?? vpcTarget.position.x;
                const targetAbsY = vpcTarget.positionAbsolute?.y ?? vpcTarget.position.y;

                const xOffset = nodeAbsX - targetAbsX;
                const yOffset = nodeAbsY - targetAbsY;
                setNodes((prevNodes) =>
                    prevNodes.map((n) =>
                        n.id === node.id
                            ? {
                                  ...n,
                                  parentNode: vpcTarget.id,
                                  parentId: vpcTarget.id,
                                  extent: 'parent',
                                  position: { x: xOffset, y: yOffset },
                              }
                            : n
                    )
                );
                reactFlowInstance?.updateNodeInternals?.(vpcTarget.id);
            } else {
                alert('Las Subnets solo pueden estar dentro de una VPC');
            }
            return;
        }

        // ----------- INSTANCIAS SOLO DENTRO DE SUBNET -----------
        if (restrictedNodes.includes(node.type)) {
            const parentId = node.parentNode || node.parentId;
            let subnetTarget = nodes.find((nd) => nd.id === parentId && nd.type === TYPE_SUBNETWORK_NODE);

            if (!subnetTarget) {
                subnetTarget = nodes.find((nd) => {
                // Validación defensiva
                if (
                    typeof nd !== "object" ||
                    nd == null ||
                    nd.type !== TYPE_SUBNETWORK_NODE ||
                    typeof nd.position !== "object" ||
                    nd.position == null
                ) {
                    return false;
                }

                const nodePosX = node.positionAbsolute?.x ?? node.position.x;
                const nodePosY = node.positionAbsolute?.y ?? node.position.y;

                const targetPosX = nd.positionAbsolute?.x ?? nd.position.x;
                const targetPosY = nd.positionAbsolute?.y ?? nd.position.y;

                // Validar bounds
                return (
                    nodePosX + (node.width || 0) / 2 > targetPosX &&
                    nodePosX + (node.width || 0) / 2 < targetPosX + (nd.style?.width || nd.width || 0) &&
                    nodePosY + (node.height || 0) / 2 > targetPosY &&
                    nodePosY + (node.height || 0) / 2 < targetPosY + (nd.style?.height || nd.height || 0)
                );
                });
            }

            if (subnetTarget && (subnetTarget.position || subnetTarget.positionAbsolute)) {
                const nodeAbsX = node.positionAbsolute?.x ?? node.position.x;
                const nodeAbsY = node.positionAbsolute?.y ?? node.position.y;
                const targetAbsX = subnetTarget.positionAbsolute?.x ?? subnetTarget.position.x;
                const targetAbsY = subnetTarget.positionAbsolute?.y ?? subnetTarget.position.y;

                const xOffset = nodeAbsX - targetAbsX;
                const yOffset = nodeAbsY - targetAbsY;
                setNodes((prevNodes) =>
                    prevNodes.map((n) =>
                        n.id === node.id
                            ? {
                                  ...n,
                                  parentNode: subnetTarget.id,
                                  parentId: subnetTarget.id,
                                  extent: 'parent',
                                  position: { x: xOffset, y: yOffset },
                              }
                            : n
                    )
                );
                reactFlowInstance?.updateNodeInternals?.(subnetTarget.id);
            } else {
                alert('Las instancias solo pueden estar dentro de una Subnet.');
            }
            return;
        }

        // ---- PARA OTROS NODOS, LA LÓGICA QUEDA IGUAL (ej: routers, vpcs) ----
        // Si tienes lógica adicional para otros tipos de nodos, agrégala aquí.
    }, [nodes, setNodes, reactFlowInstance]);
};

export default useNodeDragStop;
