const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');


const Chat = sequelize.define('Chat', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user1Id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    user2Id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    workspaceId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Workspaces',
            key: 'id'
        },
        onDelete: 'CASCADE'
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['user1Id', 'user2Id', 'workspaceId']
        }
    ]
});

Chat.associate = function(models) {
    Chat.belongsTo(models.User, { as: 'user1', foreignKey: 'user1Id' });
    Chat.belongsTo(models.User, { as: 'user2', foreignKey: 'user2Id' });
    Chat.belongsTo(models.Workspace, { foreignKey: 'workspaceId' });
};



module.exports = Chat;