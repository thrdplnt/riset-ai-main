"use client";

import { Box, Divider, Typography, styled, useTheme } from "@mui/material";
import SidebarMenu from "./SidebarMenu";

const SidebarWrapper = styled(Box)(({ theme }) => (`
  width: 280px;
  min-width: 280px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 7;
  background: ${theme.palette.background.paper};
  border-right: 1px solid ${theme.palette.divider};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`));

interface SidebarProps {
  role: "user" | "admin";
  onLogout: () => void;
}

export default function Sidebar({ role, onLogout }: SidebarProps) {
  const theme = useTheme();

  return (
    <SidebarWrapper>
      {/* Logo */}
      <Box sx={{ px: 3, py: 2.5 }}>
        <Typography
            variant="h5"
            color="primary"
            sx={{ fontWeight: 700, letterSpacing: 0.5 }}
        >
            Riset AI
        </Typography>
      </Box>

      <Divider />

      {/* Menu */}
      <Box sx={{ flex: 1, overflowY: "auto", py: 1 }}>
        <SidebarMenu role={role} onLogout={onLogout} />
      </Box>
    </SidebarWrapper>
  );
}
