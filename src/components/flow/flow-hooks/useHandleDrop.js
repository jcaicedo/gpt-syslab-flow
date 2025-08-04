// in useHandleDrop.js
import { useCallback } from 'react';
import {
  TYPE_VPC_NODE, TYPE_SUBNETWORK_NODE,
  restrictedNodes,
  widthDefaultVPCNode, heightDefaultVPCNode,
  widthDefaultSubNetworkNode, heightDefaultSubNetworkNode,
  widthDefaultInstanceNode, heightDefaultInstanceNode,
  colorBgInstanceNode, colorsBgSubnetworksNodes,
  TYPE_ROUTER_NODE
} from '../utils/constants';
import getNodeTitle from '../utils/getNodeTitle';

const getRandomColor = () => colorsBgSubnetworksNodes[
  Math.floor(Math.random() * colorsBgSubnetworksNodes.length)
];

const makeId = () => Math.random().toString(36).substring(2, 10);

export default function useHandleDrop(reactFlowInstance, setNodes) {
  return {
    onDrop: useCallback(event => {
      event.preventDefault();
      if (!reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });

      let width = widthDefaultInstanceNode, height = heightDefaultInstanceNode;
      if (type === TYPE_VPC_NODE) {
        width = widthDefaultVPCNode; height = heightDefaultVPCNode;
      } else if (type === TYPE_SUBNETWORK_NODE) {
        width = widthDefaultSubNetworkNode; height = heightDefaultSubNetworkNode;
      }

      const bg = restrictedNodes.includes(type) ? colorBgInstanceNode : getRandomColor();
      const center = { x: position.x + width / 2, y: position.y + height / 2 };
      const id = makeId();

      let newNode = {
        id, type, position, width, height,
        data: { label: `${type}-${id}`, title: getNodeTitle({ type }), bgNode: bg }
      };

      const all = reactFlowInstance.getNodes();

      if (type === TYPE_VPC_NODE) {
        setNodes(nds => [...nds, newNode]);
        return;
      }

      if (type === TYPE_SUBNETWORK_NODE) {
        const parent = all.find(n => {
          if (n.type !== TYPE_VPC_NODE) return false;
          const { x: px, y: py } = n.position;
          const pw = n.width || n.style?.width;
          const ph = n.height || n.style?.height;
          return center.x > px && center.x < px + pw && center.y > py && center.y < py + ph;
        });
        if (!parent) return;
        const { x: px, y: py } = parent.position;
        newNode = {
          ...newNode,
          parentId: parent.id,
          parentNode: parent.id,
          position: { x: position.x - px, y: position.y - py },
          extent: 'parent'
        };
        setNodes(nds => [...nds, newNode]);
        return;
      }

      if (type === TYPE_ROUTER_NODE) {
        const exist = all.some(n => n.type === TYPE_ROUTER_NODE);
        if (exist) {
          alert('Only one router node is allowed in the flow.');
          return;
        }
        setNodes(nds => [...nds, newNode]); return;
      }

      if (restrictedNodes.includes(type)) {
        const subnet = all.find(n => {
          if (n.type !== TYPE_SUBNETWORK_NODE) return false;
          const parent = all.find(p => p.id === (n.parentNode || n.parentId));
          if (!parent) return false;
          const sx = parent.position.x + n.position.x;
          const sy = parent.position.y + n.position.y;
          const sw = n.width || n.style?.width;
          const sh = n.height || n.style?.height;
          return center.x > sx && center.x < sx + sw && center.y > sy && center.y < sy + sh;
        });
        if (!subnet) return;
        const parent = all.find(p => p.id === (subnet.parentNode || subnet.parentId));
        const sx = parent.position.x + subnet.position.x;
        const sy = parent.position.y + subnet.position.y;
        newNode = {
          ...newNode,
          parentId: subnet.id,
          parentNode: subnet.id,
          position: { x: position.x - sx, y: position.y - sy },
          extent: 'parent'
        };
        setNodes(nds => [...nds, newNode]);
        return;
      }
    }, [reactFlowInstance, setNodes])
  };
}
