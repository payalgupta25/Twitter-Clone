import express from 'express';
import { protectRoute } from '../middlewares/auth.middleware.js';
import { getUsersProfile , followUnfollowUser , getSuggestedUsers, updateUser } from '../controllers/user.controller.js';

const router=express.Router();


router.get('/profile/:username', protectRoute, getUsersProfile);  //as user need to be logged in to see other users profile
router.post('/follow/:id', protectRoute, followUnfollowUser);
router.post('/update', protectRoute, updateUser);
router.get('/suggested',protectRoute, getSuggestedUsers);

export default router;