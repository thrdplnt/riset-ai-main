"use client";

import {
  Box, Button, Chip, CircularProgress, Dialog, DialogContent,
  DialogTitle, Divider, FormControl, IconButton, MenuItem,
  Paper, Select, Slider, Stack, Switch, TextField, Tooltip, Typography,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { useEffect, useState } from "react";

interface Model {
  id: string;
  provider_id: string;
  provider_name: string;
  display_name: string;
  model_name: string;
  is_active: boolean;
  isNew?: boolean;
  isDirty?: boolean;
}

interface AvailableModel {
  model_name: string;
  display_name: string;
  max_context_length: number;
}

interface AvailableModels {
  openai: AvailableModel[] | { error: string };
  gemini: AvailableModel[] | { error: string };
  anthropic: AvailableModel[] | { error: string };
}

const PROVIDERS = [
  { id: "openai", label: "OpenAI" },
  { id: "gemini", label: "Google" },
  { id: "claude", label: "Anthropic" },
];

function getToken() {
  if (typeof window === "undefined") return "";
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1] ?? "";
}

function formatTokenLimit(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
}

export default function ModelManagementPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [tokenLimit, setTokenLimit] = useState<number>(5_000_000);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [presetOpen, setPresetOpen] = useState(false);
  const [available, setAvailable] = useState<AvailableModels | null>(null);
  const [loadingAvailable, setLoadingAvailable] = useState(false);

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  });

  useEffect(() => {
    fetch("/api/admin/models", { headers: getHeaders() })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setModels(data.data);
        else if (Array.isArray(data)) setModels(data);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAvailable = async () => {
    setLoadingAvailable(true);
    setPresetOpen(true);
    try {
      const res = await fetch("/api/admin/models/available", { headers: getHeaders() });
      const data = await res.json();
      setAvailable(data);
    } catch {
      setAvailable(null);
    } finally {
      setLoadingAvailable(false);
    }
  };

  const handleAddFromPreset = (providerId: string, model: AvailableModel) => {
    const alreadyExists = models.some((m) => m.model_name === model.model_name);
    if (alreadyExists) return;
    setModels((prev) => [...prev, {
      id: "",
      provider_id: providerId,
      provider_name: PROVIDERS.find((p) => p.id === providerId)?.label ?? providerId,
      display_name: model.display_name,
      model_name: model.model_name,
      is_active: true,
      isNew: true,
    }]);
    setPresetOpen(false);
  };

  const handleAddManual = () => {
    setModels((prev) => [...prev, {
      id: "",
      provider_id: "openai",
      provider_name: "OpenAI",
      display_name: "",
      model_name: "",
      is_active: true,
      isNew: true,
    }]);
  };

  const handleChange = (index: number, field: keyof Model, value: unknown) => {
    setModels((prev) =>
      prev.map((m, i) => i === index ? { ...m, [field]: value, isDirty: true } : m)
    );
  };

  const handleDelete = async (index: number) => {
    const model = models[index];
    if (model.isNew) {
      setModels((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    const res = await fetch("/api/admin/models", {
      method: "DELETE",
      headers: getHeaders(),
      body: JSON.stringify({ model_id: model.id }),
    });
    if (res.ok) setModels((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleActive = async (index: number) => {
    const model = models[index];
    if (model.isNew) {
      handleChange(index, "is_active", !model.is_active);
      return;
    }
    const newActive = !model.is_active;
    const res = await fetch("/api/admin/models", {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ model_id: model.id, is_active: newActive }),
    });
    if (res.ok) handleChange(index, "is_active", newActive);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      for (const model of models) {
        if (model.isNew && model.display_name && model.model_name) {
          await fetch("/api/admin/models", {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify({
              provider_id: model.provider_id,
              model_name: model.model_name,
              display_name: model.display_name,
            }),
          });
        } else if (!model.isNew && model.isDirty) {
          await fetch("/api/admin/models", {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify({
              model_id: model.id,
              display_name: model.display_name,
              model_name: model.model_name,
              is_active: model.is_active,
            }),
          });
        }
      }
      const res = await fetch("/api/admin/models", { headers: getHeaders() });
      const data = await res.json();
      if (data.success) setModels(data.data);
      setSaveMsg("Konfigurasi berhasil disimpan!");
    } catch {
      setSaveMsg("Terjadi kesalahan saat menyimpan.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 3000);
    }
  };

  const getAvailableList = (key: keyof AvailableModels): AvailableModel[] => {
    if (!available) return [];
    const val = available[key];
    return Array.isArray(val) ? val : [];
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>Model Management</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Manage models and token limits.
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {/* Action buttons */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 3, alignItems: "center" }}>
        <Button variant="outlined" size="small" startIcon={<TuneOutlinedIcon />}
          onClick={loadAvailable} sx={{ borderRadius: "8px" }}>
          Dari Preset
        </Button>
        <Button variant="outlined" size="small" startIcon={<AddOutlinedIcon />}
          onClick={handleAddManual} sx={{ borderRadius: "8px" }}>
          Manual
        </Button>
        <Box sx={{ flex: 1 }} />
        {saveMsg && (
          <Typography variant="body2"
            color={saveMsg.includes("berhasil") ? "success.main" : "error.main"}>
            {saveMsg}
          </Typography>
        )}
        <Button variant="contained" size="small" startIcon={<SaveOutlinedIcon />}
          onClick={handleSave} disabled={saving} sx={{ borderRadius: "8px" }}>
          {saving ? "Menyimpan..." : "Simpan Konfigurasi"}
        </Button>
      </Stack>

      {/* Token Limit */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Batas Token per Pengguna
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total akumulasi token input &amp; output
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <TextField size="small" type="number" value={tokenLimit}
              onChange={(e) => setTokenLimit(Number(e.target.value))}
              slotProps={{ htmlInput: { min: 0 } }} sx={{ width: 140 }} />
            <Typography variant="body2" color="text.secondary">tokens</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 32 }}>
              {formatTokenLimit(tokenLimit)}
            </Typography>
          </Stack>
        </Stack>
        <Slider value={tokenLimit} onChange={(_, val) => setTokenLimit(val as number)}
          min={0} max={10_000_000} step={100_000} sx={{ color: "text.primary" }} />
      </Paper>

      {/* Models list */}
      <Stack spacing={2}>
        {models.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Belum ada model. Tambah dengan Dari Preset atau Manual.
            </Typography>
          </Paper>
        ) : (
          models.map((model, index) => (
            <Paper key={model.id || index} variant="outlined" sx={{ p: 3 }}>
              <Stack direction="row" sx={{ alignItems: "center", mb: 2 }} spacing={1.5}>
                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <Select value={model.provider_id}
                    onChange={(e) => handleChange(index, "provider_id", e.target.value)}
                    disabled={!model.isNew}>
                    {PROVIDERS.map((p) => (
                      <MenuItem key={p.id} value={p.id}>{p.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Chip
                  label={model.is_active ? "Aktif" : "Nonaktif"}
                  size="small"
                  sx={{
                    bgcolor: model.is_active ? "rgba(87,202,34,0.12)" : "rgba(0,0,0,0.08)",
                    color: model.is_active ? "success.main" : "text.secondary",
                    fontWeight: 600, fontSize: "12px",
                  }}
                />
                <Box sx={{ flex: 1 }} />

                <Tooltip title={model.is_active ? "Nonaktifkan" : "Aktifkan"}>
                  <Switch checked={model.is_active}
                    onChange={() => handleToggleActive(index)} size="small" />
                </Tooltip>

                <Tooltip title="Hapus model">
                  <IconButton size="small" onClick={() => handleDelete(index)}
                    sx={{ color: "text.secondary", border: "none" }}>
                    <DeleteOutlineOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary"
                    sx={{ mb: 0.5, display: "block" }}>
                    Nama Tampilan (Label)
                  </Typography>
                  <TextField fullWidth size="small" value={model.display_name}
                    onChange={(e) => handleChange(index, "display_name", e.target.value)}
                    placeholder="GPT-4o Mini" />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary"
                    sx={{ mb: 0.5, display: "block" }}>
                    Model ID (API Name)
                  </Typography>
                  <TextField fullWidth size="small" value={model.model_name}
                    onChange={(e) => handleChange(index, "model_name", e.target.value)}
                    placeholder="gpt-4o-mini" />
                </Box>
              </Stack>
            </Paper>
          ))
        )}
      </Stack>

      {/* Dialog Preset */}
      <Dialog open={presetOpen} onClose={() => setPresetOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Pilih Model dari Provider</DialogTitle>
        <DialogContent>
          {loadingAvailable ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : (
            <Stack spacing={3} sx={{ mt: 1 }}>
              {(["openai", "gemini", "anthropic"] as const).map((provKey) => {
                const provId = provKey === "anthropic" ? "claude" : provKey;
                const provLabel = PROVIDERS.find((p) => p.id === provId)?.label ?? provKey;
                const list = getAvailableList(provKey);
                return (
                  <Box key={provKey}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      {provLabel}
                    </Typography>
                    {list.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        Tidak ada model tersedia
                      </Typography>
                    ) : (
                      <Stack spacing={0.5}>
                        {list.map((m) => {
                          const exists = models.some((em) => em.model_name === m.model_name);
                          return (
                            <Stack key={m.model_name} direction="row"
                              sx={{ alignItems: "center", justifyContent: "space-between",
                                p: 1.5, borderRadius: "8px",
                                border: "1px solid", borderColor: "divider",
                                bgcolor: exists ? "action.hover" : "background.paper" }}>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {m.display_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {m.model_name}
                                </Typography>
                              </Box>
                              <Button size="small" variant={exists ? "outlined" : "contained"}
                                disabled={exists}
                                onClick={() => handleAddFromPreset(provId, m)}
                                sx={{ borderRadius: "8px", minWidth: 80 }}>
                                {exists ? "Sudah ada" : "Tambah"}
                              </Button>
                            </Stack>
                          );
                        })}
                      </Stack>
                    )}
                  </Box>
                );
              })}
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}