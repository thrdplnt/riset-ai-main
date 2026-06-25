"use client";

import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import {
  Box, Divider, Link, Popover, Stack, Typography,
} from "@mui/material";
import { MouseEvent, useState } from "react";
import { ROUTES } from "@/routes";

const DatabaseIcon = ({ size = 13 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

interface TokenBadgeProps {
  remaining: number | null;
  total: number | null;
  planName?: string;
  expiresAt?: string | null;
  modelName?: string;
}

export const TokenBadge = ({
  remaining,
  total,
  planName = "Basic",
  expiresAt,
  modelName,
}: TokenBadgeProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const formatNumber = (n: number) => n.toLocaleString("en-US");

  const expiry = expiresAt
    ? new Date(expiresAt).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      })
    : null;

  return (
    <>
      {/* Badge */}
      <Box
        onClick={handleOpen}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          px: 1.5,
          py: 0.5,
          bgcolor: "background.paper",
          borderRadius: "8px",
          border: "1px solid",
          borderColor: "custom.borderLight",
          cursor: "pointer",
          transition: "background 0.15s",
          color: "text.secondary",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {modelName || "—"}
        </Typography>
        <Box sx={{
          width: "1px", height: 12,
          bgcolor: "custom.borderLight",
        }} />
        <DatabaseIcon size={14} />
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {remaining !== null ? `${remaining.toLocaleString("en-US")} Token` : "— Token"}
        </Typography>
      </Box>

      {/* Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              mt: 1, minWidth: 240,
              borderRadius: "14px",
              border: "1px solid", borderColor: "custom.borderLight",
              boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
              overflow: "hidden",
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, bgcolor: "action.hover" }}>
          <Typography variant="caption" color="text.secondary">Plan</Typography>
          <Typography sx={{ fontWeight: 700, fontSize: "14px", color: "text.primary" }}>
            {planName}
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ px: 2, py: 1.5 }}>
          <Stack sx={{ gap: 0.5 }}>
            <Typography sx={{ fontWeight: 600, fontSize: "13px", color: "text.primary" }}>
              Tokens Quota
            </Typography>
            <Stack sx={{
              flexDirection: "row", alignItems: "center",
              gap: 0.5, color: "text.secondary",
            }}>
              <DatabaseIcon size={13} />
              <Typography variant="body2" color="text.secondary"
                sx={{ fontWeight: 500, fontSize: "13px" }}>
                {remaining !== null ? `${formatNumber(remaining)} Token left` : "—"}
              </Typography>
            </Stack>
            {expiry && (
              <Typography variant="caption" color="text.secondary">
                Expires {expiry}
              </Typography>
            )}
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ px: 2, py: 1.25 }}>
          <Link
            href={ROUTES.SETTINGS_TOKEN_USAGE}
            underline="none"
            sx={{
              display: "flex", alignItems: "center", gap: 0.5,
              fontSize: "13px", fontWeight: 600, color: "text.primary",
              "&:hover": { color: "primary.main" },
            }}
          >
            Check Usage
            <ArrowForwardIosOutlinedIcon sx={{ fontSize: 10 }} />
          </Link>
        </Box>
      </Popover>
    </>
  );
};