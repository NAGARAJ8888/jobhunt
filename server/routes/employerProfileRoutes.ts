import express from "express";
import {
  createEmployerProfile,
  getAllEmployerProfiles,
  getEmployerProfileById,
  getEmployerProfileByEmployerId,
  updateEmployerProfile,
  deleteEmployerProfile,
} from "../controllers/employerProfileController";

const router = express.Router();

router.post("/", createEmployerProfile);
router.get("/", getAllEmployerProfiles);
router.get("/employer/:employerId", getEmployerProfileByEmployerId);
router.get("/:profileId", getEmployerProfileById);
router.put("/:profileId", updateEmployerProfile);
router.delete("/:profileId", deleteEmployerProfile);

export default router;
