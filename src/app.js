
const express = require("express");
const taskRoutes = require("./routes/routes");
const errorHandler = require("./middleware/errorhandler");

const app = express();

// Parse incoming JSON request bodies
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Task API is running successfully"
  });
});

// Task API routes
app.use("/api/tasks", taskRoutes);

// Centralized error-handling middleware
app.use(errorHandler);

module.exports = app;
