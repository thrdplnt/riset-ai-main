import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    slate: {
      500: string;
      900: string;
    };
    custom: {
      whiteOverlay: string;
      whiteGhost: string;
      borderLight: string;
      buttonDark: string;
      buttonText: string;
    };
  }
  interface PaletteOptions {
    slate?: {
      500: string;
      900: string;
    };
    custom?: {
      whiteOverlay: string;
      whiteGhost: string;
      borderLight: string;
      buttonDark: string;
      buttonText: string;
    };
  }
}

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#333333",
      contrastText: "#f9f9f9",
    },
    secondary: {
      main: "#64748b",
      contrastText: "#ffffff",
    },
    background: {
      default: "#ffffff",
      paper: "#ffffff",
    },
    text: {
      primary: "#020817",
      secondary: "#64748b",
    },
    divider: "#0000001a",
    error: { main: "#d32f2f" },
    warning: { main: "#ed6c02" },
    info: { main: "#0288d1" },
    success: { main: "#2e7d32" },
    slate: {
      500: "#64748b",
      900: "#0f172a",
    },
    custom: {
      whiteOverlay: "#ffffffd9",
      whiteGhost: "#ffffff01",
      borderLight: "#0000001a",
      buttonDark: "#333333",
      buttonText: "#f9f9f9",
    },
  },
  typography: {
    fontFamily: '"Inter", Helvetica, Arial, sans-serif',
    h1: { fontSize: "22.5px", fontWeight: 600, lineHeight: "32px" },
    h3: { fontSize: "22.5px", fontWeight: 600, lineHeight: "24px", letterSpacing: "-0.6px" },
    subtitle1: { fontSize: "13.5px", fontWeight: 500, lineHeight: "24px" },
    subtitle2: { fontSize: "12.6px", fontWeight: 600, lineHeight: "14px" },
    body1: { fontSize: "13.5px", fontWeight: 400, lineHeight: "24px" },
    body2: { fontSize: "12.9px", fontWeight: 400, lineHeight: "28px" },
    button: {
      fontSize: "13.3px",
      fontWeight: 600,
      lineHeight: "20px",
      textTransform: "none",
    },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: {
          margin: 0,
          padding: 0,
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          fontFamily: theme.typography.fontFamily,
        },
        "*": { boxSizing: "border-box" },
      }),
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.custom.whiteOverlay,
          border: `1px solid ${theme.palette.custom.borderLight}`,
          borderRadius: theme.shape.borderRadius,
          boxShadow: "0px 2px 4px -2px rgba(0,0,0,0.1), 0px 4px 6px -1px rgba(0,0,0,0.1)",
          backdropFilter: "blur(4px) brightness(100%)",
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          ...theme.typography.button,
          minHeight: 40,
          borderRadius: 6,
          padding: "8px 16px",
          boxShadow: "none",
          textTransform: "none",
        }),
        contained: ({ theme }) => ({
          backgroundColor: theme.palette.custom.buttonDark,
          color: theme.palette.custom.buttonText,
          "&:hover": {
            backgroundColor: theme.palette.primary.main,
            boxShadow: "none",
          },
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          minHeight: 40,
          borderRadius: 6,
          backgroundColor: theme.palette.background.paper,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.custom.borderLight,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.text.secondary,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
            borderWidth: 1,
          },
          "& input": {
            padding: "9.67px 11.67px 9.66px",
            fontSize: "13.5px",
            color: theme.palette.text.primary,
          },
        }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: "13.5px",
          color: theme.palette.text.primary,
          borderColor: theme.palette.divider,
        }),
        head: ({ theme }) => ({
          fontWeight: 600,
          fontSize: "12.6px",
          color: theme.palette.text.primary,
        }),
      },
    },
  },
});

export default theme;