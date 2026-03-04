import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('green_sync.db');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'faculty', 'hod', 'admin')),
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    avatar TEXT
  );

  CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL,
    deadline DATETIME NOT NULL,
    max_marks INTEGER NOT NULL,
    faculty_id INTEGER NOT NULL,
    department TEXT NOT NULL,
    FOREIGN KEY(faculty_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assignment_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    grade INTEGER,
    feedback TEXT,
    plagiarism_score INTEGER DEFAULT 0,
    FOREIGN KEY(assignment_id) REFERENCES assignments(id),
    FOREIGN KEY(student_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS notices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    attachment_url TEXT,
    target_department TEXT NOT NULL, -- 'all' or specific department
    publish_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    expiry_date DATETIME,
    is_emergency INTEGER DEFAULT 0,
    author_id INTEGER NOT NULL,
    FOREIGN KEY(author_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS impact_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    department TEXT NOT NULL,
    pages_saved INTEGER DEFAULT 0,
    date DATE DEFAULT (DATE('now'))
  );
`);

// Seed some initial data if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
  // Password is 'password123' hashed (simulated for now, normally use bcrypt)
  // For demo purposes, we'll use plain text or a simple hash if we don't want to wait for bcrypt in seed
  const insertUser = db.prepare('INSERT INTO users (email, password, role, name, department) VALUES (?, ?, ?, ?, ?)');
  insertUser.run('admin@greensync.edu', 'admin123', 'admin', 'System Admin', 'Administration');
  insertUser.run('faculty@greensync.edu', 'faculty123', 'faculty', 'Dr. Sarah Jenkins', 'Engineering');
  insertUser.run('student@greensync.edu', 'student123', 'student', 'Alice Johnson', 'Engineering');
  
  const insertImpact = db.prepare('INSERT INTO impact_stats (department, pages_saved, date) VALUES (?, ?, ?)');
  insertImpact.run('Engineering', 1200, '2024-10-24');
  insertImpact.run('Law', 450, '2024-10-23');
  insertImpact.run('Arts & Design', 320, '2024-10-22');
}

export default db;
