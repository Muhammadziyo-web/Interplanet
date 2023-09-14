import validator from "validator";
import { isEmailValid } from "../middleware/email.cheker.js";
import mongoose, { Schema, Document, model, Types } from "mongoose";
const PostSchema = new Schema({
  companyName: {
    type: String,
    required: true,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  salary: {
    type: String,
    required: true,
  },
  planet: {
    type: String,
    required: true,
  },
  about: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "Users",
  },
});
export default model("Jobs", PostSchema);
