import React, { memo } from 'react';
import { Handle, Position } from "@xyflow/react";
import { Paper, Box, Typography } from '@mui/material';
import './styles/RouterNode.css';

const RouterNodeInstance = ({ id, title = "ROUTER" }) => {
    return (
        <Paper elevation={3} className="router-node" style={{ backgroundColor: '#fff' }}>
            {title && <Typography variant="h6" className="router-node-title">{title}</Typography>}
            <Box className="router">
                <Box className="circle">
                    <Box className="horizontal-line"></Box>
                    <Box className="vertical-line"></Box>
                    <Box className="arrow up"></Box>
                    <Box className="arrow right"></Box>
                    <Box className="arrow down"></Box>
                    <Box className="arrow left"></Box>
                </Box>
            </Box>
            <Handle type="target" position={Position.Bottom} />
            
        </Paper>
    );
};

export default memo(RouterNodeInstance);
