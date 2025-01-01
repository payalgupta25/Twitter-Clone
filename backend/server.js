import express from 'express';
import dotenv from 'dotenv';
import path from "path";
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import postRoutes from './routes/post.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import { connectDB } from './db/db.js';
import cookieParser from 'cookie-parser';
import {v2 as cloudinary} from 'cloudinary';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();

const __dirname = path.resolve();

//limit should be less than 200mb to prevent DOS attack 
app.use(express.json({limit:"5mb"}));  // to parse JSON data in the request body
app.use(express.urlencoded({ extended: true })); // to parse form data in the request body
app.use(cookieParser());  //to convert cookie string to object and attach it to req.cookies , means we can access cookies in req.cookies

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications',notificationRoutes);

if(process.env.NODE_ENV === 'production'){
  app.use(express.static(path.join(__dirname, '/frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
  }
  );
}




app.listen(process.env.PORT || 5000, () => {
  connectDB();
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});