// Campus Pace - Stable Upload & Sync Update - 2026-04-11
import express from 'express';
import { gradeSubmission } from '../controllers/assignmentController';
import { protectRoute, authorizeRole } from '../middlewares/authMiddleware';
import { getSubmissionsByAssignment, downloadSubmission } from '../controllers/submissionController';

const router = express.Router();

router.get('/assignment/:assignmentId', protectRoute, authorizeRole('faculty', 'admin', 'student'), getSubmissionsByAssignment);
router.get('/download/:id', downloadSubmission); // Public-ish download link for easier browser access
router.put('/:id/grade', protectRoute, authorizeRole('faculty', 'admin'), gradeSubmission);

export default router;
