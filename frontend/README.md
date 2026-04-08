# FITURDAY - Gym Management System

FITURDAY is a MERN stack application designed for gym management, tracking workouts, and booking sessions.

## 🚀 Getting Started

To run the project locally, follow these steps:

### 1. Prerequisites
- Node.js installed
- MongoDB installed and running (or a MongoDB Atlas URI)

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory and add the necessary environment variables (e.g., `MONGO_URI`, `JWT_SECRET`, etc.).
4. Start the backend server:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5000` by default.

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173` (or the port specified by Vite).

---

## 🔐 Login Process Flow

The authentication system is built using JWT (JSON Web Tokens) and React Context API.

1.  **User Input**: The user enters their email and password on the Login page (`/login`).
2.  **Frontend Action**: The `Login.jsx` component calls the `login` function from `AuthContext`.
3.  **API Call**: The `AuthContext` sends a `POST` request to `http://localhost:5000/api/auth/login` with the user's credentials.
4.  **Backend Verification**:
    -   The `authController.loginUser` receives the request.
    -   It checks if the user exists in the database.
    -   It compares the provided password with the hashed password stored in MongoDB using `bcrypt`.
5.  **Token Generation**: If valid, the backend generates an `accessToken` (short-lived) and a `refreshToken` (long-lived).
6.  **Response**: The server sends back the user profile details along with the tokens.
7.  **Client-side Storage**:
    -   The frontend receives the response and stores the `accessToken` and `refreshToken` in `localStorage`.
    -   The `AuthContext` state is updated with the user information.
8.  **Navigation**: Upon successful login, the user is automatically navigated to the Dashboard (`/dashboard`).
9.  **Authorized Requests**: For subsequent requests, an Axios interceptor automatically attaches the `accessToken` to the `Authorization` header. If the token expires, the interceptor attempts to refresh it using the `refreshToken`.

---

## Test Credentials

For testing purposes, you can use the following accounts:

| Role |            Email |           Password |
| :--- | :---             | :---               |
| **Admin** | `admin@fiturday.com` | `admin123` |
| **Gym Owner** | `owner@fiturday.com` | `owner123` |
| **Trainer** | `trainer@fiturday.com` | `trainer123` |
| **Regular User** | `user@fiturday.com` | `user123` |
