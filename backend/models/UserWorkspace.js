const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const UserWorkspace = sequelize.define('UserWorkspace', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'member' },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
  UserId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  WorkspaceId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Workspaces',
      key: 'id'
    }
  }
});

// Define associations
UserWorkspace.associate = function(models) {
  UserWorkspace.belongsTo(models.User, { foreignKey: 'UserId' });
  UserWorkspace.belongsTo(models.Workspace, { foreignKey: 'WorkspaceId' });
};

module.exports = UserWorkspace;
