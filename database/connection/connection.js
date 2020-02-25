const Sequelize = require('sequelize');

//Connect to db
const sequelize = new Sequelize('bs', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql'
});

module.exports = sequelize;
global.sequelize = sequelize;
