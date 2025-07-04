/* eslint-disable react/prop-types */
import { memo } from 'react';
import { Handle, Position, NodeResizer } from "@xyflow/react";
import './styles/SubNetworkNode.css'
import { Box, Paper, Typography } from '@mui/material';

// eslint-disable-next-line react/prop-types, react-refresh/only-export-components
function SubNetworkNodeInstance({ data, isConnectable }) {


  const DEFAULT_HANDLE_STYLE = {
    width: 30,
    height: 30,
    bottom: -5,
  };
  // eslint-disable-next-line react/prop-types
  const titleNode = data.title;
  return (
    <>
      <Paper className='node-subnetwork' elevation={3}
        sx={{ position: 'relative', minWidth: 180, minHeight: 100 }}
        // eslint-disable-next-line react/prop-types
        style={{ backgroundColor: data.bgNode }}>
        <NodeResizer minWidth={180} minHeight={100} />
        <Box sx={{ padding: 1 }} style={{ backgroundColor: '#00008b' }}>
          <Typography>{titleNode} {data.subnetName}</Typography>
        </Box>
        <Handle
          type="source"
          id='blue'
          position={Position.Top}
          style={{ ...DEFAULT_HANDLE_STYLE, left: "50%", background: "blue" }}
          isConnectable={isConnectable}
          onConnect={(params) => console.log("handle onConnect", params)}
        />
     
      </Paper>




    </>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export default memo(SubNetworkNodeInstance);
