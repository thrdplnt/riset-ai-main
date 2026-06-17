"use client";

import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import { Box, CircularProgress, IconButton, Paper, Stack } from "@mui/material";
import { KeyboardEvent, useRef, useState } from "react";
import { ModelSelector } from "./ModelSelector";

interface ChatInputProps {
  onSend: (message: string) => void;
  modelId: string;
  onModelChange: (modelId: string, modelName: string) => void;
  loading?: boolean;
  placeholder?: string;
  menuDirection?: "up" | "down";
}

export const ChatInput = ({
  onSend,
  modelId,
  onModelChange,
  loading = false,
  placeholder = "Ask anything...",
  menuDirection = "up",
}: ChatInputProps) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  };

  const canSend = value.trim().length > 0 && !loading;

  return (
    <Paper elevation={0} sx={{
      borderRadius: "20px",
      border: "1px solid",
      borderColor: "custom.borderLight",
      boxShadow: "0px 2px 20px rgba(0,0,0,0.07)",
      bgcolor: "background.paper",
      px: 1, pt: 1.5, pb: 1,
      width: "100%",
    }}>
      <Stack sx={{ gap: 1.5 }}>
        <Box sx={{ px: 0.75 }}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder={placeholder}
            rows={1}
            style={{
              width: "100%", border: "none", outline: "none",
              background: "transparent", resize: "none",
              fontFamily: '"Inter", Helvetica, sans-serif',
              fontSize: "15px", fontWeight: 400, lineHeight: "24px",
              color: "#020817", padding: 0, minHeight: "24px",
              maxHeight: "180px", overflowY: "auto",
            }}
          />
        </Box>
        <Stack sx={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <ModelSelector
            value={modelId}
            onChange={onModelChange}
            menuDirection={menuDirection}
          />
          <IconButton
            onClick={handleSend}
            disabled={!canSend}
            sx={{
              width: 32, height: 32, border: "none",
              bgcolor: canSend ? "custom.buttonDark" : "action.disabledBackground",
              color: canSend ? "custom.buttonText" : "text.disabled",
              "&:hover": { bgcolor: canSend ? "primary.main" : "action.disabledBackground" },
              transition: "all 0.15s ease",
            }}
          >
            {loading
              ? <CircularProgress size={14} sx={{ color: "inherit" }} />
              : <ArrowUpwardRoundedIcon sx={{ fontSize: 17 }} />}
          </IconButton>
        </Stack>
      </Stack>
    </Paper>
  );
};