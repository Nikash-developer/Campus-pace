// Campus Pace - Stable Upload & Sync Update - 2026-04-11
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar, Clock, Users, AlertTriangle, CheckCircle2, XCircle,
  ChevronRight, ArrowLeft, Search, Download, Mail, Phone, Eye,
  BookOpen, BarChart3, TrendingUp, TrendingDown, Minus,
  Filter, RefreshCcw, Sparkles, GraduationCap, AlertCircle,
  MapPin, Bell, FileText, Printer, X, Check, UserX, Timer,
  Save, Loader2
} from 'lucide-react';
import { AttendanceMarker } from './AttendanceMarker';
import { DefaulterList } from './DefaulterList';
import Papa from 'papaparse';
import toast from 'react-hot-toast';

interface FacultyAttendancePageProps {
  user: any;
  theme: any;
  themeMode: string;
}

// ---- Mock schedule data ----
const mockSchedule = [
  { id: '1', time: '9:00 AM', subject: 'Data Structures', code: 'CS201', division: 'CSE 3rd Year A', room: 'Room 302', status: 'ongoing', presentCount: 58, totalCount: 60 },
  { id: '2', time: '11:00 AM', subject: 'Algorithms', code: 'CS304', division: 'CSE 3rd Year B', room: 'Room 305', status: 'upcoming', presentCount: 0, totalCount: 58 },
  { id: '3', time: '2:00 PM', subject: 'Database Systems', code: 'CS401', division: 'CSE 4th Year A', room: 'Lab 102', status: 'upcoming', presentCount: 0, totalCount: 55 },
];

const mockAlerts = [
  { subject: 'Data Structures', code: 'CS201', critical: 3, warning: 2 },
  { subject: 'Algorithms', code: 'CS304', critical: 0, warning: 1 },
];

const mockClassHealth = [
  { subject: 'Data Structures', avg: 78, trend: 'down' },
  { subject: 'Algorithms', avg: 92, trend: 'up' },
  { subject: 'Database Systems', avg: 65, trend: 'down' },
];

const mockRecentActivity = [
  { date: 'Apr 10', subject: 'Data Structures', division: 'CSE 3rd A', present: 57, absent: 3 },
  { date: 'Apr 09', subject: 'Algorithms', division: 'CSE 3rd B', present: 58, absent: 2 },
  { date: 'Apr 08', subject: 'Data Structures', division: 'CSE 3rd A', present: 55, absent: 5 },
];

const mockDefaulters = [
  { student_id: 'd1', name: 'Bhavna Patel', rollNo: 'CS20103', pct: 58.3, absCount: 10, needed: 7, trend: -3, possible: true, email: 'b.patel@college.edu' },
  { student_id: 'd2', name: 'Rohan Verma', rollNo: 'CS20119', pct: 54.2, absCount: 11, needed: 9, trend: -5, possible: true, email: 'r.verma@college.edu' },
  { student_id: 'd3', name: 'Vikram Singh', rollNo: 'CS20142', pct: 62.5, absCount: 9, needed: 5, trend: -1, possible: true, email: 'v.singh@college.edu' },
  { student_id: 'd4', name: 'Fatima Sheikh', rollNo: 'CS20107', pct: 71.0, absCount: 7, needed: 2, trend: 2, possible: true, email: 'f.sheikh@college.edu' },
  { student_id: 'd5', name: 'Karan Mehta', rollNo: 'CS20112', pct: 68.2, absCount: 8, needed: 3, trend: -1, possible: true, email: 'k.mehta@college.edu' },
];

const MOCK_MAPPINGS = [
  { id: 'm1', subject_name: 'Data Structures', department: 'Computer Engineering', division: 'Div A' },
  { id: 'm2', subject_name: 'Algorithms', department: 'Computer Engineering', division: 'Div B' },
  { id: 'm3', subject_name: 'Database Systems', department: 'IT', division: 'Div A' },
  { id: 'm4', subject_name: 'Theory of Computation', department: 'Computer Engineering', division: 'Div C' },
  { id: 'm5', subject_name: 'Distributed Systems', department: 'Cloud Computing', division: 'Div A' },
];

const SUBJECT_PASSKEYS: Record<string, string> = {
  'Data Structures': 'DATA123',
  'Algorithms': 'ALGO456',
  'Database Systems': 'DB888',
  'Theory of Computation': 'THEORY9',
  'Distributed Systems': 'CLOUD77',
  'Computer Engineering': 'COMP22',
  'IT': 'IT55',
};

type View = 'dashboard' | 'marking' | 'defaulters' | 'student-detail' | 'analytics' | 'history-detail';

export const FacultyAttendancePage: React.FC<FacultyAttendancePageProps> = ({ user, theme: t, themeMode }) => {
  const [view, setView] = useState<View>('dashboard');
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'critical' | 'warning' | 'safe' | 'excellent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDefaulters, setSelectedDefaulters] = useState<string[]>([]);
  const [attendanceMappings, setAttendanceMappings] = useState<any[]>([]);
  const [markingStudents, setMarkingStudents] = useState<any[]>([]);
  const [wizardStep, setWizardStep] = useState(0); // 0: Subject, 1: Passkey, 2: Class, 3: Marking
  const [selectedWizardSubject, setSelectedWizardSubject] = useState<any>(null);
  const [passkeyInput, setPasskeyInput] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedDiv, setSelectedDiv] = useState('');
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [selectedMapping, setSelectedMapping] = useState<any>(null);
  const [selectedHistory, setSelectedHistory] = useState<any>(null);
  const [historyStudents, setHistoryStudents] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingMappings, setIsLoadingMappings] = useState(false);

  useEffect(() => {
    // Start with mock data so the UI is never empty
    setAttendanceMappings(MOCK_MAPPINGS);

    if (!user?.id) return;
    setIsLoadingMappings(true);
    fetch(`/api/attendance/faculty/mappings/${user.id}`)
      .then(r => r.json())
      .then(d => { 
        if (Array.isArray(d) && d.length > 0) {
          setAttendanceMappings(d); 
        }
      })
      .catch(() => {
        // Keeping MOCK_MAPPINGS on error
      })
      .finally(() => setIsLoadingMappings(false));
  }, [user?.id]);

  const handleStartWizardForMapping = async (mapping: any) => {
    setSelectedMapping(mapping);
    setSelectedWizardSubject(mapping);
    setWizardStep(mapping ? 1 : 0);
    setPasskeyInput('');
    setSelectedBranch('');
    setSelectedYear('');
    setSelectedDiv('');
    setView('marking');

    if (mapping) {
      try {
        const res = await fetch(`/api/attendance/students/${mapping.id}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setMarkingStudents(data);
        } else {
          // Fallback to mock students
          setMarkingStudents(mockDefaulters.map((d, i) => ({ ...d, id: d.student_id })));
        }
      } catch {
        // Fallback to mock students on error
        setMarkingStudents(mockDefaulters.map((d, i) => ({ ...d, id: d.student_id })));
      }
    }
  };

  const handleStartMarking = (mapping: any) => {
    handleStartWizardForMapping(mapping);
  };

  const handleViewDefaulters = async (mapping: any) => {
    setSelectedMapping(mapping);
    setView('defaulters');
    try {
      const res = await fetch(`/api/attendance/defaulters/${mapping.id}`);
      const data = await res.json();
      setDefaulters(Array.isArray(data) ? data : mockDefaulters);
    } catch {
      setDefaulters(mockDefaulters as any);
    }
  };

  const handleViewHistory = async (record: any) => {
    setSelectedHistory(record);
    setView('history-detail');
    setIsLoadingHistory(true);
    // Simulate fetching attendance records for that specific session
    setTimeout(() => {
      setHistoryStudents(mockDefaulters.slice(0, 15).map(d => ({
        ...d,
        status: Math.random() > 0.1 ? 'present' : 'absent'
      })));
      setIsLoadingHistory(false);
    }, 800);
  };

  const filteredDefaulters = mockDefaulters.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterTab === 'critical') return d.pct < 65 && matchesSearch;
    if (filterTab === 'warning') return d.pct >= 65 && d.pct < 75 && matchesSearch;
    if (filterTab === 'safe') return d.pct >= 75 && d.pct <= 85 && matchesSearch;
    if (filterTab === 'excellent') return d.pct > 85 && matchesSearch;
    return matchesSearch;
  });

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const RiskBadge = ({ pct }: { pct: number }) => {
    if (pct < 65) return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-600">Critical</span>;
    if (pct < 75) return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-orange-100 text-orange-600">Warning</span>;
    if (pct <= 85) return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-600">Safe</span>;
    return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-600">Excellent</span>;
  };

  // ===== DASHBOARD VIEW =====
  if (view === 'dashboard') {
    return (
      <motion.div key="att-dash" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-32">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className={`text-4xl font-black ${t.heading}`}>Attendance Center</h1>
            <p className={`${t.muted} font-medium mt-1`}>Manage, track, and analyze student attendance with AI-powered insights.</p>
          </div>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleStartMarking(null)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 transition-all"
            >
              <Sparkles size={20} /> Take Attendance
            </motion.button>
            <div className={`flex items-center gap-3 px-5 py-3 ${t.card} rounded-2xl border ${t.border} shadow-sm`}>
              <Calendar size={18} className="text-primary" />
              <span className={`text-sm font-bold ${t.heading}`}>{today}</span>
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className={`${t.card} rounded-[2rem] border ${t.border} shadow-sm overflow-hidden`}>
          <div className={`p-6 border-b ${t.border} flex items-center gap-3`}>
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <h2 className={`text-lg font-black ${t.heading}`}>Today's Schedule</h2>
              <p className={`text-xs font-bold ${t.muted}`}>{mockSchedule.length} classes scheduled</p>
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {mockSchedule.map((cls, idx) => (
              <motion.div key={cls.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.06 }}
                className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 group hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[80px]">
                    <p className={`text-sm font-black ${t.heading}`}>{cls.time}</p>
                    {cls.status === 'ongoing' && (
                      <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />LIVE
                      </span>
                    )}
                  </div>
                  <div className={`w-px h-12 ${cls.status === 'ongoing' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  <div>
                    <p className={`font-black ${t.heading}`}>{cls.subject} <span className={`text-xs font-bold ${t.muted}`}>({cls.code})</span></p>
                    <p className={`text-xs font-bold ${t.muted} mt-0.5`}>{cls.division}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`flex items-center gap-1 text-[10px] font-bold ${t.muted}`}><MapPin size={11} />{cls.room}</span>
                      {cls.status === 'ongoing' && (
                        <span className={`flex items-center gap-1 text-[10px] font-bold ${t.muted}`}>
                          <Users size={11} />{cls.presentCount}/{cls.totalCount} Present
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {attendanceMappings.length > 0 ? (
                    <motion.button
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => handleStartMarking(attendanceMappings[idx % attendanceMappings.length])}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm text-white shadow-lg transition-all ${cls.status === 'ongoing' ? 'bg-emerald-500 shadow-emerald-500/25' : 'bg-primary shadow-primary/20'}`}
                    >
                      <CheckCircle2 size={16} /> Take Attendance
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => { setSelectedSchedule(cls); setView('marking'); }}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm text-white shadow-lg transition-all ${cls.status === 'ongoing' ? 'bg-emerald-500 shadow-emerald-500/25' : 'bg-primary shadow-primary/20'}`}
                    >
                      <CheckCircle2 size={16} /> Take Attendance
                    </motion.button>
                  )}
                  <button className={`p-2.5 rounded-xl border ${t.border} ${t.muted} hover:bg-slate-100 transition-all`}>
                    <BarChart3 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Alerts + Class Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alerts */}
          <div className={`${t.card} rounded-[2rem] border ${t.border} shadow-sm overflow-hidden`}>
            <div className={`p-6 border-b ${t.border} flex items-center gap-3`}>
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-500 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <h2 className={`text-lg font-black ${t.heading}`}>Attendance Alerts</h2>
            </div>
            <div className="p-4 space-y-3">
              {mockAlerts.map((alert, idx) => (
                <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.07 }}
                  className={`p-4 rounded-2xl ${alert.critical > 0 ? 'bg-red-50 border border-red-100' : 'bg-orange-50 border border-orange-100'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`font-black ${alert.critical > 0 ? 'text-red-900' : 'text-orange-900'} text-sm`}>
                        {alert.subject} <span className="text-[10px] font-bold opacity-60">({alert.code})</span>
                      </p>
                      {alert.critical > 0 && (
                        <p className="text-[11px] text-red-700 font-bold mt-0.5">🔴 {alert.critical} students below 65%</p>
                      )}
                      {alert.warning > 0 && (
                        <p className="text-[11px] text-orange-700 font-bold mt-0.5">🟡 {alert.warning} students below 75%</p>
                      )}
                    </div>
                    <button
                      onClick={() => { setSelectedMapping(attendanceMappings[0] || null); setView('defaulters'); }}
                      className={`flex items-center gap-1 text-[11px] font-black ${alert.critical > 0 ? 'text-red-600' : 'text-orange-600'} hover:underline`}
                    >
                      View <ChevronRight size={12} />
                    </button>
                  </div>
                </motion.div>
              ))}
              {mockAlerts.length === 0 && (
                <div className="py-8 text-center">
                  <CheckCircle2 className="mx-auto text-emerald-400 mb-2" size={28} />
                  <p className={`text-sm font-bold ${t.muted}`}>All students are on track!</p>
                </div>
              )}
            </div>
          </div>

          {/* Class Health */}
          <div className={`${t.card} rounded-[2rem] border ${t.border} shadow-sm overflow-hidden`}>
            <div className={`p-6 border-b ${t.border} flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-500 flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
                <h2 className={`text-lg font-black ${t.heading}`}>Class Health Overview</h2>
              </div>
              <button
                onClick={() => setView('analytics')}
                className="text-[11px] font-black text-primary flex items-center gap-1 hover:underline"
              >
                Detailed Report <ChevronRight size={12} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {mockClassHealth.map((cls, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-black ${t.heading}`}>{cls.subject}</span>
                    <div className="flex items-center gap-2">
                      {cls.trend === 'up' ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-red-400" />}
                      <span className={`text-sm font-black ${cls.avg < 75 ? 'text-red-500' : cls.avg >= 85 ? 'text-emerald-500' : 'text-blue-500'}`}>
                        {cls.avg}%
                      </span>
                      {cls.avg < 75 && <AlertTriangle size={14} className="text-red-400" />}
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${cls.avg}%` }} transition={{ duration: 0.8, delay: idx * 0.1 }}
                      className={`h-full rounded-full ${cls.avg < 65 ? 'bg-red-400' : cls.avg < 75 ? 'bg-orange-400' : cls.avg >= 85 ? 'bg-emerald-400' : 'bg-blue-400'}`}
                    />
                  </div>
                </div>
              ))}
              <div className={`pt-4 border-t ${t.border}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-black ${t.heading}`}>Overall Class Avg</span>
                  <span className="text-sm font-black text-blue-500">
                    {Math.round(mockClassHealth.reduce((a, c) => a + c.avg, 0) / mockClassHealth.length)}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mt-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(mockClassHealth.reduce((a, c) => a + c.avg, 0) / mockClassHealth.length)}%` }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`${t.card} rounded-[2rem] border ${t.border} shadow-sm overflow-hidden`}>
          <div className={`p-6 border-b ${t.border} flex items-center gap-3`}>
            <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-500 flex items-center justify-center">
              <FileText size={20} />
            </div>
            <h2 className={`text-lg font-black ${t.heading}`}>Recent Attendance Activity</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`text-[10px] font-black ${t.muted} uppercase tracking-[0.15em]`}>
                <tr className="bg-slate-50/60">
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-left">Subject</th>
                  <th className="px-6 py-4 text-left">Division</th>
                  <th className="px-6 py-4 text-center">Present</th>
                  <th className="px-6 py-4 text-center">Absent</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${t.border}`}>
                {mockRecentActivity.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className={`px-6 py-4 text-sm font-bold ${t.heading}`}>{row.date}</td>
                    <td className={`px-6 py-4 text-sm font-bold ${t.text}`}>{row.subject}</td>
                    <td className={`px-6 py-4 text-sm font-bold ${t.muted}`}>{row.division}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-600">{row.present}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-red-100 text-red-500">{row.absent}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(var(--primary-rgb), 0.1)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleViewHistory(row)}
                        className={`p-2 rounded-xl ${t.search} ${t.muted} hover:text-primary transition-all`}
                      >
                        <Eye size={16} />
                      </motion.button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    );
  }

  // ===== MARKING VIEW (Wizard) =====
  if (view === 'marking') {
    const currentPasskey = selectedWizardSubject ? (SUBJECT_PASSKEYS[selectedWizardSubject.subject_name] || '1234') : '';

    return (
      <motion.div key="att-marking-wizard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 pb-32">
        {/* Wizard Header & Progress */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (wizardStep > 0) setWizardStep(prev => prev - 1);
                else setView('dashboard');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${t.border} ${t.muted} hover:bg-slate-50 transition-all text-sm font-bold`}
            >
              <ArrowLeft size={16} /> {wizardStep === 0 ? 'Back to Dashboard' : 'Previous Step'}
            </button>
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map(s => (
                  <div key={s} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${wizardStep >= s ? 'bg-primary' : 'bg-slate-200'}`} />
                ))}
              </div>
              <span className={`text-[10px] font-black ${t.muted} uppercase tracking-widest`}>Step {wizardStep + 1} of 5</span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <h2 className={`text-4xl font-black ${t.heading}`}>
              {wizardStep === 0 && "Select your Subject"}
              {wizardStep === 1 && "Security Verification"}
              {wizardStep === 2 && "Configure Class Details"}
              {wizardStep === 3 && "Mark Attendance"}
              {wizardStep === 4 && "Attendance Saved!"}
            </h2>
            <p className={`${t.muted} font-medium`}>
              {wizardStep === 0 && "Choose the course you are teaching right now."}
              {wizardStep === 1 && "Enter the passkey assigned for this subject."}
              {wizardStep === 2 && "Select the target branch, year, and division."}
              {wizardStep === 3 && "Mark students as present or absent and click save."}
              {wizardStep === 4 && "The session has been successfully recorded in the database."}
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* ... existing steps 0-2 ... */}
          {wizardStep === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attendanceMappings.map((m, idx) => (
                <motion.div
                  key={m.id}
                  whileHover={{ y: -5, scale: 1.02, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  onClick={() => handleStartWizardForMapping(m)}
                  className={`${t.card} rounded-[2.5rem] border ${t.border} p-8 cursor-pointer transition-all relative overflow-hidden group`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                    <BookOpen size={28} />
                  </div>
                  <h3 className={`text-xl font-black ${t.heading} mb-2`}>{m.subject_name}</h3>
                  <p className={`text-sm font-bold ${t.muted}`}>{m.department} • {m.division}</p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {wizardStep === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="max-w-md mx-auto w-full text-center">
              <div className={`${t.card} rounded-[3rem] border ${t.border} p-10 shadow-xl space-y-8`}>
                <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                  <Timer size={40} />
                </div>
                <div className="space-y-2">
                  <label className={`text-xs font-black ${t.muted} uppercase tracking-widest`}>Enter Subject Passkey</label>
                  <input
                    type="text"
                    value={passkeyInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPasskeyInput(val);
                      if (val === currentPasskey) {
                        toast.success('Passkey Verified!', { icon: '🔐' });
                        setTimeout(() => setWizardStep(2), 600);
                      }
                    }}
                    placeholder="••••••••"
                    className={`w-full text-center p-6 text-2xl font-black rounded-2xl border-2 transition-all outline-none ${
                       passkeyInput === currentPasskey 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900' 
                        : passkeyInput.length > 0 && currentPasskey.startsWith(passkeyInput)
                          ? 'border-primary bg-primary/5'
                          : passkeyInput.length > 0 ? 'border-red-500 bg-red-50' : 'border-slate-200'
                    }`}
                  />
                  <p className={`text-[10px] font-bold ${t.muted} mt-4 italic`}>* For demo purposes, the passkey is: {currentPasskey}</p>
                </div>
              </div>
            </motion.div>
          )}

          {wizardStep === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-4xl mx-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <label className={`text-xs font-black ${t.muted} uppercase tracking-widest ml-1`}>Branch / Stream</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['CSE', 'AI/ML', 'IT', 'ME', 'ECE'].map(b => (
                      <button
                        key={b}
                        onClick={() => setSelectedBranch(b)}
                        className={`p-4 rounded-2xl border font-bold transition-all text-sm ${selectedBranch === b ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : `${t.card} ${t.border} ${t.text} hover:bg-slate-50`}`}
                      >
                        {b} Engineering
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className={`text-xs font-black ${t.muted} uppercase tracking-widest ml-1`}>Academic Year</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['FE', 'SE', 'TE', 'BE'].map(y => (
                      <button
                        key={y}
                        onClick={() => setSelectedYear(y)}
                        className={`p-4 rounded-2xl border font-bold transition-all text-sm ${selectedYear === y ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : `${t.card} ${t.border} ${t.text} hover:bg-slate-50`}`}
                      >
                        {y === 'FE' ? 'First Year' : y === 'SE' ? 'Second Year' : y === 'TE' ? 'Third Year' : 'Final Year'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className={`text-xs font-black ${t.muted} uppercase tracking-widest ml-1`}>Division</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Div A', 'Div B', 'Div C', 'Div D'].map(d => (
                      <button
                        key={d}
                        onClick={() => setSelectedDiv(d)}
                        className={`p-4 rounded-2xl border font-bold transition-all text-sm ${selectedDiv === d ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : `${t.card} ${t.border} ${t.text} hover:bg-slate-50`}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-8">
                <button
                  disabled={!selectedBranch || !selectedYear || !selectedDiv}
                  onClick={() => setWizardStep(3)}
                  className="px-12 py-5 bg-primary text-white rounded-[2rem] font-black shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 disabled:grayscale disabled:opacity-50 transition-all flex items-center gap-3"
                >
                  Start Marking Session <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: MARKING SESSION */}
          {wizardStep === 3 && (
            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {selectedMapping ? (
                <div className="space-y-6">
                  {/* Class Info Mini-Card */}
                  <div className={`${t.card} rounded-[2rem] border ${t.border} shadow-sm p-6 flex flex-wrap items-center justify-between gap-6`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <Users size={24} />
                      </div>
                      <div>
                        <p className={`text-[10px] font-black ${t.muted} uppercase tracking-widest`}>Ongoing Session</p>
                        <h3 className={`text-xl font-black ${t.heading}`}>{selectedWizardSubject?.subject_name} • {selectedBranch} {selectedYear} ({selectedDiv})</h3>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-right">
                        <p className={`text-[10px] font-black ${t.muted} uppercase`}>Passkey Verified</p>
                        <p className="text-emerald-500 font-black text-sm">••••••••</p>
                      </div>
                    </div>
                  </div>

                  <AttendanceMarker
                    mappingId={selectedMapping.id}
                    subjectName={selectedMapping.subject_name}
                    students={markingStudents}
                    facultyId={user?.id}
                    theme={t}
                    onSuccess={() => {
                      setWizardStep(4);
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-20 p-8">
                   <AlertCircle size={60} className="text-red-500 mx-auto mb-4" />
                   <h2 className="text-2xl font-black">Something went wrong</h2>
                   <p className="text-slate-500 mb-8">Subject data was lost during the wizard. Please try again.</p>
                   <button onClick={() => setWizardStep(0)} className="px-8 py-3 bg-primary text-white rounded-xl font-bold">Restart Wizard</button>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 4: SUCCESS SUMMARY */}
          {wizardStep === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto text-center">
              <div className={`${t.card} rounded-[3rem] border ${t.border} p-12 shadow-2xl space-y-8 relative overflow-hidden text-center`}>
                <motion.div 
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                  className="w-24 h-24 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30"
                >
                  <CheckCircle2 size={48} />
                </motion.div>
                
                <div className="space-y-4">
                  <h3 className={`text-3xl font-black ${t.heading}`}>Attendance Secured!</h3>
                  <p className={`${t.muted} font-medium px-8`}>
                    The class attendance for <strong>{selectedWizardSubject?.subject_name}</strong> has been successfully uploaded to the central LMS database.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4">
                   <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                     <p className={`text-[10px] font-black ${t.muted} uppercase mb-1`}>Record Status</p>
                     <p className="text-emerald-600 font-black">Synced Stable</p>
                   </div>
                   <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                     <p className={`text-[10px] font-black ${t.muted} uppercase mb-1`}>Time Recorded</p>
                     <p className={`font-black ${t.heading}`}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                   </div>
                </div>

                <button
                  onClick={() => setView('dashboard')}
                  className="w-full py-5 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-98 transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // ===== DEFAULTERS VIEW =====
  if (view === 'defaulters') {
    const critical = mockDefaulters.filter(d => d.pct < 65);
    const warning = mockDefaulters.filter(d => d.pct >= 65 && d.pct < 75);
    const safe = mockDefaulters.filter(d => d.pct >= 75 && d.pct <= 85);
    const excellent = mockDefaulters.filter(d => d.pct > 85);

    return (
      <motion.div key="att-defaulters" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('dashboard')} className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${t.border} ${t.muted} hover:bg-slate-50 transition-all text-sm font-bold`}>
              <ArrowLeft size={16} /> Back
            </button>
            <div>
              <h1 className={`text-2xl font-black ${t.heading}`}>Defaulter List</h1>
              <p className={`text-xs font-bold ${t.muted}`}>{selectedMapping?.subject_name || 'Data Structures (CS201)'} · CSE 3rd Year A · Total Lectures: 24/40 · Class Avg: 78.2%</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const data = mockDefaulters.map(d => ({ Name: d.name, Roll: d.rollNo, Attendance: `${d.pct}%`, Status: d.pct < 65 ? 'Critical' : 'Warning' }));
                const csv = Papa.unparse(data);
                const blob = new Blob([csv], { type: 'text/csv' });
                const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'defaulters.csv'; a.click();
                toast.success('CSV exported!');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-black hover:bg-emerald-100 transition-all"
            >
              <Download size={14} /> Export CSV
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 text-sm font-black hover:bg-slate-200 transition-all">
              <Printer size={14} /> Print
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Critical', count: critical.length, color: 'red', bgColor: 'bg-red-50', borderColor: 'border-red-200', textColor: 'text-red-600', sub: '<65%' },
            { label: 'Warning', count: warning.length, color: 'orange', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', textColor: 'text-orange-600', sub: '65–74%' },
            { label: 'Safe', count: safe.length, color: 'emerald', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', textColor: 'text-emerald-600', sub: '75–85%' },
            { label: 'Excellent', count: excellent.length + 53, color: 'blue', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-600', sub: '>85%' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className={`${stat.bgColor} ${stat.borderColor} border rounded-[1.5rem] p-5 cursor-pointer hover:shadow-md transition-all`}
              onClick={() => setFilterTab(stat.label.toLowerCase() as any)}>
              <p className={`text-[10px] font-black uppercase tracking-widest ${stat.textColor}`}>{stat.label} <span className="opacity-60">({stat.sub})</span></p>
              <p className={`text-4xl font-black ${stat.textColor} mt-2`}>{stat.count}</p>
              <p className="text-[10px] text-slate-500 font-bold mt-1">students</p>
            </motion.div>
          ))}
        </div>

        {/* Filter & Search */}
        <div className={`${t.card} rounded-2xl border ${t.border} p-4 flex flex-wrap gap-3 items-center`}>
          <div className="flex gap-2 flex-wrap">
            {['all', 'critical', 'warning', 'safe', 'excellent'].map(f => (
              <button key={f} onClick={() => setFilterTab(f as any)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterTab === f ? 'bg-primary text-white shadow-sm' : `${t.search} ${t.muted} hover:text-primary`}`}>
                {f}
              </button>
            ))}
          </div>
          <div className={`flex-1 min-w-[180px] relative`}>
            <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.muted}`} />
            <input
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search student..."
              className={`w-full pl-9 pr-4 py-2 rounded-xl ${t.search} border ${t.border} text-sm font-medium outline-none focus:border-primary transition-all`}
            />
          </div>
        </div>

        {/* Critical Students */}
        {filteredDefaulters.filter(d => d.pct < 65).length > 0 && (
          <div className={`${t.card} rounded-[2rem] border border-red-100 shadow-sm overflow-hidden`}>
            <div className="p-5 bg-red-50 border-b border-red-100 flex items-center gap-3">
              <AlertTriangle size={18} className="text-red-500" />
              <h3 className="text-sm font-black text-red-900">Critical Students (Below 65%) — {filteredDefaulters.filter(d => d.pct < 65).length} students</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] bg-slate-50/60">
                  <tr>
                    <th className="px-6 py-3 text-left">Roll No.</th>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-center">Attendance</th>
                    <th className="px-6 py-3 text-center">Absences</th>
                    <th className="px-6 py-3 text-center">Lectures Needed</th>
                    <th className="px-6 py-3 text-center">Trend</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${t.border}`}>
                  {filteredDefaulters.filter(d => d.pct < 65).map((d, idx) => (
                    <tr key={d.student_id} className="hover:bg-red-50/30 transition-colors">
                      <td className="px-6 py-4 text-xs font-black text-slate-500">{d.rollNo}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${d.name}`} className="w-9 h-9 rounded-full bg-slate-100" alt="" />
                          <p className={`text-sm font-black ${t.heading}`}>{d.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-black text-red-500">{d.pct}%</span>
                        <div className="w-16 mx-auto h-1.5 bg-red-100 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-red-400 rounded-full" style={{ width: `${d.pct}%` }} />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center"><span className="text-sm font-black text-slate-500">{d.absCount}</span></td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-700">{d.needed} lectures</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {d.trend < 0 ? (
                          <span className="flex items-center justify-center gap-1 text-xs font-black text-red-500"><TrendingDown size={14} />{Math.abs(d.trend)}%</span>
                        ) : (
                          <span className="flex items-center justify-center gap-1 text-xs font-black text-emerald-500"><TrendingUp size={14} />+{d.trend}%</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => window.location.href = `mailto:${d.email}`} className="p-2 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-100 transition-all"><Mail size={15} /></button>
                          <button className="p-2 rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200 transition-all"><Phone size={15} /></button>
                          <button onClick={() => { setSelectedStudent(d); setView('student-detail'); }} className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all"><Eye size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Warning Students */}
        {filteredDefaulters.filter(d => d.pct >= 65 && d.pct < 75).length > 0 && (
          <div className={`${t.card} rounded-[2rem] border border-orange-100 shadow-sm overflow-hidden`}>
            <div className="p-5 bg-orange-50 border-b border-orange-100 flex items-center gap-3">
              <AlertCircle size={18} className="text-orange-500" />
              <h3 className="text-sm font-black text-orange-900">Warning Zone (65–74%) — {filteredDefaulters.filter(d => d.pct >= 65 && d.pct < 75).length} students</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] bg-slate-50/60">
                  <tr>
                    <th className="px-6 py-3 text-left">Roll No.</th>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-center">Attendance</th>
                    <th className="px-6 py-3 text-center">Absences</th>
                    <th className="px-6 py-3 text-center">To Reach 75%</th>
                    <th className="px-6 py-3 text-center">Trend</th>
                    <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${t.border}`}>
                  {filteredDefaulters.filter(d => d.pct >= 65 && d.pct < 75).map((d) => (
                    <tr key={d.student_id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="px-6 py-4 text-xs font-black text-slate-500">{d.rollNo}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${d.name}`} className="w-9 h-9 rounded-full bg-slate-100" alt="" />
                          <p className={`text-sm font-black ${t.heading}`}>{d.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-black text-orange-500">{d.pct}%</span>
                        <div className="w-16 mx-auto h-1.5 bg-orange-100 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-orange-400 rounded-full" style={{ width: `${d.pct}%` }} />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center"><span className="text-sm font-black text-slate-500">{d.absCount}</span></td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-700">{d.needed} lectures</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {d.trend < 0 ? (
                          <span className="flex items-center justify-center gap-1 text-xs font-black text-red-500"><TrendingDown size={14} />{Math.abs(d.trend)}%</span>
                        ) : (
                          <span className="flex items-center justify-center gap-1 text-xs font-black text-emerald-500"><TrendingUp size={14} />+{d.trend}%</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => window.location.href = `mailto:${d.email}`} className="p-2 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-100 transition-all"><Mail size={15} /></button>
                          <button className="p-2 rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200 transition-all"><Phone size={15} /></button>
                          <button onClick={() => { setSelectedStudent(d); setView('student-detail'); }} className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all"><Eye size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  // ===== STUDENT DETAIL VIEW =====
  if (view === 'student-detail' && selectedStudent) {
    const s = selectedStudent;
    const projectedIfAttendAll = ((14 + 16) / 40 * 100).toFixed(1);
    const mockLog = [
      { date: 'Apr 10', lec: 24, topic: 'BST – Insertion', status: 'absent' },
      { date: 'Apr 09', lec: 23, topic: 'Binary Trees Intro', status: 'absent' },
      { date: 'Apr 08', lec: 22, topic: 'Tree Traversal', status: 'absent' },
      { date: 'Apr 07', lec: 21, topic: 'Graph Algorithms', status: 'present' },
      { date: 'Apr 04', lec: 20, topic: "Dijkstra's Algorithm", status: 'present' },
    ];
    return (
      <motion.div key="att-student" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pb-32">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('defaulters')} className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${t.border} ${t.muted} hover:bg-slate-50 transition-all text-sm font-bold`}>
            <ArrowLeft size={16} /> Back to Defaulter List
          </button>
          <span className={`text-lg font-black ${t.heading}`}>Student Attendance Profile</span>
        </div>

        {/* Student Info */}
        <div className={`${t.card} rounded-[2rem] border ${t.border} shadow-sm p-6`}>
          <div className="flex items-center gap-5">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`} className="w-16 h-16 rounded-2xl bg-slate-100" alt="" />
            <div>
              <h2 className={`text-xl font-black ${t.heading}`}>{s.name}</h2>
              <p className={`text-sm font-bold ${t.muted}`}>Roll No: {s.rollNo} · 3rd Year / 6th Sem</p>
              <p className={`text-xs font-bold ${t.muted} mt-0.5`}>{s.email} · CSE Division A</p>
            </div>
            <div className="ml-auto">
              <RiskBadge pct={s.pct} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={`${t.card} rounded-[2rem] border ${t.border} shadow-sm p-6 space-y-5`}>
          <h3 className={`text-base font-black ${t.heading}`}>📊 Subject: Data Structures (CS201)</h3>

          <div>
            <div className="flex justify-between mb-1">
              <span className={`text-sm font-bold ${t.muted}`}>Current Attendance</span>
              <span className={`text-sm font-black text-red-500`}>{s.pct}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${s.pct}%` }} transition={{ duration: 0.8 }}
                className="h-full bg-gradient-to-r from-red-500 to-orange-400 rounded-full" />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-slate-400 font-bold">0%</span>
              <div className="relative" style={{ left: '75%', transform: 'translateX(-50%)' }}>
                <span className="text-[10px] text-orange-500 font-black">↑ 75% Target</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">100%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Lectures Attended', value: '14', sub: 'of 24 conducted', color: 'text-blue-500' },
              { label: 'Absent', value: `${s.absCount}`, sub: 'lectures missed', color: 'text-red-500' },
              { label: 'Lectures Needed', value: `${s.needed}`, sub: 'of remaining 16', color: 'text-orange-500' },
              { label: 'Recovery', value: s.possible ? '✅ Yes' : '❌ No', sub: 'possible', color: 'text-emerald-500' },
            ].map((stat, i) => (
              <div key={i} className={`p-4 rounded-2xl ${t.search} border ${t.border}`}>
                <p className={`text-[10px] font-black ${t.muted} uppercase tracking-widest`}>{stat.label}</p>
                <p className={`text-xl font-black ${stat.color} mt-1`}>{stat.value}</p>
                <p className={`text-[10px] ${t.muted} mt-0.5`}>{stat.sub}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-2">
            <h4 className="text-sm font-black text-emerald-900">🎯 Recovery Analysis</h4>
            <div className="grid grid-cols-2 gap-3 text-xs font-bold text-emerald-800">
              <div>Total Planned: <span className="font-black">40</span></div>
              <div>Remaining: <span className="font-black">16</span></div>
              <div>If attends all: <span className="font-black text-emerald-600">{projectedIfAttendAll}% projected</span></div>
              <div>At current rate: <span className="font-black text-red-600">~62.5% (below 75%)</span></div>
            </div>
          </div>
        </div>

        {/* Attendance Log */}
        <div className={`${t.card} rounded-[2rem] border ${t.border} shadow-sm overflow-hidden`}>
          <div className={`p-6 border-b ${t.border}`}>
            <h3 className={`text-base font-black ${t.heading}`}>📅 Attendance Log — Data Structures</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/60">
                <tr>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-center">Lecture #</th>
                  <th className="px-6 py-3 text-left">Topic</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-center">Marked By</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${t.border}`}>
                {mockLog.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className={`px-6 py-4 text-sm font-bold ${t.heading}`}>{row.date}</td>
                    <td className="px-6 py-4 text-center text-xs font-bold text-slate-400">{row.lec}</td>
                    <td className={`px-6 py-4 text-sm font-medium ${t.text}`}>{row.topic}</td>
                    <td className="px-6 py-4 text-center">
                      {row.status === 'present' ? (
                        <span className="flex items-center justify-center gap-1 text-xs font-black text-emerald-600"><CheckCircle2 size={14} /> Present</span>
                      ) : (
                        <span className="flex items-center justify-center gap-1 text-xs font-black text-red-500"><XCircle size={14} /> Absent</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-xs font-bold text-slate-400">Dr. (You)</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Communication */}
        <div className={`${t.card} rounded-[2rem] border ${t.border} shadow-sm p-6 space-y-4`}>
          <h3 className={`text-base font-black ${t.heading}`}>📨 Communication Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => window.location.href = `mailto:${s.email}`} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-black hover:bg-blue-600 transition-all shadow-sm">
              <Mail size={16} /> Send Warning Email
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-black hover:bg-orange-600 transition-all shadow-sm">
              <Bell size={16} /> Alert Parent
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-black hover:bg-slate-50 transition-all">
              <FileText size={16} /> Schedule Meeting
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ===== ANALYTICS VIEW =====
  if (view === 'analytics') {
    return (
      <motion.div key="att-analytics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pb-32">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('dashboard')} className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${t.border} ${t.muted} hover:bg-slate-50 transition-all text-sm font-bold`}>
              <ArrowLeft size={16} /> Dashboard
            </button>
            <h1 className={`text-2xl font-black ${t.heading}`}>Attendance Analytics</h1>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-black hover:opacity-90 transition-all">
              <Download size={14} /> Export Report
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-black hover:bg-slate-50 transition-all">
              <Printer size={14} /> Print View
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Class Average', value: '78.2%', icon: <BarChart3 size={20} />, bg: 'bg-blue-500', trend: '+2.1%' },
            { label: 'Total Students', value: '60', icon: <Users size={20} />, bg: 'bg-violet-500', trend: 'enrolled' },
            { label: 'At Risk Students', value: '8', icon: <AlertTriangle size={20} />, bg: 'bg-red-500', trend: '-1 from last week' },
            { label: 'Perfect Attendance', value: '14', icon: <GraduationCap size={20} />, bg: 'bg-emerald-500', trend: 'students at 100%' },
          ].map((kpi, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className={`${t.card} rounded-[1.5rem] border ${t.border} shadow-sm p-5 flex items-start gap-4`}>
              <div className={`w-10 h-10 rounded-2xl ${kpi.bg} text-white flex items-center justify-center flex-shrink-0`}>{kpi.icon}</div>
              <div>
                <p className={`text-[10px] font-black ${t.muted} uppercase tracking-widest`}>{kpi.label}</p>
                <p className={`text-2xl font-black ${t.heading}`}>{kpi.value}</p>
                <p className={`text-[10px] font-bold ${t.muted} mt-0.5`}>{kpi.trend}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Distribution */}
        <div className={`${t.card} rounded-[2rem] border ${t.border} shadow-sm p-6`}>
          <h3 className={`text-base font-black ${t.heading} mb-6`}>📊 Attendance Distribution</h3>
          <div className="flex items-end gap-6 h-40">
            {[
              { label: 'Critical\n<65%', count: 3, max: 60, color: 'bg-red-400' },
              { label: 'Warning\n65–74%', count: 5, max: 60, color: 'bg-orange-400' },
              { label: 'Safe\n75–85%', count: 38, max: 60, color: 'bg-emerald-400' },
              { label: 'Excellent\n>85%', count: 14, max: 60, color: 'bg-blue-400' },
            ].map((bar, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <span className={`text-sm font-black ${t.heading}`}>{bar.count}</span>
                <div className="w-full flex items-end justify-center">
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: `${(bar.count / 60) * 120}px` }}
                    transition={{ duration: 0.7, delay: i * 0.1 }}
                    className={`w-3/4 ${bar.color} rounded-t-xl`}
                  />
                </div>
                <span className={`text-[10px] font-bold text-center ${t.muted} whitespace-pre-line`}>{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top & Concern */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`${t.card} rounded-[2rem] border ${t.border} shadow-sm p-6`}>
            <h3 className="text-sm font-black text-emerald-600 mb-4">🏅 Perfect Attendance</h3>
            <div className="space-y-3">
              {['Aadhya Sharma', 'Chirag Desai', 'Eshan Gupta', 'Gaurav Singh'].map((name, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} className="w-8 h-8 rounded-full bg-slate-100" alt="" />
                    <span className={`text-sm font-bold ${t.heading}`}>{name}</span>
                  </div>
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">100%</span>
                </div>
              ))}
            </div>
          </div>
          <div className={`${t.card} rounded-[2rem] border ${t.border} shadow-sm p-6`}>
            <h3 className="text-sm font-black text-red-500 mb-4">⚠️ Declining Trend</h3>
            <div className="space-y-3">
              {mockDefaulters.slice(0, 4).map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${d.name}`} className="w-8 h-8 rounded-full bg-slate-100" alt="" />
                    <span className={`text-sm font-bold ${t.heading}`}>{d.name}</span>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-black text-red-500">
                    <TrendingDown size={12} />{Math.abs(d.trend)}% last week
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ===== HISTORY DETAIL VIEW =====
  if (view === 'history-detail' && selectedHistory) {
    return (
      <motion.div
        key="att-history-detail"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6 pb-32"
      >
        {/* Back header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setView('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${t.border} ${t.muted} hover:bg-slate-50 transition-all text-sm font-bold`}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <div className="flex gap-2">
            <button className={`p-2 rounded-xl border ${t.border} ${t.muted} hover:bg-slate-50 transition-all`}>
              <Download size={16} />
            </button>
            <button className={`p-2 rounded-xl border ${t.border} ${t.muted} hover:bg-slate-50 transition-all`}>
              <Printer size={16} />
            </button>
          </div>
        </div>

        {/* Session Banner */}
        <div className={`${t.card} rounded-[2.5rem] border ${t.border} shadow-sm p-8 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Calendar size={120} className="text-primary" />
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full w-fit">
                <Clock size={12} /> Attendance Record
              </div>
              <h1 className={`text-3xl font-black ${t.heading} mt-2`}>
                {selectedHistory.subject}
              </h1>
              <p className={`${t.muted} font-medium`}>
                {selectedHistory.division} • {selectedHistory.date}
              </p>
            </div>

            <div className="flex gap-4">
              <div className="text-center px-6 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <p className="text-2xl font-black text-emerald-600">{selectedHistory.present}</p>
                <p className="text-[10px] font-black text-emerald-800 uppercase tracking-tighter">Present</p>
              </div>
              <div className="text-center px-6 py-3 bg-red-50 border border-red-100 rounded-2xl">
                <p className="text-2xl font-black text-red-500">{selectedHistory.absent}</p>
                <p className="text-[10px] font-black text-red-800 uppercase tracking-tighter">Absent</p>
              </div>
              <div className="text-center px-6 py-3 bg-blue-50 border border-blue-100 rounded-2xl">
                <p className="text-2xl font-black text-blue-600">
                  {Math.round((selectedHistory.present / (selectedHistory.present + selectedHistory.absent)) * 100)}%
                </p>
                <p className="text-[10px] font-black text-blue-800 uppercase tracking-tighter">Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${t.muted}`} size={18} />
            <input
              type="text"
              placeholder="Search student by name or roll no..."
              className={`w-full pl-12 pr-4 py-3 rounded-2xl border ${t.border} ${t.search} focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-sm`}
            />
          </div>
          <div className="flex gap-2">
            <button className={`px-4 py-2 rounded-xl border ${t.border} ${t.search} ${t.heading} text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all`}>
              Present Only
            </button>
            <button className={`px-4 py-2 rounded-xl border ${t.border} ${t.search} ${t.heading} text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all`}>
              Absent Only
            </button>
          </div>
        </div>

        {/* Student List */}
        <div className={`${t.card} rounded-[2.5rem] border ${t.border} shadow-sm overflow-hidden`}>
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 className={`text-xl font-black ${t.heading}`}>Session Student List</h3>
            <div className={`text-xs font-bold ${t.muted}`}>
              Showing {historyStudents.length} Students
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoadingHistory ? (
              <div className="py-20 text-center space-y-4">
                <Loader2 className="animate-spin text-primary mx-auto" size={40} />
                <p className={`font-black ${t.muted}`}>Retrieving attendance logs...</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className={`bg-slate-50/50 text-[10px] font-black ${t.muted} uppercase tracking-[0.2em]`}>
                  <tr>
                    <th className="px-8 py-5">Roll No.</th>
                    <th className="px-8 py-5">Student Name</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {historyStudents.map((student, idx) => (
                    <motion.tr
                      key={student.student_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      whileHover={{ backgroundColor: 'rgba(var(--primary-rgb), 0.02)' }}
                      className="group transition-colors"
                    >
                      <td className={`px-8 py-6 text-sm font-black ${t.muted} font-mono`}>
                        {student.rollNo}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${t.search} border ${t.border} flex items-center justify-center overflow-hidden`}>
                            <img
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`}
                              alt={student.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className={`text-sm font-black ${t.heading}`}>{student.name}</p>
                            <p className={`text-[10px] font-bold ${t.muted}`}>{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`flex items-center gap-2 w-fit px-3 py-1.5 rounded-full ${
                          student.status === 'present'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-red-50 text-red-500'
                        }`}>
                          {student.status === 'present' ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <XCircle size={14} />
                          )}
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {student.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className={`p-2 rounded-xl ${t.search} ${t.muted} hover:text-primary border ${t.border} transition-all shadow-sm`}>
                            <Mail size={14} />
                          </button>
                          <button
                            onClick={() => { setSelectedStudent(student); setView('student-detail'); }}
                            className={`p-2 rounded-xl ${t.search} ${t.muted} hover:text-primary border ${t.border} transition-all shadow-sm`}
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
};
