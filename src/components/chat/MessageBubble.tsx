"use client";

import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import { Avatar, Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  modelName?: string;
  tokens?: { prompt: number; completion: number; total: number };
}

interface MessageBubbleProps {
  message: Message;
  userInitials?: string;
}

export const MessageBubble = ({ message, userInitials = "U" }: MessageBubbleProps) => {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <Stack
      sx={{ flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-start", gap: 1.5, maxWidth: "100%" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {isUser ? (
        <Avatar sx={{
          width: 28, height: 28,
          bgcolor: "custom.buttonDark",
          fontSize: "11px", fontWeight: 700, flexShrink: 0,
        }}>
          {userInitials}
        </Avatar>
      ) : (
        <Box component="img" src="/favicon.ico" alt="Riset AI"
          sx={{ width: 28, height: 28, borderRadius: "8px",
            objectFit: "cover", flexShrink: 0 }} />
      )}

      <Stack sx={{
        alignItems: isUser ? "flex-end" : "flex-start",
        gap: 0.5, maxWidth: { xs: "85%", sm: "72%" },
      }}>
        <Box sx={{
          px: 2, py: 1.25,
          borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
          bgcolor: isUser ? "custom.buttonDark" : "rgba(0,0,0,0.04)",
          color: isUser ? "custom.buttonText" : "text.primary",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          border: isUser ? "none" : "1px solid",
          borderColor: isUser ? "transparent" : "custom.borderLight",
        }}>
          {isUser ? (
            <Typography variant="body1" sx={{
              whiteSpace: "pre-wrap", lineHeight: 1.7, color: "inherit",
            }}>
              {message.content}
            </Typography>
          ) : (
            <Box sx={{
              fontSize: "14px", lineHeight: 1.7, color: "text.primary",
              "& p": { mt: 0, mb: 1, "&:last-child": { mb: 0 } },
              "& h1, & h2, & h3": { fontWeight: 600, mt: 1.5, mb: 0.75 },
              "& h1": { fontSize: "18px" },
              "& h2": { fontSize: "16px" },
              "& h3": { fontSize: "14px" },
              "& ul, & ol": { pl: 2.5, mb: 1 },
              "& li": { mb: 0.25 },
              "& strong": { fontWeight: 600 },
              "& em": { fontStyle: "italic" },
              "& code": {
                bgcolor: "rgba(0,0,0,0.06)",
                px: 0.75, py: 0.25,
                borderRadius: "4px",
                fontSize: "13px",
                fontFamily: "monospace",
              },
              "& pre": {
                bgcolor: "rgba(0,0,0,0.06)",
                p: 1.5, borderRadius: "8px",
                overflow: "auto", mb: 1,
                "& code": { bgcolor: "transparent", p: 0 },
              },
              "& blockquote": {
                borderLeft: "3px solid",
                borderColor: "divider",
                pl: 1.5, ml: 0, my: 1,
                color: "text.secondary",
              },
              "& hr": { my: 1.5, border: "none",
                borderTop: "1px solid", borderColor: "divider" },
              "& a": { color: "primary.main", textDecoration: "underline" },
              "& table": { width: "100%", borderCollapse: "collapse", mb: 1 },
              "& th, & td": {
                border: "1px solid", borderColor: "divider",
                px: 1, py: 0.5, textAlign: "left",
              },
              "& th": { bgcolor: "rgba(0,0,0,0.04)", fontWeight: 600 },
            }}>
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </Box>
          )}

          {message.tokens && (
            <Typography sx={{
              fontSize: "10.5px",
              color: isUser ? "rgba(255,255,255,0.4)" : "text.secondary",
              mt: 0.75,
            }}>
              {message.tokens.total.toLocaleString()} tokens
            </Typography>
          )}
        </Box>

        {/* Copy button */}
        <Stack sx={{
          flexDirection: "row", gap: 0.25,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.15s", px: 0.5,
        }}>
          <Tooltip title={copied ? "Copied!" : "Copy"} placement="bottom">
            <IconButton size="small" onClick={handleCopy}
              sx={{ width: 26, height: 26, border: "none",
                color: "text.secondary",
                "&:hover": { bgcolor: "action.hover" } }}>
              {copied
                ? <CheckOutlinedIcon sx={{ fontSize: 13, color: "success.main" }} />
                : <ContentCopyOutlinedIcon sx={{ fontSize: 13 }} />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Stack>
  );
};
