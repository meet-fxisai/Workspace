const { Messages, User, Chat } = require('../models');

exports.sendMessage = async (req, res) => {
  try {
    const { message, contentType = 'text', authorId, chatId } = req.body;

    if (!message || !chatId) {
      return res.status(400).json({ message: 'Missing required fields: message, chatId' });
    }

    // Create the message in database
    const newMessage = await Messages.create({
      message,
      contentType,
      authorId,
      chatId
    });

    // Get user info for the message
    const author = await User.findByPk(authorId);
    const chat = await Chat.findByPk(chatId);

    if (chat && author) {
      // Create socket message payload
      const socketMessage = {
        id: newMessage.id,
        content: message,
        authorId: authorId,
        senderName: author.name,
        chatId: chatId,
        createdAt: newMessage.createdAt,
        contentType: contentType
      };

      // Find the recipient (other user in the chat)
      let recipientId;
      if (chat.user1Id === authorId) {
        recipientId = chat.user2Id;
      } else {
        recipientId = chat.user1Id;
      }

      console.log(`📤 API: Broadcasting message from ${author.name} to user ${recipientId}`);
      
      // Use global broadcast function if available
      if (global.broadcastMessage) {
        const sent = global.broadcastMessage(recipientId, socketMessage);
        if (sent) {
          console.log(`✅ API: Message broadcasted successfully`);
        } else {
          console.log(`⚠️ API: Recipient not online, message saved to DB only`);
        }
      } else {
        console.warn('Global broadcast function not available');
      }
    }

    return res.status(201).json({ 
      message: 'Message sent successfully', 
      data: newMessage 
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
exports.getMessages = async(req, res) => {
  try {
    const { chatId } = req.params;

    if (!chatId) {
      return res.status(400).json({ message: 'Chat ID is required' });
    }

    const messages = await Messages.findAll({
      where: { chatId },
      order: [['createdAt', 'ASC']], // Changed to ASC for chronological order
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'email']
      }]
    });

    return res.status(200).json({ message: 'Messages retrieved successfully', data: messages });
  } catch (error) {
    console.error('Error retrieving messages:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
