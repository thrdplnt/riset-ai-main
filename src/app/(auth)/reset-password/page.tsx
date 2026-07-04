"use client";

import { Alert, Box, Button, IconButton, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ROUTES } from "@/routes";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirm) return setError("Semua field wajib diisi.");
    if (password.length < 8) return setError("Password minimal 8 karakter.");
    
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) return setError("Password harus kombinasi huruf dan angka.");
    
    if (password !== confirm) return setError("Password tidak cocok.");
    if (!token) return setError("Token tidak ditemukan.");


    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Terjadi kesalahan.");
      } else {
        setSuccess(true);
        setTimeout(() => router.push(ROUTES.LOGIN), 3000);
      }
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={1.5}>
        {error && (
          <Alert severity="error" sx={{ borderRadius: 1, py: 0.5 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ borderRadius: 1, py: 0.5 }}>
            Password berhasil diubah! Mengarahkan ke halaman login...
          </Alert>
        )}

        <Stack spacing="8px">
          <Typography component="label" htmlFor="password" variant="subtitle2" color="text.primary">
            Password Baru
          </Typography>
          <TextField
            id="password"
            name="new-password"
            type={showPassword ? "text" : "password"}
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 karakter, kombinasi huruf & angka"
            disabled={success}
            autoComplete="new-password"
            sx={{
              input: {
                '::-ms-clear': { display: 'none' },
                '::-ms-reveal': { display: 'none' },
                '::-webkit-textfield-decoration-container': { display: 'none' },
              },
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((value) => !value)}
                      edge="end"
                      size="small"
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showPassword ? <VisibilityOutlinedIcon fontSize="small" /> : <VisibilityOffOutlinedIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Stack>

        <Stack spacing="8px">
          <Typography component="label" htmlFor="confirm" variant="subtitle2" color="text.primary">
            Konfirmasi Password
          </Typography>
          <TextField
            id="confirm"
            name="confirm-password"
            type={showConfirm ? "text" : "password"}
            fullWidth
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Ulangi password baru"
            disabled={success}
            autoComplete="new-password"
            sx={{
              input: {
                '::-ms-clear': { display: 'none' },
                '::-ms-reveal': { display: 'none' },
                '::-webkit-textfield-decoration-container': { display: 'none' },
              },
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirm((value) => !value)}
                      edge="end"
                      size="small"
                      aria-label={showConfirm ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showConfirm ? <VisibilityOutlinedIcon fontSize="small" /> : <VisibilityOffOutlinedIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Stack>

        <Box>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading || success}
          >
            {loading ? "Menyimpan..." : success ? "Tersimpan!" : "Simpan Password Baru"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Masukkan password baru kamu."
      footer={null}
    >
      <Suspense fallback={<Typography>Memuat...</Typography>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}