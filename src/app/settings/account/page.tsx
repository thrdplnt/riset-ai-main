"use client";

import {
  Alert,
  Box,
  Button,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

function getToken() {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
}

export default function AccountPage() {
  const { updateUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telp, setTelp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = getToken();
      const res = await fetch("/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setName(data.data.name ?? "");
        setEmail(data.data.email ?? "");
        setTelp(data.data.telp ?? "");
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return setError("Nama wajib diisi.");
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = getToken();
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, telp }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Terjadi kesalahan.");
      } else {
        setSuccess("Profil berhasil diperbarui.");
        updateUser({ name });
      }
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        My Account
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Manage your profile and account settings.
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600 }}>        
        <Stack spacing={2.5}>
          {error && (
            <Alert severity="error" sx={{ borderRadius: 1, py: 0.5 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ borderRadius: 1, py: 0.5 }}>
              {success}
            </Alert>
          )}

          <Stack spacing="6px">
            <Typography component="label" htmlFor="email" variant="subtitle2">
              Email
            </Typography>
            <TextField
              id="email"
              type="email"
              fullWidth
              value={email}
              disabled
              sx={{ "& .MuiInputBase-root": { bgcolor: "action.hover" } }}
            />
          </Stack>

          <Stack spacing="6px">
            <Typography component="label" htmlFor="name" variant="subtitle2">
              Name
            </Typography>
            <TextField
              id="name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap"
            />
          </Stack>

          <Stack spacing="6px">
            <Typography component="label" htmlFor="telp" variant="subtitle2">
              Phone Number
            </Typography>
            <TextField
              id="telp"
              fullWidth
              value={telp}
              onChange={(e) => setTelp(e.target.value)}
              placeholder="+62..."
            />
          </Stack>

          <Box>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Menyimpan..." : "Update Profile"}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}