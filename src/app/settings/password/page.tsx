"use client";

import {
  Alert, Box, Button, Divider, IconButton,
  InputAdornment, Stack, TextField, Typography,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { useState } from "react";

function getToken() {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
}

export default function PasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      return setError("Semua field wajib diisi.");
    }
    if (newPassword.length < 8) {
      return setError("Password baru minimal 8 karakter.");
    }
    if (newPassword !== confirmPassword) {
      return setError("Konfirmasi password tidak cocok.");
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = getToken();
      const res = await fetch("/api/users/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Terjadi kesalahan.");
      } else {
        setSuccess("Password berhasil diubah.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  const EyeToggle = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <InputAdornment position="end">
      <IconButton onClick={onToggle} edge="end" size="small">
        {show
          ? <VisibilityOffOutlinedIcon fontSize="small" />
          : <VisibilityOutlinedIcon fontSize="small" />
        }
      </IconButton>
    </InputAdornment>
  );

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Change Password
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Update your account password.
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
            <Typography component="label" htmlFor="currentPassword" variant="subtitle2">
              Current Password
            </Typography>
            <TextField
              id="currentPassword"
              type={showCurrent ? "text" : "password"}
              fullWidth
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              slotProps={{
                input: {
                  endAdornment: <EyeToggle show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} />,
                },
              }}
            />
          </Stack>

          <Stack spacing="6px">
            <Typography component="label" htmlFor="newPassword" variant="subtitle2">
              New Password
            </Typography>
            <TextField
              id="newPassword"
              type={showNew ? "text" : "password"}
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              slotProps={{
                input: {
                  endAdornment: <EyeToggle show={showNew} onToggle={() => setShowNew(!showNew)} />,
                },
              }}
            />
          </Stack>

          <Stack spacing="6px">
            <Typography component="label" htmlFor="confirmPassword" variant="subtitle2">
              Confirm New Password
            </Typography>
            <TextField
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              slotProps={{
                input: {
                  endAdornment: <EyeToggle show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />,
                },
              }}
            />
          </Stack>

          <Box>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Menyimpan..." : "Change Password"}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}