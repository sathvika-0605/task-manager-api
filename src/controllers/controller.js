
const mongoose = require("mongoose");
const Task = require("../models/task");

// Validate MongoDB task ID
const isValidTaskId = (id) => {
  return mongoose.isValidObjectId(id);
};

// Validate due date
const isValidDueDate = (dueDate) => {
  return (
    typeof dueDate === "string" &&
    dueDate.trim() !== "" &&
    !Number.isNaN(Date.parse(dueDate))
  );
};

// CREATE a new task
const createTask = async (req, res) => {
  try {
    const { title, description, completed, dueDate } = req.body;

    // Validate title
    if (typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Task title is required and cannot be empty.",
      });
    }

    // Validate description
    if (
      description !== undefined &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Description must be a string.",
      });
    }

    // Validate completed
    if (
      completed !== undefined &&
      typeof completed !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "Completed must be true or false.",
      });
    }

    // Validate due date
    if (
      dueDate !== undefined &&
      dueDate !== null &&
      !isValidDueDate(dueDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "Due date must be a valid date string or null.",
      });
    }

    const task = await Task.create({
      title: title.trim(),
      ...(description !== undefined && { description }),
      ...(completed !== undefined && { completed }),
      ...(dueDate !== undefined && {
        dueDate:
          dueDate === null ? null : new Date(dueDate),
      }),
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully.",
      task,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to create task.",
      error: error.message,
    });
  }
};

// GET all tasks with pagination, filtering, searching, and sorting
const getTasks = async (req, res) => {
  try {
    // Pagination
    const page =
      req.query.page === undefined ? 1 : Number(req.query.page);

    const requestedLimit =
      req.query.limit === undefined
        ? 10
        : Number(req.query.limit);

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(requestedLimit) ||
      requestedLimit < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "page and limit must be positive integers.",
      });
    }

    // Maximum 100 tasks per page
    const limit = Math.min(requestedLimit, 100);
    const skip = (page - 1) * limit;

    // Build database filters
    const filter = {};

    // Filter by completion status
    if (req.query.completed !== undefined) {
      if (!["true", "false"].includes(req.query.completed)) {
        return res.status(400).json({
          success: false,
          message: "completed must be true or false.",
        });
      }

      filter.completed = req.query.completed === "true";
    }

    // Search by task title
    if (req.query.search !== undefined) {
      if (typeof req.query.search !== "string") {
        return res.status(400).json({
          success: false,
          message: "search must be a string.",
        });
      }

      const search = req.query.search.trim();

      if (search) {
        // Escape regex special characters so search is literal
        const escapedSearch = search.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );

        filter.title = {
          $regex: escapedSearch,
          $options: "i",
        };
      }
    }

    // Sorting: newest first by default
    const sort =
      req.query.sort === undefined ? "newest" : req.query.sort;

    if (!["newest", "oldest"].includes(sort)) {
      return res.status(400).json({
        success: false,
        message: "sort must be newest or oldest.",
      });
    }

    const sortOrder = sort === "oldest" ? 1 : -1;

    // Fetch tasks and total matching count
    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .sort({ createdAt: sortOrder, _id: sortOrder })
        .skip(skip)
        .limit(limit)
        .exec(),

      Task.countDocuments(filter).exec(),
    ]);

    return res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        completed: req.query.completed ?? null,
        search:
          typeof req.query.search === "string" &&
          req.query.search.trim()
            ? req.query.search.trim()
            : null,
        sort,
      },
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve tasks.",
      error: error.message,
    });
  }
};

// GET a single task by ID
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidTaskId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID.",
      });
    }

    const task = await Task.findById(id).exec();

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    return res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve task.",
      error: error.message,
    });
  }
};

// UPDATE a task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed, dueDate } = req.body;

    // Validate task ID
    if (!isValidTaskId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID.",
      });
    }

    // Only these fields can be updated
    const allowedFields = [
      "title",
      "description",
      "completed",
      "dueDate",
    ];

    const providedFields = Object.keys(req.body);

    if (
      providedFields.length === 0 ||
      !providedFields.some((field) => allowedFields.includes(field))
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one valid field to update.",
      });
    }

    // Validate title
    if (
      title !== undefined &&
      (typeof title !== "string" || title.trim() === "")
    ) {
      return res.status(400).json({
        success: false,
        message: "Title must be a non-empty string.",
      });
    }

    // Validate description
    if (
      description !== undefined &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Description must be a string.",
      });
    }

    // Validate completed
    if (
      completed !== undefined &&
      typeof completed !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "Completed must be true or false.",
      });
    }

    // Validate due date
    if (
      dueDate !== undefined &&
      dueDate !== null &&
      !isValidDueDate(dueDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "Due date must be a valid date string or null.",
      });
    }

    // Build updates from allowed fields only
    const updates = {};

    if (title !== undefined) {
      updates.title = title.trim();
    }

    if (description !== undefined) {
      updates.description = description;
    }

    if (completed !== undefined) {
      updates.completed = completed;
    }

    if (dueDate !== undefined) {
      updates.dueDate =
        dueDate === null ? null : new Date(dueDate);
    }

    // returnDocument: "after" replaces the deprecated new: true
    const task = await Task.findByIdAndUpdate(id, updates, {
      returnDocument: "after",
      runValidators: true,
      strict: true,
    }).exec();

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task updated successfully.",
      task,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to update task.",
      error: error.message,
    });
  }
};

// DELETE a task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidTaskId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID.",
      });
    }

    const task = await Task.findByIdAndDelete(id).exec();

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully.",
      task,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete task.",
      error: error.message,
    });
  }
};

// Export controller functions
module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
