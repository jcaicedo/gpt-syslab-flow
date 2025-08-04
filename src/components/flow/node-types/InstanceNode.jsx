import { memo } from 'react'
import { Box, Paper, Typography } from '@mui/material';
import './styles/InstanceNode.css';
import { getIconByInstanceType } from '../helper/iconHelper';



// eslint-disable-next-line react/prop-types
const InstanceNode = ({ data, type }) => {

    // eslint-disable-next-line react/prop-types
    const titleNode = data.title

    return (
        <Paper elevation={3} className="instance-node">
            <Typography variant="h6" className="instance-node-title">{titleNode}</Typography>
            <Box className="instance-icon-container">
                {getIconByInstanceType(type)}
            </Box>
        </Paper>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export default memo(InstanceNode);
