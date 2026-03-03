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

export default mongoose.model('QuestionPaper', questionPaperSchema);
