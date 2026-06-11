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
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/routes";

const footerLinks = [
  {
    text: "Don't have an account? ",
    linkText: "Register here",
    suffix: ".",
    href: ROUTES.REGISTER,
  },
  {
    text: "Didn't receive your verification email? ",
    linkText: "Resend here",
    suffix: ".",
    href: "#",
  },
  {
    text: "Forgot your password? ",
    linkText: "Reset here",
    suffix: ".",
    href: ROUTES.FORGOT_PASSWORD,
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }
    setError("");
    setLoading(true);
    const { error: loginError } = await login(email, password);
    if (loginError) {
      setError(loginError);
      setLoading(false);
    }
  };

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
              <Link href={item.href} underline="always" color="inherit">
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
            {loading ? "Logging in..." : "Login"}
          </Button>
        </Stack>
      </Box>
    </AuthLayout>
  );
}