import { Request, Response } from 'express';
import { Application } from '../models/Application';
import { User } from '../models/User';
import { Job } from '../models/Job';

export const submitApplication = async (req: Request, res: Response) => {
  try {
    const { jobId, fullName, email, phone, coverLetter, userId, resumeUrl } = req.body;

    // Validate required fields
    if (!jobId || !fullName || !email || !phone || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Create new application with Cloudinary resume URL
    const newApplication = new Application({
      job: jobId,
      applicant: userId,
      fullName,
      email,
      phone,
      coverLetter,
      resume: resumeUrl || '',
    });

    await newApplication.save();

    res.status(201).json({ message: 'Application submitted successfully', application: newApplication });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getUserApplications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Find all applications by this user and populate job details
    const applications = await Application.find({ applicant: userId })
      .populate('job')
      .sort({ createdAt: -1 });

    res.status(200).json({ applications });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getEmployerApplications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Find all jobs posted by this employer
    const jobs = await Job.find({ postedBy: userId });
    const jobIds = jobs.map((job) => job._id);

    // Find all applications for these jobs and populate applicant details
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('job')
      .populate('applicant', 'name email')
      .sort({ appliedAt: -1 });

    res.status(200).json({ applications });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const getJobApplications = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Find all applications for this specific job and populate applicant details
    const applications = await Application.find({ job: jobId })
      .populate('job')
      .populate('applicant', 'name email')
      .sort({ appliedAt: -1 });

    res.status(200).json({ applications });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body as { status?: string };

    const allowedStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];

    if (!applicationId) {
      return res.status(400).json({ error: 'Application ID is required' });
    }

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true }
    )
      .populate('job')
      .populate('applicant', 'name email');

    if (!updatedApplication) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.status(200).json({
      message: 'Application status updated successfully',
      application: updatedApplication,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
