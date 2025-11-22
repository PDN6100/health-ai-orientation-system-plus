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

    // Créer un token JWT
    const token = jwt.sign({ userId: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1h' });

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
  (req, res) => {
    const token = jwt.sign({ userId: req.user.id, name: req.user.displayName }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Generated JWT Token:', token);
    console.log('Redirecting to:', `http://localhost:3000/predict?token=${token}`);
    res.redirect(`http://localhost:3000/predict?token=${token}`);
  }
);

module.exports = router;