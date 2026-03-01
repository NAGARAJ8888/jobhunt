import express from 'express';
import multer from 'multer';
import {
  submitApplication,
  getUserApplications,
  getEmployerApplications,
  getJobApplications,
  updateApplicationStatus,
} from '../controllers/applicationController';

const router = express.Router();

// Configure multer for parsing multipart/form-data
const upload = multer();

router.post('/apply', upload.none(), submitApplication);
router.get('/user/:userId', getUserApplications);
router.get('/employer/:userId', getEmployerApplications);
router.get('/job/:jobId', getJobApplications);
router.patch('/:applicationId/status', express.json(), updateApplicationStatus);

export default router;
