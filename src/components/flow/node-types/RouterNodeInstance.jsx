/* eslint-disable react/prop-types */
import { memo } from 'react';
import { Handle, Position } from "@xyflow/react";
import '../styles/packet-tracer.css';
import RouterIcon from '@mui/icons-material/Router'; // o el ícono que uses

const RouterNodeInstance = ({ data = {}, isConnectable }) => {
  const name = data.identifier || 'Router';
  const state = data.internetGateway ? 'up' : (data.natGateway ? 'warn' : 'up');

  return (
    <div style={{ width: 120, height: 130, display:'grid', placeItems:'center' }}>
      <div className="pt-device" style={{ borderRadius: 56, width: 96, height: 96 }}>
        <div className={`pt-device__led ${state === 'down' ? 'pt-device__led--down' : state === 'warn' ? 'pt-device__led--warn' : ''}`} />
        <div className="pt-device__icon" style={{ fontSize: 36 }}>
          <RouterIcon />
        </div>

        <Handle type="source" position={Position.Top}    className="pt-handle-tri pt-handle-tri--on" isConnectable={isConnectable} />
        <Handle type="target" position={Position.Bottom} className="pt-handle-tri pt-handle-tri--on" isConnectable={isConnectable} />
        <Handle type="target" position={Position.Left}   className="pt-handle-tri pt-handle-tri--on" isConnectable={isConnectable} />
        <Handle type="source" position={Position.Right}  className="pt-handle-tri pt-handle-tri--on" isConnectable={isConnectable} />
      </div>

      <div className="pt-device__label">{name}</div>
      <div className="pt-device__sublabel">{data.region || 'region n/a'}</div>
    </div>
  );
};

export default memo(RouterNodeInstance);
