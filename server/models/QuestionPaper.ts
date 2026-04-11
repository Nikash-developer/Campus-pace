// Campus Pace - Stable Upload & Sync Update - 2026-04-11
import mongoose from 'mongoose';

const questionPaperSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    year: { type: String, required: true },
    semester: { type: String, required: true },
    examType: { type: String, required: true },
    fileUrl: { type: String }, // Optional if using fileData
    fileData: { type: Buffer }, // Store small files directly for Vercel
    contentType: { type: String }
}, { timestamps: true });

export default mongoose.models.QuestionPaper || mongoose.model('QuestionPaper', questionPaperSchema);
