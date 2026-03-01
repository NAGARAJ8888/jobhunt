import express from 'express';
import { getJobs, createJob, getEmployerJobs, getJobById, updateJob, deleteJob } from '../controllers/jobController';

const router = express.Router();

router.get('/', getJobs);
router.get('/employer/:userId', getEmployerJobs);
router.get('/:jobId', getJobById);
router.post('/', createJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);

export default router;
