
require("dotenv").config();

const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../src/app");
const Task = require("../src/models/task");

async function runIntegrationTest() {
  const uri = process.env.TEST_MONGO_URI;

  // Safety check: only allow the dedicated local test database.
  if (
    !uri ||
    !uri.startsWith("mongodb://127.0.0.1:27017/taskmanager_test")
  ) {
    throw new Error(
      "Safety check failed. Set TEST_MONGO_URI to the local taskmanager_test database."
    );
  }

  let createdTaskId;

  try {
    await mongoose.connect(uri);
    console.log("Connected to test database.");

    // CREATE
    const createResponse = await request(app)
      .post("/api/tasks")
      .send({
        title: "Integration Test Task",
        description: "Testing with real MongoDB",
      });

    if (createResponse.status !== 201) {
      throw new Error(
        `CREATE failed: ${createResponse.status} ${JSON.stringify(createResponse.body)}`
      );
    }

    createdTaskId =
      createResponse.body.task?._id || createResponse.body._id;

    if (!createdTaskId) {
      throw new Error("CREATE succeeded but no task ID was returned.");
    }

    console.log("PASS: Create task");

    // READ ALL
    const listResponse = await request(app).get("/api/tasks");

    if (listResponse.status !== 200) {
      throw new Error(`LIST failed: ${listResponse.status}`);
    }

    console.log("PASS: List tasks");

    // READ ONE
    const getResponse = await request(app).get(
      `/api/tasks/${createdTaskId}`
    );

    if (getResponse.status !== 200) {
      throw new Error(`GET BY ID failed: ${getResponse.status}`);
    }

    console.log("PASS: Get task by ID");

    // UPDATE
    const updateResponse = await request(app)
      .put(`/api/tasks/${createdTaskId}`)
      .send({ completed: true });

    if (updateResponse.status !== 200) {
      throw new Error(`UPDATE failed: ${updateResponse.status}`);
    }

    console.log("PASS: Update task");

    // DELETE
    const deleteResponse = await request(app).delete(
      `/api/tasks/${createdTaskId}`
    );

    if (deleteResponse.status !== 200) {
      throw new Error(`DELETE failed: ${deleteResponse.status}`);
    }

    createdTaskId = null;
    console.log("PASS: Delete task");

    console.log("\nAll real MongoDB integration tests passed!");
  } finally {
    // If a test fails midway, remove only the task created by this script.
    if (createdTaskId && mongoose.connection.readyState === 1) {
      await Task.findByIdAndDelete(createdTaskId);
    }

    await mongoose.disconnect();
  }
}

runIntegrationTest().catch((error) => {
  console.error("\nIntegration test failed:", error.message);
  process.exitCode = 1;
});
