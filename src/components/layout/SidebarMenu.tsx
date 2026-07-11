"use client";

import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
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

const SectionLabel = ({ children, first = false }: { children: React.ReactNode; first?: boolean }) => (
  <Typography sx={{
    px: 1.5,
    pt: first ? 0.5 : 2,
    pb: 0.75,
    fontFamily: 'var(--font-manrope), sans-serif',
    fontSize: "11px", fontWeight: 700,
    color: "text.secondary",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  }}>
    {children}
  </Typography>
);

interface SidebarMenuProps {
  role: "user" | "admin";
  onLogout: () => void;
  onNavigate?: () => void;
}

export default function SidebarMenu({ role, onLogout, onNavigate }: SidebarMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();

  const mainItems =
    role === "admin" ? adminMenuItems : userMenuItems;

  const handleNavigate = (path: string) => {
    router.push(path);
    onNavigate?.();
  };

  return (
    <List disablePadding sx={{ px: 1 }}>
      <SectionLabel first>Account</SectionLabel>
      {mainItems.map((item) => (
        <MenuItemButton
          key={item.path}
          selected={pathname === item.path}
          onClick={() => handleNavigate(item.path)}
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
                  fontFamily: 'var(--font-inter), sans-serif',
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

      {role === "admin" && (
        <>
          <SectionLabel>Administration</SectionLabel>
          {adminManagementItems.map((item) => (
            <MenuItemButton
              key={item.path}
              selected={pathname === item.path}
              onClick={() => handleNavigate(item.path)}
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
                      fontFamily: 'var(--font-inter), sans-serif',
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

      <Divider sx={{ my: 1.5 }} />
      <MenuItemButton onClick={onLogout}>
        <ListItemIcon sx={{ minWidth: 36, color: "error.main" }}>
          <LogoutOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText
          primary="Logout"
          slotProps={{
            primary: {
              sx: {
                fontFamily: 'var(--font-inter), sans-serif',
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
