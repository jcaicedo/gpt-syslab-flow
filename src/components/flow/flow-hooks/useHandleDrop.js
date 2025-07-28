import { useCallback } from 'react';
import {
  TYPE_VPC_NODE,
  TYPE_SUBNETWORK_NODE,
  restrictedNodes,
  TYPE_ROUTER_NODE,
  widthDefaultInstanceNode,
  heightDefaultInstanceNode,
  widthDefaultInstanceRouter,
  heightDefaultInstanceRouter,
  widthDefaultSubNetworkNode,
  heightDefaultSubNetworkNode,
  widthDefaultVPCNode,
  heightDefaultVPCNode,
  colorBgInstanceNode,
  colorsBgSubnetworksNodes
} from '../utils/constants';
import getNodeTitle from '../utils/getNodeTitle';

const getRandomColorNode = () => colorsBgSubnetworksNodes[Math.floor(Math.random() * colorsBgSubnetworksNodes.length)];
const makeId = () => Math.random().toString(36).substr(2, 9);

const useHandleDrop = (reactFlowInstance, setNodes) => {
  const onDrop = useCallback(event => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type || !reactFlowInstance) return;

    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY
    });

    let w = widthDefaultInstanceNode, h = heightDefaultInstanceNode;
    if (type === TYPE_ROUTER_NODE) {
      w = widthDefaultInstanceRouter; h = heightDefaultInstanceRouter;
    } else if (type === TYPE_SUBNETWORK_NODE) {
      w = widthDefaultSubNetworkNode; h = heightDefaultSubNetworkNode;
    } else if (type === TYPE_VPC_NODE) {
      w = widthDefaultVPCNode; h = heightDefaultVPCNode;
    }

    const bg = restrictedNodes.includes(type) || type === TYPE_ROUTER_NODE ? colorBgInstanceNode : getRandomColorNode();
    const centerX = position.x + w / 2;
    const centerY = position.y + h / 2;
    const newNode = {
      id: makeId(),
      type,
      data: { label: `${type}_${Date.now()}`, title: getNodeTitle({ type }), bgNode: bg },
      position,
      style: { width: w, height: h }
    };
    const all = reactFlowInstance.getNodes();

    if (type === TYPE_VPC_NODE) {
      setNodes(nds => [...nds, newNode]);
      return;
    }

    if (type === TYPE_SUBNETWORK_NODE) {
      const parent = all.find(n => n.type === TYPE_VPC_NODE &&
        centerX >= n.position.x && centerX <= n.position.x + (n.style.width || n.width) &&
        centerY >= n.position.y && centerY <= n.position.y + (n.style.height || n.height));
      if (!parent) return;
      newNode.parentNode = parent.id;
      newNode.position = { x: position.x - parent.position.x, y: position.y - parent.position.y };
      newNode.extent = 'parent';
      setNodes(nds => [...nds, newNode]);
      return;
    }

    if (restrictedNodes.includes(type)) {
      const parent = all.find(n => n.type === TYPE_SUBNETWORK_NODE &&
        centerX >= n.position.x && centerX <= n.position.x + (n.style.width || n.width) &&
        centerY >= n.position.y && centerY <= n.position.y + (n.style.height || n.height));
      if (!parent) return;
      newNode.parentNode = parent.id;
      newNode.position = { x: position.x - parent.position.x, y: position.y - parent.position.y };
      newNode.extent = 'parent';
      setNodes(nds => [...nds, newNode]);
      return;
    }
  }, [reactFlowInstance]);

  return { onDrop };
};

export default useHandleDrop;
