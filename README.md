# Task Manager API

A RESTful Task Manager API built with Node.js, Express.js, MongoDB, and Mongoose. This project supports task management operations, input validation, filtering, searching, sorting, pagination, and automated testing.

## Features

- Create, retrieve, update, and delete tasks (CRUD)
- Validate task titles, due dates, and completion status
- Retrieve tasks by MongoDB ObjectId
- Filter tasks by completion status
- Search tasks by title
- Sort tasks by newest or oldest
- Paginate results with a maximum page size of 100
- Handle invalid input and missing tasks
- Automated testing with Jest and Supertest

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **ODM:** Mongoose
- **Environment Configuration:** dotenv
- **Testing:** Jest and Supertest

## Project Structure

```text
Task - API/
├── config/
├── scripts/
│   └── integration-test.js
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── controller.js
│   ├── middleware/
│   │   ├── errorhandler.js
│   │   └── middleware.js
│   ├── models/
│   │   └── task.js
│   ├── routes/
│   │   └── routes.js
│   └── app.js
├── Tests/
│   ├── app.test.js
│   ├── setup.js
│   ├── tasks-crud.test.js
│   └── tasks.test.js
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js
```

## Prerequisites

Make sure you have installed:

- Node.js and npm
- MongoDB running locally or a reachable MongoDB instance
- Postman (optional, for manual API testing)

## Installation and Setup

### 1. Install dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root.

For a local MongoDB instance, use:

```env
MONGO_URI=mongodb://127.0.0.1:27017/task_manager
```

If your MongoDB connection uses a different URI, configure your own value.

**Security:** Never commit your `.env` file or database credentials to GitHub.

### 3. Start the server

For normal execution:

```bash
npm start
```

For development with automatic server restarts:

```bash
npm run dev
```

The API uses `http://localhost:5000` if configured to run on port 5000.

## API Endpoints

Base URL: `http://localhost:5000`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Check the API home route |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks` | Retrieve all tasks |
| GET | `/api/tasks/:id` | Retrieve a task by ID |
| PUT | `/api/tasks/:id` | Update an existing task |
| DELETE | `/api/tasks/:id` | Delete a task |

## Task Data Model

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | MongoDB-generated task identifier |
| `title` | String | Required task title, maximum 100 characters |
| `description` | String | Optional description; defaults to an empty string |
| `completed` | Boolean | Task completion status; defaults to `false` |
| `dueDate` | Date or null | Optional task due date |
| `createdAt` | Date | Automatically generated creation timestamp |
| `updatedAt` | Date | Automatically generated update timestamp |

## Example API Requests

### 1. Create a task

**Method:** POST

**Endpoint:** `/api/tasks`

Request body:

```json
{
  "title": "Complete API documentation",
  "description": "Prepare the project README",
  "completed": false,
  "dueDate": "2026-11-01T00:00:00.000Z"
}
```

### 2. Retrieve all tasks

**Method:** GET

```text
/api/tasks
```

### 3. Retrieve a task by ID

**Method:** GET

```text
/api/tasks/:id
```

Replace `:id` with the task's actual MongoDB ObjectId.

### 4. Update a task

**Method:** PUT

```text
/api/tasks/:id
```

Request body:

```json
{
  "title": "Complete project documentation",
  "completed": true
}
```

### 5. Delete a task

**Method:** DELETE

```text
/api/tasks/:id
```

Replace `:id` with the ID of the task to delete.

## Filtering, Searching, Sorting, and Pagination

### Filter by completion status

Retrieve completed tasks:

```text
GET /api/tasks?completed=true
```

Retrieve incomplete tasks:

```text
GET /api/tasks?completed=false
```

### Search tasks by title

```text
GET /api/tasks?search=Postman
```

### Pagination

```text
GET /api/tasks?page=1&limit=5
```

- `page` specifies the page number.
- `limit` specifies the requested number of tasks per page.
- The maximum page size is 100 tasks.

### Sort tasks

Newest first:

```text
GET /api/tasks?sort=newest
```

Oldest first:

```text
GET /api/tasks?sort=oldest
```

## Validation and Error Handling

The API validates incoming data and handles invalid task IDs, missing tasks, invalid due dates, invalid completion values, and invalid pagination and sorting parameters.

Common HTTP status codes:

| Status | Meaning |
|---|---|
| `200 OK` | Request completed successfully |
| `201 Created` | Task created successfully |
| `400 Bad Request` | Invalid input or query parameters |
| `404 Not Found` | Requested task does not exist |
| `500 Internal Server Error` | Unexpected server error |

## Automated Testing

This project uses Jest and Supertest for automated tests.

Run the test suite:

```bash
npm test
```

To run tests sequentially:

```bash
npx jest --runInBand
```

### Latest Verified Test Results

- **Test suites passed:** 3 out of 3
- **Tests passed:** 12 out of 12
- **Failed tests:** 0

Manual Postman testing has also covered CRUD operations, validation, filtering, searching, sorting, and pagination.

## Security Considerations

- Keep `.env` and database credentials private.
- Ensure `.env` is excluded through `.gitignore`.
- Use a separate test database for integration tests.
- Avoid exposing sensitive connection strings in public repositories.

## Future Enhancements

- Add user authentication and authorization.
- Add interactive API documentation with Swagger/OpenAPI.
- Expand integration testing using a dedicated test database.
- Add structured logging and monitoring.
- Deploy the API to a hosting platform.

## Author

**Task Manager API**

A backend project demonstrating REST API development, MongoDB integration, input validation, query handling, and automated testing.
