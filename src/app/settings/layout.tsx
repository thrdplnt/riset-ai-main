"use client";

import { Box, IconButton, Typography } from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const role = user?.role === "admin" ? "admin" : "user";
  const router = useRouter();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Box sx={{
        height: 64,
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 8,
        display: "flex",
        alignItems: "center",
        px: 3,
        gap: 1,
      }}>
        <IconButton size="small" onClick={() => router.push("/chat")}>
          <ArrowBackOutlinedIcon fontSize="small" />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Settings
        </Typography>
      </Box>

      <Box sx={{ display: "flex", mt: "64px" }}>
        <Sidebar role={role} onLogout={logout} />
        <Box sx={{ ml: "280px", flex: 1, minHeight: "calc(100vh - 64px)", bgcolor: "background.default" }}>
          <Box sx={{ p: 4 }}>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}