// Campus Pace - Stable Upload & Sync Update - 2026-04-11
import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    urgency_level: { type: String, enum: ['Low', 'Medium', 'Emergency'], default: 'Low' },
    target_audience: { type: String },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    read_receipts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export default mongoose.models.Notice || mongoose.model('Notice', noticeSchema);
