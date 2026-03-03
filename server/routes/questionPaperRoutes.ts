import express from 'express';
import { upload, uploadPaper, getPapers, downloadPaper } from '../controllers/questionPaperController';

const router = express.Router();

router.get('/question-papers', getPapers);
router.get('/question-papers/download/:id', downloadPaper);
router.post('/upload-paper', upload.single('file'), uploadPaper);

export default router;
