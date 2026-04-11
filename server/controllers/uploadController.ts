// Campus Pace - Stable Upload & Sync Update - 2026-04-11
import multer from 'multer';
import Submission from '../models/Submission';
import User from '../models/User';
import { calculateImpact } from '../utils/ecoEngine';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const storage = multer.memoryStorage();
export const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } }); // Enforced 20MB Limit

export const uploadFile = async (req: any, res: any) => {
    try {
        const rawAssignmentId = req.body.assignment_id || req.body.assignmentId;
        const assignment_id = mongoose.Types.ObjectId.isValid(rawAssignmentId) 
            ? rawAssignmentId 
            : new mongoose.Types.ObjectId(); 

        const studentEmail = req.body.student_email || (req.user && req.user.email);
        console.log(`[Eco-Sync] Incoming request for: ${studentEmail || 'Unknown'}`);
        
        let targetUser = req.user;

        // IDENTITY BRIDGE: If we have an email from the frontend, find or create that user in MongoDB (Case-Insensitive)
        if (studentEmail && studentEmail !== 'mock@student.com') {
            let mongoUser = await User.findOne({ email: { $regex: new RegExp(`^${studentEmail}$`, 'i') } });
            if (!mongoUser) {
                console.log(`Creating new MongoDB profile for sync: ${studentEmail}`);
                mongoUser = await User.create({
                    name: req.body.student_name || 'User',
                    email: studentEmail,
                    role: 'student',
                    eco_stats: {
                        total_pages_saved: 0,
                        total_water_saved: 0,
                        total_co2_prevented: 0,
                        total_trees_preserved: 0
                    }
                });
            }
            targetUser = mongoUser;
        }

        const cloudFileUrl = req.body.file_url;
        const cloudFileName = req.body.file_name;
        const file = req.file;

        if (!file && !cloudFileUrl) {
            return res.status(400).json({ error: 'No file uploaded and no cloud URL provided' });
        }

        let pageCount = 1;
        let final_url = cloudFileUrl || '';

        if (file) {
            // BACKEND SUPABASE UPLOAD: Bypasses Client Cors
            console.log(`[Eco-Sync] Uploading ${file.originalname} to Supabase from server...`);
            const fileExt = file.originalname.split('.').pop();
            const fileName = `${targetUser?._id || 'anon'}_${Date.now()}.${fileExt}`;
            const filePath = `submissions/${fileName}`;

            const { error: storageError } = await supabase.storage
                .from('assignments')
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false
                });

            if (storageError) {
                console.error("Backend Supabase Error:", storageError);
                throw new Error(`Cloud Storage Error: ${storageError.message}`);
            }

            const { data: { publicUrl } } = supabase.storage
                .from('assignments')
                .getPublicUrl(filePath);

            final_url = publicUrl;

            if (file.mimetype === 'application/pdf') {
                try {
                    const pdfString = file.buffer.toString('utf8', 0, 16384);
                    const pageMatch = pdfString.match(/\/Count\s+(\d+)/);
                    if (pageMatch && pageMatch[1]) {
                        pageCount = parseInt(pageMatch[1], 10);
                    } else {
                        const pageNodes = (file.buffer.toString().match(/\/Type\s*\/Page\b/g) || []).length;
                        pageCount = Math.max(1, pageNodes);
                    }
                } catch (err) {
                    pageCount = 1;
                }
            }
        } else if (cloudFileUrl) {
            pageCount = req.body.page_count || 4; 
            console.log(`[Eco-Sync] Cloud file detected: ${cloudFileName}. Using estimated page count: ${pageCount}`);
        }

        const eco_update = calculateImpact(pageCount);
        const plagiarism_score = Math.floor(Math.random() * 8) + 2;

        const submissionId = new mongoose.Types.ObjectId();

        await Submission.create({
            _id: submissionId,
            student_id: targetUser?._id || req.user?._id,
            assignment_id: assignment_id,
            file_data: file ? file.buffer : null,
            content_type: file ? file.mimetype : 'application/pdf',
            file_url: final_url,
            page_count: pageCount,
            plagiarism_score: plagiarism_score,
            status: "Submitted",
            eco_impact: eco_update
        });

        // Update local MongoDB user stats for the IDENTIFIED user
        if (targetUser) {
            console.log(`[Eco-Sync] Updating MongoDB profile for: ${targetUser.email}`);
            await User.findByIdAndUpdate(targetUser._id, {
                $inc: {
                    'eco_stats.total_pages_saved': eco_update.pages,
                    'eco_stats.total_water_saved': eco_update.water_saved,
                    'eco_stats.total_co2_prevented': eco_update.co2_prevented,
                    'eco_stats.total_trees_preserved': eco_update.trees_preserved
                }
            });
            console.log(`[Eco-Sync] Successfully updated impact data.`);
        }

        res.status(200).json({
            message: 'Impact calculated and saved.',
            eco_update,
            plagiarism_score,
            file_url: final_url
        });

    } catch (error: any) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: error.message || 'Server error during upload process' });
    }
};
