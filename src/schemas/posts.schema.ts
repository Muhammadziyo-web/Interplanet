import validator from "validator";
import { isEmailValid } from "../middleware/email.cheker.js";
import mongoose, { Schema, Document, model, Types } from "mongoose";
const PostSchema = new Schema({
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