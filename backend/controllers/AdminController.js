const User = require("../Models/User");
const Prediction = require("../Models/PredictModeldb");
const fs = require('fs');
const path = require('path');

// CRUD pour les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // Récupérer tous les utilisateurs
    res.status(200).json(users);
  } catch (err) {
    console.error("Erreur lors de la récupération des utilisateurs :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, role } = req.body; // Récupérer les données du corps de la requête
    const newUser = new User({ name, email, role });
    await newUser.save(); // Sauvegarder le nouvel utilisateur
    res.status(201).json({ message: "Utilisateur créé avec succès", user: newUser });
  } catch (err) {
    console.error("Erreur lors de la création de l'utilisateur :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id; // Récupérer l'ID de l'utilisateur
    const { name, email, role } = req.body; // Récupérer les données du corps de la requête
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, role },
      { new: true } // Retourner l'utilisateur mis à jour
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.status(200).json({ message: "Utilisateur mis à jour avec succès", user: updatedUser });
  } catch (err) {
    console.error("Erreur lors de la mise à jour de l'utilisateur :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id; // Récupérer l'ID de l'utilisateur
    const user = await User.findByIdAndDelete(userId); // Supprimer l'utilisateur
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (err) {
    console.error("Erreur lors de la suppression de l'utilisateur :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// CRUD pour les prédictions
exports.getAllPredictions = async (req, res) => {
  try {
    const predictions = await Prediction.find().populate("Userid"); // Récupérer toutes les prédictions
    res.status(200).json(predictions);
  } catch (err) {
    console.error("Erreur lors de la récupération des prédictions :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.createPrediction = async (req, res) => {
  try {
    const { disease, Confidence, Userid } = req.body; // Récupérer les données du corps de la requête
    const newPrediction = new Prediction({ disease, Confidence, Userid });
    await newPrediction.save(); // Sauvegarder la nouvelle prédiction
    res.status(201).json({ message: "Prédiction créée avec succès", prediction: newPrediction });
  } catch (err) {
    console.error("Erreur lors de la création de la prédiction :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.updatePrediction = async (req, res) => {
  try {
    const predictionId = req.params.id; // Récupérer l'ID de la prédiction
    const { disease, Confidence, Userid } = req.body; // Récupérer les données du corps de la requête
    const updatedPrediction = await Prediction.findByIdAndUpdate(
      predictionId,
      { disease, Confidence, Userid },
      { new: true } // Retourner la prédiction mise à jour
    );
    if (!updatedPrediction) {
      return res.status(404).json({ message: "Prédiction non trouvée" });
    }
    res.status(200).json({ message: "Prédiction mise à jour avec succès", prediction: updatedPrediction });
  } catch (err) {
    console.error("Erreur lors de la mise à jour de la prédiction :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.deletePrediction = async (req, res) => {
  try {
    const predictionId = req.params.id; // Récupérer l'ID de la prédiction
    const prediction = await Prediction.findByIdAndDelete(predictionId); // Supprimer la prédiction
    if (!prediction) {
      return res.status(404).json({ message: "Prédiction non trouvée" });
    }
    res.status(200).json({ message: "Prédiction supprimée avec succès" });
  } catch (err) {
    console.error("Erreur lors de la suppression de la prédiction :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Get disease advice JSON from server file
exports.getDiseaseAdvice = async (req, res) => {
  try {
    const filePath = path.join(__dirname, '..', 'data', 'diseaseAdvice.json');
    if (!fs.existsSync(filePath)) return res.status(200).json({});
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    res.status(200).json(data);
  } catch (err) {
    console.error('Erreur lecture diseaseAdvice:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Save disease advice JSON to server file (overwrite)
exports.saveDiseaseAdvice = async (req, res) => {
  try {
    const payload = req.body || {};
    const fileDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir, { recursive: true });
    const filePath = path.join(fileDir, 'diseaseAdvice.json');
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
    res.status(200).json({ message: 'Fiches sauvegardées' });
  } catch (err) {
    console.error('Erreur sauvegarde diseaseAdvice:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};