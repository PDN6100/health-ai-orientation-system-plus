const jwt = require('jsonwebtoken');

const ensureAuthenticated = (req, res, next) => {
  const authHeader = req.headers['authorization']; // Récupérer l'en-tête Authorization
  if (!authHeader) {
    return res.status(401).json({
      message: 'Unauthorized, JWT token is required',
      success: false,
    });
  }

  // Vérifier si le token est au format "Bearer <token>"
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : authHeader;

  if (!token) {
    return res.status(401).json({
      message: 'Unauthorized, invalid JWT format',
      success: false,
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Ajout des infos utilisateur décodées
    next();
  } catch (err) {
    return res.status(401).json({
      message: 'Unauthorized, JWT token is invalid or expired',
      success: false,
    });
  }
};

module.exports = ensureAuthenticated;
