const sequelize = require("../config/database");
const users = require("../models/users");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    const bulkUsers = [];
    for (let i = 1; i <= 50; i++) {  // Changed from 5000 to 50
      bulkUsers.push({
        name: `User${i}`,
        email: `user${i}@example.com`,
        password: `password${i}`,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    await users.bulkCreate(bulkUsers);
    console.log("50 users have been added to the database.");  // Updated message
  } catch (error) {
    console.error("Unable to seed the database:", error);
  } finally {
    await sequelize.close();
  }
})();
