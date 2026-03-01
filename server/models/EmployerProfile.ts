import mongoose from "mongoose";

const EmployerProfileSchema = new mongoose.Schema(
  {
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    companyName: { type: String, required: true },
    companyLogo: { type: String },
    industry: { type: String },
    companySize: { type: String },
    website: { type: String },
    location: { type: String },
    aboutCompany: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    linkedIn: { type: String },
    companyBanner: { type: String },
    foundedYear: { type: Number },
  },
  { timestamps: true }
);

export const EmployerProfile = mongoose.model("EmployerProfile", EmployerProfileSchema);
