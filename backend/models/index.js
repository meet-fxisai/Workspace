const sequelize = require('../config/sequelize');
const Organization = require('./Organization');
const User = require('./User');
const Workspace = require('./Workspace');
const UserWorkspace = require('./UserWorkspace');
const Chat = require('./Chat')
const Messages = require('./Messages')


const syncModels = async () => {
  await sequelize.sync({ alter: true });
};

module.exports = { Organization, User, Workspace, UserWorkspace, Chat, Messages, syncModels, sequelize };
