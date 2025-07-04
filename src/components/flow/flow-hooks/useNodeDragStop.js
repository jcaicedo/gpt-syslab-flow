import { useCallback } from 'react';

const useNodeDragStop = ({ nodes, setNodes, reactFlow, TYPE_SUBNETWORK_NODE }) => {
    console.log("entrando useNodeDragStop");

    return useCallback((evt, node) => {
        // No hacer nada si el nodo es de tipo subnetwork
        if (node.type === TYPE_SUBNETWORK_NODE) return;

        nodes.forEach((nd) => {
            // Solo considerar nodos de tipo subnetwork
            if (nd.type === TYPE_SUBNETWORK_NODE && nd.height && nd.width) {
                const rec = { height: nd.height, width: nd.width, ...nd.position };

                // Verificar si el nodo arrastrado intersecta con el nodo subnetwork
                if (reactFlow.isNodeIntersecting(node, rec, false)) {
                    // Si el nodo no tiene un nodo padre asignado
                    if (!node.parentNode) {
                        // Asignar el nodo subnetwork como padre
                        node.parentNode = nd.id;
                        node.extent = "parent"; // Establecer la extensión a padre

                        // Calcular la nueva posición relativa al nodo padre
                        const xOffset = node.positionAbsolute.x - nd.position.x;
                        const yOffset = node.positionAbsolute.y - nd.position.y;

                        // Mostrar información de depuración
                        console.log('Posición absoluta del nodo arrastrado:', node.positionAbsolute);
                        console.log('Posición del nodo padre:', nd.position);
                        console.log('Nueva posición calculada:', { x: xOffset, y: yOffset });

                        node.position = {
                            x: xOffset, // Posición en X respecto al padre
                            y: yOffset  // Posición en Y respecto al padre
                        };

                        // Actualizar los nodos en el estado
                        setNodes((prevNodes) =>
                            prevNodes.map((n) => {
                                if (n.id === node.id) {
                                    return { ...n, ...node }; // Actualizar el nodo con la nueva posición y parentNode
                                }
                                return n;
                            })
                        );
                    }
                }
            }
        });
    }, [nodes, setNodes, reactFlow, TYPE_SUBNETWORK_NODE]);
};

export default useNodeDragStop;
