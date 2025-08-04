import {  useRef, useCallback } from "react";
import {  addEdge } from "@xyflow/react"
import {  TYPE_ROUTER_NODE, TYPE_SUBNETWORK_NODE } from '../utils/constants';

export function useFlowState() {

    const connectionCreated = useRef(false)

    const isValidConnection = useCallback((connection, nodes) => {

        const { source, target } = connection;
        const sourceNode = nodes.find(node => node.id === source);
        const targetNode = nodes.find(node => node.id === target);
        if (!sourceNode || !targetNode) {
            return false;
        }

        if (sourceNode.type === TYPE_SUBNETWORK_NODE || targetNode.type === TYPE_SUBNETWORK_NODE) {
            return false;
        }

        if (sourceNode.type === TYPE_ROUTER_NODE && (sourceNode.disabled || targetNode.disabled)) {
            return false; // No permitir conexiones con nodos deshabilitados
        }

        // Verificar si están dentro del mismo nodo de subnetwork
        const isSameParent = sourceNode.parentNode === targetNode.parentNode;

        if (isSameParent) {
            connectionCreated.current = true;
        }

        return isSameParent;


    }, [])

    const onConnectStart = useCallback(() => {
        // // // console.log("onConnectStart");
        connectionCreated.current = false;
    }, []);

    const onConnect = useCallback(
        (params, setEdges) => {
            // // // console.log("llego");
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