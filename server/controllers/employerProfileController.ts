import { Request, Response } from "express";
import { EmployerProfile } from "../models/EmployerProfile";

export const createEmployerProfile = async (req: Request, res: Response) => {
  try {
    const { employer, companyName } = req.body;

    if (!employer || !companyName) {
      return res.status(400).json({ error: "Employer and companyName are required" });
    }

    const existingProfile = await EmployerProfile.findOne({ employer });
    if (existingProfile) {
      return res.status(409).json({ error: "Employer profile already exists" });
    }

    const profile = new EmployerProfile(req.body);
    await profile.save();

    res.status(201).json({
      message: "Employer profile created successfully",
      profile,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getAllEmployerProfiles = async (_req: Request, res: Response) => {
  try {
    const profiles = await EmployerProfile.find()
      .populate("employer", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({ profiles });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getEmployerProfileById = async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;

    if (!profileId) {
      return res.status(400).json({ error: "Profile ID is required" });
    }

    const profile = await EmployerProfile.findById(profileId).populate(
      "employer",
      "name email role"
    );

    if (!profile) {
      return res.status(404).json({ error: "Employer profile not found" });
    }

    res.status(200).json({ profile });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getEmployerProfileByEmployerId = async (req: Request, res: Response) => {
  try {
    const { employerId } = req.params;

    if (!employerId) {
      return res.status(400).json({ error: "Employer ID is required" });
    }

    const profile = await EmployerProfile.findOne({ employer: employerId }).populate(
      "employer",
      "name email role"
    );

    if (!profile) {
      return res.status(404).json({ error: "Employer profile not found" });
    }

    res.status(200).json({ profile });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const updateEmployerProfile = async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;
    const updates = req.body;

    if (!profileId) {
      return res.status(400).json({ error: "Profile ID is required" });
    }

    if ("employer" in updates) {
      delete updates.employer;
    }

    const profile = await EmployerProfile.findByIdAndUpdate(profileId, updates, {
      new: true,
      runValidators: true,
    }).populate("employer", "name email role");

    if (!profile) {
      return res.status(404).json({ error: "Employer profile not found" });
    }

    res.status(200).json({
      message: "Employer profile updated successfully",
      profile,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteEmployerProfile = async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;

    if (!profileId) {
      return res.status(400).json({ error: "Profile ID is required" });
    }

    const deletedProfile = await EmployerProfile.findByIdAndDelete(profileId);

    if (!deletedProfile) {
      return res.status(404).json({ error: "Employer profile not found" });
    }

    res.status(200).json({ message: "Employer profile deleted successfully" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
