// // middleware/authMiddleware.js
// const jwt = require('jsonwebtoken');
// const db = require('../database/database');

// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   // Authorization: Bearer <token>
//   const token = authHeader && authHeader.split(' ')[1];

//   if (!token) return res.status(401).json({ status: false, message: 'No token provided' });

//   jwt.verify(token, 'tokenSecretKey', (err, decoded) => {
//     if (err) return res.status(403).json({ status: false, message: 'Invalid token' });
//     const business_owner =  db.businessOwner.findOne({ where: { id: decoded.business_owner_id } });
//     if (!business_owner) return res.status(403).json({ status: false, message: 'Invalid token' });

//     req.business_owner=business_owner; // Attach business owner to request

//     req.business_owner_id = decoded.business_owner_date; // Attach to request
//     next();
//   });
// };

// module.exports = authenticateToken;


// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const db = require('../database/database');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    // Authorization: Bearer <token>
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        status: false, 
        message: 'No token provided' 
      });
    }

    // Verify token (using Promise-based approach)
    let decoded;
    try {
      decoded = jwt.verify(token, 'tokenSecretKey');
    } catch (err) {
      return res.status(403).json({ 
        status: false, 
        message: 'Invalid or expired token' 
      });
    }

    // Check if business owner exists in database (WITH AWAIT)
    const business_owner = await db.businessOwner.findOne({ 
      where: { id: decoded.business_owner_data } 
    });
    
    if (!business_owner) {
      return res.status(403).json({ 
        status: false, 
        message: 'Business owner not found' 
      });
    }

    // Attach to request
    req.business_owner = business_owner;
    req.business_owner_id = decoded.business_owner_data; // Fixed property name

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      status: false, 
      message: 'Internal server error during authentication' 
    });
  }
};

module.exports = authenticateToken;