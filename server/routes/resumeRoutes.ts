import express from "express";
import {
  parseResumePreview,
  uploadOrUpdateResume,
  getActiveResumeByUser,
  getResumesByUser,
} from "../controllers/resumeController.js";

const router = express.Router();

router.post("/parse", parseResumePreview);
router.post("/", uploadOrUpdateResume);
router.get("/user/:userId/active", getActiveResumeByUser);
router.get("/user/:userId", getResumesByUser);

export default router;
