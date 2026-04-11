// Campus Pace - Stable Upload & Sync Update - 2026-04-11
import express from 'express';
import { getFacultyMappings, markAttendance, getStudentSummary, getDefaulters } from '../controllers/attendanceController';

const router = express.Router();

// Faculty Routes
router.get('/faculty/mappings/:facultyId', getFacultyMappings);
router.get('/defaulters/:mappingId', getDefaulters);
router.post('/submit', markAttendance);

// Student Routes
router.get('/student/summary/:studentId', getStudentSummary);

export default router;
