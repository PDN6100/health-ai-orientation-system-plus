const jwt = require('jsonwebtoken');

const verifyToken = (req) => {
  const auth = req.headers.authorization || req.headers.Authorization || '';
  if (!auth) return null;
  const parts = auth.split(' ');
  if (parts.length !== 2) return null;
  const scheme = parts[0];
  const token = parts[1];
  if (!/^Bearer$/i.test(scheme)) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload;
  } catch (err) {
    return null;
  }
};

const requireAdmin = (req, res, next) => {
  const payload = verifyToken(req);
  if (!payload) return res.status(401).json({ message: 'Unauthorized' });
  // payload may include role if token was issued with it
  if (payload.role !== 'admin') return res.status(403).json({ message: 'Forbidden: admin only' });
  req.user = payload;
  next();
};

module.exports = { verifyToken, requireAdmin };
