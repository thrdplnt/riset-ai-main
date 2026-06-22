"use client";

import { Box, Divider, LinearProgress, Paper, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import TokenOutlinedIcon from "@mui/icons-material/TokenOutlined";
import { useEffect, useState } from "react";

function getToken() {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
}

function formatToken(n: number | null) {
  if (n === null) return "-";
  return n.toLocaleString("en-US");
}

function percentLeft(remaining: number | null, total: number | null) {
  if (remaining === null || total === null || total === 0) return 0;
  return Math.floor((remaining / total) * 100);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

function formatDateTime(date: string) {
  return {
    date: new Date(date).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    }),
    time: new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit",
    }),
  };
}

interface TokenData {
  model_id: string;
  display_name: string;
  remaining_quota: number | null;
  total_quota: number | null;
}

interface PlanData {
  name: string;
  expires: string;
}

interface HistoryItem {
  interacted_at: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  model_name: string;
}

export default function TokenUsagePage() {
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      const res = await fetch("/api/users/token-usage", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPlan(data.data.plan);
        setTokens(data.data.tokens);
        setHistory(data.data.history ?? []);
      }
    };
    fetchData();
  }, []);

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Token Usage
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Monitor your token quota and usage.
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Stack spacing={3}>
        {/* Plan */}
        <Paper variant="outlined" sx={{ p: 2, bgcolor: "action.hover" }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Plan</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {plan ? plan.name : "Tidak ada langganan aktif"}
              </Typography>
            </Box>
            {plan && (
              <Typography variant="body2" color="text.secondary">
                Expires {formatDate(plan.expires)}
              </Typography>
            )}
          </Stack>
        </Paper>

        {/* Token Quota per Model */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
            Token Quota per Model
          </Typography>
          <Paper variant="outlined">
            {tokens.length === 0 ? (
              <Box sx={{ px: 2.5, py: 3, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Tidak ada data token
                </Typography>
              </Box>
            ) : (
              tokens.map((item, index) => (
                <Box key={item.model_id}>
                  <Box sx={{ px: 2.5, py: 2 }}>
                    <Stack direction="row" sx={{
                      justifyContent: "space-between",
                      alignItems: "center", mb: 1,
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.display_name}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                        <TokenOutlinedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatToken(item.remaining_quota)} / {formatToken(item.total_quota)} tokens
                        </Typography>
                      </Stack>
                    </Stack>

                    <LinearProgress
                      variant="determinate"
                      value={percentLeft(item.remaining_quota, item.total_quota)}
                      sx={{
                        height: 6, borderRadius: "100px",
                        bgcolor: "rgba(0,0,0,0.08)", mb: 0.75,
                        "& .MuiLinearProgress-bar": {
                          borderRadius: "100px",
                          bgcolor: percentLeft(item.remaining_quota, item.total_quota) < 20
                            ? "error.main"
                            : "primary.main",
                        },
                      }}
                    />

                    <Typography variant="caption" color="text.secondary">
                      {percentLeft(item.remaining_quota, item.total_quota)}% left
                    </Typography>
                  </Box>
                  {index < tokens.length - 1 && <Divider />}
                </Box>
              ))
            )}
          </Paper>
        </Box>

        {/* History */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
            History
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "action.hover" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Model</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Tokens</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center"
                      sx={{ color: "text.secondary", py: 3 }}>
                      No usage history found
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map((item, index) => {
                    const { date, time } = formatDateTime(item.interacted_at);
                    return (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.model_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.input_tokens.toLocaleString()} in · {item.output_tokens.toLocaleString()} out
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{date}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {time}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.total_tokens.toLocaleString("en-US")}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Stack>
    </Box>
  );
}