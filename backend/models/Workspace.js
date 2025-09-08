const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Organization = require('./Organization');

const Workspace = sequelize.define('Workspace', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  domain: { type: DataTypes.STRING, allowNull: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false }

});

Workspace.associate = function(models) {
  // Add this association if it's missing
  Workspace.hasMany(models.UserWorkspace, { foreignKey: 'WorkspaceId' });
  Workspace.belongsToMany(models.User, { 
    through: models.UserWorkspace, 
    foreignKey: 'WorkspaceId',
    otherKey: 'UserId'
  });
  // ...other associations...
};

Workspace.belongsTo(Organization, {
  foreignKey: {
    name: 'OrganizationId',
    type: DataTypes.UUID,
    allowNull: false
  }
});
Organization.hasMany(Workspace);

module.exports = Workspace;
