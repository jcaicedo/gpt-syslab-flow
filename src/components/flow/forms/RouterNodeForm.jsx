/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { Box, Button, Divider, IconButton, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import DeleteOutline from "@mui/icons-material/DeleteOutline";

export default function RouterNodeForm({
  nodeData = {},
  onSave,
  deleteNode,
  connectedVpcs = [],       // [{id, name, cidr}]
  vlanRegion = "us-east-1",
}) {
  // Carga inicial (si ya había rutas)
  const [routes, setRoutes] = useState(() => Array.isArray(nodeData.routeTable) ? nodeData.routeTable : []);

  // Asegura que las rutas apunten a VPCs existentes (por si desconectaste algo)
  useEffect(() => {
    setRoutes(prev => prev.filter(r =>
      connectedVpcs.some(v => v.id === r.sourceVpcId) &&
      (r.destVpcId ? connectedVpcs.some(v => v.id === r.destVpcId) : true)
    ));
  }, [connectedVpcs]);

  const canAdd = connectedVpcs.length >= 2;

  const addRoute = () => {
    if (!canAdd) return;
    const src = connectedVpcs[0];
    const dst = connectedVpcs.find(v => v.id !== src.id) || connectedVpcs[0];
    setRoutes(r => [...r, {
      sourceVpcId: src.id,
      destVpcId: dst.id,
      destCidr: dst.cidr || "",
    }]);
  };

  const updateRoute = (idx, patch) => {
    setRoutes(r => {
      const next = [...r];
      next[idx] = { ...next[idx], ...patch };
      // si cambia el destVpcId, sincroniza destCidr con el CIDR de esa VPC
      if (patch.destVpcId) {
        const v = connectedVpcs.find(v => v.id === patch.destVpcId);
        next[idx].destCidr = v?.cidr || "";
      }
      return next;
    });
  };

  const removeRoute = (idx) => {
    setRoutes(r => r.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    // Guarda dentro del router como "routeTable"
    onSave({
      ...nodeData,
      routeTable: routes,
      region: nodeData.region || vlanRegion,
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Router</Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        VPCs conectadas a este router: {connectedVpcs.length || 0}
      </Typography>

      <Divider sx={{ my: 1 }} />

      {!canAdd && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Conecta al menos <b>dos VPC</b> a este router para poder definir rutas.
        </Typography>
      )}

      {routes.map((r, idx) => {
        const src = connectedVpcs.find(v => v.id === r.sourceVpcId);
        const dst = connectedVpcs.find(v => v.id === r.destVpcId);
        return (
          <Stack key={idx} direction="row" gap={1} alignItems="center" sx={{ mb: 1 }}>
            <Select
              size="small"
              value={r.sourceVpcId || ""}
              onChange={(e) => updateRoute(idx, { sourceVpcId: e.target.value })}
              sx={{ minWidth: 160 }}
            >
              {connectedVpcs.map(v => (
                <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>
              ))}
            </Select>

            <Typography variant="body2">→</Typography>

            <Select
              size="small"
              value={r.destVpcId || ""}
              onChange={(e) => updateRoute(idx, { destVpcId: e.target.value })}
              sx={{ minWidth: 160 }}
            >
              {connectedVpcs
                .filter(v => v.id !== r.sourceVpcId) // evita mismo origen=destino
                .map(v => (
                  <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>
                ))}
            </Select>

            <TextField
              size="small"
              label="dest CIDR"
              value={r.destCidr || ""}
              onChange={(e) => updateRoute(idx, { destCidr: e.target.value })}
              sx={{ minWidth: 180 }}
            />

            <IconButton onClick={() => removeRoute(idx)}>
              <DeleteOutline />
            </IconButton>
          </Stack>
        );
      })}

      <Stack direction="row" gap={1} sx={{ mt: 1 }}>
        <Button variant="outlined" onClick={addRoute} disabled={!canAdd}>+ Ruta</Button>
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={handleSave}>Guardar</Button>
        <Button color="error" onClick={deleteNode}>Delete Node</Button>
      </Stack>
    </Box>
  );
}
