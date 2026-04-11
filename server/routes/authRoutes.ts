// Campus Pace - Stable Upload & Sync Update - 2026-04-11
import express from 'express';
import { login, signup, getMe, getStatsByEmail } from '../controllers/authController';
import { protectRoute } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protectRoute, getMe);
router.get('/stats/:email', getStatsByEmail);

export default router;
