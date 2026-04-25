const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ msg: 'No token' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ msg: 'Invalid token' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token invalid' });
  }
};

const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });
  next();
};

module.exports = { auth, adminAuth };