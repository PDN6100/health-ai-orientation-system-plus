require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./Models/User'); // Ajuste le chemin selon ta structure

async function setAdminRole(email) {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const user = await User.findOne({ email });

    if (!user) {
      console.log(`Utilisateur avec email ${email} non trouvé.`);
      process.exit(1);
    }

    // Ajoute ou modifie le champ role
    user.role = 'admin';

    await user.save();

    console.log(`Rôle 'admin' attribué à ${email} avec succès !`);
    process.exit(0);

  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle :', error);
    process.exit(1);
  }
}

// Remplace ici par l'email cible
setAdminRole('papadiaw.ngom1@gmail.com');
