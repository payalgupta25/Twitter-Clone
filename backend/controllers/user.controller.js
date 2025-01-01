//models
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

//others
import bcrypt from "bcryptjs";
import {v2 as cloudinary} from "cloudinary";
import { likePost } from "./post.controller.js";


export const getUsersProfile = async (req, res) => {
    try {

        const {username} = req.params;  
        const user = await User.findOne({username}).select("-password");
        if(!user){
            return res.status(404).json({error:"User not found"});
        }

        res.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            username:user.username,
            email:user.email,
            profileImg:user.profileImg,
            coverImg:user.coverImg,
            followers:user.followers,
            following:user.following,
            bio:user.bio,
            link:user.link,
            likePosts:user.likedPosts,
        });

    } catch (error) {
        console.log("Error in getUsersProfile controller: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const followUnfollowUser = async (req, res) => {
    try {

        const { id } = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);  //req.user is attached in protectRoute middleware, which is the logged in user as it also needs to be updated

        //if user is trying to follow/unfollow himself
        if(id==req.user._id.toString()){           //req.user._id is an object, so converting it to string
            return res.status(400).json({error:"You can't follow/unfollow yourself"});
        }

        if(!userToModify || !currentUser){
            return res.status(404).json({error:"User not found"});
        }

        const isFollowing = currentUser.following.includes(id);  //if id is already in following array, then user is already following that user
        if(!isFollowing){
            //follow the user
            await User.findByIdAndUpdate(req.user._id, {$push:{following:id}}); //add id(other person's) to following array of current user(loggedIn me)
            await User.findByIdAndUpdate(id, {$push:{followers:req.user._id}}); //add id(current user) to followers array of other person
            res.status(200).json({message:`${userToModify.username} followed successfully`});

            //Send notification to the user
            const notification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id,
            });

            await notification.save();

            // TODO: Send notification to the user

        }else{
            //unfollow the user
            await User.findByIdAndUpdate(req.user._id, {$pull:{following:id}}); //remove id(other person's) from following array of current user(loggedIn me)
            await User.findByIdAndUpdate(id, {$pull:{followers:req.user._id}}); //remove id(current user) from followers array of other person
            res.status(200).json({message:`${userToModify.username} unfollowed successfully`});
        }

    } catch (error) {
        console.log("Error in followUnfollowUser controller: ", error);
        res.status(500).json({ error: "Internal server error" }); 
    }
};

export const getSuggestedUsers = async (req, res) => {
    const userId = req.user._id;

    // const usersFollowedByMe = await User.findById(userId).select("following"); //.select("following") is used to get only following array of the user
    // const users = await User.aggregate([  //aggregate is used to perform complex queries
    //     {
    //         $match: {
    //             _id: { $ne: userId }, //exclude the logged in user
    //         },
    //     },
    //     { $sample: { size: 10 } },  //get 10 random users
    // ]);

    // // 1,2,3,4,5,6,
    // const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id)); //filter out the users which are already followed by me
    // const suggestedUsers = filteredUsers.slice(0, 4);       //show only 4 users

    // suggestedUsers.forEach((user) => (user.password = null));  //remove password from the response
    const suggestedUsers = await User.aggregate([
        {
          $match: {
            _id: { $ne: userId }, // Exclude the current user
            _id: { $nin: (await User.findById(userId).select("following")).following }, // Exclude followed users
          },
        },
        {
          $project: {
            password: 0, // Exclude sensitive fields like password
          },
        },
        { $sample: { size: 4 } }, // Randomly select 4 users
      ]);

    res.status(200).json(suggestedUsers);

};

export const updateUser = async (req, res) => {

    const { username, fullName, email, bio, link, currentPassword, newPassword } = req.body;
    let {profileImg, coverImg,} = req.body;

    const userId = req.user._id;

    try {
        let user = await User.findById(userId);
        if(!user){
            return res.status(404).json({error:"User not found"});
        }
        if((!currentPassword && newPassword) || (currentPassword && !newPassword)){
            return res.status(400).json({error:"Please provide both correctPassword and newPassword"});
        }
        if(currentPassword && newPassword){

            const isMatch = await bcrypt.compare(currentPassword, user.password);

            if(!isMatch){
                return res.status(400).json({error:"Incorrect password"});
            }

            if(newPassword.length < 6){
                return res.status(400).json({error:"Password must be atleast 6 characters long"});
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        if(profileImg){
            if (user.profileImg) {
				// https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
				await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);      //destroy the image from cloudinary using public_id
                //id is the last part of the url, so split the url by / and get the last part, then split it by . and get the first part
			}

            const uploadedResponse = await cloudinary.uploader.upload(profileImg);  //upload the image to cloudinary
            profileImg = uploadedResponse.secure_url;  //get the secure url of the uploaded image
        }

        if(coverImg){
            if (user.coverImg) {
				await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
			}
            const uploadedResponse = await cloudinary.uploader.upload(coverImg);  //upload the image to cloudinary
            coverImg = uploadedResponse.secure_url;  //get the secure url of the uploaded image
        }

        user.username = username || user.username;
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        user = await user.save();

        user.password = null;  //remove password from the response

        return res.status(200).json(user);

        // const user = await User.findByIdAndUpdate(
        //     req.user._id,
        //     {$set:{
        //         username:req.body.username,
        //         fullName:req.body.fullName,
        //         email:req.body.email,
        //         bio:req.body.bio,
        //         profileImg:req.body.profileImg,
        //         coverImg:req.body.coverImg,
        //         link:req.body.link,
        //     }},
        //     {new:true}
    } catch (error) {
        console.log("Error in userProfile controller: ", error);
        res.status(500).json({ error: "Internal server error" });        
    }
}; 