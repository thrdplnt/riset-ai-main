"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppBar, Box, Stack, Toolbar, Snackbar, Alert } from "@mui/material";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput, PendingAttachment } from "@/components/chat/ChatInput";
import { FreeUserBanner } from "@/components/chat/FreeUserBanner";
import { TokenBadge } from "@/components/chat/TokenBadge";
import { UserMenu } from "@/components/chat/UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { Typography } from "@mui/material";

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

interface Chat {
  id: string;
  title: string;
  created_at: string;
}

function ChatPageContent() {
  const { logout, user } = useAuth();
  const searchParams = useSearchParams();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingInitialChat, setIsLoadingInitialChat] = useState(() => Boolean(searchParams.get("id")));

  const [modelId, setModelId] = useState("");
  const [modelName, setModelName] = useState("");

  const [remaining, setRemaining] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFree, setIsFree] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [limitError, setLimitError] = useState<string | null>(null);
  const [supportsWebSearch, setSupportsWebSearch] = useState(false);
  const [allModels, setAllModels] = useState<any[]>([]);
  const [planName, setPlanName] = useState<string | undefined>(undefined);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  // On mobile, start with sidebar hidden
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 900;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const userInitials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  useEffect(() => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((data) => { if (data.success) setChats(data.data); });

    fetch("/api/models")
    .then((r) => r.json())
    .then((data) => { if (data.success) setAllModels(data.data); });
  }, []);

  useEffect(() => {
    const current = allModels.find((m) => m.id === modelId);
    setSupportsWebSearch(current?.supports_web_search ?? false);
  }, [modelId, allModels]);

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
          setPlanName(data.data.plan_name ?? undefined);
          setExpiresAt(data.data.expires_at ?? null);
        }
      });
  }, [modelId]);

  useEffect(() => {
    const container = bottomRef.current?.parentElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setLimitError(null);
    setModelId("");
    setModelName("");
    setRemaining(null);
    setTotal(null);
    window.history.pushState(null, "", "/chat");
  };

  const handleSelectChat = async (id: string) => {
    setActiveChatId(id);
    setLimitError(null);
    window.history.pushState(null, "", `/chat?id=${id}`);
    const res = await fetch(`/api/chat/${id}`);
    const data = await res.json();
    if (data.success) {
      const history: Message[] = data.data.history.flatMap((log: any) => [
        {
          id: `${log.id}-user`, role: "user" as const, content: log.prompt_text,
          attachments: log.attachments ?? [],
        },
        {
          id: `${log.id}-ai`, role: "assistant" as const, content: log.response_text,
          tokens: {
            prompt: log.input_tokens, completion: log.output_tokens,
            total: log.input_tokens + log.output_tokens,
          },
        },
      ]);
      setMessages(history);

      const lastLog = data.data.history[data.data.history.length - 1];
      if (lastLog?.model_id && lastLog?.model_display_name) {
        setModelId(lastLog.model_id);
        setModelName(lastLog.model_display_name);
      } else {
        const savedId = localStorage.getItem("lastModelId");
        const savedName = localStorage.getItem("lastModelName");
        if (savedId && savedName) {
          setModelId(savedId);
          setModelName(savedName);
        }
      }
    }
  };

  useEffect(() => {
    const idFromUrl = searchParams.get("id");
    if (idFromUrl) {
      handleSelectChat(idFromUrl).finally(() => setIsLoadingInitialChat(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteChat = async (id: string) => {
    await fetch(`/api/chat/${id}`, { method: "DELETE" });
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeChatId === id) {
      setActiveChatId(null);
      setMessages([]);
      window.history.pushState(null, "", "/chat");
    }
  };

  const handleModelChange = (id: string, name: string) => {
    setModelId(id);
    setModelName(name);
    setLimitError(null);
    setRemaining(null);
    setTotal(null);
    localStorage.setItem("lastModelId", id);
    localStorage.setItem("lastModelName", name);
  };

  const handleSend = async (prompt: string, attachments: PendingAttachment[], webSearch: boolean) => {
    if (isFree) {
      setLimitError("Plan Free tidak dapat mengakses AI. Hubungi admin untuk upgrade.");
      return;
    }
    if (!modelId) {
      setLimitError("Silakan pilih Model AI terlebih dahulu.");
      return;
    }

    setLimitError(null);
    let chatId = activeChatId;

    if (!chatId) {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: prompt.slice(0, 50) || "New Chat" }),
      });
      const data = await res.json();
      if (data.success) {
        chatId = data.data.id;
        setChats((prev) => [data.data, ...prev]);
        setActiveChatId(chatId);
        window.history.pushState(null, "", `/chat?id=${chatId}`);
      }
    }

    if (!chatId) return;

    const userMsg: Message = {
      id: crypto.randomUUID(), role: "user", content: prompt,
      attachments,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`/api/chat/${chatId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          model_id: modelId,
          attachments,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          web_search: webSearch,
        }),
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

        setChats((prev) => {
          const updated = prev.map((c) =>
            c.id === chatId && c.title === "New Chat"
              ? { ...c, title: prompt.slice(0, 50) || c.title }
              : c
          );
          const target = updated.find((c) => c.id === chatId);
          if (!target) return updated;
          const rest = updated.filter((c) => c.id !== chatId);
          return [target, ...rest];
        });
      } else {
        // Tampilkan pesan error sebagai bubble tanpa prefix "Error:"
        setMessages((prev) => [...prev, {
          id: crypto.randomUUID(), role: "assistant",
          content: data.message,
        }]);
      }
    } catch {
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(), role: "assistant",
        content: "Terjadi kesalahan. Coba lagi.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const [blockAttachOnWebSearch, setBlockAttachOnWebSearch] = useState(false);

    useEffect(() => {
      const current = allModels.find((m) => m.id === modelId);
      setSupportsWebSearch(current?.supports_web_search ?? false);
      setBlockAttachOnWebSearch(current?.provider_id === "openai"); 
    }, [modelId, allModels]);

  const showEmptyState = !isLoadingInitialChat && (!activeChatId || messages.length === 0);

  return (
    <Box sx={{
      height: "100vh",
      "@supports (height: 100svh)": { height: "100svh" },
      display: "flex",
      overflow: "hidden",
      bgcolor: "background.default",
      position: "relative",
    }}>
      {/* Backdrop: mobile only, shown when sidebar is expanded */}
      {isMobile && !collapsed && (
        <Box
          onClick={() => setCollapsed(true)}
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.4)",
            zIndex: 9,
          }}
        />
      )}

      {/* Sidebar: always in flex flow so collapsed strip stays visible.
          On mobile when expanded, it becomes fixed overlay so content isn't squeezed. */}
      <Box sx={{
        // When mobile + expanded: take it out of flow as fixed overlay
        position: (isMobile && !collapsed) ? "fixed" : "relative",
        top: (isMobile && !collapsed) ? 0 : "auto",
        left: (isMobile && !collapsed) ? 0 : "auto",
        height: (isMobile && !collapsed) ? "100vh" : "auto",
        ...((isMobile && !collapsed) ? { "@supports (height: 100svh)": { height: "100svh" } } : {}),
        zIndex: (isMobile && !collapsed) ? 10 : "auto",
        flexShrink: 0,
        transition: "none",
      }}>
        <ChatSidebar
          chats={chats}
          activeChatId={activeChatId ?? undefined}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
        />
      </Box>

      <Box sx={{
        flex: 1, minWidth: 0,
        display: "flex", flexDirection: "column",
        height: "100vh", "@supports (height: 100svh)": { height: "100svh" }, overflow: "hidden",
      }}>
        <AppBar position="static" elevation={0} sx={{
          bgcolor: "background.paper",
          borderBottom: "1px solid", borderColor: "divider",
          flexShrink: 0,
        }}>
          <Toolbar sx={{
            minHeight: "56px !important",
            px: "16px !important",
            justifyContent: "flex-end",
            gap: 1.5,
          }}>
            <TokenBadge
              remaining={remaining}
              total={total}
              modelName={modelName}
              planName={planName}
              expiresAt={expiresAt}
            />
            <UserMenu user={user} onLogout={logout} />
          </Toolbar>
        </AppBar>

        {isFree && <FreeUserBanner />}

        <Box sx={{
          flex: 1, minHeight: 0,
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          {isLoadingInitialChat ? (
            <Box sx={{
              flex: 1, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>
              <Stack sx={{ flexDirection: "row", alignItems: "center", gap: 0.5 }}>
                {[0, 0.15, 0.3].map((delay) => (
                  <Box key={delay} sx={{
                    width: 6, height: 6, borderRadius: "50%",
                    bgcolor: "text.secondary",
                    animation: "bounce 1s ease infinite",
                    animationDelay: `${delay}s`,
                    "@keyframes bounce": {
                      "0%, 80%, 100%": { transform: "scale(0.8)" },
                      "40%": { transform: "scale(1.2)" },
                    },
                  }} />
                ))}
              </Stack>
            </Box>
          ) : showEmptyState ? (
            <Box sx={{
              flex: 1,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              px: { xs: 3, sm: 6, md: 10 },
              pb: 6, gap: 4,
            }}>
              <Typography sx={{
                fontWeight: 600,
                fontSize: { xs: 24, sm: 30, md: 36 },
                letterSpacing: "-0.5px",
                color: "text.primary",
                textAlign: "center",
              }}>
                What can I help you with today?
              </Typography>
              <Box sx={{ width: "100%", maxWidth: 680 }}>
                <ChatInput
                  onSend={handleSend}
                  modelId={modelId}
                  onModelChange={handleModelChange}
                  loading={loading}
                  menuDirection="down"
                  supportsWebSearch={supportsWebSearch}
                  blockAttachOnWebSearch={blockAttachOnWebSearch}
                  disabled={isFree}
                  isMobile={isMobile}
                />
              </Box>
            </Box>
          ) : (
            <>
              <Box sx={{
                flex: 1, minHeight: 0, overflowY: "auto",
                px: { xs: 3, sm: 6, md: 10 },
                py: 3,
                display: "flex", flexDirection: "column",
                gap: 2.5,
              }}>
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    userInitials={userInitials}
                  />
                ))}

                {loading && (
                  <Box sx={{ px: 0, py: 0.5, width: "100%" }}>
                    <Stack sx={{ flexDirection: "row", alignItems: "center", gap: 0.5 }}>
                      {[0, 0.15, 0.3].map((delay) => (
                        <Box key={delay} sx={{
                          width: 6, height: 6, borderRadius: "50%",
                          bgcolor: "text.secondary",
                          animation: "bounce 1s ease infinite",
                          animationDelay: `${delay}s`,
                          "@keyframes bounce": {
                            "0%, 80%, 100%": { transform: "scale(0.8)" },
                            "40%": { transform: "scale(1.2)" },
                          },
                        }} />
                      ))}
                    </Stack>
                  </Box>
                )}
                <div ref={bottomRef} />
              </Box>

              <Box sx={{
                flexShrink: 0,
                px: { xs: 3, sm: 6, md: 10 },
                pb: 3, pt: 1.5,
                bgcolor: "background.default",
              }}>
                {limitError && (
                  <Box sx={{
                    mb: 1.5, px: 1.5, py: 1,
                    borderRadius: "10px",
                    bgcolor: "rgba(211,47,47,0.08)",
                    border: "1px solid rgba(211,47,47,0.15)",
                  }}>
                    <Typography sx={{
                      fontSize: "12.5px", color: "error.main", fontWeight: 500,
                    }}>
                      {limitError}
                    </Typography>
                  </Box>
                )}
                <ChatInput
                  onSend={handleSend}
                  modelId={modelId}
                  onModelChange={handleModelChange}
                  loading={loading}
                  menuDirection="up"
                  supportsWebSearch={supportsWebSearch}
                  disabled={isFree}
                  isMobile={isMobile}
                />
              </Box>
            </>
          )}
        </Box>
      </Box>

      <Snackbar
        open={Boolean(limitError)}
        autoHideDuration={4000}
        onClose={() => setLimitError(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="warning" onClose={() => setLimitError(null)} sx={{ width: "100%" }}>
          {limitError}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatPageContent />
    </Suspense>
  );
}