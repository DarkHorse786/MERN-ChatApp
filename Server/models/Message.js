// models/User.js
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userModel",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userModel",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    seen: {
      type: Boolean,
      default: false,
    },

    timestamps: {
      type: Date,
      default: Date.now,
    },
  },
);
const messageModel = mongoose.model("messageModel", MessageSchema);
export default messageModel;
