import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    file_url: { type: String, required: true },
    page_count: { type: Number, default: 0 },
    plagiarism_score: { type: Number, default: 0 },
    grading_rubric_scores: { type: Map, of: Number },
    feedback_text: { type: String, default: "" },
    status: { type: String, enum: ['Submitted', 'Graded'], default: 'Submitted' },
    eco_impact: {
        pages: { type: Number, default: 0 },
        water_saved: { type: Number, default: 0 },
        co2_prevented: { type: Number, default: 0 }
    },
    submission_timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Submission', submissionSchema);
