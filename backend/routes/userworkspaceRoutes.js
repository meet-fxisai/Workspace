const express = require('express');
const router = express.Router();
const authMiddleware = require('../services/authMiddleware');

const userworkspaceController = require('../controllers/userworkspaceController');

router.post('/admin/assign-workspaces', authMiddleware('admin'), userworkspaceController.assignWorkspaces);
router.get('/user/:userId/workspaces',  userworkspaceController.getUserWorkspaces);
router.get('/users/:workspaceId',  userworkspaceController.getUsersOfWorkspace);

module.exports = router;