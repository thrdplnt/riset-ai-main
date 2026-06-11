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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !telp || !email || !password) {
      setError("Semua field wajib diisi.");
      return;
    }
    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, telp, email, password }),
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
              placeholder="+62812345678"
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
