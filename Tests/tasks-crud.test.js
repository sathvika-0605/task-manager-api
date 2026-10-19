
const request = require("supertest");
const app = require("../src/app");

jest.mock("../src/models/task", () => ({
  create: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

const Task = require("../src/models/task");

const taskId = "507f1f77bcf86cd799439011";

const sampleTask = {
  _id: taskId,
  title: "Test task",
  description: "Testing CRUD operations",
  completed: false,
  dueDate: null,
};

describe("Task API - successful CRUD tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("POST /api/tasks should create a task", async () => {
    Task.create.mockResolvedValue(sampleTask);

    const response = await request(app)
      .post("/api/tasks")
      .send({
        title: "Test task",
        description: "Testing CRUD operations",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.task.title).toBe("Test task");

    expect(Task.create).toHaveBeenCalledWith({
      title: "Test task",
      description: "Testing CRUD operations",
    });
  });

  test("GET /api/tasks should return tasks", async () => {
    const query = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([sampleTask]),
    };

    Task.find.mockReturnValue(query);

    Task.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(1),
    });

    const response = await request(app).get("/api/tasks");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.count).toBe(1);
    expect(response.body.tasks[0].title).toBe("Test task");
    expect(response.body.pagination.total).toBe(1);

    expect(Task.find).toHaveBeenCalledWith({});
    expect(Task.countDocuments).toHaveBeenCalledWith({});
    expect(query.sort).toHaveBeenCalledWith({
      createdAt: -1,
      _id: -1,
    });
    expect(query.skip).toHaveBeenCalledWith(0);
    expect(query.limit).toHaveBeenCalledWith(10);
  });

  test("GET /api/tasks/:id should return one task", async () => {
    Task.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(sampleTask),
    });

    const response = await request(app).get(
      `/api/tasks/${taskId}`
    );

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.task.title).toBe("Test task");
    expect(Task.findById).toHaveBeenCalledWith(taskId);
  });

  test("PUT /api/tasks/:id should update a task", async () => {
    const updatedTask = {
      ...sampleTask,
      title: "Updated task",
      completed: true,
    };

    Task.findByIdAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(updatedTask),
    });

    const response = await request(app)
      .put(`/api/tasks/${taskId}`)
      .send({
        title: "Updated task",
        completed: true,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.task.title).toBe("Updated task");
    expect(response.body.task.completed).toBe(true);

    expect(Task.findByIdAndUpdate).toHaveBeenCalledWith(
      taskId,
      {
        title: "Updated task",
        completed: true,
      },
      {
        returnDocument: "after",
        runValidators: true,
        strict: true,
      }
    );
  });

  test("DELETE /api/tasks/:id should delete a task", async () => {
    Task.findByIdAndDelete.mockReturnValue({
      exec: jest.fn().mockResolvedValue(sampleTask),
    });

    const response = await request(app).delete(
      `/api/tasks/${taskId}`
    );

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "Task deleted successfully."
    );
    expect(response.body.task.title).toBe("Test task");

    expect(Task.findByIdAndDelete).toHaveBeenCalledWith(taskId);
  });
});
