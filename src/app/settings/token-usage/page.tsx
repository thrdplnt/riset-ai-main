"use client";

import {
  Box, Divider, Paper, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography,
} from "@mui/material";
import TokenOutlinedIcon from "@mui/icons-material/TokenOutlined";

const dummyPlan = {
  name: "Basic",
  expires: "May 17, 2026",
};

const dummyTokens = [
  { model: "ChatGPT 5", remaining: 4200000, total: 5000000 },
  { model: "Gemini 2.5", remaining: 4200000, total: 5000000 },
  { model: "Claude AI", remaining: 4200000, total: 5000000 },
];

const dummyHistory: { details: string; date: string; tokens: number }[] = [];

function formatToken(n: number) {
  return n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n.toLocaleString();
}

function percentLeft(remaining: number, total: number) {
  return Math.round((remaining / total) * 100);
}

export default function TokenUsagePage() {
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
              <Typography variant="caption" color="text.secondary">
                Plan
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {dummyPlan.name}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Expires {dummyPlan.expires}
            </Typography>
          </Stack>
        </Paper>

        {/* Token Quota per Model */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
            Token Quota per Model
          </Typography>
          <Paper variant="outlined">
            {dummyTokens.map((item, index) => (
              <Box key={item.model}>
                <Box sx={{ px: 2.5, py: 1.5 }}>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                    <Typography variant="body2">{item.model}</Typography>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                      <TokenOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography variant="body2">
                        {formatToken(item.remaining)} / {formatToken(item.total)} tokens
                      </Typography>
                    </Stack>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ float: "right" }}>
                    {percentLeft(item.remaining, item.total)}% left
                  </Typography>
                </Box>
                {index < dummyTokens.length - 1 && <Divider />}
              </Box>
            ))}
          </Paper>
        </Box>

        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
            History
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "action.hover" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Details</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Tokens</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dummyHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ color: "text.secondary", py: 3 }}>
                      No usage history found
                    </TableCell>
                  </TableRow>
                ) : (
                  dummyHistory.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.details}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell align="right">{item.tokens.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Stack>
    </Box>
  );
}