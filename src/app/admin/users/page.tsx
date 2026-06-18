"use client";

import {
  Box, Chip, Divider, FormControl, MenuItem,
  Paper, Select, Stack, Switch, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Tooltip, Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

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
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

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

  useEffect(() => {
    fetchUsers();
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
              <TableCell sx={{ fontWeight: 600, width: "18%" }}>Nama</TableCell>
              <TableCell sx={{ fontWeight: 600, width: "22%" }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600, width: "15%" }}>No. HP</TableCell>
              <TableCell sx={{ fontWeight: 600, width: "14%" }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 600, width: "14%" }}>Terdaftar</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, width: "17%" }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  Tidak ada pengguna
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} sx={{ "&:last-child td": { border: 0 } }}>
                  <TableCell sx={{ width: "18%" }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.name}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ width: "22%" }}>
                    <Typography variant="body2" color="text.secondary" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.email}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ width: "15%" }}>
                    <Typography variant="body2" color="text.secondary">
                      {user.telp || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ width: "14%" }}>
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
                  <TableCell sx={{ width: "14%" }}>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(user.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ width: "17%" }}>
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}