import * as React from 'react';
import { Tabs, Tab, Box, Tooltip } from '@mui/material';

// Composant TabsPanel réutilisable
export default function TabsPanel({ tabs, value, onChange, sx }) {
  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 2, ...sx }}>
      <Tabs
        value={value}
        onChange={onChange}
        textColor="primary"
        indicatorColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 500 } }}
      >
        {tabs.map((t) => {
          const label = (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {t.icon || null}
              {t.label}
            </span>
          );
          return (
            <Tooltip key={t.value} title={t.tooltip || t.label} arrow>
              <Tab label={label} value={t.value} />
            </Tooltip>
          );
        })}
      </Tabs>
    </Box>
  );
}
