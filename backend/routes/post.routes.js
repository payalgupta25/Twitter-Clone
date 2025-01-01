import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { commentOnPost, createPost , deletePost , likePost , getPosts , getFollowingPosts , getLikedPosts , getUserPosts } from "../controllers/post.controller.js";

const router = express.Router();

router.get("/getPosts",protectRoute,getPosts);
router.get("/following", protectRoute, getFollowingPosts);
router.get("/liked/:id", protectRoute, getLikedPosts);
router.get("/user/:username", protectRoute, getUserPosts);
router.post("/create",protectRoute,createPost);
router.post("/like/:id",protectRoute,likePost);
router.post("/comment/:id",protectRoute,commentOnPost);
router.delete("/:id",protectRoute,deletePost);

export default router;