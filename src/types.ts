// Campus Pace - Stable Upload & Sync Update - 2026-04-11
export interface User {
  id: string | number;
  email: string;
  role: 'student' | 'faculty' | 'hod' | 'admin';
  name: string;
  department: string;
  avatar?: string;
  eco_stats?: {
    total_pages_saved: number;
    total_water_saved: number;
    total_co2_prevented: number;
    total_trees_preserved: number;
  };
  eco_level?: number;
}

export interface Assignment {
  id: string | number;
  title: string;
  description: string;
  long_description?: string;
  topic?: string;
  tags?: string[];
  subject: string;
  deadline: string;
  max_marks: number;
  faculty_id: string | number;
  department: string;
  status?: 'pending' | 'in-progress' | 'submitted';
}

export interface Submission {
  id: string | number;
  assignment_id: string | number;
  student_id: string | number;
  file_url: string;
  submission_date: string;
  grade?: number;
  feedback?: string;
  plagiarism_score: number;
  student_name?: string;
  student_avatar?: string;
}

export interface Notice {
  id: string | number;
  title: string;
  content: string;
  attachment_url?: string;
  target_department: string;
  publish_date: string;
  expiry_date?: string;
  is_emergency: boolean;
  author_id: string | number;
  author_name?: string;
  image_url?: string;
}

export interface AttendanceMapping {
  id: string;
  faculty_id: string;
  department: string;
  year: string;
  division: string;
  subject_name: string;
  total_lectures_planned: number;
}

export interface AttendanceAnalytics {
  student_id: string;
  mapping_id: string;
  total_lectures_conducted: number;
  lectures_attended: number;
  attendance_percentage: number;
  lectures_needed_for_75: number;
  risk_level: 'excellent' | 'safe' | 'warning' | 'critical';
  last_updated: string;
  subject_class_mapping?: {
    subject_name: string;
    total_lectures_planned: number;
  };
}
