import type { Metadata } from "next";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/theme";

export const metadata: Metadata = {
  title: "Riset AI",
  description: "Multi-LLM API Gateway",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
