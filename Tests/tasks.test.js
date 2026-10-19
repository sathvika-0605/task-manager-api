
const request = require("supertest");
const app = require("../src/app");

describe("Task API - validation tests", () => {
  describe("POST /api/tasks", () => {
    test("should reject a task without a title", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .send({ description: "Test description" });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Task title is required and cannot be empty."
      );
    });

    test("should reject an empty title", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .send({ title: "   " });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test("should reject a non-boolean completed value", async () => {
      const response = await request(app)
        .post("/api/tasks")
        .send({
          title: "Test task",
          completed: "yes"
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe(
        "Completed must be true or false."
      );
    });
  });

  describe("GET /api/tasks/:id", () => {
    test("should reject an invalid task ID", async () => {
      const response = await request(app).get(
        "/api/tasks/invalid-id"
      );

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid task ID.");
    });
  });

  describe("PUT /api/tasks/:id", () => {
    test("should reject an invalid task ID", async () => {
      const response = await request(app)
        .put("/api/tasks/invalid-id")
        .send({ title: "Updated task" });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid task ID.");
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    test("should reject an invalid task ID", async () => {
      const response = await request(app).delete(
        "/api/tasks/invalid-id"
      );

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid task ID.");
    });
  });
});
