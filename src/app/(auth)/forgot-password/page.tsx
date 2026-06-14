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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email wajib diisi.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Terjadi kesalahan.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Typography variant="body2" color="slate.500" sx={{ textAlign: "center" }}>
            Oh, I remember now!{" "}
            <Link href={ROUTES.LOGIN} underline="always" color="inherit">
              Login here
            </Link>
            .
          </Typography>
        </Box>
      }
    >
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={1.5}>
          {error && (
            <Alert severity="error" sx={{ borderRadius: 1, py: 0.5 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ borderRadius: 1, py: 0.5 }}>
              Reset link has been sent to your email.
            </Alert>
          )}

          <Stack spacing="8px">
            <Typography component="label" htmlFor="email"
              variant="subtitle2" color="text.primary">
              Email
            </Typography>
            <TextField
              id="email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={success}
            />
          </Stack>

          <Box>
            <Button
              type="submit"
              variant="contained"
              fullWidth disabled={loading || success}
            >
              {loading ? "Sending..." : success ? "Link Sent!" : "Sent Reset Link"}
            </Button>
          </Box>
        </Stack>
      </Box>
    </AuthLayout>
  );
}
