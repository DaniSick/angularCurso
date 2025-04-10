const sequelize = require("../config/database");
const users = require("../models/users");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    
    // Delete all records from the users table
    const deleted = await users.destroy({
      where: {},
      truncate: true // This will reset primary key sequence
    });
    
    console.log("Database emptied successfully!");
    console.log("All users have been removed from the database.");
    console.log("You can now run the seedDatabase.js script to add new users.");
    
  } catch (error) {
    console.error("Unable to clear the database:", error);
  } finally {
    await sequelize.close();
  }
})();