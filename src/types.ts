export interface User {
  id: string | number;
  email: string;
  role: 'student' | 'faculty' | 'hod' | 'admin';
  name: string;
  department: string;
  avatar?: string;
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
