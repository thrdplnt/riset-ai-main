"use client";

import { ThemeProvider, CssBaseline } from "@mui/material";
import { Poppins, Manrope, Inter } from "next/font/google";
import theme from "@/theme";
import { AuthProvider } from "@/contexts/AuthContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${manrope.variable} ${inter.variable}`}>
      <body style={{ margin: 0 }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <style>{`html, body { scrollbar-width: none; } html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }`}</style>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}