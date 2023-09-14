import validator from "validator";
import { isEmailValid } from "../middleware/email.cheker.js";
import mongoose, { Schema, Document, model, Types } from "mongoose";
const UserChema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: isEmailValid,
      message: "Invalid email address",
    },
  },
  password: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
  },
  bio: {
    type: String,
  },
  img: {
    type: String,
  },
  planet: {
    type: String,
  },
  posts: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Posts",
    },
  ],
  jobs: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Jobs",
    },
  ],
  travel: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Travel",
    },
  ],
});

export default model("Users", UserChema);
