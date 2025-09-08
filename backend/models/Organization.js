const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Organization = sequelize.define('Organization', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  domain: { type: DataTypes.STRING, allowNull: false, unique: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false }
});

module.exports = Organization;
