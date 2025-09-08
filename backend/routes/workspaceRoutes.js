const express = require('express');
const router = express.Router();
const workspaceController = require('../controllers/workspaceController');

router.post('/', workspaceController.createWorkspace);
router.get('/', workspaceController.getWorkspaces);
router.get('/organization/:organizationId', workspaceController.getWorkspacesByOrganization);
router.get('/:id', workspaceController.getWorkspace);
router.put('/:id', workspaceController.updateWorkspace);
router.delete('/:id', workspaceController.deleteWorkspace);

module.exports = router;
