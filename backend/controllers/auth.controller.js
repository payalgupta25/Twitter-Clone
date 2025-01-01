import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '../utils/generateToken.js';
import { protectRoute } from '../middlewares/auth.middleware.js';


export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password"); //select("-password") is used to exclude password from the response
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getMe controller: ");
        res.status(500).json({error:"Internal server error"});
    }
}
export const signup = async (req, res) => {
    try {
        const {fullName, username, email, password} = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({error:"Email is not in correct format"});
        }

        if(password.length < 6){
            return res.status(400).json({error:"Password must be atleast 6 characters long"});
        }

        if(!fullName || !username || !email || !password){
            return res.status(400).json({error:"All fields are mandatory"});
        }

        const userExists = await User.findOne({$or:[{email},{username}]});
        if(userExists){
            return res.status(400).json({error:"User with this email or username already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName:fullName, //as key and value are same, we can write it as fullName only
            username,
            email, 
            password:passwordHash
        });

        if(newUser){
            generateTokenAndSetCookie(newUser._id,res);
            await newUser.save();

            res.status(201).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                username:newUser.username,
                email:newUser.email,
                profileImg:newUser.profileImg,
                coverImg:newUser.coverImg,
                followers:newUser.followers,
                following:newUser.following,
            });
        }else{
            return res.status(400).json({error:"Something went wrong"});
        }
    } catch (error) {
        console.log("Error in signup controller: ",error);
        res.status(500).json({error:"Internal server error"});
    }
} 
export const login = async (req, res) => {
    try {

        const {username,email,password} = req.body;
        const user = await User.findOne({$or:[{username},{email}]});
        const isPasswordCorrect = user && await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect){
            return res.status(400).json({error:"Invalid credentials"});
        }else{
            //if we won't generate token and set cookie here, then we have to send token in response and then client has to store it in local storage or session storage
            generateTokenAndSetCookie(user._id,res); //here we are generating token and setting it in cookie beacuse we are using cookie based authentication
            res.status(200).json({
                _id:user._id,
                fullName:user.fullName,
                username:user.username,
                email:user.email,
                profileImg:user.profileImg,
                coverImg:user.coverImg,
                followers:user.followers,
                following:user.following,
            });
            console.log(`${username} logged in successfully`);
        }
 
    } catch (error) {
        console.log("Error in login controller: ",error);
        res.status(500).json({error:"Internal server error"});
        
    }
}
export const logout= async (req, res) => {
    try {
        const username = req.user?.username || "Unknown User";
        // const user = await User.findById(req.user._id);
        res.cookie("jwt","",{maxAge:0}); //setting the jwt cookie to empty string and maxAge to 1ms so that it expires immediately
        res.status(200).json({message:`${username} Logged out successfully`});
    } catch (error) {
        console.log("Error in logout controller: ",error);
        res.status(500).json({error:"Internal server error"});
    }
}