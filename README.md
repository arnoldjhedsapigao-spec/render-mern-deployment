# Project Name

A backend RESTful API built with Node.js and Express.js, featuring user authentication, authorization, and data persistence with MongoDB.

## 🚀 Features

- **Express.js Framework:** Fast, unopinionated, minimalist web framework.
- **MongoDB & Mongoose:** Schema-based data modeling and seamless database communication.
- **Authentication & Authorization:** Secure user registration, login, and user-based route access controls.
- **Environment Variables:** Configuration management using `nodemon.json`.

## 🛠️ Prerequisites

Ensure you have the following installed on your local machine:

- [Node.js](https://nodejs.org) (v24.11.1 or higher)
- [npm](https://npmjs.com)
- [MongoDB](https://mongodb.com) (an Atlas cloud account)

## 📦 Installation & Setup

Follow these steps to get your development environment running:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/arnoldjhedsapigao-spec/render-mern-deployment.git
   cd your-repo-name
   ```

2. **Install project dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `nodemon.json` file in the root directory:
   ```bash
   touch nodemon.json
   ```
   Open the file and add your custom configurations (see the Configuration section below).

## ⚙️ Configuration (nodemon.json)

Your `nodemon.json` file should contain the following variables:

| Variable      | Description                           | Example Value               |
| :------------ | :------------------------------------ | :-------------------------- |
| `PORT`        | The port your server runs on          | `5000`                      |
| `DB_USER`     | MongoDB username                      | `arnoldjhedsapigao_db_user` |
| `DB_PASSWORD` | MongoDB password                      | `Pazs3ord`                  |
| `DB_NAME`     | MongoDB database                      | `db_mern_dev`               |
| `JWT_KEY`     | Secret key used to sign access tokens | `supersecret_dont_share`    |

## 🏃 Running the Application

### Development Mode

Runs the application using `nodemon` for automatic server restarts whenever you save file changes:

```bash
npm run dev
```

### Production Mode

Runs the application standardly using core Node.js:

```bash
npm start
```

The server will initialize and listen at **`http://localhost:5000`**.

## 📂 Project Structure

```text
├── controllers/        # Request handlers mapping to specific routes (User, Place)
├── middleware/         # Auth verification, and file upload check
├── models/             # Mongoose schemas (User, Place), and HttpError class
├── routes/             # Express route definitions grouped by resource (User, Place)
├── uploads/            #
│   ├── images/         # Image upload storage
├── util                # Address coordinates
├── .gitignore          # Prevents tracking node_modules and nodemon.json
├── app.js              # Server entry point, middleware chain, and database init
├── nodemon.json        # Local environment variables (ignored by Git)
└── package.json        # Manifest file managing dependencies and scripts
```

## 🔐 API Endpoints (Quick Reference)

### domain.com/api/users

| HTTP Method | Path                | Description        | Access           |
| :---------- | :------------------ | :----------------- | :--------------- |
| **GET**     | `/api/users/`       | Retrieve user list | Public           |
| **POST**    | `/api/users/signup` | Create new user    | Un-authenticated |
| **POST**    | `/api/users/login`  | Log user in        | Un-authenticated |

### domain.com/api/places

| HTTP Method | Path                    | Description                                | Access        |
| :---------- | :---------------------- | :----------------------------------------- | :------------ |
| **GET**     | `/api/places/user/:uid` | Retrieve place list for a userId (uid)     | Public        |
| **GET**     | `/api/places/:pid`      | Retrieve a specific place by placeId (pid) | Authenticated |
| **POST**    | `/api/places/`          | Create a new place                         | Authenticated |
| **PATCH**   | `/api/places/:pid`      | Update a place by placeId (pid)            | Authenticated |
| **DELETE**  | `/api/places/:pid`      | Remove a place by placeId (pid)            | Authenticated |
