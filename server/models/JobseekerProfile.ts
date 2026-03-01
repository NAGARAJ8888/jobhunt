import mongoose from "mongoose";

const JobSeekerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  // Basic Info
  headline: String,
  bio: String,
  phone: String,
  location: String,
  profileImage: String,
  resume: String,

  // Skills
  skills: [String],

  // Work Experience
  experience: [
    {
      company: String,
      position: String,
      employmentType: {
        type: String,
        enum: ["Full-time", "Part-time", "Internship", "Freelance"],
      },
      startDate: Date,
      endDate: Date,
      currentlyWorking: Boolean,
      description: String,
      location: String,
    },
  ],

  // Internships (separate for filtering freshers)
  internships: [
    {
      company: String,
      role: String,
      duration: String,
      startDate: Date,
      endDate: Date,
      description: String,
      certificateUrl: String,
    },
  ],

  // Education
  education: [
    {
      institution: String,
      degree: String,
      fieldOfStudy: String,
      startYear: Number,
      endYear: Number,
      grade: String,
    },
  ],

  // Projects
  projects: [
    {
      title: String,
      description: String,
      technologies: [String],
      githubLink: String,
      liveLink: String,
      startDate: Date,
      endDate: Date,
    },
  ],

  // Certifications
  certifications: [
    {
      title: String,
      issuingOrganization: String,
      issueDate: Date,
      expiryDate: Date,
      credentialId: String,
      credentialUrl: String,
    },
  ],

  // Achievements
  achievements: [
    {
      title: String,
      description: String,
      date: Date,
    },
  ],

  // Languages Known
  languages: [
    {
      language: String,
      proficiency: {
        type: String,
        enum: ["Basic", "Conversational", "Fluent", "Native"],
      },
    },
  ],

  // Social Links
  socialLinks: {
    linkedin: String,
    github: String,
    portfolio: String,
    twitter: String,
  },

  // Job Preferences
  jobPreferences: {
    preferredRole: String,
    preferredLocation: String,
    expectedSalary: Number,
    jobType: {
      type: String,
      enum: ["Remote", "Onsite", "Hybrid"],
    },
    availability: {
      type: String,
      enum: ["Immediate", "15 Days", "1 Month", "2+ Months"],
    },
  },

  // Profile Completion Score (for gamification)
  profileStrength: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const JobSeeker = mongoose.model("JobSeeker", JobSeekerSchema);