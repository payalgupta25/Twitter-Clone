import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import {v2 as cloudinary} from 'cloudinary';
import Notification from "../models/notification.model.js";

export const createPost = async (req, res) => {

    try {

        const userId = req.user._id.toString();
        const user = await User.findById(userId);
        if(!user) return res.status(400).json({message:"User not found"});

        let {text,img} = req.body;

        if(!text && !img) return res.status(400).json({message:"Text or image is required"});

        if(img){
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }

        const post = new Post({
            user:userId,
            text,
            img
        });

        await post.save();
        console.log("Post created successfully")
        res.status(201).json(post);
        
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Something went wrong in creating post"});
    }
};

export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id.toString();
        const post= await Post.findByIdAndDelete(postId);

        if(post.user.toString() !== userId) return res.status(401).json({message:"You are not authorized to delete this post"});
        if(!post) return res.status(400).json({message:"Post not found"});

        if(post.img){
            const publicId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(publicId);
        }

        console.log("Post deleted successfully");
        res.status(200).json(post);

    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Something went wrong in deleting post"});        
    }
};

export const commentOnPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;
        const {text} = req.body;

        if(!text) return res.status(400).json({message:"Comment text is required"});

        const post = await Post.findById(postId);

        if(!post) return res.status(400).json({message:"Post not found"});
        console.log("Found post");

        const comment = {
            commentedBy:userId,
            text
        };

        post.comments.push(comment);
        await post.save();

        console.log("Commented on post successfully");
        res.status(200).json(post);

    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Something went wrong in commenting on post"});
    }
};

export const likePost = async (req, res) => {
    try {

        const userId = req.user._id;
		const { id: postId } = req.params;

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const userLikedPost = post.likes.includes(userId);

        if(userLikedPost){
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
            const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
			res.status(200).json(updatedLikes);
            console.log("Post unliked successfully");
        }else{
            post.likes.push(userId);
			await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
			await post.save();

			const notification = new Notification({
				from: userId,
				to: post.user,
				type: "like",
			});
			await notification.save();

			const updatedLikes = post.likes;
			res.status(200).json(updatedLikes);
            console.log("Post liked successfully");

        }
    
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Something went wrong in liking post"});
    }
};

export const getPosts = async (req, res) => {
    try {
        //sort by latest post first
        const posts = await Post.find().sort({createdAt:-1}).populate({
            path:"user",
            select:"-password"
        }).populate({
            path:"comments.commentedBy",
            select:"-password"
        }); 

        //.select("-password") doesn't work with populate, so we need to use select to exclude password field in user model

        if(posts.length===0) return res.status(200).json([]);

        res.status(200).json(posts);
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Something went wrong in getting posts"});
    }
};

export const getLikedPosts = async (req, res) => {
	const userId = req.params.id;

	try {
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.commentedBy",
				select: "-password",
			});

		res.status(200).json(likedPosts);
	} catch (error) {
		console.log("Error in getLikedPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getFollowingPosts = async (req, res) => {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const following = user.following;

		const feedPosts = await Post.find({ user: { $in: following } })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.commentedBy",
				select: "-password",
			});

		res.status(200).json(feedPosts);
	} catch (error) {
		console.log("Error in getFollowingPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getUserPosts = async (req, res) => {
	try {
		const { username } = req.params;

		const user = await User.findOne({ username });
		if (!user) return res.status(404).json({ error: "User not found" });

		const posts = await Post.find({ user: user._id })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.commentedBy",
				select: "-password",
			});

		res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getUserPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};