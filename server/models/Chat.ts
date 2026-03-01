import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },

  guestId: {
    type: String,
    index: true
  },

  title: {
    type: String, // "Frontend Jobs Discussion"
  },

  type: {
    type: String,
    enum: ["career", "job_match", "interview", "general"],
    default: "general"
  },

  lastMessageAt: {
    type: Date
  }

}, { timestamps: true });

export const Chat = mongoose.model("Chat", ChatSchema);
