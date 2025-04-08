const sequelize = require("../config/database");
const users = require("../models/users");

(async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log("✅ Connection to the database has been established successfully.");
    
    // Check if the users table exists and has data
    try {
      const count = await users.count();
      console.log(`✅ Users table exists and contains ${count} records.`);
      
      if (count > 0) {
        // Get a sample of users to verify data format
        const sampleUsers = await users.findAll({ limit: 3 });
        console.log("Sample users:");
        console.log(JSON.stringify(sampleUsers, null, 2));
      } else {
        console.log("⚠️ Users table is empty. Consider running the seed script.");
      }
    } catch (tableError) {
      console.error("❌ Error accessing users table:", tableError.message);
      console.log("The table might not exist. Try running the sync script first.");
    }
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error.message);
    
    // Provide some helpful debugging tips
    console.log("\nDebugging tips:");
    console.log("1. Make sure your database server is running");
    console.log("2. Check your database connection settings in config/database.js");
    console.log("3. Verify that the database specified in your config exists");
    console.log("4. Ensure you have the correct permissions to access the database");
  } finally {
    await sequelize.close();
  }
})();
