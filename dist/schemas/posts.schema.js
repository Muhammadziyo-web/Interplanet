import mongoose, { Schema, model } from "mongoose";
const PostSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    likes: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Users",
        },
    ],
    comments: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Comments",
        },
    ],
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "Users",
    },
});
export default model("Posts", PostSchema);
