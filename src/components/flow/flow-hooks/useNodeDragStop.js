import { useCallback } from 'react';

import {
    TYPE_VPC_NODE,
    TYPE_SUBNETWORK_NODE,
    TYPE_COMPUTER_NODE,
    TYPE_PRINTER_NODE,
    TYPE_SERVER_NODE,
    TYPE_DEFAULT_NODE
} from '../utils/constants';

// Nodos que deben estar dentro de una Subnet
const restrictedNodes = [
    TYPE_COMPUTER_NODE,
    TYPE_PRINTER_NODE,
    TYPE_SERVER_NODE,
    TYPE_DEFAULT_NODE
];


const useNodeDragStop = ({ nodes, setNodes }) => {
    console.log("entrando useNodeDragStop");

    return useCallback((evt, node) => {
        // No hacer nada si el nodo es de tipo subnetwork
        if (node.type === TYPE_SUBNETWORK_NODE) {

            const vpcTarget = nodes.find((nd) =>
                nd.type === TYPE_VPC_NODE &&
                nd.width &&
                nd.height &&
                node.positionAbsolute.x + (node.width || 0) / 2 > nd.position.x &&
                node.positionAbsolute.x + (node.width || 0) / 2 < nd.position.x + nd.width &&
                node.positionAbsolute.y + (node.height || 0) / 2 > nd.position.y &&
                node.positionAbsolute.y + (node.height || 0) / 2 < nd.position.y + nd.height
            );

            if (vpcTarget) {
                // Si el nodo subnetwork está dentro de un VPC, asignar el VPC como padre
                const xOffset = node.positionAbsolute.x - vpcTarget.position.x;
                const yOffset = node.positionAbsolute.y - vpcTarget.position.y;

                setNodes((prevNodes) =>
                    prevNodes.map((n) =>
                        n.id === node.id ? {
                            ...n,
                            parentNode: vpcTarget.id,
                            extent: 'parent',
                            position: {
                                x: xOffset,
                                y: yOffset
                            }
                        } : n
                    )
                );
            } else {
                setNodes((prevNodes) =>
                    prevNodes.map((n) =>
                        n.id === node.id
                            ? { ...n } // Rebotar al lugar anterior
                            : n
                    )
                );
                alert('Las Subnets solo pueden estar dentro de una VPC');
            }
            return;
        }


        // nodes.forEach((nd) => {
        //     // Solo considerar nodos de tipo subnetwork
        //     if (nd.type === TYPE_SUBNETWORK_NODE && nd.height && nd.width) {
        //         const rec = { height: nd.height, width: nd.width, ...nd.position };

        //         // Verificar si el nodo arrastrado intersecta con el nodo subnetwork
        //         if (reactFlow.isNodeIntersecting(node, rec, false)) {
        //             // Si el nodo no tiene un nodo padre asignado
        //             if (!node.parentNode) {
        //                 // Asignar el nodo subnetwork como padre
        //                 node.parentNode = nd.id;
        //                 node.extent = "parent"; // Establecer la extensión a padre

        //                 // Calcular la nueva posición relativa al nodo padre
        //                 const xOffset = node.positionAbsolute.x - nd.position.x;
        //                 const yOffset = node.positionAbsolute.y - nd.position.y;

        //                 // Mostrar información de depuración
        //                 console.log('Posición absoluta del nodo arrastrado:', node.positionAbsolute);
        //                 console.log('Posición del nodo padre:', nd.position);
        //                 console.log('Nueva posición calculada:', { x: xOffset, y: yOffset });

        //                 node.position = {
        //                     x: xOffset, // Posición en X respecto al padre
        //                     y: yOffset  // Posición en Y respecto al padre
        //                 };

        //                 // Actualizar los nodos en el estado
        //                 setNodes((prevNodes) =>
        //                     prevNodes.map((n) => {
        //                         if (n.id === node.id) {
        //                             return { ...n, ...node }; // Actualizar el nodo con la nueva posición y parentNode
        //                         }
        //                         return n;
        //                     })
        //                 );
        //             }
        //         }
        //     }
        // });


        // ---- INSTANCIAS SOLO PUEDEN ESTAR DENTRO DE UNA SUBNET ----
        if (restrictedNodes.includes(node.type)) {
            const subnetTarget = nodes.find(
                (nd) =>
                    nd.type === TYPE_SUBNETWORK_NODE &&
                    nd.width &&
                    nd.height &&
                    node.positionAbsolute.x + (node.width || 0) / 2 > nd.position.x &&
                    node.positionAbsolute.x + (node.width || 0) / 2 < nd.position.x + nd.width &&
                    node.positionAbsolute.y + (node.height || 0) / 2 > nd.position.y &&
                    node.positionAbsolute.y + (node.height || 0) / 2 < nd.position.y + nd.height
            );

            if (subnetTarget) {
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
                setNodes((prevNodes) =>
                    prevNodes.map((n) =>
                        n.id === node.id
                            ? { ...n } // Rebotar al lugar anterior
                            : n
                    )
                );
                alert('Este nodo solo puede estar dentro de una Subnet');
            }
            return;
        }
    }, [nodes, setNodes]);
};

export default useNodeDragStop;
