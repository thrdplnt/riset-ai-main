"use client";

import { Box, styled } from "@mui/material";
import SidebarMenu from "./SidebarMenu";

const SidebarWrapper = styled(Box)(({ theme }) => (`
  width: 260px;
  min-width: 260px;
  position: fixed;
  left: 0;
  top: 64px;
  height: calc(100vh - 64px);
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
  onNavigate?: () => void;
  // open: undefined = desktop always visible
  // open: true  = mobile, slide in
  // open: false = mobile, slide out (not rendered)
  open?: boolean;
}

export default function Sidebar({ role, onLogout, onNavigate, open }: SidebarProps) {
  const isMobileMode = open !== undefined;

  // Mobile + closed: don't render at all
  if (isMobileMode && !open) return null;

  return (
    <SidebarWrapper sx={{
      zIndex: isMobileMode ? 10 : 7,
      boxShadow: isMobileMode ? "4px 0 16px rgba(0,0,0,0.12)" : "none",
      animation: isMobileMode ? "slideIn 0.22s ease forwards" : "none",
      "@keyframes slideIn": {
        from: { transform: "translateX(-260px)" },
        to: { transform: "translateX(0)" },
      },
    }}>
      <Box sx={{ flex: 1, overflowY: "auto", py: 1 }}>
        <SidebarMenu role={role} onLogout={onLogout} onNavigate={isMobileMode ? onNavigate : undefined} />
      </Box>
    </SidebarWrapper>
  );
}