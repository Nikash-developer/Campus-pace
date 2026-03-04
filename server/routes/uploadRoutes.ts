import express from 'express';
import { upload, uploadFile } from '../controllers/uploadController';
import { protectRoute, authorizeRole } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', protectRoute, authorizeRole('student'), upload.single('file'), uploadFile);

export default router;
