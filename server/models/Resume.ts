import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  originalFileName: String,

  fileUrl: String, // stored in cloud

  extractedText: String,

  extractedSkills: [String],

  experienceYears: Number,

  education: [{
    degree: String,
    field: String,
    institution: String
  }],

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

export const Resume = mongoose.model("Resume", ResumeSchema);