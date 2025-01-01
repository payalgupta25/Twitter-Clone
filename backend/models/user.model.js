import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase: true,
            trim: true,  //it will remove the extra spaces
            index: true //it will help in searching
        },

        fullName:{
            type:String,
            required:true,
            trim:true
        },

        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true
        },

        password:{
            type:String,
            required:true,
            minLength:6
        },

        profileImg:{
            type:String,
            default:""
        },

        coverImg:{
            type:String,
            default:""
        },

        followers:[
            {
                type:mongoose.Schema.Types.ObjectId, 
                ref:"User",
                default:[] //by default no followers
            }
        ],

        following:[
            {
                type:mongoose.Schema.Types.ObjectId, 
                ref:"User",
                default:[] //by default no following
            }
        ],

        bio:{
            type:String,
            maxLength:100,
            default:""
        },

        link:{
            type:String,
            default:""
        },
        likedPosts:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Post",
                default:[]
            }
        ]

    },
    {
        timestamps:true
    });

const User = mongoose.model("User",userSchema);

export default User;