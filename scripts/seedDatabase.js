const sequelize = require("../config/database");
const users = require("../models/users");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    const bulkUsers = [];
    for (let i = 1; i <= 5000; i++) {
      bulkUsers.push({
        name: `User${i}`,
        email: `user${i}@example.com`,
        password: `password${i}`,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    await users.bulkCreate(bulkUsers);
    console.log("5000 users have been added to the database.");
  } catch (error) {
    console.error("Unable to seed the database:", error);
  } finally {
    await sequelize.close();
  }
})();
