const { Organization, Workspace } = require('../models');

// Register Organization and create default workspace
exports.registerOrganization = async (req, res) => {
  try {
    const { name, domain } = req.body;
    const org = await Organization.create({ name, domain });
    await Workspace.create({ name, domain, OrganizationId: org.id });
    res.status(201).json(org);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all organizations
exports.getOrganizations = async (req, res) => {
  try {
    const orgs = await Organization.findAll();
    res.json(orgs);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get organization by ID
exports.getOrganization = async (req, res) => {
  try {
    const org = await Organization.findByPk(req.params.id);
    if (!org) return res.status(404).json({ error: 'Not found' });
    res.json(org);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update organization
exports.updateOrganization = async (req, res) => {
  try {
    const org = await Organization.findByPk(req.params.id);
    if (!org) return res.status(404).json({ error: 'Not found' });
    await org.update(req.body);
    res.json(org);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete organization (soft delete) and all associated workspaces and users
exports.deleteOrganization = async (req, res) => {
  try {
    const org = await Organization.findByPk(req.params.id);
    if (!org) return res.status(404).json({ error: 'Not found' });
    org.is_deleted = true;
    await org.save();

    // Soft delete all associated workspaces
    const workspaces = await org.getWorkspaces();
    for (const ws of workspaces) {
      ws.is_deleted = true;
      await ws.save();
    }

    // Soft delete all associated users
    const users = await org.getUsers();
    for (const user of users) {
      user.is_deleted = true;
      await user.save();
    }

    res.json({ message: 'Deleted (soft) organization, workspaces, and users' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deactivateOrganization = async (req, res) => {
  try {
    const org = await Organization.findByPk(req.params.id);
    if (!org) return res.status(404).json({ error: 'Not found' });
    org.is_active = false;
    await org.save();

    // Soft deactivate all associated workspaces
    const workspaces = await org.getWorkspaces();
    for (const ws of workspaces) {
      ws.is_active = false;
      await ws.save();
    }

    // Soft deactivate all associated users
    const users = await org.getUsers();
    for (const user of users) {
      user.is_active = false;
      await user.save();
    }

    res.json({ message: 'Deactivated (soft)' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
