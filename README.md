# Twitter Clone

A full-stack Twitter-like social media application built with React, Node.js, Express, MongoDB, and TailwindCSS.

## Features

- User authentication (Sign Up, Login, Logout)
- Create, edit, and delete posts
- Like and comment on posts
- Follow/unfollow users
- Notifications for likes and follows
- Responsive design with TailwindCSS
- Real-time updates using React Query

---

## Project Structure

```
Twitter-Clone/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── hooks/
│   │   └── App.jsx
│   ├── public/
│   ├── index.html
│   └── tailwind.config.js
└── README.md
```

---

## Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or on a cloud service like MongoDB Atlas)

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` directory with the following structure:

   ```env
   PORT=5000
   MONGODB_URL=<your_mongodb_connection>
   JWT_SECRET=<your_jwt_secret>
   CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
   CLOUDINARY_API_KEY=<your_cloudinary_api_key>
   CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
   NODE_ENV=development
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

---

## Scripts

### Backend

- `npm run dev`: Start the backend server in development mode
- `npm start`: Start the backend server in production mode

### Frontend

- `npm run dev`: Start the frontend development server
- `npm run build`: Build the frontend for production
- `npm run preview`: Preview the production build

---

## Environment Variables

### Backend `.env`

```env
PORT=5000
MONGODB_URL=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
NODE_ENV=development
```

### Frontend Proxy Configuration

The frontend is configured to proxy API requests to the backend. Ensure the backend is running on `http://localhost:5000` or update the proxy settings in `frontend/vite.config.js` if needed.

---

## Technologies Used

### Frontend

- React
- React Router
- React Query
- TailwindCSS
- DaisyUI
- Vite

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Cloudinary (for image uploads)
- JSON Web Tokens (JWT) for authentication

---

## API Endpoints

### Authentication

- `POST /api/auth/signup`: Register a new user
- `POST /api/auth/login`: Login a user
- `POST /api/auth/logout`: Logout a user
- `GET /api/auth/me`: Get the authenticated user's details

### Users

- `GET /api/users/profile/:username`: Get a user's profile
- `POST /api/users/follow/:id`: Follow/unfollow a user
- `POST /api/users/update`: Update user profile
- `GET /api/users/suggested`: Get suggested users to follow

### Posts

- `GET /api/posts/getPosts`: Get all posts
- `GET /api/posts/following`: Get posts from followed users
- `GET /api/posts/liked/:id`: Get liked posts of a user
- `GET /api/posts/user/:username`: Get posts by a specific user
- `POST /api/posts/create`: Create a new post
- `POST /api/posts/like/:id`: Like/unlike a post
- `POST /api/posts/comment/:id`: Comment on a post
- `DELETE /api/posts/:id`: Delete a post

### Notifications

- `GET /api/notifications`: Get notifications for the authenticated user
- `DELETE /api/notifications`: Delete all notifications

---

## Deployment

### Backend

1. Deploy the backend to a cloud platform like Heroku, AWS, or Render.
2. Ensure the `.env` variables are set in the deployment environment.

### Frontend

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to a static hosting service like Vercel, Netlify, or AWS S3.

---
