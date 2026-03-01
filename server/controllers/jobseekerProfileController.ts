import { Request, Response } from "express";
import { JobSeeker } from "../models/JobseekerProfile";

export const createJobseekerProfile = async (req: Request, res: Response) => {
  try {
    const { user } = req.body;

    if (!user) {
      return res.status(400).json({ error: "User is required" });
    }

    const existingProfile = await JobSeeker.findOne({ user });
    if (existingProfile) {
      return res.status(409).json({ error: "Jobseeker profile already exists" });
    }

    const profile = new JobSeeker(req.body);
    await profile.save();

    res.status(201).json({
      message: "Jobseeker profile created successfully",
      profile,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getAllJobseekerProfiles = async (_req: Request, res: Response) => {
  try {
    const profiles = await JobSeeker.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({ profiles });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getJobseekerProfileById = async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;

    if (!profileId) {
      return res.status(400).json({ error: "Profile ID is required" });
    }

    const profile = await JobSeeker.findById(profileId).populate("user", "name email role");

    if (!profile) {
      return res.status(404).json({ error: "Jobseeker profile not found" });
    }

    res.status(200).json({ profile });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getJobseekerProfileByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const profile = await JobSeeker.findOne({ user: userId }).populate("user", "name email role");

    if (!profile) {
      return res.status(404).json({ error: "Jobseeker profile not found" });
    }

    res.status(200).json({ profile });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const updateJobseekerProfile = async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;
    const updates = req.body;

    if (!profileId) {
      return res.status(400).json({ error: "Profile ID is required" });
    }

    if ("user" in updates) {
      delete updates.user;
    }

    const profile = await JobSeeker.findByIdAndUpdate(profileId, updates, {
      new: true,
      runValidators: true,
    }).populate("user", "name email role");

    if (!profile) {
      return res.status(404).json({ error: "Jobseeker profile not found" });
    }

    res.status(200).json({
      message: "Jobseeker profile updated successfully",
      profile,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteJobseekerProfile = async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;

    if (!profileId) {
      return res.status(400).json({ error: "Profile ID is required" });
    }

    const deletedProfile = await JobSeeker.findByIdAndDelete(profileId);

    if (!deletedProfile) {
      return res.status(404).json({ error: "Jobseeker profile not found" });
    }

    res.status(200).json({ message: "Jobseeker profile deleted successfully" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
