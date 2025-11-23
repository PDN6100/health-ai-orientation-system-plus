const express = require('express');
const router = express.Router();
const User = require('../Models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');

// Route de connexion
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Vérification des champs
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    // Trouver l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ success: false, message: 'Invalid password' });
    }

    // Créer un token JWT (inclut rôle pour vérification côté serveur)
    const token = jwt.sign({ userId: user._id, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Répondre avec le token et les infos utilisateur
    res.json({
      success: true,
      message: 'Login successful',
      jwtToken: token,
      name: user.name,
      userId: user._id,
      role: user.role,
    });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Route pour démarrer l'authentification Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Route de callback après l'authentification Google
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
  async (req, res) => {
    try {
      if (!req.user) return res.redirect('/');
      // Try to find or create a corresponding local user record so we can include role
      let localUser = null;
      try {
        localUser = await User.findOne({ googleId: req.user.id });
      } catch (e) {
        console.warn('Erreur recherche user google:', e.message || e);
      }
      if (!localUser) {
        try {
          // create a lightweight user record
          localUser = new User({ name: req.user.displayName || 'Google User', email: (req.user.emails && req.user.emails[0] && req.user.emails[0].value) || '', role: 'user', googleId: req.user.id });
          await localUser.save();
        } catch (e) {
          console.warn('Erreur création user local:', e.message || e);
        }
      }

      const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret';
      const payload = { userId: (localUser && localUser._id) || req.user.id, name: req.user.displayName };
      if (localUser && localUser.role) payload.role = localUser.role;
      const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
      console.log('Generated JWT Token for Google login.');
      // Redirect back to frontend with token
      const redirectTo = process.env.CLIENT_URL || 'http://localhost:3000';
      res.redirect(`${redirectTo}/predict?token=${token}`);
    } catch (err) {
      console.error('Error in Google callback:', err);
      res.redirect('/');
    }
  }
);

module.exports = router;