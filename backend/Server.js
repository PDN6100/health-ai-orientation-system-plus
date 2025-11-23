const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
require("dotenv").config();

// Initialisation de l'application
const app = express();

// Middleware pour traiter les données JSON et gérer les CORS
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:3000',  // URL du frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Autoriser toutes les méthodes nécessaires
    allowedHeaders: ['Content-Type', 'Authorization'], // Autoriser les en-têtes nécessaires
}));

// Configuration de Express-session (pour Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
  })
);

// Initialisation de Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Charger la configuration Passport
require("./config/passport");

// Ping test route
app.get("/ping", (req, res) => {
  res.send("PONG");
});

// Connexion à la base de données MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connecté à MongoDB");

    // Import des routes
    const AuthRouter = require("./Routes/AuthRouter");
    const predictrouter = require("./Routes/predictRoute");
    const contactRouter = require("./Routes/contact");
    const adminRoutes = require("./Routes/admin");

    // Routes API
    app.use("/auth", AuthRouter);            // Authentification
    app.use("/api/predict", predictrouter);  // Prédiction
    app.use("/api/history", predictrouter);  // Historique
    app.use('/api/contact', contactRouter); // Contact form
    app.use("/admin", adminRoutes);          // Admin

  })
  .catch((err) => {
    console.error("❌ Erreur de connexion MongoDB :", err);
    process.exit(1); // Arrêter l'application si échec
  });

// Gestion d'erreurs globale
app.use((err, req, res, next) => {
  console.error('🔥 Erreur serveur :', err);
  res.status(500).json({ success: false, message: 'Erreur Interne du Serveur' });
});

// Sécurité : éviter les plantages silencieux
process.on('uncaughtException', (err) => {
  console.error('❗ Erreur non interceptée :', err);
  process.exit(1);
});

// Démarrer le serveur
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`🚀 Serveur en écoute sur le port ${port}`);
});
