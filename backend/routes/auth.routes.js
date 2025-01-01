import express from 'express';  
import {getMe, signup, login, logout } from '../controllers/auth.controller.js';
import { protectRoute } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/me',protectRoute, getMe); //protectRoute is a middleware to check if user is logged in
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

export default router;

//when we hit /me route, it will first go to protectRoute middleware and then to getMe controller due to next() in protectRoute middleware