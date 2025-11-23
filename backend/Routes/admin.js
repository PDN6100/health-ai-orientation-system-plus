const express = require("express");
const router = express.Router();
const { requireAdmin } = require('../Middlewares/jwtAuth');

// Apply admin check to all admin routes
router.use(requireAdmin);
const AdminController = require("../controllers/AdminController");

// Routes pour les utilisateurs
router.get("/users", AdminController.getAllUsers); // Lire tous les utilisateurs
router.post("/users", AdminController.createUser); // Créer un utilisateur
router.put("/users/:id", AdminController.updateUser); // Mettre à jour un utilisateur
router.delete("/users/:id", AdminController.deleteUser); // Supprimer un utilisateur

// Routes pour les prédictions
router.get("/predictions", AdminController.getAllPredictions); // Lire toutes les prédictions
router.post("/predictions", AdminController.createPrediction); // Créer une prédiction
router.put("/predictions/:id", AdminController.updatePrediction); // Mettre à jour une prédiction
router.delete("/predictions/:id", AdminController.deletePrediction); // Supprimer une prédiction

// Routes pour gérer les fiches maladies (stockage fichier JSON côté serveur)
router.get('/diseaseAdvice', AdminController.getDiseaseAdvice);
router.post('/diseaseAdvice', AdminController.saveDiseaseAdvice);

module.exports = router;