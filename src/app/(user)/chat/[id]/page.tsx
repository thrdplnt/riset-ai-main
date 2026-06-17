"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { AppBar, Box, Stack, Toolbar, Typography } from "@mui/material";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { FreeUserBanner } from "@/components/chat/FreeUserBanner";
import { TokenBadge } from "@/components/chat/TokenBadge";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/routes";

// Interface sesuai MessageBubble baru — pakai object message
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  modelName?: string;
  tokens?: { prompt: number; completion: number; total: number };
}

interface Chat {
  id: string;
  title: string;
  created_at: string;
}

export default function ChatRoomPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>(id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [modelId, setModelId] = useState("");
  const [modelName, setModelName] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFree, setIsFree] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [limitError, setLimitError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((data) => { if (data.success) setChats(data.data); });
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/chat/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const history: Message[] = data.data.history.flatMap((log: any) => [
            { id: `${log.id}-user`, role: "user" as const, content: log.prompt_text },
            { id: `${log.id}-ai`, role: "assistant" as const, content: log.response_text,
              tokens: { prompt: log.input_tokens, completion: log.output_tokens,
                total: log.input_tokens + log.output_tokens } },
          ]);
          setMessages(history);
        }
      });
  }, [id]);

  useEffect(() => {
    fetch("/api/quota/check")
      .then((r) => r.json())
      .then((data) => { if (!data.data?.has_subscription) setIsFree(true); })
      .catch(() => setIsFree(true));
  }, []);

  useEffect(() => {
    if (!modelId) return;
    fetch(`/api/quota?model_id=${modelId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setRemaining(data.data.remaining_quota);
          setTotal(data.data.total_quota);
        }
      });
  }, [modelId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewChat = async () => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "New Chat" }),
    });
    const data = await res.json();
    if (data.success) {
      setChats((prev) => [data.data, ...prev]);
      setActiveChatId(data.data.id);
      setMessages([]);
      setLimitError(null);
      window.history.pushState(null, "", `/chat/${data.data.id}`);
    }
  };

  const handleSelectChat = async (chatId: string) => {
    setActiveChatId(chatId);
    setLimitError(null);
    window.history.pushState(null, "", `/chat/${chatId}`);
    const res = await fetch(`/api/chat/${chatId}`);
    const data = await res.json();
    if (data.success) {
      const history: Message[] = data.data.history.flatMap((log: any) => [
        { id: `${log.id}-user`, role: "user" as const, content: log.prompt_text },
        { id: `${log.id}-ai`, role: "assistant" as const, content: log.response_text,
          tokens: { prompt: log.input_tokens, completion: log.output_tokens,
            total: log.input_tokens + log.output_tokens } },
      ]);
      setMessages(history);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    await fetch(`/api/chat/${chatId}`, { method: "DELETE" });
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    if (activeChatId === chatId) {
      setMessages([]);
      const rest = chats.filter((c) => c.id !== chatId);
      if (rest.length > 0) handleSelectChat(rest[0].id);
      else router.push(ROUTES.CHAT);
    }
  };

  const handleModelChange = (id: string, name: string) => {
    setModelId(id);
    setModelName(name);
    setLimitError(null);
    setRemaining(null);
    setTotal(null);
  };

  const handleSend = async (prompt: string) => {
    if (isFree) {
      setLimitError("Plan Free tidak dapat mengakses AI. Hubungi admin untuk upgrade.");
      return;
    }
    if (!modelId) return;

    setLimitError(null);
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`/api/chat/${activeChatId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model_id: modelId }),
      });
      const data = await res.json();

      if (data.success) {
        setMessages((prev) => [...prev, {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.data.response,
          modelName,
          tokens: {
            prompt: data.data.input_tokens,
            completion: data.data.output_tokens,
            total: data.data.input_tokens + data.data.output_tokens,
          },
        }]);
        setRemaining(data.data.remaining_quota);
        setChats((prev) =>
          prev.map((c) => c.id === activeChatId ? { ...c, title: prompt.slice(0, 50) } : c)
        );
      } else {
        setLimitError(data.message);
        setMessages((prev) => [...prev, {
          id: crypto.randomUUID(), role: "assistant", content: `Error: ${data.message}`,
        }]);
      }
    } catch {
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(), role: "assistant", content: "Terjadi kesalahan. Coba lagi.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", overflow: "hidden", bgcolor: "background.default" }}>
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
      />

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column",
        height: "100vh", overflow: "hidden" }}>

        <AppBar position="static" elevation={0}
          sx={{ bgcolor: "background.paper", borderBottom: "1px solid",
            borderColor: "divider", flexShrink: 0 }}>
          <Toolbar sx={{ minHeight: "56px !important", px: "16px !important",
            justifyContent: "flex-end", gap: 1.5 }}>
            <TokenBadge remaining={remaining} total={total} />
            <Box sx={{ width: 32, height: 32, borderRadius: "50%",
              bgcolor: "custom.buttonDark", display: "flex",
              alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              onClick={() => router.push(ROUTES.SETTINGS_ACCOUNT)}>
              <Typography sx={{ color: "custom.buttonText", fontSize: "12px", fontWeight: 700 }}>
                U
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>

        {isFree && <FreeUserBanner />}

        <Box sx={{ flex: 1, minHeight: 0, display: "flex",
          flexDirection: "column", overflow: "hidden" }}>
          {messages.length === 0 ? (
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              px: { xs: 2, sm: 4 }, pb: 4, gap: 3 }}>
              <Typography sx={{ fontWeight: 600,
                fontSize: { xs: 22, sm: 28, md: 32 },
                letterSpacing: "-0.5px", color: "text.primary", textAlign: "center" }}>
                What can I help you with today?
              </Typography>
              <Box sx={{ width: "100%", maxWidth: 620 }}>
                <ChatInput onSend={handleSend} modelId={modelId}
                  onModelChange={handleModelChange} loading={loading} menuDirection="down" />
              </Box>
            </Box>
          ) : (
            <>
              <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto",
                px: { xs: 2, sm: 4, md: 8 }, py: 3,
                display: "flex", flexDirection: "column", gap: 2.5 }}>
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} userInitials="U" />
                ))}

                {loading && (
                  <Stack sx={{ flexDirection: "row", alignItems: "center", gap: 1.5 }}>
                    <Box component="img" src="/favicon.ico" alt="AI"
                      sx={{ width: 28, height: 28, borderRadius: "8px",
                        objectFit: "cover", flexShrink: 0 }} />
                    <Box sx={{ px: 2, py: 1.25, borderRadius: "4px 16px 16px 16px",
                      bgcolor: "rgba(0,0,0,0.04)", border: "1px solid",
                      borderColor: "custom.borderLight" }}>
                      <Stack sx={{ flexDirection: "row", alignItems: "center", gap: 0.5 }}>
                        {[0, 0.15, 0.3].map((delay) => (
                          <Box key={delay} sx={{ width: 6, height: 6, borderRadius: "50%",
                            bgcolor: "text.secondary",
                            animation: "bounce 1s ease infinite",
                            animationDelay: `${delay}s`,
                            "@keyframes bounce": {
                              "0%, 80%, 100%": { transform: "scale(0.8)" },
                              "40%": { transform: "scale(1.2)" },
                            } }} />
                        ))}
                      </Stack>
                    </Box>
                  </Stack>
                )}
                <div ref={bottomRef} />
              </Box>

              <Box sx={{ flexShrink: 0, px: { xs: 2, sm: 4, md: 8 },
                pb: 2.5, pt: 1, bgcolor: "background.default",
                borderTop: "1px solid", borderColor: "divider" }}>
                {limitError && (
                  <Box sx={{ mb: 1, px: 1.5, py: 1, borderRadius: "10px",
                    bgcolor: "rgba(211,47,47,0.08)",
                    border: "1px solid rgba(211,47,47,0.15)" }}>
                    <Typography sx={{ fontSize: "12.5px", color: "error.main", fontWeight: 500 }}>
                      {limitError}
                    </Typography>
                  </Box>
                )}
                <ChatInput onSend={handleSend} modelId={modelId}
                  onModelChange={handleModelChange} loading={loading} menuDirection="up" />
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}