const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Organization = require('./Organization');
const Workspace = require('./Workspace');
const Messages = require('./Messages');

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'member'), defaultValue: 'member' },
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
  // otp : { type: DataTypes.STRING, allowNull: true }

});

User.associate = function(models) {
  // Add this association if it's missing
  User.hasMany(models.UserWorkspace, { foreignKey: 'UserId' });
  User.belongsToMany(models.Workspace, { 
    through: models.UserWorkspace, 
    foreignKey: 'UserId',
    otherKey: 'WorkspaceId'
  });
  // ...other associations...
};

User.belongsTo(Organization, {
  foreignKey: {
    name: 'OrganizationId',
    type: DataTypes.UUID,
    allowNull: false
  }
});
Organization.hasMany(User);

User.hasMany(Messages, { 
  foreignKey: 'authorId', 
  as: 'messages' 
});
Messages.belongsTo(User, { 
  foreignKey: 'authorId', 
  as: 'author' 
});

module.exports = User;