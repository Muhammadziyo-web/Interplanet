import mongoose, { Schema, model } from "mongoose";
const PostSchema = new Schema({
    from: {
        type: String,
        required: true,
    },
    to: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        required: true,
    },
    startDate: {
        type: String,
        required: true,
    },
    arriveDate: {
        type: String,
        required: true,
    },
    img: {
        type: String
    },
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "Users",
    },
});
export default model("Travel", PostSchema);
