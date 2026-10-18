// authMiddleware.js - JWT token verification middleware
// Protects routes that require the user to be logged in
// Attach this middleware to any route that needs authentication

const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  // 1. Get the token from the Authorization header
  // Header format: "Authorization: Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 2. Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'foodrescue_jwt_secret');

    // 3. Attach the user info to req.user so controllers can use it
    req.user = decoded; // { id, email, role }
    next(); // Continue to the actual route handler
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
  }
};

// Middleware to allow only specific roles (e.g., only 'donor' or only 'ngo')
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. You do not have permission for this action.' });
    }
    next();
  };
};

module.exports = { protect, allowRoles };
