import express from 'express';
import { getAssignments, createAssignment, updateAssignment, getSubmissions } from '../controllers/assignmentController';
import { protectRoute, authorizeRole } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/')
    .get(protectRoute, getAssignments)
    .post(protectRoute, authorizeRole('faculty', 'admin'), createAssignment);

router.route('/:id')
    .put(protectRoute, authorizeRole('faculty', 'admin'), updateAssignment);

router.get('/:id/submissions', protectRoute, authorizeRole('faculty', 'admin'), getSubmissions);

export default router;
