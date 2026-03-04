import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    course: { type: String },
    description: { type: String },
    deadline: { type: Date },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    target_department: { type: String }
}, { timestamps: true });

export default mongoose.model('Assignment', assignmentSchema);
