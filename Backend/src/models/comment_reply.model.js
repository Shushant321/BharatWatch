import mongoose from 'mongoose';

const commentReplySchema = new mongoose.Schema({
    message:{
        type: String,
        required: true
    },
    comment:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    },
    video:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    userName:{
        type: String,
        default: "Anonymous"
    },
    userAvatar:{
        type: String,
        default: ""
    },
    likes:{
        type: Number,
        default: 0
    },
    replies:{
        type: Number,
        default: 0
    }
},{
    timestamps:true
})

export const CommentReply = mongoose.model("CommentReply",commentReplySchema)
