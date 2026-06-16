"use client";

import { Box, Divider, IconButton, Typography, styled } from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import SidebarMenu from "./SidebarMenu";
import { useRouter } from "next/navigation";

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
  backPath?: string;
  title?: string;
}

export default function Sidebar({ role, onLogout, backPath, title = "Settings" }: SidebarProps) {
  const router = useRouter();

  return (
    <SidebarWrapper>
      {/* Header */}
      <Box sx={{ px: 2, py: 2, display: "flex", alignItems: "center", gap: 1, minHeight: 64 }}>
        {backPath && (
          <IconButton size="small" onClick={() => router.push(backPath)}>
            <ArrowBackOutlinedIcon fontSize="small" />
          </IconButton>
        )}
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
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