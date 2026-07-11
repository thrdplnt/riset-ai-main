"use client";

import { useEffect, useState } from "react";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const role = user?.role === "admin" ? "admin" : "user";
  const router = useRouter();
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 900;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const sidebarOpen_prop = isMobile === null
    ? false
    : isMobile
      ? sidebarOpen
      : undefined;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* Header */}
      <Box sx={{
        height: 64,
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 11,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 3,
        flexShrink: 0,
      }}>
        <Stack sx={{ flexDirection: "row", alignItems: "center", gap: 1 }}>
          <IconButton size="small" onClick={() => router.push("/chat")} sx={{ border: "none" }}>
            <ArrowBackOutlinedIcon fontSize="small" />
          </IconButton>
          <Typography sx={{
            fontFamily: "var(--font-poppins), sans-serif",
            fontWeight: 600,
            fontSize: "16px",
            color: "text.primary",
          }}>
            Settings
          </Typography>
        </Stack>
      </Box>

      <Box sx={{ display: "flex", mt: "64px", flex: 1, overflow: "hidden", position: "relative" }}>

        {/* Backdrop: mobile only, tap to close */}
        {isMobile === true && sidebarOpen && (
          <Box
            onClick={() => setSidebarOpen(false)}
            sx={{
              position: "fixed",
              top: "64px", left: 0, right: 0, bottom: 0,
              bgcolor: "rgba(0,0,0,0.4)",
              zIndex: 9,
            }}
          />
        )}

        {/* Sidebar */}
        <Sidebar
          role={role}
          onLogout={() => { setSidebarOpen(false); logout(); }}
          onNavigate={() => setSidebarOpen(false)}
          open={sidebarOpen_prop}
        />

        {/* Main content */}
        <Box sx={{
          flex: 1,
          minWidth: 0,
          overflowY: "auto",
          bgcolor: "background.default",
          ml: isMobile === false ? "260px" : 0,
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}>
          <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            {/* Hamburger: mobile only */}
            {isMobile === true && (
              <Box sx={{ mb: 2 }}>
                <IconButton
                  size="small"
                  onClick={() => setSidebarOpen((v) => !v)}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "8px",
                    p: "6px",
                  }}
                >
                  <MenuIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}