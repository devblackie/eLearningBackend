const jwt = require('jsonwebtoken');
  const User = require('../models/User');

const adminAuth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ userId: decoded.userId }); // Query by userId
    // if (decoded.role !== 'admin') {
    //   return res.status(403).json({ error: 'Admin access required' });
    // }
    // req.user = decoded;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    req.user = user; // Attach the user object to the request
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = adminAuth;