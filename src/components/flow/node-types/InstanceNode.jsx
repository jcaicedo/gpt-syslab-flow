import { memo } from 'react';
import { Handle, Position } from "@xyflow/react";
import NodeChrome from './NodeChrome';
import '../styles/packet-tracer.css';
import { getIconByInstanceType } from '../helper/iconHelper';

// eslint-disable-next-line react/prop-types
const InstanceNode = ({ data = {}, type, isConnectable }) => {
  const name = data.name || data.title || 'Instance';
  const ip = data.ipAddress || 'IP n/a';
  const ami = data.ami || 'AMI n/a';
  const itype = data.instanceType || 'type n/a';

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <NodeChrome
        type="inst"
        title={name}
        subtitle={`${ip} • ${itype}`}
        status="up"
        rightArea={<span className="pt-badge">{ami}</span>}
      >
        <div className="pt-badges" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="pt-badge">ENI-0</span>
          <span className="pt-badge">SSH {data?.sshAccess ? 'Yes' : 'No'}</span>
          <div style={{ marginLeft: 'auto' }}>{getIconByInstanceType?.(type)}</div>
        </div>
      </NodeChrome>

      {/* Instancia ↔ Subnet (un solo puerto superior suele ser suficiente) */}
      {/* <Handle type="source" position={Position.Top} className="pt-handle" isConnectable={isConnectable} />
      <Handle type="target" position={Position.Top} className="pt-handle" isConnectable={isConnectable} /> */}
    </div>
  );
};

export default memo(InstanceNode);
