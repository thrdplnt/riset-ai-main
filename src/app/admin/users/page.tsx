"use client";

import {
  Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, FormControl, IconButton, LinearProgress, MenuItem,
  Paper, Select, Stack, Switch, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Tooltip, Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
const DatabaseIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);
import { TableSortLabel } from "@mui/material";

function getToken() {
  if (typeof window === "undefined") return "";
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1] ?? "";
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatDateLong(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

function formatDateTime(date: string) {
  return {
    date: new Date(date).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    }),
    time: new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit",
    }),
  };
}

function formatToken(n: number | null) {
  if (n === null) return "-";
  return n.toLocaleString("en-US");
}

function percentLeft(remaining: number | null, total: number | null) {
  if (remaining === null || total === null || total === 0) return 0;
  return Math.floor((remaining / total) * 100);
}

interface User {
  id: string;
  name: string;
  email: string;
  telp: string;
  role: "user" | "admin";
  is_active: boolean;
  created_at: string;
  current_plan: string | null;
  subscription_end: string | null;
  last_usage_at: string | null;
  last_usage_model: string | null;
}

interface Plan {
  id: string;
  plan_name: string;
  price: number;
  duration: number;
  token_limit: number;
}

interface SubscriptionHistory {
  id: string;
  plan_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  limit_snapshot: number;
}

interface TokenData {
  model_id: string;
  display_name: string;
  remaining_quota: number | null;
  total_quota: number | null;
}

interface PlanData {
  name: string;
  expires: string;
}



function timeAgo(dateStr: string | null) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} hari lalu`;
  if (hours > 0) return `${hours} jam lalu`;
  if (minutes > 0) return `${minutes} menit lalu`;
  return "Baru saja";
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [history, setHistory] = useState<SubscriptionHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "email" | "created_at" | "last_usage_at">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Token usage dialog state
  const [tokenUsageOpen, setTokenUsageOpen] = useState(false);
  const [tokenUsageUser, setTokenUsageUser] = useState<User | null>(null);
  const [tokenUsagePlan, setTokenUsagePlan] = useState<PlanData | null>(null);
  const [tokenUsageTokens, setTokenUsageTokens] = useState<TokenData[]>([]);

  const [loadingTokenUsage, setLoadingTokenUsage] = useState(false);

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  });

  const fetchUsers = () => {
    const params = new URLSearchParams({ sortBy, sortOrder });
    fetch(`/api/admin/users?${params}`, { headers: getHeaders() })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setUsers(data.data);
      });
  };

  const fetchPlans = () => {
    fetch("/api/admin/subscriptions", { headers: getHeaders() })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setPlans(data.data);
      });
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortOrder]);

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleToggleActive = async (user: User) => {
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ user_id: user.id, is_active: !user.is_active }),
    });
    if (res.ok) fetchUsers();
  };

  const handleChangeRole = async (user: User, role: "user" | "admin") => {
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ user_id: user.id, role }),
    });
    if (res.ok) fetchUsers();
  };

  const handleOpenHistory = async (user: User) => {
    setSelectedUser(user);
    setSelectedPlanId("");
    setErrorMsg("");
    setAssignOpen(true);
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/history?user_id=${user.id}`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) setHistory(data.data);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleOpenTokenUsage = async (user: User) => {
    setTokenUsageUser(user);
    setTokenUsageOpen(true);
    setLoadingTokenUsage(true);
    setTokenUsagePlan(null);
    setTokenUsageTokens([]);
    try {
      const res = await fetch(`/api/admin/users/token-usage?user_id=${user.id}`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setTokenUsagePlan(data.data.plan);
        setTokenUsageTokens(data.data.tokens);
      }
    } finally {
      setLoadingTokenUsage(false);
    }
  };

  const handleAssignClick = () => {
    if (!selectedPlanId) return;
    setErrorMsg("");
    setConfirmOpen(true);
  };

  const handleSort = (column: "name" | "email" | "created_at" | "last_usage_at") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleConfirmAssign = async () => {
    if (!selectedUser || !selectedPlanId) return;
    setConfirmOpen(false);
    setAssigning(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ user_id: selectedUser.id, plan_id: selectedPlanId }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        fetchUsers();
        const histRes = await fetch(`/api/admin/subscriptions/history?user_id=${selectedUser.id}`, {
          headers: getHeaders(),
        });
        const histData = await histRes.json();
        if (histData.success) setHistory(histData.data);
        setSelectedPlanId("");
      } else {
        setErrorMsg(data.message ?? "Gagal mengaktifkan plan");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan koneksi. Coba lagi.");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>Users</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Manage users and roles.
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <TableContainer component={Paper} variant="outlined" sx={{ overflowX: "auto" }}>
        <Table sx={{ tableLayout: "auto", minWidth: 800 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "action.hover" }}>
              <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>
                <TableSortLabel
                  active={sortBy === "name"}
                  direction={sortBy === "name" ? sortOrder : "asc"}
                  onClick={() => handleSort("name")}>
                  Nama
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>
                <TableSortLabel
                  active={sortBy === "email"}
                  direction={sortBy === "email" ? sortOrder : "asc"}
                  onClick={() => handleSort("email")}>
                  Email
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, minWidth: 110 }}>
                <TableSortLabel
                  active={sortBy === "created_at"}
                  direction={sortBy === "created_at" ? sortOrder : "asc"}
                  onClick={() => handleSort("created_at")}>
                  Terdaftar
                </TableSortLabel>
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, minWidth: 140 }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, minWidth: 60 }}>Aksi</TableCell>
              <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>
                <TableSortLabel
                  active={sortBy === "last_usage_at"}
                  direction={sortBy === "last_usage_at" ? sortOrder : "asc"}
                  onClick={() => handleSort("last_usage_at")}>
                  Last Usage
                </TableSortLabel>
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, minWidth: 110 }}>Token Usage</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  Tidak ada pengguna
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} sx={{ "&:last-child td": { border: 0 } }}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(user.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" sx={{ alignItems: "center", justifyContent: "center" }} spacing={1}>
                      <Box sx={{ width: 70, textAlign: "center" }}>
                        <Chip
                          label={user.is_active ? "Aktif" : "Nonaktif"}
                          size="small"
                          sx={{
                            bgcolor: user.is_active ? "rgba(87,202,34,0.12)" : "rgba(0,0,0,0.08)",
                            color: user.is_active ? "success.main" : "text.secondary",
                            fontWeight: 600,
                            fontSize: "12px",
                            width: "100%",
                          }}
                        />
                      </Box>
                      <Tooltip title={user.is_active ? "Nonaktifkan" : "Aktifkan"}>
                        <Switch
                          checked={user.is_active}
                          onChange={() => handleToggleActive(user)}
                          size="small"
                        />
                      </Tooltip>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Riwayat & atur plan">
                      <IconButton size="small" onClick={() => handleOpenHistory(user)}>
                        <HistoryOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {user.last_usage_at ? (
                      <>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {timeAgo(user.last_usage_at)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.last_usage_model}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Belum pernah
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Lihat token usage">
                      <IconButton size="small" onClick={() => handleOpenTokenUsage(user)}>
                        <DatabaseIcon size={18} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog Assign Plan */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          Riwayat plan — {selectedUser?.name}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>

            <Typography variant="body2" color="text.secondary">
              Riwayat subscription
            </Typography>

            {loadingHistory ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress size={28} />
              </Box>
            ) : history.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                Belum ada riwayat subscription
              </Typography>
            ) : (
              <Stack spacing={1}>
                {history.map((h) => (
                  <Box key={h.id} sx={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    p: 1.25, borderRadius: "8px",
                    bgcolor: "action.hover",
                    opacity: h.is_active ? 1 : 0.6,
                  }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {h.plan_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(h.start_date)} &rarr; {formatDate(h.end_date)}
                      </Typography>
                    </Box>
                    <Chip
                      label={h.is_active ? "Aktif" : "Berakhir"}
                      size="small"
                      sx={{
                        bgcolor: h.is_active ? "rgba(87,202,34,0.12)" : "rgba(0,0,0,0.08)",
                        color: h.is_active ? "success.main" : "text.secondary",
                        fontWeight: 600, fontSize: "11px",
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            )}

            <Divider />

            <Typography variant="body2" color="text.secondary">
              Aktifkan plan baru
            </Typography>
            {errorMsg && (
              <Typography variant="body2" color="error.main" sx={{ mb: 1 }}>
                {errorMsg}
              </Typography>
            )}
            <FormControl fullWidth size="small">
              <Select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                displayEmpty>
                <MenuItem value="" disabled>Pilih plan</MenuItem>
                {plans.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.plan_name} — {p.token_limit.toLocaleString()} token / {p.duration} hari
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAssignOpen(false)} sx={{ borderRadius: "8px" }}>
            Tutup
          </Button>
          <Button variant="contained" onClick={handleAssignClick}
            disabled={!selectedPlanId || assigning} sx={{ borderRadius: "8px" }}>
            {assigning ? <CircularProgress size={18} color="inherit" /> : "Aktifkan"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Confirm Assign */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          Konfirmasi ganti plan
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Yakin ingin mengaktifkan plan{" "}
            <strong>{plans.find((p) => p.id === selectedPlanId)?.plan_name}</strong>{" "}
            untuk <strong>{selectedUser?.name}</strong>? Plan yang sedang aktif (jika ada)
            akan dinonaktifkan dan sisa kuota token akan diakumulasikan ke plan baru.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} sx={{ borderRadius: "8px" }}>
            Batal
          </Button>
          <Button variant="contained" onClick={handleConfirmAssign} sx={{ borderRadius: "8px" }}>
            Ya, aktifkan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Token Usage */}
      <Dialog
        open={tokenUsageOpen}
        onClose={() => setTokenUsageOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { maxHeight: "85vh" } } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Token Usage — {tokenUsageUser?.name}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {loadingTokenUsage ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress size={32} />
            </Box>
          ) : (
            <Stack spacing={0}>
              {/* Plan info */}
              <Box sx={{ px: 2.5, pt: 2, pb: 1.5 }}>
                <Paper variant="outlined" sx={{ p: 1.75, bgcolor: "action.hover" }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Plan</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {tokenUsagePlan ? tokenUsagePlan.name : "Tidak ada langganan aktif"}
                      </Typography>
                    </Box>
                    {tokenUsagePlan && (
                      <Typography variant="body2" color="text.secondary">
                        Expires {formatDateLong(tokenUsagePlan.expires)}
                      </Typography>
                    )}
                  </Stack>
                </Paper>
              </Box>

              <Divider />

              {/* Token Quota per Model */}
              <Box sx={{ px: 2.5, pt: 2, pb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                  Token Quota per Model
                </Typography>
                <Paper variant="outlined">
                  {tokenUsageTokens.length === 0 ? (
                    <Box sx={{ px: 2.5, py: 3, textAlign: "center" }}>
                      <Typography variant="body2" color="text.secondary">
                        Tidak ada data token
                      </Typography>
                    </Box>
                  ) : (
                    tokenUsageTokens.map((item, index) => (
                      <Box key={item.model_id}>
                        <Box sx={{ px: 2.5, py: 2 }}>
                          <Stack direction="row" sx={{
                            justifyContent: "space-between",
                            alignItems: "center", mb: 1,
                          }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {item.display_name}
                            </Typography>
                            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                              <Box sx={{ color: "text.secondary", display: "flex", alignItems: "center" }}><DatabaseIcon size={14} /></Box>
                              <Typography variant="body2" color="text.secondary">
                                {formatToken(
                                  item.total_quota !== null && item.remaining_quota !== null
                                    ? item.total_quota - item.remaining_quota
                                    : null
                                )} / {formatToken(item.total_quota)} tokens used
                              </Typography>
                            </Stack>
                          </Stack>

                          <LinearProgress
                            variant="determinate"
                            value={100 - percentLeft(item.remaining_quota, item.total_quota)}
                            sx={{
                              height: 6, borderRadius: "100px",
                              bgcolor: "rgba(0,0,0,0.08)", mb: 0.75,
                              "& .MuiLinearProgress-bar": {
                                borderRadius: "100px",
                                bgcolor: (100 - percentLeft(item.remaining_quota, item.total_quota)) > 80
                                  ? "error.main"
                                  : "primary.main",
                              },
                            }}
                          />

                          <Typography variant="caption" color="text.secondary">
                            {100 - percentLeft(item.remaining_quota, item.total_quota)}% used
                          </Typography>
                        </Box>
                        {index < tokenUsageTokens.length - 1 && <Divider />}
                      </Box>
                    ))
                  )}
                </Paper>
              </Box>

            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setTokenUsageOpen(false)} sx={{ borderRadius: "8px" }}>
            Tutup
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}