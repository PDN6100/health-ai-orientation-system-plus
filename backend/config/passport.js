const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Charger les variables d'environnement
require('dotenv').config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:8080/auth/google/callback',
    scope: ['profile', 'email'],  // Ajouter des scopes ici si nécessaire
},
(accessToken, refreshToken, profile, done) => {
    // On peut enregistrer le profil de l'utilisateur dans la base de données ici
    console.log('Google profile:', profile);
    return done(null, profile);
}));

// Sérialisation de l'utilisateur dans la session
passport.serializeUser((user, done) => {
    done(null, user);  // On sauvegarde l'utilisateur dans la session
});

// Désérialisation de l'utilisateur
passport.deserializeUser((user, done) => {
    done(null, user);  // On récupère l'utilisateur de la session
});
