const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("my_database", "admin", "admin", {
  host: "localhost",
  dialect: "postgres",
});

module.exports = sequelize;
