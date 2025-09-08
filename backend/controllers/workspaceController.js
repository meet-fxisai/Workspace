const { Workspace } = require('../models');

// Create Workspace
exports.createWorkspace = async (req, res) => {
  try {
    const { name, domain, OrganizationId } = req.body;
    const workspace = await Workspace.create({ name, domain, OrganizationId });
    res.status(201).json(workspace);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all workspaces
exports.getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.findAll();
    res.json(workspaces);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get workspace by ID
exports.getWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findByPk(req.params.id);
    if (!workspace) return res.status(404).json({ error: 'Not found' });
    res.json(workspace);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update workspace
exports.updateWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findByPk(req.params.id);
    if (!workspace) return res.status(404).json({ error: 'Not found' });
    await workspace.update(req.body);
    res.json(workspace);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete workspace (soft delete)
exports.deleteWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findByPk(req.params.id);
    if (!workspace) return res.status(404).json({ error: 'Not found' });
    workspace.is_deleted = true;
    await workspace.save();
    res.json({ message: 'Deleted (soft)' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get workspaces by organization ID
exports.getWorkspacesByOrganization = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const workspaces = await Workspace.findAll({
      where: { 
        OrganizationId: organizationId,
        is_deleted: false // Assuming you want to exclude deleted workspaces
      }
    });
    res.json(workspaces);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
