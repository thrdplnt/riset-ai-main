"use client";

import {
  Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, FormControl, IconButton, MenuItem,
  Paper, Select, Stack, Switch, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Tooltip, Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";

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

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  });

  const fetchUsers = () => {
    fetch("/api/admin/users", { headers: getHeaders() })
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
    fetchPlans();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleAssignClick = () => {
  if (!selectedPlanId) return;
  setErrorMsg("");
  setConfirmOpen(true);
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

      <TableContainer component={Paper} variant="outlined">
        <Table sx={{ tableLayout: "fixed" }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "action.hover" }}>
              <TableCell sx={{ fontWeight: 600, width: "15%" }}>Nama</TableCell>
              <TableCell sx={{ fontWeight: 600, width: "18%" }}>Email</TableCell>
              {/* <TableCell sx={{ fontWeight: 600, width: "12%" }}>Role</TableCell> */}
              {/* <TableCell sx={{ fontWeight: 600, width: "13%" }}>Plan</TableCell> */}
              <TableCell sx={{ fontWeight: 600, width: "12%" }}>Terdaftar</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, width: "15%" }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, width: "15%" }}>Aksi</TableCell>
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
                  <TableCell sx={{ width: "15%" }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.name}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ width: "18%" }}>
                    <Typography variant="body2" color="text.secondary" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.email}
                    </Typography>
                  </TableCell>
                  {/* <TableCell sx={{ width: "12%" }}>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user, e.target.value as "user" | "admin")}
                        sx={{ fontSize: 13 }}>
                        <MenuItem value="user">User</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell sx={{ width: "13%" }}>
                    {user.current_plan ? (
                      <Chip label={user.current_plan} size="small"
                        sx={{ bgcolor: "rgba(33,150,243,0.12)", color: "info.main", fontWeight: 600, fontSize: "12px" }} />
                    ) : (
                      <Chip label="Free" size="small"
                        sx={{ bgcolor: "rgba(0,0,0,0.08)", color: "text.secondary", fontWeight: 600, fontSize: "12px" }} />
                    )}
                  </TableCell> */}
                  <TableCell sx={{ width: "12%" }}>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(user.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ width: "15%" }}>
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
                  <TableCell align="center" sx={{ width: "15%" }}>
                    <Tooltip title="Riwayat & atur plan">
                      <IconButton size="small" onClick={() => handleOpenHistory(user)}>
                        <HistoryOutlinedIcon fontSize="small" />
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
    </Box>
    
  );
}