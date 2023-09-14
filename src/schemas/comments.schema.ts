import validator from "validator";
import { isEmailValid } from "../middleware/email.cheker.js";
import mongoose, { Schema, Document, model, Types } from "mongoose";
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
