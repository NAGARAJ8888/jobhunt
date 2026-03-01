import mongoose from "mongoose";

const AISessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat"
  },

  lastExtractedSkills: [String],

  lastSuggestedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job"
  }],

  conversationState: {
    type: String // "suggesting_jobs", "improving_resume", etc.
  }

}, { timestamps: true });

export const AISession = mongoose.model("AISession", AISessionSchema);