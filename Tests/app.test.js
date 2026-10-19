
const request = require("supertest");
const app = require("../src/app");

describe("Task API", () => {
  test("GET / should return a success message", async () => {
    const response = await request(app).get("/");

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe(
      "Task API is running successfully"
    );
  });
});
