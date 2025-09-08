const { Chat, User, UserWorkspace, Workspace, Messages } = require('../models');

exports.createWorkspaceChats = async (req, res) => {
  try {
    const { userId, workspaceId } = req.body;
    
    // Verify the user belongs to the workspace
    const userInWorkspace = await UserWorkspace.findOne({
      where: { 
        UserId: userId, 
        WorkspaceId: workspaceId,
        is_active: true,
        is_deleted: false
      }
    });
    
    if (!userInWorkspace) {
      return res.status(403).json({
        success: false,
        message: 'User does not belong to this workspace'
      });
    }
    
    // Get all users in the workspace - Alternative approach
    const userWorkspaces = await UserWorkspace.findAll({
      where: { 
        WorkspaceId: workspaceId,
        is_active: true,
        is_deleted: false
      }
    });
    
    // Get user details separately
    const userIds = userWorkspaces.map(uw => uw.UserId);
    const users = await User.findAll({
      where: { id: userIds },
      attributes: ['id', 'email'] // Removed 'username'
    });
    
    const createdChats = [];
    
    // Create chats with all users in the workspace (including self)
    for (const user of users) {
      const targetUserId = user.id;
      
      // Determine user1Id and user2Id (always put smaller ID first for consistency)
      const user1Id = userId.localeCompare(targetUserId) <= 0 ? userId : targetUserId;
      const user2Id = userId.localeCompare(targetUserId) <= 0 ? targetUserId : userId;
      
      // Check if chat already exists
      const existingChat = await Chat.findOne({
        where: {
          user1Id,
          user2Id,
          workspaceId
        }
      });
      
      if (!existingChat) {
        const newChat = await Chat.create({
          user1Id,
          user2Id,
          workspaceId
        });
        
        createdChats.push({
          ...newChat.toJSON(),
          targetUser: user
        });
      }
    }
    
    res.status(201).json({
      success: true,
      message: `Created ${createdChats.length} new chats in workspace`,
      chats: createdChats,
      totalUsersInWorkspace: users.length
    });
    
  } catch (error) {
    console.error('Error creating workspace chats:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating workspace chats',
      error: error.message
    });
  }
};


exports.getChatsById = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    // Use Sequelize findAll with all attributes and ordering
    const messages = await Messages.findAll({ 
      where: { chatId },
      attributes: [ 'message', 'contentType', 'authorId', 'createdAt'],
      order: [['createdAt', 'ASC']] // Order by creation time
    });
    
    res.status(200).json({
      success: true,
      message: 'Messages fetched successfully',
      data: messages,
      count: messages.length
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
}

