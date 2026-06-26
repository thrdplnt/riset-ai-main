"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Box, CircularProgress, Typography, Button, Stack } from "@mui/material";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import { ROUTES } from "@/routes";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Token tidak ditemukan di URL");
      return;
    }

    fetch(`/api/auth/verify-email?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.message);
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Terjadi kesalahan saat memverifikasi email");
      });
  }, [searchParams]);

  return (
    <Box sx={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      px: 3,
    }}>
      <Stack sx={{ alignItems: "center", gap: 2, maxWidth: 400, textAlign: "center" }}>
        {status === "loading" && (
          <>
            <CircularProgress size={40} />
            <Typography sx={{ fontSize: "15px", color: "text.secondary" }}>
              Memverifikasi email kamu...
            </Typography>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircleOutlinedIcon sx={{ fontSize: 56, color: "success.main" }} />
            <Typography sx={{ fontWeight: 600, fontSize: "18px" }}>
              Email Terverifikasi!
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "text.secondary" }}>
              {message}
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push(ROUTES.LOGIN)}
              sx={{ mt: 1, bgcolor: "custom.buttonDark", textTransform: "none" }}
            >
              Login Sekarang
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <ErrorOutlineOutlinedIcon sx={{ fontSize: 56, color: "error.main" }} />
            <Typography sx={{ fontWeight: 600, fontSize: "18px" }}>
              Verifikasi Gagal
            </Typography>
            <Typography sx={{ fontSize: "14px", color: "text.secondary" }}>
              {message}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => router.push(ROUTES.REGISTER)}
              sx={{ mt: 1, textTransform: "none" }}
            >
              Daftar Ulang
            </Button>
          </>
        )}
      </Stack>
    </Box>
  );
}