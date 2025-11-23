import * as React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';

export default function Header({ title = '', onMenu, userName, onLogout }) {
  const [avatarSrc, setAvatarSrc] = React.useState(localStorage.getItem('userAvatar') || null);
  const [logoSrc, setLogoSrc] = React.useState('/assets/doctor1.png');

  React.useEffect(() => {
    const onSave = () => setAvatarSrc(localStorage.getItem('userAvatar') || null);
    window.addEventListener('profile:saved', onSave);
    return () => window.removeEventListener('profile:saved', onSave);
  }, []);

  // if doctor.png is missing, fallback to existing svg logo
  const handleLogoError = () => {
    if (logoSrc !== '/assets/logo-healthyai.svg') setLogoSrc('/assets/logo-healthyai.svg');
  };

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
          <img src={logoSrc} onError={handleLogoError} alt="logo" className="logo-animated" />
          <Typography variant="h6" sx={{ fontWeight: 700, ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ color: 'gray' }}>
            {userName ? `Bonjour, ${userName}` : 'Bienvenue'}
          </Typography>
          {avatarSrc ? (
            <Avatar src={avatarSrc} alt={userName || 'user'} />
          ) : (
            <Avatar sx={{ bgcolor: '#0e992e' }}>{(userName || 'U').charAt(0)}</Avatar>
          )}
          {onLogout && (
            <Button
              startIcon={<LogoutIcon />}
              color="inherit"
              onClick={onLogout}
              sx={{ textTransform: 'none' }}
            >
              Déconnexion
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
