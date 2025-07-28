import { useCallback } from 'react'

const useRestrictMovement = (reactFlowInstance, setNodes) => {
     console.log("useRestrictMovement called");

    const onNodeDragStop = useCallback((_, node) => {
         console.log("onNodeDragStop called with node:", node);

        const nodes = reactFlowInstance.getNodes();

        const parentNode = nodes.find((n) => n.id === node.parenNode || n.id === node.parentId);

        if (!parentNode) return;

        const isInside =
            node.position.x >= 0 &&
            node.position.y >= 0 &&
            node.position.x + (node.width || 0) <= (parentNode.width || parentNode.style?.width) &&
            node.position.y + (node.height || 0) <= (parentNode.height || parentNode.style?.height);

        if (!isInside) {
            // Revertimos el movimiento
            setNodes((nds) =>
                nds.map((n) =>
                    n.id === node.id
                        ? {

                            ...n,
                            position: { x: 10, y: 10 }, // puedes ajustar la posición por defecto dentro del padre
                        }
                        : n
                )
            );
        }

    }, [reactFlowInstance, setNodes]);

    return { onNodeDragStop }
}

export default useRestrictMovement