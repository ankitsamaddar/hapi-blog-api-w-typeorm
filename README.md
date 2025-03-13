# Hapi with TypeORM

This project is a backend for a Blog site RESTful APIs built using Hapi.js and TypeORM. Used `JWT` Authentication for route validations, `Joi` for payload schema validation and added `Swagger` docs for documenting the API routes.

Used `fakerjs` to generate the users and posts.


## Getting Started

### Prerequisites

- Node.js (>= 14.x)
- npm (>= 6.x) or yarn (>= 1.x)

### Installation

1. Clone the repository:

  ```sh
  git clone git@github.com:ankitsamaddar/hapi-blog-api-w-typeorm.git
  cd hapi-blog-api-w-typeorm
  ```

2. Install dependencies:

  ```sh
  npm install
  ```

### Running the Application

1. Start the server:

  ```sh
  npm run dev
  ```

2. The server will be running at `http://localhost:3000`.

  ```bash
  Creating fake Data...
✅ 50 fake users created ✅
✅ 100 fake posts created for 50 users ✅
Created UsersEntity
Created PostsEntity
📀 DB init -> Done! 📀
🚀 Server running on http://localhost:3000 🚀
  ```

3. The API routes docs will be available at `http://localhost:3000/docs`.

  ![API Docs Image](api-docs.png)
