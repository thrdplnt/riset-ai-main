"use client";

import CheckIcon from "@mui/icons-material/Check";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, Menu, MenuItem, Stack, Tooltip, Typography } from "@mui/material";
import { MouseEvent, useEffect, useState } from "react";

interface ModelOption {
  id: string;
  provider_name: string;
  display_name: string;
  model_name: string;
}

interface ModelSelectorProps {
  value: string;
  onChange: (modelId: string, modelName: string) => void;
  menuDirection?: "up" | "down";
}

export const ModelSelector = ({
  value,
  onChange,
  menuDirection = "up",
}: ModelSelectorProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [models, setModels] = useState<ModelOption[]>([]);
  const open = Boolean(anchorEl);

  useEffect(() => {
    fetch("/api/models")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setModels(data.data);
          // Tidak auto-select — user harus pilih sendiri
        }
      })
      .catch(() => {});
  }, []);

  const selected = models.find((m) => m.id === value);
  const handleOpen = (e: MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleSelect = (model: ModelOption) => {
    onChange(model.id, model.display_name);
    handleClose();
  };

  const anchorOrigin = menuDirection === "up"
    ? { horizontal: "left" as const, vertical: "top" as const }
    : { horizontal: "left" as const, vertical: "bottom" as const };

  const transformOrigin = menuDirection === "up"
    ? { horizontal: "left" as const, vertical: "bottom" as const }
    : { horizontal: "left" as const, vertical: "top" as const };

  return (
    <>
        <Box
          component="button"
          onClick={handleOpen}
          sx={{
            display: "flex", alignItems: "center", gap: 0.75,
            height: 30, px: 1.5, borderRadius: "100px",
            border: "1px solid",
            borderColor: "custom.borderLight",
            bgcolor: open ? "action.hover" : "transparent",
            cursor: "pointer",
            fontWeight: 500, fontSize: "13px",
            fontFamily: 'var(--font-inter), Helvetica, sans-serif',
            color: "text.secondary",
            transition: "background 0.15s",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          {selected?.display_name ?? "Select model"}
          <ExpandMoreIcon sx={{ fontSize: 16 }} />
        </Box>

      <Menu
        anchorEl={anchorEl} open={open} onClose={handleClose}
        anchorOrigin={anchorOrigin} transformOrigin={transformOrigin}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              minWidth: 200, maxWidth: 290,
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "custom.borderLight",
              boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
              overflow: "hidden", maxHeight: 380,
              ...(menuDirection === "up" ? { mb: 0.75 } : { mt: 0.75 }),
            },
          },
          list: {
            sx: { py: 0.5 },
          },
        }}
      >
        {models.map((model) => (
          <MenuItem
            key={model.id}
            selected={model.id === value}
            onClick={() => handleSelect(model)}
            sx={{
              mx: 0.5, borderRadius: "8px", mb: 0.25,
              py: 0.625, px: 1.25,
              minHeight: "auto",
              "&.Mui-selected": { bgcolor: "action.selected" },
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Stack sx={{ flexDirection: "row", alignItems: "center", gap: 1, width: "100%" }}>
              <Typography variant="body2" sx={{ flex: 1, fontWeight: 500, fontSize: "13px" }}>
                {model.display_name}
              </Typography>
              ...
            </Stack>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};