/* eslint-disable react/prop-types */
import { memo } from 'react';
import { NodeResizer } from "@xyflow/react";
import './styles/SubNetworkNode.css'
import { Box, Paper, Typography } from '@mui/material';

// eslint-disable-next-line react/prop-types, react-refresh/only-export-components
function SubNetworkNodeInstance({ data }) {


  // eslint-disable-next-line react/prop-types
  const titleNode = data.title;
  return (
    <>
      <Paper className='node-subnetwork' elevation={3}
        sx={{ position: 'relative', minWidth: 180, minHeight: 100 }}
        // eslint-disable-next-line react/prop-types
        style={{ backgroundColor: data.bgNode }}>
        <NodeResizer minWidth={180} minHeight={100} />
        <Box sx={{ p: 1, backgroundColor: '#1976d2', color: '#fff' }}>
          <Typography>{titleNode} {data.subnetName}</Typography>
        </Box>
      </Paper>




    </>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export default memo(SubNetworkNodeInstance);
