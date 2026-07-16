"use client";

import {
  Alert, Box, Button, Chip, Divider, IconButton,
  Paper, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography,
} from "@mui/material";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { useEffect, useState } from "react";

function getToken() {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);

  if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "a few seconds ago";
}

interface Session {
  id: string;
  device: string;
  created_at: string;
  last_active: string;
  isCurrent: boolean;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchSessions = async () => {
    const token = getToken();
    const res = await fetch("/api/users/sessions", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) setSessions(data.data);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleDelete = async (id: string) => {
  const token = getToken();
  const res = await fetch(`/api/users/sessions/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (data.success) {
    setSuccess("Sesi berhasil dihapus.");
    fetchSessions();
  } else {
    setError(data.message);
  }
};

  const handleClearAll = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    const token = getToken();
    const res = await fetch("/api/users/sessions", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) {
      setSuccess("Semua sesi lain berhasil dihapus.");
      fetchSessions();
    } else {
      setError(data.message);
    }
    setLoading(false);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Sessions
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Manage your active sessions.
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Stack spacing={2}>
        {error && <Alert severity="error" sx={{ borderRadius: 1, py: 0.5 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ borderRadius: 1, py: 0.5 }}>{success}</Alert>}

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Sessions</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Delete</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                      {session.device}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5, alignItems: "center" }}>
                      <Typography variant="caption" color="text.secondary">
                        {session.id}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {timeAgo(session.last_active)}
                      </Typography>
                      {session.isCurrent && (
                        <Chip label="Current" size="small" color="primary" sx={{ height: 18, fontSize: 10 }} />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="error"
                      disabled={session.isCurrent}
                      onClick={() => handleDelete(session.id)}
                    >
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box>
          <Button
            variant="contained"
            color="error"
            disabled={loading || sessions.filter((s) => !s.isCurrent).length === 0}
            onClick={handleClearAll}
          >
            {loading ? "Menghapus..." : "Clear All Sessions"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}