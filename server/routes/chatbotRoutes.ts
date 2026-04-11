// Campus Pace - Stable Upload & Sync Update - 2026-04-11
import express from 'express';
import { handleChatOptions } from '../controllers/chatbotController';
import { protectRoute } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', protectRoute, handleChatOptions);

export default router;
