const ADMIN_EMAIL = "papadiaw.ngom1@gmail.com";
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require("./Models/User");


// Signup (inscription classique)
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (user) {
            return res.status(409)
                .json({ message: 'User is already exist, you can login', success: false });
        }
        const userModel = new UserModel({ name, email, password });
        userModel.password = await bcrypt.hash(password, 10);
        await userModel.save();
        res.status(201)
            .json({
                message: "Signup successfully",
                success: true
            })
    } catch (err) {
        res.status(500)
            .json({
                message: "Internal server error",
                success: false
            })
    }
}



const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        const errorMsg = 'Auth failed, email or password is wrong';
        if (!user) {
            return res.status(403).json({ message: errorMsg, success: false });
        }
        const isPassEqual = await bcrypt.compare(password, user.password);
        if (!isPassEqual) {
            return res.status(403).json({ message: errorMsg, success: false });
        }

        const jwtToken = jwt.sign(
            { email: user.email, _id: user._id, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Définir le token dans l'en-tête Authorization
        res.setHeader('X-auth-token', jwtToken);

        // Retourner le token dans la réponse JSON
        res.status(200).json({
            message: "Login Success",
            success: true,
            email,
            name: user.name,
            jwtToken,
            userId:user._id,
        });

    } catch (err) {
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};



// Méthode pour gérer la réponse de l'authentification via Google
const googleAuthCallback = async (req, res) => {
    try {
        const { id, displayName, emails,name } = req.user; // Profil retourné par Google
        const email = emails[0].value; // Récupérer l'email principal
        const fullName = displayName; // Utiliser directement displayName

        console.log("Google User Profile:", req.user); // Log pour déboguer

        // Vérifiez si l'utilisateur existe déjà dans la base de données
        let user = await UserModel.findOne({ googleId: id });

        if (!user) {
            // Si l'utilisateur n'existe pas, le créer
            user = new UserModel({
                googleId: id,
                name:fullName, // Utiliser displayName pour le champ 'name'
                email,
            });

            await user.save(); // Sauvegarder l'utilisateur
        }
        console.log("-----");
        console.log(user._id);
        console.log(name.givenName);

        // Générer un token JWT
        const jwtToken = jwt.sign(
            { email: user.email, _id: user._id, name:name.givenName }, // Ajouter le champ 'name'
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Rediriger avec le token ou renvoyer une réponse JSON
        res.redirect(`http://localhost:3000/predict?token=${jwtToken}&userName=${name.givenName}&userId=${user._id}`);
    } catch (err) {
        console.error('Google Auth Error:', err.message);
        res.status(500).json({
            message: "Google authentication failed",
            success: false
        });
    }
};



module.exports = {
    signup,
    login,
    googleAuthCallback // Export de la méthode pour le callback Google
};
