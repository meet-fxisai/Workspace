const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    contentType: {
        type: DataTypes.ENUM('text', 'image'),
        allowNull: false,
        defaultValue: 'text'
    },
    authorId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        },
        onDelete: 'SET NULL'
    },
    parentMessageId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Messages',
            key: 'id'
        },
        onDelete: 'SET NULL'
    },
    chatId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Chats',
            key: 'id'
        },
        onDelete: 'CASCADE'
    }
}, {
    timestamps: true,
    indexes: [
        {
            fields: ['chatId']
        }
    ]
});

Message.associate = function(models) {
    Message.belongsTo(models.User, { 
      foreignKey: 'authorId', 
      as: 'author' 
    });
    Message.belongsTo(models.Chat, { foreignKey: 'chatId' });
};

module.exports = Message;