import * as React from 'react';
import { AppBar, Toolbar, Typography, Box, Avatar, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

export default function Header({ title = 'HealthyAI', onMenu }) {
  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{ borderBottom: '1px solid #eee' }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={onMenu}>
            <MenuIcon />
          </IconButton>
          <img src="/assets/logo-healthyai.svg" alt="logo" style={{ height: 40 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ color: 'gray' }}>
            Bienvenue
          </Typography>
          <Avatar sx={{ bgcolor: '#0e992e' }}>U</Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
