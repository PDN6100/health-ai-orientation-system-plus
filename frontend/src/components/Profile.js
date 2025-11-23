import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, Button, Avatar, IconButton, Snackbar } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

export default function Profile({ onSaved }) {
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState(null); // data URL
  const [savedSnackbar, setSavedSnackbar] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    const userName = localStorage.getItem('userName') || '';
    const userEmail = localStorage.getItem('userEmail') || '';
    const userAvatar = localStorage.getItem('userAvatar') || null;
    setProfile({ name: userName, email: userEmail });
    setAvatar(userAvatar);
  }, []);

  const handleChange = (e) => setProfile((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e && e.preventDefault();
    setSaving(true);
    try {
      // persist locally for now; backend integration can be added later
      localStorage.setItem('userName', profile.name);
      localStorage.setItem('userEmail', profile.email);
      if (avatar) localStorage.setItem('userAvatar', avatar);
      else localStorage.removeItem('userAvatar');
      // notify parent if provided
      if (typeof onSaved === 'function') onSaved({ name: profile.name, email: profile.email, avatar });
      // also dispatch a window event to help components in other tabs update
      try {
        window.dispatchEvent(new Event('profile:saved'));
      } catch (err) {
        // notify in console if dispatch failed (shouldn't block save)
        // eslint-disable-next-line no-console
        console.warn('profile:saved event dispatch failed', err);
      }
        setSavedSnackbar(true);
    } catch (err) {
      console.error('Profile save error', err);
    } finally {
      setSaving(false);
    }
  };

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  };

  const onChooseFile = (e) => handleFile(e.target.files && e.target.files[0]);

  const onRemoveAvatar = () => {
    setAvatar(null);
    localStorage.removeItem('userAvatar');
    if (fileRef.current) fileRef.current.value = null;
  };

  return (
    <Box sx={{ mt: 4, px: 3, maxWidth: 720, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Éditer mon profil
      </Typography>
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', mb: 2 }}>
        <Avatar src={avatar} sx={{ width: 88, height: 88 }} />
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="avatar-file"
            type="file"
            onChange={onChooseFile}
            ref={fileRef}
          />
          <label htmlFor="avatar-file">
            <IconButton color="primary" component="span">
              <PhotoCamera />
            </IconButton>
          </label>
          <Button color="inherit" onClick={onRemoveAvatar}>&nbsp;Supprimer</Button>
        </Box>
      </Box>

      <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField name="name" label="Nom complet" value={profile.name} onChange={handleChange} />
        <TextField name="email" label="Email" value={profile.email} onChange={handleChange} />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button type="submit" variant="contained" disabled={saving}>
            Enregistrer
          </Button>
          <Button variant="outlined" onClick={() => { setProfile({ name: '', email: '' }); onRemoveAvatar(); }}>
            Réinitialiser
          </Button>
        </Box>
      </Box>
      <Snackbar open={savedSnackbar} autoHideDuration={2500} onClose={() => setSavedSnackbar(false)} message="Profil enregistré" />
    </Box>
  );
}
