// Campus Pace - Stable Upload & Sync Update - 2026-04-11
import { Request, Response } from 'express';
import { supabase } from '../../src/lib/supabase';
import { refreshAnalyticsCache } from '../utils/attendanceAnalytics';

export const getFacultyMappings = async (req: Request, res: Response) => {
  try {
    const { facultyId } = req.params;
    const { data, error } = await supabase
      .from('subject_class_mapping')
      .select('*')
      .eq('faculty_id', facultyId);

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const markAttendance = async (req: Request, res: Response) => {
  try {
    const { mappingId, lectureDate, topic, attendance, facultyId } = req.body;

    // 1. Create lecture record
    const { data: lecture, error: lectureError } = await supabase
      .from('lectures_conducted')
      .insert({
        mapping_id: mappingId,
        faculty_id: facultyId,
        lecture_date: lectureDate,
        topic: topic
      })
      .select()
      .single();

    if (lectureError) throw lectureError;

    // 2. Insert attendance records
    const attendanceData = attendance.map((att: any) => ({
      lecture_id: lecture.id,
      student_id: att.studentId,
      status: att.status
    }));

    const { error: attError } = await supabase
      .from('attendance_records')
      .insert(attendanceData);

    if (attError) throw attError;

    // 3. Trigger cache refresh for all students in this class
    // In a real app, this would be a background job
    const refreshPromises = attendance.map((att: any) => 
      refreshAnalyticsCache(att.studentId, mappingId)
    );
    await Promise.all(refreshPromises);

    res.json({ message: 'Attendance marked and analytics updated.', lectureId: lecture.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getStudentSummary = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    
    const { data: analytics, error } = await supabase
      .from('attendance_analytics_cache')
      .select(`
        *,
        subject_class_mapping (
          subject_name,
          total_lectures_planned
        )
      `)
      .eq('student_id', studentId);

    if (error) throw error;

    const overall = analytics.length > 0 
      ? analytics.reduce((acc, curr) => acc + curr.attendance_percentage, 0) / analytics.length 
      : 0;

    res.json({
      overall_percentage: overall,
      subjects: analytics.map(a => ({
        id: a.mapping_id,
        name: a.subject_class_mapping.subject_name,
        percentage: a.attendance_percentage,
        risk: a.risk_level,
        lectures_attended: a.lectures_attended,
        total_conducted: a.total_lectures_conducted,
        lectures_needed: a.lectures_needed_for_75
      }))
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDefaulters = async (req: Request, res: Response) => {
  try {
    const { mappingId } = req.params;
    const { data, error } = await supabase
      .from('attendance_analytics_cache')
      .select(`
        *,
        auth_users:student_id (
          name,
          email,
          avatar
        )
      `)
      .eq('mapping_id', mappingId)
      .in('risk_level', ['warning', 'critical'])
      .order('attendance_percentage', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
