"use client";

import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  styled,
  useTheme,
} from "@mui/material";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import TokenOutlinedIcon from "@mui/icons-material/TokenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import MemoryOutlinedIcon from "@mui/icons-material/MemoryOutlined";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES } from "@/routes";

interface MenuItem {
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  path: string;
}

const userMenuItems: MenuItem[] = [
  {
    label: "My Account",
    subtitle: "Manage your profile information",
    icon: <PersonOutlinedIcon fontSize="small" />,
    path: ROUTES.SETTINGS_ACCOUNT,
  },
  {
    label: "Change Password",
    subtitle: "Update your account password",
    icon: <KeyOutlinedIcon fontSize="small" />,
    path: ROUTES.SETTINGS_PASSWORD,
  },
  {
    label: "Token Usage",
    subtitle: "Monitor your token quota and usage",
    icon: <TokenOutlinedIcon fontSize="small" />,
    path: ROUTES.SETTINGS_TOKEN_USAGE,
  },
  {
    label: "Sessions",
    subtitle: "Manage your active sessions",
    icon: <SecurityOutlinedIcon fontSize="small" />,
    path: ROUTES.SETTINGS_SESSIONS,
  },
];

const adminMenuItems: MenuItem[] = [
  {
    label: "My Account",
    subtitle: "Manage your profile information",
    icon: <PersonOutlinedIcon fontSize="small" />,
    path: ROUTES.SETTINGS_ACCOUNT,
  },
  {
    label: "Change Password",
    subtitle: "Update your account password",
    icon: <KeyOutlinedIcon fontSize="small" />,
    path: ROUTES.SETTINGS_PASSWORD,
  },
  {
    label: "Sessions",
    subtitle: "Manage your active sessions",
    icon: <SecurityOutlinedIcon fontSize="small" />,
    path: ROUTES.SETTINGS_SESSIONS,
  },
];

const adminManagementItems: MenuItem[] = [
  {
    label: "Users",
    subtitle: "Manage users and roles",
    icon: <GroupOutlinedIcon fontSize="small" />,
    path: ROUTES.ADMIN_USERS,
  },
  {
    label: "Models",
    subtitle: "Manage models and token limits",
    icon: <MemoryOutlinedIcon fontSize="small" />,
    path: ROUTES.ADMIN_MODELS,
  },
];

const MenuItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: 8,
  marginBottom: 2,
  padding: "8px 12px",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  "&.Mui-selected": {
    backgroundColor: theme.palette.action.selected,
    "&:hover": {
      backgroundColor: theme.palette.action.selected,
    },
  },
}));

interface SidebarMenuProps {
  role: "user" | "admin";
  onLogout: () => void;
}

export default function SidebarMenu({ role, onLogout }: SidebarMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();

  const mainItems =
    role === "admin" ? adminMenuItems : userMenuItems;

  return (
    <List disablePadding sx={{ px: 1 }}>
      {/* Main Menu */}
      {mainItems.map((item) => (
        <MenuItemButton
          key={item.path}
          selected={pathname === item.path}
          onClick={() => router.push(item.path)}
        >
          <ListItemIcon
            sx={{
              minWidth: 36,
              color:
                pathname === item.path
                  ? theme.palette.primary.main
                  : theme.palette.text.secondary,
            }}
          >
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.label}
            slotProps={{
              primary: {
                sx: {
                  fontSize: 14,
                  fontWeight: pathname === item.path ? 600 : 400,
                  color: pathname === item.path
                    ? theme.palette.text.primary
                    : theme.palette.text.secondary,
                },
              },
            }}
          />
        </MenuItemButton>
      ))}

      {/* Admin Management Items */}
      {role === "admin" && (
        <>
          <Divider sx={{ my: 1 }} />
          {adminManagementItems.map((item) => (
            <MenuItemButton
              key={item.path}
              selected={pathname === item.path}
              onClick={() => router.push(item.path)}
            >
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color:
                    pathname === item.path
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{
                  primary: {
                    sx: {
                      fontSize: 14,
                      fontWeight: pathname === item.path ? 600 : 400,
                      color: pathname === item.path
                        ? theme.palette.text.primary
                        : theme.palette.text.secondary,
                    },
                  },
                }}
              />
            </MenuItemButton>
          ))}
        </>
      )}

      {/* Logout */}
      <Divider sx={{ my: 1 }} />
      <MenuItemButton onClick={onLogout}>
        <ListItemIcon sx={{ minWidth: 36, color: "error.main" }}>
          <LogoutOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText
          primary="Logout"
          slotProps={{
            primary: {
              sx: {
                fontSize: 14,
                fontWeight: 400,
                color: "error.main",
              },
            },
          }}
        />
      </MenuItemButton>
    </List>
  );
}
