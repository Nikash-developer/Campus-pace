import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User';
import Assignment from './models/Assignment';
import Submission from './models/Submission';
import Notice from './models/Notice';
import QuestionPaper from './models/QuestionPaper';
import fs from 'fs';
import path from 'path';

dotenv.config();

export const seedDB = async () => {
    try {
        // Check if users already exist
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            console.log('Seeding initial MongoDB users...');

            const adminPass = await bcrypt.hash('admin123', 10);
            const facultyPass = await bcrypt.hash('faculty123', 10);
            const studentPass = await bcrypt.hash('student123', 10);

            await User.create([
                {
                    name: 'System Admin',
                    email: 'admin@greensync.edu',
                    password: adminPass,
                    role: 'admin',
                    department: 'Administration'
                },
                {
                    name: 'Dr. Sarah Jenkins',
                    email: 'faculty@greensync.edu',
                    password: facultyPass,
                    role: 'faculty',
                    department: 'Engineering'
                },
                {
                    name: 'Alice Johnson',
                    email: 'student@greensync.edu',
                    password: studentPass,
                    role: 'student',
                    department: 'Engineering',
                    eco_stats: {
                        total_pages_saved: 120,
                        total_water_saved: 194.4,
                        total_co2_prevented: 0.54
                    }
                }
            ]);

            console.log('Users seeded successfully.');
        } else {
            console.log('Users already exist, skipping user seed.');
        }

        const paperCount = await QuestionPaper.countDocuments();
        if (paperCount === 0) {
            console.log('Seeding question papers...');
            const seedFilePath = path.join(process.cwd(), 'server', 'data', 'questionPapers.json');
            if (fs.existsSync(seedFilePath)) {
                const papers = JSON.parse(fs.readFileSync(seedFilePath, 'utf-8'));
                // map to QuestionPaper schema format: subject, year, semester, examType, fileUrl
                const docs = papers.map((p: any) => ({
                    subject: p.subject,
                    year: p.year,
                    semester: p.semester,
                    examType: p.examType,
                    fileUrl: p.url
                }));
                await QuestionPaper.insertMany(docs);
                console.log(`Seeded ${docs.length} question papers successfully.`);
            } else {
                console.log('Question paper seed file not found.');
            }
        } else {
            console.log('Question papers already exist, skipping seed.');
        }
    } catch (err) {
        console.error('Seeding error:', err);
    }
};
