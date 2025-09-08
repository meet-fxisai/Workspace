const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const authMiddleware = require('../services/authMiddleware');

router.post('/register-organization', userController.registerOrganization);
router.post('/register-user', authMiddleware('admin') , userController.registerUser);
router.post('/reg',  userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/admin/deactivate-user', authMiddleware('admin'), userController.deactivateUser);
router.post('/admin/assign-workspaces', authMiddleware('admin'), userController.assignWorkspaces);
router.post('/admin/change-role', authMiddleware('admin'), userController.changeUserRole);
router.get('/:organizationId', userController.getUsersForOrganization);

module.exports = router;
