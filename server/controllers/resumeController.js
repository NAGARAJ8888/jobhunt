import mongoose from "mongoose";
import { Resume } from "../models/Resume.ts";
import parseResumeWithAI from "../services/aiResumeParser.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const parseResumePreview = async (req, res) => {
  try {
    console.log("Parsing resume text with AI...");
    const text = String(req.body?.text || "");
    if (!text.trim()) {
      return res.status(400).json({ error: "Resume text is required" });
    }

    console.log("Calling AI resume parser...");
    const parsed = await parseResumeWithAI(text);
    console.log("Parse result:", parsed);
    return res.status(200).json({ parsed });
  } catch (error) {
    console.error("Error parsing resume:", error);
    return res.status(500).json({ error: error.message || "Failed to parse resume text" });
  }
};

export const uploadOrUpdateResume = async (req, res) => {
  try {
    const {
      userId,
      originalFileName,
      fileUrl,
      extractedText,
      isActive = true,
    } = req.body || {};

    if (!userId || !isValidObjectId(userId)) {
      return res.status(400).json({ error: "Valid userId is required" });
    }

    const text = String(extractedText || "");
    const parsed = await parseResumeWithAI(text);

    if (isActive) {
      await Resume.updateMany({ user: userId }, { $set: { isActive: false } });
    }

    const resume = await Resume.create({
      user: userId,
      originalFileName: originalFileName || "",
      fileUrl: fileUrl || "",
      extractedText: parsed.extractedText || text,
      extractedSkills: parsed.skills || [],
      experienceYears: parsed.experienceYears,
      education: parsed.education || [],
      isActive: Boolean(isActive),
    });

    return res.status(201).json({
      message: "Resume saved successfully",
      resume,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to save resume" });
  }
};

export const getActiveResumeByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || !isValidObjectId(userId)) {
      return res.status(400).json({ error: "Valid userId is required" });
    }

    const resume = await Resume.findOne({ user: userId, isActive: true }).sort({ updatedAt: -1 });
    if (!resume) {
      return res.status(404).json({ error: "Active resume not found" });
    }

    return res.status(200).json({ resume });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to fetch active resume" });
  }
};

export const getResumesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || !isValidObjectId(userId)) {
      return res.status(400).json({ error: "Valid userId is required" });
    }

    const resumes = await Resume.find({ user: userId }).sort({ createdAt: -1 });
    return res.status(200).json({ resumes });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to fetch resumes" });
  }
};
