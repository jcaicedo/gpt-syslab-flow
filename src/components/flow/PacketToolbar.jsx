/* eslint-disable react/prop-types */
import { Button, Stack, Typography, IconButton, Tooltip } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';

export default function PacketToolbar({
  onSave, onRestore, onRestoreInitial, onDeploy,
  onZoomIn, onZoomOut, onFitView, title = 'Logical'
}) {
  return (
    <div className="pt-panel" style={{ padding: 8, margin: 8 }}>
      <div className="pt-toolbar">
        <Typography className="pt-toolbar__title">{title}</Typography>

        {/* Zoom / navegación a la izquierda */}
        <Stack direction="row" spacing={0.5} className="pt-toolbar__group">
          <Tooltip title="Zoom in"><IconButton size="small" className="pt-ibtn" onClick={onZoomIn}><ZoomInIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Zoom out"><IconButton size="small" className="pt-ibtn" onClick={onZoomOut}><ZoomOutIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Fit view"><IconButton size="small" className="pt-ibtn" onClick={onFitView}><CenterFocusStrongIcon fontSize="small" /></IconButton></Tooltip>
        </Stack>

        {/* Botones principales (estilo PT) */}
        <Stack direction="row" spacing={1} className="pt-toolbar__group" sx={{ ml: 2 }}>
          <Button className="pt-btn" startIcon={<SaveIcon />} onClick={onSave}>Save</Button>
          <Button className="pt-btn" startIcon={<RestoreIcon />} onClick={onRestore}>Restore</Button>
          <Button className="pt-btn pt-btn--yellow" startIcon={<RestartAltIcon />} onClick={onRestoreInitial}>Restore Initial</Button>
          <Button className="pt-btn pt-btn--green" startIcon={<PlayArrowIcon />} onClick={onDeploy}>Deploy</Button>
          {/* alternativa de upload si lo necesitas */}
          {/* <Button className="pt-btn" startIcon={<CloudUploadIcon />}>Import</Button> */}
        </Stack>
      </div>
    </div>
  );
}
