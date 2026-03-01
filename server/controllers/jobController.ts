import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Job } from '../models/Job';
import { User } from '../models/User';
import { EmployerProfile } from '../models/EmployerProfile';

export const getJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await Job.find().sort({ postedDate: -1 });
    res.json(jobs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createJob = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    let user;

    // Check if userId is a valid ObjectId or email
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    } else {
      user = await User.findOne({ email: userId });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Accept job data directly or wrapped in { job: ... }
    const jobData = req.body.job || req.body;

    const newJob = new Job({
      ...jobData,
      postedBy: user._id
    });
    await newJob.save();
    res.status(201).json(newJob);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getEmployerJobs = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const jobs = await Job.find({ postedBy: userId }).sort({ postedDate: -1 });
    res.json(jobs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const rawJobId = req.params.jobId;
    const jobId = Array.isArray(rawJobId) ? rawJobId[0] : rawJobId;

    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }

    const job = await Job.findById(jobId).populate('postedBy', 'name email role');
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const postedById =
      job.postedBy && typeof job.postedBy === 'object' && '_id' in (job.postedBy as any)
        ? (job.postedBy as any)._id
        : job.postedBy;
    const employerProfile = await EmployerProfile.findOne({ employer: postedById }).lean();

    res.json({
      job,
      employerProfile: employerProfile || null,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const job = await Job.findByIdAndUpdate(id, updates, { new: true });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const job = await Job.findByIdAndDelete(id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ message: 'Job deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
