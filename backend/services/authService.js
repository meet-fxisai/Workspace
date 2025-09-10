const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role, orgId: user.OrganizationId }, process.env.JWT_SECRET || 'secret', { expiresIn: '4h' });
};

module.exports = { hashPassword, comparePassword, generateToken };
