"use client";

import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import AddIcon from "@mui/icons-material/Add";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import {
  Box, CircularProgress, IconButton, Menu, MenuItem,
  Paper, Stack, Typography,
} from "@mui/material";
import { KeyboardEvent, useEffect, useRef, useState, MouseEvent as ReactMouseEvent } from "react";
import { ModelSelector } from "./ModelSelector";

export interface PendingAttachment {
  name: string;
  type: "image" | "pdf";
  mime_type: string;
  url: string;
}

interface ChatInputProps {
  onSend: (message: string, attachments: PendingAttachment[], webSearch: boolean) => void;
  modelId: string;
  onModelChange: (modelId: string, modelName: string) => void;
  loading?: boolean;
  placeholder?: string;
  menuDirection?: "up" | "down";
  supportsWebSearch?: boolean;
  blockAttachOnWebSearch?: boolean;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = "image/png,image/jpeg,image/webp,application/pdf";

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const ChatInput = ({
  onSend,
  modelId,
  onModelChange,
  loading = false,
  placeholder = "Ask anything...",
  menuDirection = "up",
  supportsWebSearch = false,
  blockAttachOnWebSearch = false,
  disabled = false,
}: ChatInputProps) => {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [webSearch, setWebSearch] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenMenu = (e: ReactMouseEvent<HTMLElement>) => setMenuAnchor(e.currentTarget);
  const handleCloseMenu = () => setMenuAnchor(null);

  const handleUploadClick = () => {
    handleCloseMenu();
    fileInputRef.current?.click();
  };

  useEffect(() => {
    if (!supportsWebSearch) setWebSearch(false);
  }, [supportsWebSearch]);

  const handleToggleWebSearch = () => {
    if (!supportsWebSearch || disabled) return;

    if (!webSearch && blockAttachOnWebSearch && attachments.length > 0) {
      setError("Hapus lampiran file untuk mengaktifkan pencarian web pada model ini");
      return;
    }
    setError("");
    setWebSearch((v) => !v);
  };

  const addFiles = async (fileList: File[]) => {
    if (disabled) return;

    if (webSearch && blockAttachOnWebSearch) {
      setError("Pencarian web pada model ini tidak dapat digunakan bersamaan dengan lampiran file");
      return;
    }

    setError("");
    setUploading(true);

    try {
      for (const file of fileList) {
        if (file.size > MAX_FILE_SIZE) {
          setError(`File "${file.name || 'pasted file'}" terlalu besar (maks 10MB)`);
          continue;
        }

        const isImage = file.type.startsWith("image/");
        const isPdf = file.type === "application/pdf";

        if (!isImage && !isPdf) {
          setError(`Tipe file tidak didukung`);
          continue;
        }

        const dataUrl = await fileToDataUrl(file);
        setAttachments((prev) => [...prev, {
          name: file.name || `pasted-${isImage ? "image.png" : "file.pdf"}`,
          type: isImage ? "image" : "pdf",
          mime_type: file.type,
          url: dataUrl,
        }]);
      }
    } catch {
      setError("Gagal membaca file");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await addFiles(Array.from(files));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (disabled) return;
    const items = e.clipboardData.items;
    const fileItems = Array.from(items).filter((item) => item.kind === "file");

    if (fileItems.length === 0) return;

    e.preventDefault();
    const files = fileItems
      .map((item) => item.getAsFile())
      .filter((f): f is File => f !== null);

    await addFiles(files);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    const trimmed = value.trim();
    if ((!trimmed && attachments.length === 0) || loading || disabled) return;
    onSend(trimmed, attachments, webSearch);
    setValue("");
    setAttachments([]);
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

  const canSend = (value.trim().length > 0 || attachments.length > 0) && !loading && !disabled;

  return (
    <Paper elevation={0} sx={{
      borderRadius: "20px",
      border: "1px solid",
      borderColor: "custom.borderLight",
      boxShadow: "0px 2px 20px rgba(0,0,0,0.07)",
      bgcolor: "background.paper",
      px: 1, pt: 1.5, pb: 1,
      width: "100%",
      opacity: disabled ? 0.7 : 1,
    }}>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        multiple
        hidden
        onChange={handleFileChange}
      />

      <Stack sx={{ gap: 1.5 }}>
        {attachments.length > 0 && (
          <Stack direction="row" sx={{ gap: 1, px: 0.75, flexWrap: "wrap" }}>
            {attachments.map((att, i) => (
              <Box key={i} sx={{
                position: "relative",
                display: "flex", alignItems: "center", gap: 0.75,
                px: 1, py: 0.5, borderRadius: "8px",
                bgcolor: "action.hover",
                border: "1px solid", borderColor: "custom.borderLight",
                maxWidth: 180,
              }}>
                {att.type === "image" ? (
                  <Box component="img" src={att.url} alt={att.name}
                    sx={{ width: 24, height: 24, borderRadius: "4px", objectFit: "cover" }} />
                ) : (
                  <InsertDriveFileOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                )}
                <Typography sx={{
                  fontSize: "12px", color: "text.primary",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {att.name}
                </Typography>
                <IconButton size="small" onClick={() => handleRemoveAttachment(i)}
                  sx={{ width: 18, height: 18, border: "none", ml: "auto",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.08)" } }}>
                  <CloseIcon sx={{ fontSize: 12 }} />
                </IconButton>
              </Box>
            ))}
          </Stack>
        )}

        {error && (
          <Typography sx={{ fontSize: "12px", color: "error.main", px: 0.75 }}>
            {error}
          </Typography>
        )}

        <Box sx={{ px: 0.75 }}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            onPaste={handlePaste}
            placeholder={disabled ? "Upgrade ke Basic untuk mulai chat..." : placeholder}
            disabled={disabled}
            rows={1}
            style={{
              width: "100%", border: "none", outline: "none",
              background: "transparent", resize: "none",
              fontFamily: 'var(--font-inter), Helvetica, sans-serif',
              fontSize: "15px", fontWeight: 400, lineHeight: "24px",
              color: "#020817", padding: 0, minHeight: "24px",
              maxHeight: "180px", overflowY: "auto",
              cursor: disabled ? "not-allowed" : "text",
            }}
          />
        </Box>

        <Stack sx={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Stack sx={{ flexDirection: "row", alignItems: "center", gap: 0.75 }}>
            <IconButton
              size="small"
              onClick={handleOpenMenu}
              disabled={uploading || (webSearch && blockAttachOnWebSearch) || disabled}
              sx={{
                width: 28, height: 28,
                border: "1px solid", borderColor: "custom.borderLight",
                color: "text.secondary",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              {uploading ? <CircularProgress size={14} /> : <AddIcon sx={{ fontSize: 16 }} />}
            </IconButton>

            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={handleCloseMenu}
              anchorOrigin={
                menuDirection === "up"
                  ? { vertical: "top", horizontal: "left" }
                  : { vertical: "bottom", horizontal: "left" }
              }
              transformOrigin={
                menuDirection === "up"
                  ? { vertical: "bottom", horizontal: "left" }
                  : { vertical: "top", horizontal: "left" }
              }
              slotProps={{
                paper: {
                  elevation: 0,
                  sx: {
                    borderRadius: "12px",
                    border: "1px solid", borderColor: "custom.borderLight",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
                    ...(menuDirection === "up" ? { mb: 0.75 } : { mt: 0.75 }),
                    minWidth: 140,
                  },
                },
                list: {
                  sx: { py: 0.5 },
                },
              }}
            >
              <MenuItem onClick={handleUploadClick} sx={{
                mx: 0.5, borderRadius: "8px", gap: 1, py: 0.625, px: 1.25,
                minHeight: "auto",
                "&:hover": { bgcolor: "action.hover" },
              }}>
                <AttachFileOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
                <Typography sx={{ fontSize: "13px" }}>Upload file</Typography>
              </MenuItem>
            </Menu>

            <ModelSelector value={modelId} onChange={onModelChange} menuDirection={menuDirection} />

            <Box
              component="button"
              onClick={handleToggleWebSearch}
              disabled={!supportsWebSearch || disabled}
              sx={{
                display: "flex", alignItems: "center", gap: 0.625,
                height: 30, px: 1.5, borderRadius: "100px",
                border: "1px solid",
                borderColor: webSearch ? "primary.main" : "custom.borderLight",
                color: webSearch ? "primary.main" : "text.secondary",
                bgcolor: webSearch ? "rgba(33,150,243,0.08)" : "transparent",
                opacity: supportsWebSearch ? 1 : 0.4,
                cursor: supportsWebSearch && !disabled ? "pointer" : "not-allowed",
                fontWeight: 500, fontSize: "13px",
                fontFamily: 'var(--font-inter), Helvetica, sans-serif',
                transition: "background 0.15s",
                "&:hover": { bgcolor: webSearch ? "rgba(33,150,243,0.12)" : "action.hover" },
              }}
            >
              <LanguageOutlinedIcon sx={{ fontSize: 15 }} />
              Web search
            </Box>
          </Stack>

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