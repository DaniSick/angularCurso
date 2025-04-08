const express = require("express");
const users = require("./models/users");

const app = express();
app.use(express.json());

// Get all users with pagination
app.get("/users", async (req, res) => {
  const { page = 1, limit = 20 } = req.query; // Default to page 1, 20 users per page
  const offset = (page - 1) * limit;

  const allUsers = await users.findAndCountAll({
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  res.json({
    total: allUsers.count,
    page: parseInt(page),
    limit: parseInt(limit),
    data: allUsers.rows,
  });
});

// Create a new user
app.post("/users", async (req, res) => {
  const newUser = await users.create(req.body);
  res.json(newUser);
});

// Update a user
app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  await users.update(req.body, { where: { id } });
  res.json({ message: "User updated successfully" });
});

// Delete a user
app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  await users.destroy({ where: { id } });
  res.json({ message: "User deleted successfully" });
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
