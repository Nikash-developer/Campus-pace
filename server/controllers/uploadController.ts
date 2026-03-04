import multer from 'multer';
import Submission from '../models/Submission';
import User from '../models/User';
import { calculateImpact } from '../utils/ecoEngine';
import * as pdf from 'pdf-parse';
import path from 'path';
import fs from 'fs';

const storage = multer.memoryStorage();
export const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } }); // 25MB

export const uploadFile = async (req: any, res: any) => {
    try {
        const { assignment_id } = req.body;
        const file = req.file;
        if (!file) return res.status(400).json({ error: 'No file uploaded' });

        let pageCount = 1;
        if (file.mimetype === 'application/pdf') {
            try {
                const pdfParser = (pdf as any).default || pdf;
                const data = await pdfParser(file.buffer);
                pageCount = data.numpages || 1;
            } catch (err) {
                console.error("PDF Parse error, falling back to 1 page:", err);
                pageCount = 1;
            }
        }

        // Handle File saving (Local for demo, S3 ready)
        const fileName = `submission_${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
        const uploadPath = path.join(process.cwd(), 'uploads', fileName);

        // Ensure uploads directory exists
        if (!fs.existsSync(path.join(process.cwd(), 'uploads'))) {
            fs.mkdirSync(path.join(process.cwd(), 'uploads'));
        }

        fs.writeFileSync(uploadPath, file.buffer);
        const file_url = `/uploads/${fileName}`;

        const eco_update = calculateImpact(pageCount);
        const plagiarism_score = Math.floor(Math.random() * 16); // Simulation logic

        const submission = await Submission.create({
            student_id: req.user._id,
            assignment_id,
            file_url,
            page_count: pageCount,
            plagiarism_score,
            eco_impact: eco_update,
            status: "Submitted"
        });

        await User.findByIdAndUpdate(req.user._id, {
            $inc: {
                'eco_stats.total_pages_saved': eco_update.pages,
                'eco_stats.total_water_saved': eco_update.water_saved,
                'eco_stats.total_co2_prevented': eco_update.co2_prevented
            }
        });

        // Delay to simulate processing 
        setTimeout(() => {
            res.json({ success: true, submission, eco_update, plagiarism_score });
        }, 1000);

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
