"use client";

import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SparklesOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import {
  Avatar, Box, Divider, IconButton, Menu,
  MenuItem, Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { MouseEvent, useState } from "react";
import { ROUTES } from "@/routes";

interface UserMenuProps {
  user: { name: string; email: string } | null;
  onLogout: () => void;
}

const menuItemSx = {
  px: 1.5, py: 0.875,
  borderRadius: "8px",
  mx: 0.5, gap: 1.5,
  "&:hover": { bgcolor: "action.hover" },
};

export const UserMenu = ({ user, onLogout }: UserMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const open = Boolean(anchorEl);

  const handleOpen = (e: MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{ p: 0, border: "none", "&:hover": { bgcolor: "transparent" } }}
      >
        <Avatar sx={{
          width: 32, height: 32,
          bgcolor: "custom.buttonDark",
          fontSize: "12px", fontWeight: 700,
          color: "custom.buttonText",
        }}>
          {initials}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              width: 240, borderRadius: "14px",
              border: "1px solid", borderColor: "custom.borderLight",
              boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
              overflow: "hidden", mt: 0.75,
            },
          },
        }}
      >
        {/* Header */}
        <Box sx={{ px: 2, py: 1.75, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{
            width: 38, height: 38,
            bgcolor: "custom.buttonDark",
            fontSize: "14px", fontWeight: 700,
            color: "custom.buttonText",
            flexShrink: 0,
          }}>
            {initials}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{
              fontSize: "14px", fontWeight: 600,
              color: "text.primary", lineHeight: 1.3,
            }}>
              {user?.name ?? "User"}
            </Typography>
            <Typography sx={{
              fontSize: "12px", color: "text.secondary",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {user?.email ?? ""}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mx: 1.5 }} />

        <Box sx={{ py: 0.75 }}>
          <MenuItem sx={menuItemSx} onClick={() => {
            const phoneNumber = "6281234567890";
            const message = encodeURIComponent(
              `Halo, saya ${user?.name ?? "User"} (${user?.email ?? ""}) ingin upgrade plan ke Basic. Mohon info lebih lanjut.`
            );
            window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
            handleClose();
          }}>
            <SparklesOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
            <Typography sx={{ fontSize: "13.5px", color: "text.primary" }}>
              Upgrade plan
            </Typography>
          </MenuItem>

          <MenuItem sx={menuItemSx} onClick={() => {
            router.push(ROUTES.SETTINGS_ACCOUNT); handleClose();
          }}>
            <SettingsOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
            <Typography sx={{ fontSize: "13.5px", color: "text.primary" }}>
              Settings
            </Typography>
          </MenuItem>
        </Box>

        <Divider sx={{ mx: 1.5 }} />

        <Box sx={{ py: 0.75 }}>
          <MenuItem
            sx={{ ...menuItemSx, "&:hover": { bgcolor: "rgba(239,68,68,0.05)" } }}
            onClick={() => { handleClose(); onLogout(); }}
          >
            <LogoutOutlinedIcon sx={{ fontSize: 15, color: "error.main" }} />
            <Typography sx={{ fontSize: "13.5px", color: "error.main" }}>
              Log out
            </Typography>
          </MenuItem>
        </Box>
      </Menu>
    </>
  );
};