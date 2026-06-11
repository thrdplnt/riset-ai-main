"use client";

import { Box, Card, CardContent, Stack, Typography } from "@mui/material";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const AuthLayout = ({ title, subtitle, children, footer }: AuthLayoutProps) => {
  return (
    <Box
      component="main"
  sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        px: { xs: 2, sm: 3 },
        pt: { xs: 3, sm: "20px" },
        pb: 6,
    }}
    >
      <Stack spacing={0}
        sx={{
        alignItems: "center",
        width: "100%",
        maxWidth: { xs: "100%", sm: "448px" },
        }}>
        {/* Logo */}
        <Stack spacing={0} sx={{ alignItems: "center" }}>
          <Box
            component="img"
            src="/favicon.ico"
            alt="Riset AI logo"
            sx={{ width: 40, height: 40, borderRadius: "12px", objectFit: "cover" }}
          />
          <Typography
            component="h1"
            variant="h1"
            sx={{ mt: "4px", color: "text.primary", whiteSpace: "nowrap" }}
          >
            Riset AI
          </Typography>
        </Stack>

        {/* Card */}
        <Card sx={{ width: "100%", mt: "19.66px", position: "relative", overflow: "visible" }}>
          <Box
            aria-hidden="true"
            sx={{
              position: "absolute",
              top: 20,
              left: 1,
              width: "calc(100% - 1px)",
              height: "calc(100% - 20px)",
              bgcolor: "custom.whiteGhost",
              borderRadius: 2,
              boxShadow: "0px 2px 4px -2px rgba(0,0,0,0.1), 0px 4px 6px -1px rgba(0,0,0,0.1)",
              pointerEvents: "none",
            }}
          />
          <CardContent sx={{ position: "relative", p: 3, "&:last-child": { pb: 3 } }}>
            <Stack spacing={1.5}>
              <Stack spacing={0.5}>
                <Typography component="h2" variant="h3" color="text.primary">
                  {title}
                </Typography>
                {subtitle && (
                  <Typography variant="body2" color="slate.500">
                    {subtitle}
                  </Typography>
                )}
              </Stack>
              {children}
            </Stack>
          </CardContent>
        </Card>

        {/* Footer — di luar card */}
        {footer && (
          <Box sx={{ pt: "20px", width: "100%" }}>
            {footer}
          </Box>
        )}
      </Stack>
    </Box>
  );
};