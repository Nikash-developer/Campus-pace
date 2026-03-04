import express from 'express';
import { gradeSubmission } from '../controllers/assignmentController';
import { protectRoute, authorizeRole } from '../middlewares/authMiddleware';

const router = express.Router();

router.put('/:id/grade', protectRoute, authorizeRole('faculty', 'admin'), gradeSubmission);

export default router;
