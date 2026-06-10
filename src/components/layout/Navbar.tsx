"use client";

import {
  Box,
  IconButton,
  Typography,
  styled,
  useTheme,
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { useRouter } from "next/navigation";

const NavbarWrapper = styled(Box)(({ theme }) => `
  height: 64px;
  background: ${theme.palette.background.paper};
  border-bottom: 1px solid ${theme.palette.divider};
  display: flex;
  align-items: center;
  padding: 0 ${theme.spacing(3)};
  gap: ${theme.spacing(1.5)};
  position: sticky;
  top: 0;
  z-index: 6;
`);

interface NavbarProps {
  title: string;
  backPath?: string;
}

export default function Navbar({ title, backPath }: NavbarProps) {
  const router = useRouter();
  const theme = useTheme();

  return (
    <NavbarWrapper>
      {backPath && (
        <IconButton
          size="small"
          onClick={() => router.push(backPath)}
          sx={{ border: "none" }}
        >
          <ArrowBackOutlinedIcon fontSize="small" />
        </IconButton>
      )}
      <Typography
        variant="h5"
        sx={{ fontWeight: 600, color: theme.palette.text.primary }}
    >
        {title}
    </Typography>
    </NavbarWrapper>
  );
}
