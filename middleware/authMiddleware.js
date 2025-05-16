// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Authorization: Bearer <token>
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ status: false, message: 'No token provided' });

  jwt.verify(token, 'tokenSecretKey', (err, decoded) => {
    if (err) return res.status(403).json({ status: false, message: 'Invalid token' });

    req.business_owner_id = decoded.business_owner_date; // Attach to request
    next();
  });
};

module.exports = authenticateToken;
