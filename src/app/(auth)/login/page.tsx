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
import { useEffect, useState } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/routes";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { InputAdornment, IconButton } from "@mui/material";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const reason = sessionStorage.getItem("logout_reason");
    if (reason) {
      setError(reason);
      sessionStorage.removeItem("logout_reason");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }
    setError("");
    setResendMessage("");
    setLoading(true);
    const { error: loginError } = await login(email, password);
    if (loginError) {
      setError(loginError);
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError("Masukkan email kamu terlebih dahulu di atas, lalu klik kirim ulang.");
      return;
    }
    setResending(true);
    setError("");
    setResendMessage("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setResendMessage(data.message);
      } else {
        setError(data.message ?? "Gagal mengirim ulang email verifikasi");
      }
    } catch {
      setError("Gagal mengirim ulang email verifikasi");
    } finally {
      setResending(false);
    }
  };

  const footerLinks = [
    {
      text: "Don't have an account? ",
      linkText: "Register here",
      suffix: ".",
      href: ROUTES.REGISTER,
      onClick: undefined,
    },
    {
      text: "Didn't receive your verification email? ",
      linkText: resending ? "Sending..." : "Resend here",
      suffix: ".",
      href: "#",
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        handleResendVerification();
      },
    },
    {
      text: "Forgot your password? ",
      linkText: "Reset here",
      suffix: ".",
      href: ROUTES.FORGOT_PASSWORD,
      onClick: undefined,
    },
  ];

  return (
    <AuthLayout
      title="Login"
      subtitle="Login to your account."
      footer={
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {footerLinks.map((item, index) => (
            <Typography key={index} variant="body2" color="slate.500"
              sx={{ textAlign: "center" }}>
              {item.text}
              <Link
                href={item.href}
                underline="always"
                color="inherit"
                onClick={item.onClick}
                sx={item.onClick ? { cursor: "pointer" } : undefined}
              >
                {item.linkText}
              </Link>
              {item.suffix}
            </Typography>
          ))}
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

          {resendMessage && (
            <Alert severity="success" sx={{ borderRadius: 1, py: 0.5 }}>
              {resendMessage}
            </Alert>
          )}

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

          <Button type="submit" variant="contained" fullWidth disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </Stack>
      </Box>
    </AuthLayout>
  );
}