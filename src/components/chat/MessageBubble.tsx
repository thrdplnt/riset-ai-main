"use client";

import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface MessageAttachment {
  name: string;
  type: "image" | "pdf" | "docx" | "xlsx";
  mime_type: string;
  url: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  modelName?: string;
  tokens?: { prompt: number; completion: number; total: number };
  attachments?: MessageAttachment[];
}

interface MessageBubbleProps {
  message: Message;
  userInitials?: string;
}

const ALERT_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  NOTE: { icon: InfoOutlinedIcon, color: "#0284c7", bg: "rgba(2,132,199,0.06)" },
  TIP: { icon: LightbulbOutlinedIcon, color: "#059669", bg: "rgba(5,150,105,0.06)" },
  IMPORTANT: { icon: AutoAwesomeOutlinedIcon, color: "#7c3aed", bg: "rgba(124,58,237,0.06)" },
  WARNING: { icon: WarningAmberOutlinedIcon, color: "#d97706", bg: "rgba(217,119,6,0.06)" },
  CAUTION: { icon: ErrorOutlineOutlinedIcon, color: "#dc2626", bg: "rgba(220,38,38,0.06)" },
};

const FILE_ICON_CONFIG: Record<Exclude<MessageAttachment["type"], "image">, { icon: React.ElementType; color: string }> = {
  pdf: { icon: PictureAsPdfOutlinedIcon, color: "#dc2626" },
  docx: { icon: DescriptionOutlinedIcon, color: "#2563eb" },
  xlsx: { icon: TableChartOutlinedIcon, color: "#16a34a" },
};

const extractText = (node: any): string => {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node?.props?.children) return extractText(node.props.children);
  return "";
};

const stripPrefix = (node: any): any => {
  if (typeof node === "string") {
    return node.replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/, "");
  }
  if (Array.isArray(node)) {
    const [first, ...rest] = node;
    return [stripPrefix(first), ...rest];
  }
  return node;
};

const Blockquote = ({ children }: { children?: React.ReactNode }) => {
  const fullText = extractText(children);
  const match = fullText.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/);

  if (match) {
    const type = match[1];
    const config = ALERT_CONFIG[type];
    const Icon = config.icon;

    return (
      <Box sx={{
        display: "flex", gap: 1,
        px: 1.5, py: 1.25,
        my: 1.25, borderRadius: "8px",
        bgcolor: config.bg,
        borderLeft: "3px solid",
        borderColor: config.color,
      }}>
        <Icon sx={{ fontSize: 18, color: config.color, mt: "1px", flexShrink: 0 }} />
        <Box sx={{
          fontSize: "13.5px", color: "text.primary",
          "& p": { m: 0 },
          flex: 1, minWidth: 0,
        }}>
          {stripPrefix(children)}
        </Box>
      </Box>
    );
  }

  return (
    <Box component="blockquote" sx={{
      borderLeft: "3px solid",
      borderColor: "divider",
      pl: 1.5, ml: 0, my: 1,
      color: "text.secondary",
    }}>
      {children}
    </Box>
  );
};

const Pre = ({ children }: any) => {
  const [copied, setCopied] = useState(false);

  const codeElement = Array.isArray(children) ? children[0] : children;
  const className = codeElement?.props?.className || "";
  const match = /language-(\w+)/.exec(className);
  const language = match ? match[1] : "text";

  const getRawText = (node: any): string => {
    if (typeof node === "string") return node;
    if (Array.isArray(node)) return node.map(getRawText).join("");
    if (node?.props?.children) return getRawText(node.props.children);
    return "";
  };

  const rawCode = getRawText(codeElement?.props?.children ?? children).replace(/\n$/, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <Box sx={{
      borderRadius: "8px",
      overflow: "hidden",
      mb: 1.5,
      border: "1px solid",
      borderColor: "custom.borderLight",
    }}>
      <Stack sx={{
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        px: 1.5, py: 0.75,
        bgcolor: "rgba(0,0,0,0.04)",
        borderBottom: "1px solid",
        borderColor: "custom.borderLight",
      }}>
        <Typography sx={{
          fontSize: "11px", fontWeight: 600,
          color: "text.secondary", textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}>
          {language}
        </Typography>
        <Tooltip title={copied ? "Copied!" : "Copy code"}>
          <IconButton size="small" onClick={handleCopy}
            sx={{ width: 22, height: 22, border: "none", color: "text.secondary",
              "&:hover": { bgcolor: "action.hover" } }}>
            {copied
              ? <CheckOutlinedIcon sx={{ fontSize: 12, color: "success.main" }} />
              : <ContentCopyOutlinedIcon sx={{ fontSize: 12 }} />}
          </IconButton>
        </Tooltip>
      </Stack>
      <Box
        component="pre"
        sx={{
          margin: 0,
          padding: "12px",
          fontSize: "13px",
          fontFamily: '"Fira Code", "Consolas", monospace',
          background: "#fafafa",
          color: "#1a1a1a",
          whiteSpace: "pre",
          overflowX: "auto",
          lineHeight: 1.6,
        }}
      >
        <code>{rawCode}</code>
      </Box>
    </Box>
  );
};

const InlineCode = ({ children }: { children?: React.ReactNode }) => (
  <code style={{
    background: "rgba(0,0,0,0.06)",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "13px",
    fontFamily: "monospace",
  }}>
    {children}
  </code>
);

const AttachmentPreview = ({ attachments, isUser }: { attachments?: MessageAttachment[]; isUser: boolean }) => {
  const safeAttachments = Array.isArray(attachments) ? attachments : [];
  if (safeAttachments.length === 0) return null;

  return (
    <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap", mb: 1 }}>
      {safeAttachments.map((att, i) => {
        if (att.type === "image") {
          return (
            <Box
              key={i}
              component="img"
              src={att.url}
              alt={att.name}
              sx={{
                width: 140, height: 140,
                borderRadius: "10px",
                objectFit: "cover",
                border: "1px solid",
                borderColor: "custom.borderLight",
              }}
            />
          );
        }

        const { icon: FileIcon, color: iconColor } = FILE_ICON_CONFIG[att.type] ?? {
          icon: InsertDriveFileOutlinedIcon,
          color: "inherit",
        };

        return (
          <Stack
            key={i}
            direction="row"
            sx={{
              alignItems: "center", gap: 1,
              px: 1.25, py: 1,
              borderRadius: "10px",
              bgcolor: "#ffffff",
              border: "1px solid",
              borderColor: "custom.borderLight",
              maxWidth: 200,
            }}
          >
            <FileIcon sx={{ fontSize: 20, color: iconColor }} />
            <Typography sx={{
              fontSize: "12.5px",
              color: "text.primary",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {att.name}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
};

export const MessageBubble = ({ message }: MessageBubbleProps) => {
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
      sx={{
        alignItems: isUser ? "flex-end" : "flex-start",
        gap: 0.5,
        maxWidth: isUser ? { xs: "85%", sm: "72%" } : "100%",
        width: isUser ? "auto" : "100%",
        minWidth: 0,
        ...(isUser ? { ml: "auto" } : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AttachmentPreview attachments={message.attachments} isUser={isUser} />

      {isUser ? (
        <Box sx={{
          px: 2, py: 1.25,
          borderRadius: "16px 16px 16px 16px",
          bgcolor: "rgba(233, 233, 233, 0.8)", 
          color: "text.primary",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          maxWidth: "100%",
          overflow: "hidden",
        }}>
          {message.content && (
            <Typography variant="body1" sx={{
              whiteSpace: "pre-wrap", lineHeight: 1.7, color: "inherit",
              fontFamily: 'var(--font-inter), Helvetica, sans-serif',
            }}>
              {message.content}
            </Typography>
          )}
          {message.tokens && (
            <Typography sx={{
              fontSize: "10.5px",
              color: "text.secondary",
              mt: 0.75,
            }}>
              {message.tokens.total.toLocaleString()} tokens
            </Typography>
          )}
        </Box>
      ) : (
        <Box sx={{
          px: 0, py: 0.5,
          width: "100%",
          maxWidth: "100%",
          overflow: "hidden",
        }}>
          <Box sx={{
            fontSize: "14px", lineHeight: 1.7, color: "text.primary",
            fontFamily: 'var(--font-inter), Helvetica, sans-serif',
            "& p": { mt: 0, mb: 1, "&:last-child": { mb: 0 } },
            "& h1, & h2, & h3": { fontWeight: 600, mt: 1.5, mb: 0.75 },
            "& h1": { fontSize: "18px" },
            "& h2": { fontSize: "16px" },
            "& h3": { fontSize: "14px" },
            "& ul, & ol": { pl: 2.5, mb: 1 },
            "& li": { mb: 0.25 },
            "& strong": { fontWeight: 600 },
            "& em": { fontStyle: "italic" },
            "& hr": { my: 1.5, border: "none",
              borderTop: "1px solid", borderColor: "divider" },
            "& a": { color: "primary.main", textDecoration: "underline" },
            "& table": {
              width: "100%", borderCollapse: "collapse", mb: 1.5,
              display: "block", overflowX: "auto", whiteSpace: "nowrap",
            },
            "& th, & td": {
              border: "1px solid", borderColor: "divider",
              px: 1.5, py: 0.75, textAlign: "left", fontSize: "13px",
            },
            "& th": { bgcolor: "rgba(0,0,0,0.04)", fontWeight: 600 },
            "& tr:nth-of-type(even)": { bgcolor: "rgba(0,0,0,0.02)" },
            "& .katex": { fontSize: "1.05em" },
            "& .katex-display": {
              overflowX: "auto",
              overflowY: "hidden",
              py: 0.5,
              my: 1,
            },
          }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                pre: Pre,
                code: InlineCode,
                blockquote: ({ children }) => <Blockquote>{children}</Blockquote>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </Box>

          {message.tokens && (
            <Typography sx={{
              fontSize: "10.5px",
              color: "text.secondary",
              mt: 0.75,
            }}>
              {message.tokens.total.toLocaleString()} tokens
            </Typography>
          )}
        </Box>
      )}

      <Stack sx={{
        flexDirection: "row", gap: 0.25,
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.15s", px: isUser ? 0.5 : 0,
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
  );
};
