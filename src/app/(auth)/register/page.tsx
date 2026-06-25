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
import { useState } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ROUTES } from "@/routes";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [telp, setTelp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = (): string | null => {
    if (!name || !telp || !email || !password) {
      return "Semua field wajib diisi.";
    }

    // Nama: minimal 2 karakter, hanya huruf dan spasi
    const nameRegex = /^[A-Za-z\s]{2,100}$/;
    if (!nameRegex.test(name.trim())) {
      return "Nama harus huruf dan minimal 2 karakter.";
    }

    // No HP: hanya angka, 10-13 digit (boleh diawali 0 atau +62)
    const telpRegex = /^(0|\+62)[0-9]{9,12}$/;
    if (!telpRegex.test(telp.trim())) {
      return "Nomor HP harus 10-13 digit, awali dengan 0 atau +62.";
    }

    // Email: format standar
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return "Format email tidak valid.";
    }

    // Password: minimal 8 karakter, ada huruf dan angka
    if (password.length < 8) {
      return "Password minimal 8 karakter.";
    }
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      return "Password harus kombinasi huruf dan angka.";
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

      window.location.href = ROUTES.LOGIN;
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

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
            <TextField id="password" type="password" fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              helperText="Minimal 8 karakter, kombinasi huruf dan angka"
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