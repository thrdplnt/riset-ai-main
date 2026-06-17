"use client";

import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import {
  Box, Divider, LinearProgress,
  Link, Popover, Stack, Tooltip, Typography,
} from "@mui/material";
import { MouseEvent, useState } from "react";
import { ROUTES } from "@/routes";

// ── Database icon (SVG custom) ─────────────────────────────
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
}

export const TokenBadge = ({
  remaining,
  total,
  planName = "Basic",
  expiresAt,
}: TokenBadgeProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const percent = remaining !== null && total !== null && total > 0
    ? Math.round((remaining / total) * 100)
    : null;

  const formatNumber = (n: number) => n.toLocaleString("en-US");

  const expiry = expiresAt
    ? new Date(expiresAt).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
      })
    : null;

  return (
    <>
      {/* Badge */}
      <Tooltip title={
        remaining !== null && total !== null
          ? `${remaining.toLocaleString()} / ${total.toLocaleString()} tokens remaining`
          : "No active subscription"
      }>
        <Box
          onClick={handleOpen}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            px: 1.5,
            py: 0.5,
            bgcolor: open ? "action.selected" : "action.hover",
            borderRadius: "100px",
            border: "1px solid",
            borderColor: "custom.borderLight",
            cursor: "pointer",
            transition: "background 0.15s",
            color: "text.secondary",
            "&:hover": { bgcolor: "action.selected" },
          }}
        >
          <DatabaseIcon size={14} />
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {remaining !== null ? `${remaining.toLocaleString("en-US")} Token` : "—"}
          </Typography>
        </Box>
      </Tooltip>

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
              mt: 1, minWidth: 280,
              borderRadius: "14px",
              border: "1px solid", borderColor: "custom.borderLight",
              boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
              overflow: "hidden",
            },
          },
        }}
      >
        {/* Plan */}
        <Box sx={{ px: 2.5, py: 2, bgcolor: "action.hover" }}>
          <Typography variant="body2" color="text.secondary">Plan</Typography>
          <Typography sx={{ fontWeight: 700, fontSize: "16px", color: "text.primary" }}>
            {planName}
          </Typography>
        </Box>

        <Divider />

        {/* Quota */}
        <Box sx={{ px: 2.5, py: 2 }}>
          <Stack sx={{
            flexDirection: "row", justifyContent: "space-between",
            alignItems: "flex-start", mb: 1,
          }}>
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: "14px", color: "text.primary" }}>
                Tokens Quota
              </Typography>
              {expiry && (
                <Typography variant="body2" color="text.secondary">
                  Expires {expiry}
                </Typography>
              )}
            </Box>
            <Stack sx={{
              flexDirection: "row", alignItems: "center",
              gap: 0.5, color: "text.secondary",
            }}>
              <DatabaseIcon size={13} />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {remaining !== null ? `${formatNumber(remaining)} Token left` : "—"}
              </Typography>
            </Stack>
          </Stack>

          {percent !== null && (
            <LinearProgress
              variant="determinate"
              value={percent}
              sx={{
                height: 6, borderRadius: "100px",
                bgcolor: "rgba(0,0,0,0.08)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: "100px",
                  bgcolor: percent < 20 ? "error.main" : "primary.main",
                },
              }}
            />
          )}

          {remaining !== null && total !== null && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              {percent}% left · {formatNumber(remaining)} / {formatNumber(total)}
            </Typography>
          )}
        </Box>

        <Divider />

        {/* Check Usage */}
        <Box sx={{ px: 2.5, py: 1.5 }}>
          <Link
            href={ROUTES.SETTINGS_TOKEN_USAGE}
            underline="none"
            sx={{
              display: "flex", alignItems: "center", gap: 0.5,
              fontSize: "13.5px", fontWeight: 600, color: "text.primary",
              "&:hover": { color: "primary.main" },
            }}
          >
            Check Usage
            <ArrowForwardIosOutlinedIcon sx={{ fontSize: 11 }} />
          </Link>
        </Box>
      </Popover>
    </>
  );
};