// Campus Pace - Ultimate Force Update - 2026-04-11
// Campus Pace - Global Synchronization & Stabilization Update - 2026-04-11
// Campus Pace - Stable Upload & Sync Update - 2026-04-11
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import QuestionPaper from '../models/QuestionPaper';

// Configure multer for memory storage (best for Vercel/Cloud)
const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024 } // 15MB max for MongoDB document
});

export const uploadPaper = async (req: any, res: any) => {
    try {
        const { subject, year, semester, examType, file_url } = req.body;
        const file = req.file;

        if (!file && !file_url) {
            return res.status(400).json({ error: 'No file or cloud URL provided' });
        }

        const newPaper = await QuestionPaper.create({
            subject,
            year,
            semester,
            examType,
            fileData: file ? file.buffer : null,
            contentType: file ? file.mimetype : 'application/pdf',
            fileUrl: file_url || '' 
        });

        res.status(201).json({
            id: newPaper._id,
            subject: newPaper.subject,
            year: newPaper.year,
            semester: newPaper.semester,
            type: newPaper.examType,
            url: `/api/question-papers/download/${newPaper._id}`
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const downloadPaper = async (req: any, res: any) => {
    try {
        const paper = await (QuestionPaper as any).findById(req.params.id);
        if (!paper || !paper.fileData) {
            return res.status(404).json({ error: 'File not found' });
        }
        res.set('Content-Type', paper.contentType || 'application/pdf');
        res.send(paper.fileData);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getPapers = async (req: any, res: any) => {
    try {
        const papers = await QuestionPaper.find().sort({ createdAt: -1 }).lean();

        // Map database fields back to frontend expected fields
        const formatted = papers.map((p: any) => ({
            id: p._id,
            subject: p.subject,
            year: p.year,
            semester: p.semester,
            type: p.examType,
            url: p.fileData ? `/api/question-papers/download/${p._id}` : p.fileUrl
        }));

        res.json(formatted);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
