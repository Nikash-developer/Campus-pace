// Campus Pace - Stable Upload & Sync Update - 2026-04-11
import express from 'express';
import { getNotices, createNotice, markRead } from '../controllers/noticeController';
import { protectRoute, authorizeRole } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/')
    .get(protectRoute, getNotices)
    .post(protectRoute, authorizeRole('faculty', 'admin'), createNotice);

router.post('/:id/read', protectRoute, markRead);

export default router;
