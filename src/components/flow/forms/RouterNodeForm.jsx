/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Paper,
} from "@mui/material";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import { Netmask } from "netmask";

const isValidCidr = (cidr) => {
  try { new Netmask(cidr); return true; } catch { return false; }
};

export default function RouterNodeForm({
  node,
  nodeData = {},
  onSave,
  deleteNode,
  connectedVpcs = [],     // [{id, name, cidr}]
  allVpcCidrs = [],       // [{id, name, cidr}]
  vlanRegion = "us-east-1",
}) {
  const [identifier, setIdentifier] = useState(nodeData.identifier || node?.id || "");
  const [routes, setRoutes] = useState(
    Array.isArray(nodeData.routeTable) ? nodeData.routeTable : []
  );

  useEffect(() => {
    setRoutes(prev =>
      prev.filter(r =>
        connectedVpcs.some(v => v.id === r.sourceVpcId) &&
        (!r.destVpcId || connectedVpcs.some(v => v.id === r.destVpcId))
      )
    );
  }, [connectedVpcs]);

  useEffect(() => {
    setIdentifier(nodeData.identifier || node?.id || "");
    setRoutes(Array.isArray(nodeData.routeTable) ? nodeData.routeTable : []);
  }, [nodeData, node?.id]);

  const canAdd = connectedVpcs.length >= 2;

  const [draft, setDraft] = useState({
    sourceVpcId: connectedVpcs[0]?.id || "",
    destVpcId: "",
    destCidr: "",
  });

  useEffect(() => {
    if (!draft.destVpcId) return;
    const v = allVpcCidrs.find(x => x.id === draft.destVpcId);
    if (v?.cidr) setDraft(d => ({ ...d, destCidr: v.cidr }));
  }, [draft.destVpcId, allVpcCidrs]);

  const draftErrors = useMemo(() => {
    const errs = {};
    if (!identifier?.trim()) errs.identifier = "Identifier is required";
    if (!draft.sourceVpcId) errs.sourceVpcId = "Source VPC is required";
    if (!draft.destCidr) errs.destCidr = "Destination CIDR is required";
    else if (!isValidCidr(draft.destCidr)) errs.destCidr = "Invalid CIDR format";
    if (draft.sourceVpcId && draft.destVpcId && draft.sourceVpcId === draft.destVpcId) {
      errs.destVpcId = "Destination VPC must be different from source";
    }
    return errs;
  }, [identifier, draft]);

  const addRoute = () => {
    if (!canAdd || Object.keys(draftErrors).length) return;
    setRoutes(prev => [...prev, {
      sourceVpcId: draft.sourceVpcId,
      destVpcId: draft.destVpcId || null,
      destCidr: draft.destCidr,
    }]);
    setDraft(d => ({ ...d, destVpcId: "", destCidr: "" }));
  };

  const updateRoute = (idx, patch) => {
    setRoutes(prev => {
      const next = [...prev];
      const updated = { ...next[idx], ...patch };
      if (Object.prototype.hasOwnProperty.call(patch, "destVpcId")) {
        const v = allVpcCidrs.find(x => x.id === patch.destVpcId);
        updated.destCidr = v?.cidr || updated.destCidr || "";
      }
      if (updated.sourceVpcId && updated.destVpcId && updated.sourceVpcId === updated.destVpcId) {
        updated.destVpcId = "";
      }
      next[idx] = updated;
      return next;
    });
  };

  const removeRoute = (idx) => setRoutes(prev => prev.filter((_, i) => i !== idx));

  const handleSave = () => {
    onSave({
      ...nodeData,
      identifier: identifier.trim() || (node?.id ?? "router"),
      routeTable: routes,
      region: nodeData.region || vlanRegion,
    });
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 1.5 } }}>
      <Typography variant="h6" gutterBottom>Router</Typography>

      <TextField
        fullWidth
        label="Identifier"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        error={!!draftErrors.identifier}
        helperText={draftErrors.identifier}
        sx={{ mb: 1 }}
        inputProps={{ maxLength: 40 }}
      />

      <Stack spacing={0.5} sx={{ mb: 1 }}>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          VPCs conectadas a este router:
        </Typography>
        <Stack
          direction="row"
          spacing={0.75}
          useFlexGap
          flexWrap="wrap"
          sx={{ "& .MuiChip-root": { height: 24, fontSize: 12 } }}
        >
          {connectedVpcs.length === 0
            ? <Chip label="No hay VPC conectadas" size="small" />
            : connectedVpcs.map(v => (
                <Chip key={v.id} label={`${v.name}${v.cidr ? ` • ${v.cidr}` : ""}`} size="small" />
              ))
          }
        </Stack>
      </Stack>

      <Divider sx={{ my: 1.25 }} />

      {/* Borrador nueva ruta */}
      <Typography variant="subtitle1" sx={{ mb: 0.5 }}>Agregar ruta</Typography>
      {!canAdd && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Conecta al menos <b>dos VPC</b> a este router para poder definir rutas.
        </Typography>
      )}

      <Grid container spacing={1}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth error={!!draftErrors.sourceVpcId}>
            <InputLabel id="src-vpc">Source VPC</InputLabel>
            <Select
              labelId="src-vpc"
              label="Source VPC"
              value={draft.sourceVpcId}
              onChange={(e) => setDraft(d => ({ ...d, sourceVpcId: e.target.value }))}
            >
              {connectedVpcs.map(v => (
                <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>
              ))}
            </Select>
            {draftErrors.sourceVpcId && <FormHelperText>{draftErrors.sourceVpcId}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth error={!!draftErrors.destVpcId}>
            <InputLabel id="dst-vpc">Destination VPC (optional)</InputLabel>
            <Select
              labelId="dst-vpc"
              label="Destination VPC (optional)"
              value={draft.destVpcId}
              onChange={(e) => setDraft(d => ({ ...d, destVpcId: e.target.value }))}
            >
              <MenuItem value="">— Manual CIDR —</MenuItem>
              {allVpcCidrs
                .filter(v => v.id !== draft.sourceVpcId)
                .map(v => (
                  <MenuItem key={v.id} value={v.id}>
                    {v.name}{v.cidr ? ` • ${v.cidr}` : ""}
                  </MenuItem>
                ))}
            </Select>
            {draftErrors.destVpcId && <FormHelperText>{draftErrors.destVpcId}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Destination CIDR"
            placeholder="Ej. 10.0.16.0/20 o una subnet específica"
            value={draft.destCidr}
            onChange={(e) => setDraft(d => ({ ...d, destCidr: e.target.value.trim() }))}
            error={!!draftErrors.destCidr}
            helperText={draftErrors.destCidr || "Puedes seleccionar una VPC para autocompletar."}
          />
        </Grid>

        <Grid item xs={12}>
          <Tooltip title={canAdd ? "Agregar ruta" : "Conecta 2+ VPC"}>
            <span>
              <Button
                variant="outlined"
                onClick={addRoute}
                disabled={!canAdd || Object.keys(draftErrors).length > 0}
                sx={{ mt: 0.5 }}
              >
                + Ruta
              </Button>
            </span>
          </Tooltip>
        </Grid>
      </Grid>

      <Divider sx={{ my: 1.25 }} />

      {/* Lista de rutas actuales */}
      <Typography variant="subtitle1" sx={{ mb: 0.5 }}>Rutas del router</Typography>

      <Stack spacing={0.75}>
        {routes.length === 0 && (
          <Paper variant="outlined" sx={{ p: 1, bgcolor: 'background.default', opacity: 0.8 }}>
            <Typography variant="body2">Sin rutas aún.</Typography>
          </Paper>
        )}

        {routes.map((r, idx) => (
          <Grid key={`${r.sourceVpcId}-${idx}`} container spacing={1} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id={`src-${idx}`}>Source</InputLabel>
                <Select
                  labelId={`src-${idx}`}
                  label="Source"
                  value={r.sourceVpcId || ""}
                  onChange={(e) => updateRoute(idx, { sourceVpcId: e.target.value })}
                >
                  {connectedVpcs.map(v => (
                    <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id={`dst-${idx}`}>Destination VPC (optional)</InputLabel>
                <Select
                  labelId={`dst-${idx}`}
                  label="Destination VPC (optional)"
                  value={r.destVpcId || ""}
                  onChange={(e) => updateRoute(idx, { destVpcId: e.target.value })}
                >
                  <MenuItem value="">— Manual CIDR —</MenuItem>
                  {connectedVpcs
                    .filter(v => v.id !== r.sourceVpcId)
                    .map(v => (
                      <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={10} md={3.5}>
              <TextField
                fullWidth
                size="small"
                label="dest CIDR"
                value={r.destCidr || ""}
                onChange={(e) => updateRoute(idx, { destCidr: e.target.value })}
              />
            </Grid>

            <Grid item xs={2} md={0.5} sx={{ textAlign: { xs: 'right', md: 'left' } }}>
              <IconButton onClick={() => removeRoute(idx)} size="small">
                <DeleteOutline fontSize="small" />
              </IconButton>
            </Grid>
          </Grid>
        ))}
      </Stack>

      {/* Acciones */}
      <Stack direction="row" gap={1} sx={{ mt: 2 }}>
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={handleSave}>Guardar</Button>
        <Button color="error" onClick={deleteNode}>Delete Node</Button>
      </Stack>
    </Box>
  );
}
