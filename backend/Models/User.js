const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,  // Le nom est requis
    },
    email: {
        type: String,
        required: true,
        unique: true, // L'email doit être unique pour chaque utilisateur
    },
    password: {
        type: String,
        required: function () {
            // Le mot de passe est requis uniquement pour les utilisateurs non-Google
            return !this.googleId;
        },
    },
    googleId: {
        type: String, // Identifiant unique pour les utilisateurs Google
        unique: true, // Assurez-vous qu'il n'y a pas de duplicats
        sparse: true, // La contrainte est facultative pour les utilisateurs non-Google
    },
    createdAt: {
        type: Date,
        default: Date.now, // Date de création de l'utilisateur
    },
    role: {
        type: String,
        default: "user", // <-- Ajout du champ role
        required: true
    }
});

const UserModel = mongoose.model('users', UserSchema);

module.exports = UserModel;