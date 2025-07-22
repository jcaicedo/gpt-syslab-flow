import { useCallback } from 'react';
import { TYPE_VPC_NODE, TYPE_SUBNETWORK_NODE } from '../utils/constants';
import { restrictedNodes } from '../utils/constants'; // instancias, printers, etc.

const useNodeDragStop = ({ nodes, setNodes }) => {
    return useCallback((evt, node) => {
        // ----------- SUBNETWORK SOLO DENTRO DE VPC -----------
        if (node.type === TYPE_SUBNETWORK_NODE) {
            const vpcTarget = nodes.find((nd) => {
                // Validación defensiva
                if (
                    typeof nd !== "object" ||
                    nd == null ||
                    nd.type !== TYPE_VPC_NODE ||
                    typeof nd.position !== "object" ||
                    nd.position == null ||
                    typeof nd.position.x !== "number" ||
                    typeof nd.position.y !== "number"
                ) {
                    // Log para rastrear descartes
                    // console.warn("Nodo VPC descartado por posición inválida", nd);
                    return false;
                }
                // Validar bounds
                return (
                    node.positionAbsolute.x + (node.width || 0) / 2 > nd.position.x &&
                    node.positionAbsolute.x + (node.width || 0) / 2 < nd.position.x + (nd.style?.width || nd.width || 0) &&
                    node.positionAbsolute.y + (node.height || 0) / 2 > nd.position.y &&
                    node.positionAbsolute.y + (node.height || 0) / 2 < nd.position.y + (nd.style?.height || nd.height || 0)
                );
            });

            if (vpcTarget && vpcTarget.position) {
                const xOffset = node.positionAbsolute.x - vpcTarget.position.x;
                const yOffset = node.positionAbsolute.y - vpcTarget.position.y;
                setNodes((prevNodes) =>
                    prevNodes.map((n) =>
                        n.id === node.id
                            ? {
                                  ...n,
                                  parentNode: vpcTarget.id,
                                  extent: 'parent',
                                  position: { x: xOffset, y: yOffset },
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
            const subnetTarget = nodes.find((nd) => {
                // Validación defensiva
                if (
                    typeof nd !== "object" ||
                    nd == null ||
                    nd.type !== TYPE_SUBNETWORK_NODE ||
                    typeof nd.position !== "object" ||
                    nd.position == null ||
                    typeof nd.position.x !== "number" ||
                    typeof nd.position.y !== "number"
                ) {
                    // Log para rastrear descartes
                    // console.warn("Nodo Subnet descartado por posición inválida", nd);
                    return false;
                }
                // Validar bounds
                return (
                    node.positionAbsolute.x + (node.width || 0) / 2 > nd.position.x &&
                    node.positionAbsolute.x + (node.width || 0) / 2 < nd.position.x + (nd.style?.width || nd.width || 0) &&
                    node.positionAbsolute.y + (node.height || 0) / 2 > nd.position.y &&
                    node.positionAbsolute.y + (node.height || 0) / 2 < nd.position.y + (nd.style?.height || nd.height || 0)
                );
            });

            if (subnetTarget && subnetTarget.position) {
                const xOffset = node.positionAbsolute.x - subnetTarget.position.x;
                const yOffset = node.positionAbsolute.y - subnetTarget.position.y;
                setNodes((prevNodes) =>
                    prevNodes.map((n) =>
                        n.id === node.id
                            ? {
                                  ...n,
                                  parentNode: subnetTarget.id,
                                  extent: 'parent',
                                  position: { x: xOffset, y: yOffset },
                              }
                            : n
                    )
                );
            } else {
                alert('Las instancias solo pueden estar dentro de una Subnet.');
            }
            return;
        }

        // ---- PARA OTROS NODOS, LA LÓGICA QUEDA IGUAL (ej: routers, vpcs) ----
        // Si tienes lógica adicional para otros tipos de nodos, agrégala aquí.
    }, [nodes, setNodes]);
};

export default useNodeDragStop;
