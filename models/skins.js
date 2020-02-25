const Sequelize = require('sequelize');

module.exports = sequelize.define('skins', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: Sequelize.STRING,
  variables: Sequelize.JSON,
  style: Sequelize.STRING
}, {
  timestamps: false
});
