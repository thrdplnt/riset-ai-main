// src/theme/index.ts
import { createTheme, alpha, lighten, darken } from "@mui/material/styles";

const themeColors = {
  primary: "#130e9f",
  secondary: "#6E759F",
  success: "#57CA22",
  warning: "#FFA319",
  error: "#FF1943",
  info: "#33C2FF",
  black: "#223354",
  white: "#ffffff",
};

const theme = createTheme({
  palette: {
    primary: {
      main: themeColors.primary,
      light: lighten(themeColors.primary, 0.3),
      dark: darken(themeColors.primary, 0.2),
    },
    secondary: {
      main: themeColors.secondary,
    },
    error: {
      main: themeColors.error,
    },
    success: {
      main: themeColors.success,
    },
    warning: {
      main: themeColors.warning,
    },
    info: {
      main: themeColors.info,
    },
    background: {
      default: "#f2f5f9",
      paper: themeColors.white,
    },
    text: {
      primary: themeColors.black,
      secondary: themeColors.secondary,
    },
  },
  typography: {
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    h4: { fontWeight: 700, fontSize: 16 },
    h5: { fontWeight: 700, fontSize: 14 },
    body1: { fontSize: 14 },
    body2: { fontSize: 14 },
    subtitle1: {
      fontSize: 14,
      color: alpha(themeColors.black, 0.7),
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: "bold",
          textTransform: "none",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontSize: 14,
        },
        head: {
          fontWeight: "bold",
          textTransform: "uppercase",
          fontSize: 13,
        },
      },
    },
  },
});

export default theme;