import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Box, Typography } from '@mui/material';

const COLORS = ['#0e992e', '#12b82b', '#00bcd4', '#ffb74d', '#ef5350'];

export default function AdvancedCharts({ topDiseases = [], history = [] }) {
  // topDiseases: [{ disease, count }]
  // history: [{ createdAt, Confidence }]

  const toPercent = (raw) => {
    const n = Number(raw || 0);
    if (isNaN(n)) return 0;
    if (n > 0 && n <= 1) return Math.round(n * 100);
    if (n > 100) return 100;
    return Math.round(n);
  };

  const lineData = (history || []).map((h) => ({
    date: new Date(h.createdAt).toLocaleDateString(),
    confidence: toPercent(h.Confidence ?? h.confidence ?? 0),
  }));

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
      <Box sx={{ background: '#fff', p: 2, borderRadius: 2, boxShadow: '0 8px 30px #00000010' }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>Top maladies</Typography>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={topDiseases} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="disease" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#0e992e" />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Box sx={{ background: '#fff', p: 2, borderRadius: 2, boxShadow: '0 8px 30px #00000010' }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>Confiance (dernières prédictions)</Typography>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={lineData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="confidence" stroke="#12b82b" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <Box sx={{ gridColumn: '1 / -1', background: '#fff', p: 2, borderRadius: 2, boxShadow: '0 8px 30px #00000010' }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>Répartition</Typography>
        <Box sx={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={topDiseases} dataKey="count" nameKey="disease" outerRadius={80} label>
                {topDiseases.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Box>
  );
}
