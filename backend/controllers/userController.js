const { Organization, User, Workspace, UserWorkspace, Chat } = require('../models');
const { hashPassword, comparePassword, generateToken } = require('../services/authService');
const axios = require('axios'); // Add this import for API calls

// Register Organization
exports.registerOrganization = async (req, res) => {
  try {
    const { name, domain } = req.body;
    const org = await Organization.create({ name, domain });
    // Create a workspace with the same name as the organization
    await Workspace.create({ name, domain, OrganizationId: org.id });
    res.status(201).json(org);  
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Register User
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, OrganizationId } = req.body;
    const hash = await hashPassword(password);
    const user = await User.create({ name, email, password: hash, role, OrganizationId });
    res.status(201).json(user);
  } catch (err) {
    console.error('Register user error:', err);
    res.status(400).json({ error: err.message });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || user.status !== 'active') return res.status(401).json({ error: 'Invalid credentials or inactive user' });
    const match = await comparePassword(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    const token = generateToken(user);
    
    // Return user info along with token for socket connection
    res.json({ 
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        OrganizationId: user.OrganizationId
      },
      message: 'Login successful'
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin: Deactivate User
exports.deactivateUser = async (req, res) => {
  try {
    user.status = 'inactive';
    await user.save();
    res.json({ message: 'User deactivated' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin: Assign Workspaces to User
exports.assignWorkspaces = async (req, res) => {
  try {
    const { userId, workspaceIds } = req.body;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await user.setWorkspaces(workspaceIds);
    res.json({ message: 'Workspaces assigned' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin: Change User Role
exports.changeUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.role = role;
    await user.save();
    res.json({ message: 'User role updated' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all users for specific organization
exports.getUsersForOrganization = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const users = await User.findAll({ 
      where: { OrganizationId: organizationId, is_deleted: false } 
    });
    res.json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete user (soft delete)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.is_deleted = true;
    await user.save();
    res.json({ message: 'User deleted (soft delete)' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
