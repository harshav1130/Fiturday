# FIT UR DAY - Deployment Guide

This project consists of a React/Vite frontend and an Express/Node.js backend with MongoDB. To deploy the application in a production environment, follow these steps.

## Prerequisites
- A MongoDB Atlas Cluster (or any MongoDB instance).
- A Razorpay Account for live or test keys.
- A Node.js runtime environment (e.g., Vercel, Render, Heroku, AWS).

## Environment Variables

### Backend (`v:/FITURDAY/backend/.env`)
Create an `.env` file in the `backend` directory with the following variables:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/fiturday?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key

# Razorpay Keys
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### Frontend (`v:/FITURDAY/frontend/.env`)
If you decide to deploy the frontend separately, ensure the frontend points to your production backend API.
*Note: Vite uses `.env.production` internally when built.*
```env
# Currently hardcoded in components to localhost:5000.
# You will need to replace `http://localhost:5000` with your deployed URL using an env variable:
VITE_API_URL=https://api.fiturday.com
```

## Production Build & Run

### 1. Build the Frontend
Navigate to the frontend folder and run the build command.
```bash
cd v:/FITURDAY/frontend
npm i
npm run build
```
This will generate a `dist` folder containing static optimized assets. You can serve this folder via Nginx, deploy it to Vercel/Netlify, or serve it directly from the backend.

### 2. Start the Backend
Navigate to the backend folder to start the Node.js server.
```bash
cd v:/FITURDAY/backend
npm i
npm start
```

## Security & Polish Notes for Production
1. **CORS:** In `server.js`, `app.use(cors({ origin: true, credentials: true }))` is currently set to reflect all origins. For production, change `origin: true` to your strict frontend domain (e.g., `origin: 'https://fiturday.com'`).
2. **Helmet:** Consider installing and adding `helmet` middleware in `server.js` for secure HTTP headers.
3. **API URL Refactoring:** Some frontend components hardcode `http://localhost:5000` in their Axios calls. Before deploying the frontend build, you should do a global find-and-replace to use `import.meta.env.VITE_API_URL` or a custom Axios instance.
4. **HTTPS:** The backend `server.js` does not force HTTPS; ensure your hosting provider (like Render or AWS load balancers) terminates SSL and forces HTTPS.

Enjoy Fit Ur Day!
