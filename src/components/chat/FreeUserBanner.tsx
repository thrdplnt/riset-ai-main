"use client";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, Typography } from "@mui/material";

export const FreeUserBanner = () => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      px: 2.5,
      py: 1.25,
      bgcolor: "rgba(33,150,243,0.07)",
      borderBottom: "1px solid rgba(33,150,243,0.15)",
      flexShrink: 0,
    }}
  >
    <InfoOutlinedIcon sx={{ fontSize: 16, color: "#2196F3", flexShrink: 0 }} />
    <Typography sx={{ fontSize: "13px", color: "#1565C0" }}>
      Akun kamu saat ini pada plan{" "}
      <strong>Free</strong>. Hubungi admin untuk mengaktifkan akses AI.
    </Typography>
  </Box>
);