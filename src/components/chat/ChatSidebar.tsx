"use client";

import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ViewSidebarOutlinedIcon from "@mui/icons-material/ViewSidebarOutlined";
import {
  Box,
  Collapse,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  OutlinedInput,
  Stack,
  Tooltip,
  Typography,
  styled,
} from "@mui/material";
import { MouseEvent, useState } from "react";

interface Chat {
  id: string;
  title: string;
  created_at: string;
}

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId?: string;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const SidebarWrapper = styled(Box)(({ theme }) => ({
  height: "100vh",
  flexShrink: 0,
  backgroundColor: theme.palette.background.paper,
  borderRight: `1px solid ${theme.palette.divider}`,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
}));

const NavButton = styled(ListItemButton)(({ theme }) => ({
  minHeight: 36,
  paddingLeft: 10,
  paddingRight: 10,
  borderRadius: 10,
  marginBottom: 2,
  color: theme.palette.text.secondary,
  "&:hover": { backgroundColor: theme.palette.action.hover },
}));

export const ChatSidebar = ({
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  collapsed = false,
  onToggleCollapse,
}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [menuState, setMenuState] = useState<{
    el: HTMLElement;
    chatId: string;
  } | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = chats.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenMenu = (e: MouseEvent<HTMLButtonElement>, chatId: string) => {
    e.stopPropagation();
    setMenuState({ el: e.currentTarget, chatId });
  };

  const handleCloseMenu = () => setMenuState(null);

  const handleDelete = () => {
    if (menuState) onDeleteChat(menuState.chatId);
    handleCloseMenu();
  };

  if (collapsed) {
    return (
      <SidebarWrapper
        sx={{
          width: 56,
          alignItems: "center",
          py: 1.5,
          gap: 1,
        }}
      >
        <Box
          component="img"
          src="/favicon.ico"
          alt="Riset AI"
          sx={{ width: 28, height: 28, borderRadius: "8px", objectFit: "cover" }}
        />
        <Tooltip title="Expand sidebar" placement="right">
          <IconButton size="small" onClick={onToggleCollapse}
            sx={{ border: "none", color: "text.secondary" }}>
            <ViewSidebarOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="New chat" placement="right">
          <IconButton size="small" onClick={onNewChat}
            sx={{ border: "none", color: "text.secondary" }}>
            <EditOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </SidebarWrapper>
    );
  }

  return (
    <SidebarWrapper sx={{ width: 260, py: 1 }}>
      {/* Header */}
      <Stack
        sx={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          mb: 0.5,
          minHeight: 40,
          flexShrink: 0,
        }}
      >
        <Stack sx={{ flexDirection: "row", alignItems: "center", gap: 1 }}>
          <Box
            component="img"
            src="/favicon.ico"
            alt="Riset AI"
            sx={{ width: 26, height: 26, borderRadius: "7px", objectFit: "cover" }}
          />
          <Typography
            sx={{ fontWeight: 600, fontSize: "14px", color: "text.primary" }}
          >
            RISET AI
          </Typography>
        </Stack>
        <Tooltip title="Collapse sidebar">
          <IconButton size="small" onClick={onToggleCollapse}
            sx={{ border: "none", color: "text.primary" }}>
            <ViewSidebarOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Nav buttons */}
      <List disablePadding sx={{ px: 0.75, flexShrink: 0 }}>
        <NavButton onClick={onNewChat}>
          <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}>
            <EditOutlinedIcon sx={{ fontSize: 15 }} />
          </ListItemIcon>
          <ListItemText
            primary="New chat"
            slotProps={{
              primary: { sx: { fontSize: "13.5px", fontWeight: 600 } },
            }}
          />
        </NavButton>
        <NavButton onClick={() => setShowSearch((v) => !v)}>
          <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}>
            <SearchOutlinedIcon sx={{ fontSize: 15 }} />
          </ListItemIcon>
          <ListItemText
            primary="Search chats"
            slotProps={{
              primary: { sx: { fontSize: "13.5px", fontWeight: 600 } },
            }}
          />
        </NavButton>
      </List>

      {/* Search input */}
      <Collapse in={showSearch} sx={{ px: 1.5, pb: 1, flexShrink: 0 }}>
        <OutlinedInput
          fullWidth
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search chats..."
          autoFocus
          startAdornment={
            <InputAdornment position="start">
              <SearchOutlinedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
            </InputAdornment>
          }
          sx={{ height: 34, fontSize: "13px", borderRadius: "8px" }}
        />
      </Collapse>

      {/* Section label */}
      <Typography
        sx={{
          px: 2, pt: 1, pb: 0.5,
          fontSize: "11px", fontWeight: 700,
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          flexShrink: 0,
        }}
      >
        Recent Chats
      </Typography>

      {/* Chat list */}
      <List
        disablePadding
        sx={{ px: 0.75, flex: 1, minHeight: 0, overflowY: "auto" }}
      >
        {filtered.length === 0 ? (
          <Box sx={{ px: 1.5, py: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {searchQuery ? "No chats found." : "No recent chats."}
            </Typography>
          </Box>
        ) : (
          filtered.map((chat) => (
            <ListItemButton
              key={chat.id}
              selected={chat.id === activeChatId}
              onClick={() => onSelectChat(chat.id)}
              onMouseEnter={() => setHoveredId(chat.id)}
              onMouseLeave={() => setHoveredId(null)}
              sx={{
                minHeight: 36,
                px: 1.25, pr: 0.75,
                borderRadius: "10px",
                mb: 0.25,
                "&.Mui-selected": {
                  bgcolor: "action.selected",
                  "&:hover": { bgcolor: "action.selected" },
                },
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <ListItemText
                primary={chat.title}
                slotProps={{
                  primary: {
                    sx: {
                      fontSize: "13px",
                      color: "text.primary",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    },
                  },
                }}
              />
              {(hoveredId === chat.id || menuState?.chatId === chat.id) && (
                <IconButton
                  size="small"
                  onClick={(e) => handleOpenMenu(e, chat.id)}
                  sx={{
                    width: 22, height: 22, ml: 0.5,
                    flexShrink: 0, border: "none",
                    color: "text.secondary",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <MoreHorizOutlinedIcon sx={{ fontSize: 14 }} />
                </IconButton>
              )}
            </ListItemButton>
          ))
        )}
      </List>

      {/* Context menu */}
      <Menu
        anchorEl={menuState?.el}
        open={Boolean(menuState)}
        onClose={handleCloseMenu}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              borderRadius: "10px",
              border: "1px solid",
              borderColor: "custom.borderLight",
              boxShadow: "0px 4px 16px rgba(0,0,0,0.08)",
              minWidth: 140,
              mt: 0.5,
            },
          },
        }}
      >
        <MenuItem
          onClick={handleDelete}
          sx={{
            fontSize: "13px", py: 0.875, px: 1.5, gap: 1,
            borderRadius: "6px", mx: 0.5,
            color: "error.main",
            "&:hover": { bgcolor: "rgba(211,47,47,0.05)" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 24 }}>
            <DeleteOutlineOutlinedIcon sx={{ fontSize: 14, color: "error.main" }} />
          </ListItemIcon>
          Hapus chat
        </MenuItem>
      </Menu>
    </SidebarWrapper>
  );
};