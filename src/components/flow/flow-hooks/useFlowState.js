import {  useRef, useCallback } from "react";
import {  addEdge } from "@xyflow/react"
import {  TYPE_ROUTER_NODE, TYPE_SUBNETWORK_NODE } from '../utils/constants';

export function useFlowState() {

    const connectionCreated = useRef(false)

    const isValidConnection = useCallback((connection, nodes) => {
        console.log("isValidConnection");

        const { source, target } = connection;
        const sourceNode = nodes.find(node => node.id === source);
        const targetNode = nodes.find(node => node.id === target);
      //  connectionCreated.current = false;
        if (!sourceNode || !targetNode) {
            return false;
        }
        if (source.type === TYPE_ROUTER_NODE && (sourceNode.disabled || targetNode.disabled)) {
            return false; // No permitir conexiones con nodos deshabilitados
        }
        // Verificar si están dentro del mismo nodo de subnetwork
        const isSameParent = sourceNode.parentNode === targetNode.parentNode;
        // Verificar si la conexión es entre un nodo subnetwork y un nodo router
        const isSubnetworkToRouterConnection = (sourceNode.type === TYPE_SUBNETWORK_NODE && targetNode.type === TYPE_ROUTER_NODE) ||
            (sourceNode.type === TYPE_ROUTER_NODE && targetNode.type === TYPE_SUBNETWORK_NODE);

        const isValid = isSameParent || isSubnetworkToRouterConnection;

        if (isValid) {
            connectionCreated.current = true;
        }

        return isValid;


    }, [])

    const onConnectStart = useCallback(() => {
        console.log("onConnectStart");
        connectionCreated.current = false;
    }, []);

    const onConnect = useCallback(
        (params, setEdges) => {
            console.log("llego");
            if (connectionCreated.current) {
                setEdges((eds) => addEdge(params, eds));
            }
        },
        []
    );

    const onConnectEnd = useCallback(() => {
        if (!connectionCreated.current) {
            alert("Solo se permiten conexiones entre nodos de la misma SUBRED");
        }
    }, []);


    return {
        isValidConnection,
        onConnectStart,
        onConnect,
        onConnectEnd
    }




}