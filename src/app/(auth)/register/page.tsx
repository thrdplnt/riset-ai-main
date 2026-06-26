"use client";

import {
  Alert,
  Box,
  Button,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import { useState } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ROUTES } from "@/routes";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { InputAdornment, IconButton } from "@mui/material";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [telp, setTelp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = (): string | null => {
    if (!name || !telp || !email || !password || !confirmPassword) {
      return "Semua field wajib diisi.";
    }

    const nameRegex = /^[A-Za-z\s]{2,100}$/;
    if (!nameRegex.test(name.trim())) {
      return "Nama harus huruf dan minimal 2 karakter.";
    }

    const telpRegex = /^(0|\+62)[0-9]{9,12}$/;
    if (!telpRegex.test(telp.trim())) {
      return "Nomor HP harus 10-13 digit, awali dengan 0 atau +62.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return "Format email tidak valid.";
    }

    if (password.length < 8) {
      return "Password minimal 8 karakter.";
    }
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      return "Password harus kombinasi huruf dan angka.";
    }

    if (password !== confirmPassword) {
      return "Konfirmasi password tidak cocok.";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), telp: telp.trim(), email: email.trim(), password }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message);
        return;
      }

      setRegisteredEmail(email.trim());
      setRegistered(true);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    setResendMessage("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail }),
      });
      const data = await res.json();
      setResendMessage(data.message);
    } catch {
      setResendMessage("Gagal mengirim ulang. Coba lagi.");
    } finally {
      setResending(false);
    }
  };

  if (registered) {
    return (
      <AuthLayout
        title="Cek Email Kamu"
        subtitle="Satu langkah lagi sebelum bisa login."
        footer={
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Typography variant="body2" color="slate.500" sx={{ textAlign: "center" }}>
              Sudah verifikasi?{" "}
              <Link href={ROUTES.LOGIN} underline="always" color="inherit">
                Login here
              </Link>
              .
            </Typography>
          </Box>
        }
      >
        <Stack sx={{ alignItems: "center", gap: 2, textAlign: "center" }}>
          <MarkEmailReadOutlinedIcon sx={{ fontSize: 56, color: "primary.main" }} />
          <Typography sx={{ fontSize: "14px", color: "text.secondary", lineHeight: 1.6 }}>
            Kami sudah mengirim link verifikasi ke{" "}
            <Typography component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
              {registeredEmail}
            </Typography>
            . Silakan cek inbox (atau folder spam) dan klik link tersebut untuk mengaktifkan akun kamu.
          </Typography>

          {resendMessage && (
            <Alert severity="success" sx={{ borderRadius: 1, py: 0.5, width: "100%" }}>
              {resendMessage}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "12.5px" }}>
            Tidak menerima email?{" "}
            <Link
              href="#"
              underline="always"
              color="inherit"
              onClick={(e) => {
                e.preventDefault();
                handleResendVerification();
              }}
              sx={{ cursor: "pointer" }}
            >
              {resending ? "Mengirim..." : "Kirim ulang"}
            </Link>
          </Typography>
        </Stack>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Register"
      subtitle="Create an account to access your dashboard."
      footer={
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Typography variant="body2" color="slate.500" sx={{ textAlign: "center" }}>
            Already have an account?{" "}
            <Link href={ROUTES.LOGIN} underline="always" color="inherit">
              Login here
            </Link>
            .
          </Typography>
        </Box>
      }
    >
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          {error && (
            <Alert severity="error" sx={{ borderRadius: 1, py: 0.5 }}>
              {error}
            </Alert>
          )}

          <Stack spacing="12px">
            <Typography component="label" htmlFor="name"
              variant="subtitle2" color="text.primary">
              Name
            </Typography>
            <TextField id="name" type="text" fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />
          </Stack>

          <Stack spacing="12px">
            <Typography component="label" htmlFor="telp"
              variant="subtitle2" color="text.primary">
              Phone Number
            </Typography>
            <TextField id="telp" type="tel" fullWidth
              value={telp}
              onChange={(e) => setTelp(e.target.value)}
              placeholder="08123456789"
            />
          </Stack>

          <Stack spacing="12px">
            <Typography component="label" htmlFor="email"
              variant="subtitle2" color="text.primary">
              Email
            </Typography>
            <TextField id="email" type="email" fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </Stack>

          <Stack spacing="12px">
            <Typography component="label" htmlFor="password"
              variant="subtitle2" color="text.primary">
              Password
            </Typography>
            <TextField id="password" type={showPassword ? "text" : "password"} fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              helperText="Minimal 8 karakter, kombinasi huruf dan angka"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                        size="small"
                        sx={{ border: "none" }}
                      >
                        {showPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Stack>

          <Stack spacing="12px">
            <TextField id="confirmPassword" type={showConfirmPassword ? "text" : "password"} fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        edge="end"
                        size="small"
                        sx={{ border: "none" }}
                      >
                        {showConfirmPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Stack>

          <Button type="submit" variant="contained" fullWidth disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </Button>
        </Stack>
      </Box>
    </AuthLayout>
  );
}