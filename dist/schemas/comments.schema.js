import mongoose, { Schema, model } from "mongoose";
const PostSchema = new Schema({
    comment: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "Users",
    },
});
export default model("Comments", PostSchema);
