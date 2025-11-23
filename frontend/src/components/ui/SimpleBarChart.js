import React from 'react';
import { Box, Typography } from '@mui/material';

// Simple, dependency-free horizontal bar chart for small datasets
export default function SimpleBarChart({ data = [], height = 200 }) {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ color: 'gray' }}>Aucune donnée</Typography>
      </Box>
    );
  }

  const max = Math.max(...data.map((d) => d.count || 0), 1);

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {data.map((d) => (
        <Box key={d.disease} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Box sx={{ minWidth: 140 }}>
            <Typography sx={{ fontSize: 13 }}>{d.disease}</Typography>
          </Box>
          <Box sx={{ flex: 1, background: '#f1f5f9', height: 28, borderRadius: 6, overflow: 'hidden' }}>
            <Box
              sx={{
                height: '100%',
                width: `${Math.round((d.count / max) * 100)}%`,
                background: 'linear-gradient(90deg, #12b82b, #0e992e)',
              }}
            />
          </Box>
          <Box sx={{ minWidth: 48, textAlign: 'right' }}>
            <Typography sx={{ fontSize: 13, color: 'gray' }}>{d.count}</Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
