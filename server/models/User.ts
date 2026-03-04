import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'faculty', 'admin', 'hod'], required: true, lowercase: true },
    department: { type: String },
    avatar: { type: String },
    eco_stats: {
        total_pages_saved: { type: Number, default: 0 },
        total_water_saved: { type: Number, default: 0 },
        total_co2_prevented: { type: Number, default: 0 },
    },
    eco_level: { type: Number, default: 1 }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
