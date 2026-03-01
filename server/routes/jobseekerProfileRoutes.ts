import express from "express";
import {
  createJobseekerProfile,
  getAllJobseekerProfiles,
  getJobseekerProfileById,
  getJobseekerProfileByUserId,
  updateJobseekerProfile,
  deleteJobseekerProfile,
} from "../controllers/jobseekerProfileController";

const router = express.Router();

router.post("/", createJobseekerProfile);
router.get("/", getAllJobseekerProfiles);
router.get("/user/:userId", getJobseekerProfileByUserId);
router.get("/:profileId", getJobseekerProfileById);
router.put("/:profileId", updateJobseekerProfile);
router.delete("/:profileId", deleteJobseekerProfile);

export default router;
