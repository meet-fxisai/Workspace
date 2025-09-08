const { User, Workspace, UserWorkspace, Chat } = require('../models');


exports.assignWorkspaces = async (req, res) => {
  try {
    const { userId, workspaceIds } = req.body;

    // Validate input
    if (!userId || !workspaceIds || !Array.isArray(workspaceIds)) {
      return res.status(400).json({ message: 'Invalid input data' });
    }

    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the workspaces
    const workspaces = await Workspace.findAll({
      where: {
        id: workspaceIds,
        is_deleted: false,
        is_active: true
      }
    });

    if (workspaces.length === 0) {
      return res.status(404).json({ message: 'No valid workspaces found' });
    }

    // Create UserWorkspace entries manually
    const assignments = [];
    for (const workspace of workspaces) {
      // Check if assignment already exists
      const existing = await UserWorkspace.findOne({
        where: {
          UserId: userId,
          WorkspaceId: workspace.id
        }
      });

      if (!existing) {
        const assignment = await UserWorkspace.create({
          UserId: userId,
          WorkspaceId: workspace.id,
          role: 'member'
        });
        assignments.push(assignment);
      }
    }

    return res.status(200).json({ 
      message: 'Workspaces assigned successfully',
      assignedWorkspaces: assignments.length,
      totalRequested: workspaceIds.length
    });
  } catch (error) {
    console.error('Error assigning workspaces:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
};


exports.getUserWorkspaces = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate input
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all workspace IDs assigned to the user
    const userWorkspaceRecords = await UserWorkspace.findAll({
      where: {
        UserId: userId,
        is_active: true,
        is_deleted: false
      },
      attributes: ['WorkspaceId', 'role', 'createdAt']
    });

    if (userWorkspaceRecords.length === 0) {
      return res.status(200).json({
        message: 'No workspaces found for this user',
        userId: userId,
        workspaces: [],
        totalWorkspaces: 0
      });
    }

    // Get workspace IDs
    const workspaceIds = userWorkspaceRecords.map(uw => uw.WorkspaceId);

    // Find the workspaces
    const workspaces = await Workspace.findAll({
      where: {
        id: workspaceIds,
        is_active: true,
        is_deleted: false
      },
      attributes: ['id', 'name', 'createdAt', 'updatedAt']
    });

    // Combine workspace data with user role
    const result = workspaces.map(workspace => {
      const userWorkspace = userWorkspaceRecords.find(uw => uw.WorkspaceId === workspace.id);
      return {
        id: workspace.id,
        name: workspace.name,
        description: workspace.description,
        role: userWorkspace.role,
        assignedAt: userWorkspace.createdAt,
        workspaceCreatedAt: workspace.createdAt,
        workspaceUpdatedAt: workspace.updatedAt
      };
    });

    return res.status(200).json({
      message: 'User workspaces retrieved successfully',
      userId: userId,
      workspaces: result,
      totalWorkspaces: result.length
    });
  } catch (error) {
    console.error('Error retrieving user workspaces:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getUsersOfWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    // Validate input
    if (!workspaceId) {
      return res.status(400).json({ message: 'Workspace ID is required' });
    }

    // Verify workspace exists and is active
    const workspace = await Workspace.findOne({
      where: {
        id: workspaceId,
        is_active: true,
        is_deleted: false
      }
    });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const userWorkspaces = await UserWorkspace.findAll({
      where: { 
        WorkspaceId: workspaceId,
        is_active: true,
        is_deleted: false
      },
      attributes: ['UserId', 'role', 'createdAt']
    });

    if (userWorkspaces.length === 0) {
      return res.status(200).json({
        message: 'No users found for this workspace',
        workspaceId: workspaceId,
        users: [],
        chats: [],
        totalUsers: 0
      });
    }

    // Get user details separately
    const userIds = userWorkspaces.map(uw => uw.UserId);
    const users = await User.findAll({
      where: {
        id: userIds,
        is_active: true,
        is_deleted: false
      },
      attributes: ['id', 'name', 'email']
    });

    // Combine user data with their roles
    const usersWithRoles = users.map(user => {
      const userWorkspace = userWorkspaces.find(uw => uw.UserId === user.id);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: userWorkspace.role,
        assignedAt: userWorkspace.createdAt
      };
    });

    // Get chats for this workspace (if needed for frontend)
    const chats = await Chat.findAll({
      where: { 
        workspaceId: workspaceId
      },
      attributes: ['id', 'user1Id', 'user2Id']
    });

    return res.status(200).json({
      message: 'Users retrieved successfully',
      workspaceId: workspaceId,
      users: usersWithRoles,
      chats: chats,
      totalUsers: usersWithRoles.length
    });
  } catch (error) {
    console.error('Error retrieving users of workspace:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};
