import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: true
  },

  sender: {
    type: String,
    enum: ["user", "ai"],
    required: true
  },

  content: {
    type: String,
    required: true
  },

  suggestedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job"
  }],

  metadata: {
    tokensUsed: Number,
    responseTime: Number
  }

}, { timestamps: true });

export const Message = mongoose.model("Message", MessageSchema);