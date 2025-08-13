/* eslint-disable react/prop-types */
import { memo } from 'react';
import { Handle, Position } from "@xyflow/react";
import '../styles/packet-tracer.css';     // asegúrate de importar donde pusiste el CSS
import { getIconByInstanceType } from '../helper/iconHelper';

const InstanceNode = ({ data = {}, type, isConnectable }) => {
  const name  = data.name || data.title || 'Instance';
  const ip    = data.ipAddress || 'IP n/a';
  const state = data.down ? 'down' : (data.warn ? 'warn' : 'up');

  return (
    <div style={{ width: 120, height: 130, display:'grid', placeItems:'center' }}>
      {/* Dispositivo */}
      <div className="pt-device">
        <div className={`pt-device__led ${state === 'down' ? 'pt-device__led--down' : state === 'warn' ? 'pt-device__led--warn' : ''}`} />
        <div className="pt-device__icon">
          {getIconByInstanceType?.(type)}
        </div>

        {/* Puertos/handles triangulares (puedes dejar 2 o 4 según la vista que quieras) */}
        <Handle type="source" position={Position.Top}    className="pt-handle-tri pt-handle-tri--on"    isConnectable={isConnectable} />
        <Handle type="target" position={Position.Bottom} className="pt-handle-tri pt-handle-tri--on"    isConnectable={isConnectable} />
        <Handle type="target" position={Position.Left}   className="pt-handle-tri pt-handle-tri--on"    isConnectable={isConnectable} />
        <Handle type="source" position={Position.Right}  className="pt-handle-tri pt-handle-tri--on"    isConnectable={isConnectable} />
      </div>

      {/* Etiquetas */}
      <div className="pt-device__label">{name}</div>
      <div className="pt-device__sublabel">{ip}</div>
    </div>
  );
};

export default memo(InstanceNode);
