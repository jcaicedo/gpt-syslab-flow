import { memo } from 'react';
import { Handle, Position, NodeResizer } from "@xyflow/react";
import './styles/VPCNode.css';
import { Box, Paper, Typography } from '@mui/material';

// eslint-disable-next-line react/prop-types, react-refresh/only-export-components
function VPCNodeInstance({ data, isConnectable }) {

    return (
        <Paper className='node-vpc' elevation={3}
            sx={{ position: 'relative', minWidth: 600, minHeight: 400 }}
            style={{ backgroundColor: data.bgColor || '#e8eaf6' }}>

            <NodeResizer minWidth={600} minHeight={400} />
            <Box sx={{ padding: 1, backgroundColor: '#0B8068', color: 'white' }}>
                <Typography fontWeight="bold">{data.vpcName}</Typography>
                {data.cirdBlock && <Typography variant="body2">
                    CIRD: {data.cirdBlock}
                </Typography>
                }

            </Box>
            <Handle
                type="source"
                position={Position.Top}
                style={{ width: 30, height: 30, top: -5, left: '50%', background: 'green' }}
                isConnectable={isConnectable}
                onConnect={(params) => console.log("handle VPC onConnect", params)}
            />
        </Paper>
    )


}

export default memo(VPCNodeInstance);