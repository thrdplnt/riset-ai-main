// settings/layout.tsx
"use client";

import { Box } from "@mui/material";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();

  return (
    <Box sx={{ display: "flex", position: "relative" }}>
      <Sidebar role="user" onLogout={logout} backPath="/chat" />
      
      {/* garis horizontal full width */}
      <Box sx={{
        position: "fixed",
        top: 64,
        left: 0,
        right: 0,
        height: "1px",
        bgcolor: "divider",
        zIndex: 6,
      }} />

      <Box sx={{ ml: "280px", flex: 1, minHeight: "100vh", bgcolor: "background.default" }}>
        <Box sx={{ height: 64 }} />
        <Box sx={{ p: 4 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}