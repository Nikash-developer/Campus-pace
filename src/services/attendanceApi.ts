// Campus Pace - Stable Upload & Sync Update - 2026-04-11
import { AttendanceAnalytics, AttendanceMapping } from '../types';

const API_BASE = '/api/attendance';

export const attendanceApi = {
  getFacultyMappings: async (facultyId: string): Promise<AttendanceMapping[]> => {
    const res = await fetch(`${API_BASE}/faculty/${facultyId}`);
    if (!res.ok) throw new Error('Failed to fetch faculty mappings');
    return res.json();
  },

  markAttendance: async (data: {
    mappingId: string;
    lectureDate: string;
    topic: string;
    attendance: { studentId: string; status: 'present' | 'absent' }[];
    facultyId: string;
  }) => {
    const res = await fetch(`${API_BASE}/mark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to mark attendance');
    return res.json();
  },

  getStudentSummary: async (studentId: string): Promise<{ overall_percentage: number; subjects: AttendanceAnalytics[] }> => {
    const res = await fetch(`${API_BASE}/student/summary/${studentId}`);
    if (!res.ok) throw new Error('Failed to fetch student summary');
    return res.json();
  },

  getDefaulters: async (mappingId: string): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/defaulters/${mappingId}`);
    if (!res.ok) throw new Error('Failed to fetch defaulters');
    return res.json();
  }
};
