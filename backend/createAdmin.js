// createAdmin.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./Models/User'); // adapte le chemin si nécessaire

async function createAdmin() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Vérifier si un admin existe déjà
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Un administrateur existe déjà :', existingAdmin.email);
      process.exit(0);
    }

    // Données de l'admin
    const name = 'Admin';
    const email = 'admin@example.com';
    const password = 'admin123'; // à changer plus tard pour production

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    await adminUser.save();
    console.log('✅ Compte administrateur créé avec succès !');
    process.exit(0);
  } catch (err) {
    console.error('Erreur lors de la création de l\'admin :', err);
    process.exit(1);
  }
}

createAdmin();
