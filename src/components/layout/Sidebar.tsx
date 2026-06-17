"use client";

import { Box, styled } from "@mui/material";
import SidebarMenu from "./SidebarMenu";

const SidebarWrapper = styled(Box)(({ theme }) => (`
  width: 280px;
  min-width: 280px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 64px;
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
  return (
    <SidebarWrapper>
      <Box sx={{ flex: 1, overflowY: "auto", py: 1 }}>
        <SidebarMenu role={role} onLogout={onLogout} /> {/* role diteruskan */}
      </Box>
    </SidebarWrapper>
  );
}