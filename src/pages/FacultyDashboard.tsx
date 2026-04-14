// Campus Pace - Ultimate Force Update - 2026-04-11
// Campus Pace - Global Synchronization & Stabilization Update - 2026-04-11
// Campus Pace - Stable Upload & Sync Update - 2026-04-11
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Leaf, Search, Bell, LayoutDashboard, BookOpen,
  TreePine, Settings, LogOut, FileText, CloudOff,
  Zap, Plus, Download, ChevronRight, Users,
  CheckCircle2, Clock, AlertCircle, ArrowLeft, ArrowRight,
  Edit3, MessageSquare, Scissors, Type, Maximize2,
  MoreVertical, Filter, SortDesc, Folder, ClipboardList, Droplets, User, X, Sparkles, Loader2,
  ChevronLeft, Shield, Camera, Sun, Moon, HelpCircle, Calendar
} from 'lucide-react';
import CountUp from 'react-countup';
import { useAuth } from '../AuthContext';
import FacultyNotices from './FacultyNotices';
import { AttendanceMarker } from '../components/attendance/AttendanceMarker';
import { DefaulterList } from '../components/attendance/DefaulterList';
import { AttendanceMapping } from '../types';
import { FacultyAttendancePage } from '../components/attendance/FacultyAttendancePage';

const themes = {
  Light: {
    bg: 'bg-[#F8FAF9]',
    header: 'bg-white border-slate-100',
    text: 'text-slate-900',
    heading: 'text-slate-800',
    card: 'bg-white border-slate-100',
    navActive: 'text-[#22C55E] bg-[#22C55E]/5',
    navInactive: 'text-slate-500 hover:bg-slate-50',
    search: 'bg-[#F1F3F5]',
    input: 'bg-slate-50 border-slate-100',
    muted: 'text-slate-400',
    border: 'border-slate-100',
    accent: 'text-[#22C55E]',
    accentBg: 'bg-[#22C55E]/5',
    sidebar: 'bg-white',
    sidebarHover: 'hover:bg-slate-50'
  },
  Dark: {
    bg: 'bg-[#0f172a]',
    header: 'bg-[#1e293b] border-slate-800',
    text: 'text-slate-100',
    heading: 'text-white',
    card: 'bg-[#1e293b] border-slate-800',
    navActive: 'text-[#22C55E] bg-[#22C55E]/10',
    navInactive: 'text-slate-400 hover:bg-slate-800',
    search: 'bg-[#334155]',
    input: 'bg-[#1e292a] border-slate-700',
    muted: 'text-slate-500',
    border: 'border-slate-800',
    accent: 'text-[#22C55E]',
    accentBg: 'bg-[#22C55E]/10',
    sidebar: 'bg-[#1e293b]',
    sidebarHover: 'hover:bg-slate-800'
  },
  Eco: {
    bg: 'bg-[#f0f4f0]',
    header: 'bg-[#f8faf8] border-[#dce6dc]',
    text: 'text-[#2d4d2d]',
    heading: 'text-[#1e3a1e]',
    card: 'bg-[#fbfcff] border-[#dce6dc]',
    navActive: 'text-[#2e7d32] bg-[#2e7d32]/10',
    navInactive: 'text-[#5d7d5d] hover:bg-[#e8f0e8]',
    search: 'bg-[#e8f0e8]',
    input: 'bg-[#f8faf8] border-[#dce6dc]',
    muted: 'text-[#8ca68c]',
    border: 'border-[#dce6dc]',
    accent: 'text-[#2e7d32]',
    accentBg: 'bg-[#2e7d32]/10',
    sidebar: 'bg-[#f8faf8]',
    sidebarHover: 'hover:bg-[#e8f0e8]'
  }
};

export default function FacultyDashboard() {
  const { user, logout } = useAuth();

  // Navigation State
  const [activeNav, setActiveNav] = useState("Assignments");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNewAssignmentModal, setShowNewAssignmentModal] = useState(false);
  const [settingsSubTab, setSettingsSubTab] = useState<'main' | 'profile' | 'notifications' | 'security' | 'appearance'>('main');
  const [newAssignmentCourse, setNewAssignmentCourse] = useState("Env Science 101");
  const [assignmentFiles, setAssignmentFiles] = useState<File[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [attendanceMappings, setAttendanceMappings] = useState<any[]>([]);
  const [selectedMapping, setSelectedMapping] = useState<any>(null);
  const [markingStudents, setMarkingStudents] = useState<any[]>([]);
  const [isMarkingLoading, setIsMarkingLoading] = useState(false);
  const [markingTopic, setMarkingTopic] = useState('');
  const [markingDate, setMarkingDate] = useState(new Date().toISOString().split('T')[0]);
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [activeAttendanceView, setActiveAttendanceView] = useState<'marking' | 'intelligence'>('marking');

  const [themeMode, setThemeMode] = useState<'Light' | 'Dark' | 'Eco'>('Light');
  const [facultyProfile, setFacultyProfile] = useState({
    name: user?.name || 'Dr. Sarah Jenkins',
    email: user?.email || 'sarah.j@university.edu',
    role: user?.role || 'Senior Faculty',
    dept: 'Environmental Sciences',
    avatar: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=prof`
  });

  const [notificationSettings, setNotificationSettings] = useState({
    assignmentAlerts: true,
    ecoMilestones: true,
    paperUploads: false,
    securityAlerts: true,
    emailBriefing: true
  });

  useEffect(() => {
    if (themeMode === 'Eco' || themeMode === 'Dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  useEffect(() => {
    const fetchMappings = async () => {
      if (!user?.id) return;
      try {
        const response = await fetch(`/api/attendance/faculty/mappings/${user.id}`);
        const data = await response.json();
        setAttendanceMappings(data);
      } catch (err) {
        console.error("Failed to fetch mappings:", err);
      }
    };
    fetchMappings();
  }, [user?.id]);

  const t = themes[themeMode];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Environmental Stats State
  const [stats, setStats] = useState({
    total: 45,
    pending: 12,
    pages: 225,
    water: 2250
  });

  // Students Data State
  const [students, setStudents] = useState([
    { id: 1, name: "Alice Johnson", date: "Oct 24, 2:30 PM", status: "Pending", grade: "- / 100", rubric: { research: 28, clarity: 25, grammar: 18, relevance: 20 }, feedback: "Excellent work on integrating the sustainability concepts. Your analysis of urban density could be expanded slightly in the next assignment." },
    { id: 2, name: "Bob Smith", date: "Oct 24, 4:15 PM", status: "Graded", grade: "92 / 100", rubric: { research: 29, clarity: 26, grammar: 17, relevance: 20 }, feedback: "Great points made." },
    { id: 3, name: "Charlie Brown", date: "Oct 25, 9:00 AM", status: "Late", grade: "- / 100", rubric: { research: 20, clarity: 20, grammar: 15, relevance: 15 }, feedback: "" },
    { id: 4, name: "Diana Prince", date: "Oct 24, 1:00 PM", status: "Graded", grade: "88 / 100", rubric: { research: 26, clarity: 25, grammar: 18, relevance: 19 }, feedback: "Solid arguments." },
    { id: 5, name: "Evan Wright", date: "Oct 24, 3:45 PM", status: "Pending", grade: "- / 100", rubric: { research: 0, clarity: 0, grammar: 0, relevance: 0 }, feedback: "" },
    { id: 6, name: "Fiona Gallagher", date: "Oct 24, 2:10 PM", status: "Graded", grade: "95 / 100", rubric: { research: 30, clarity: 28, grammar: 19, relevance: 18 }, feedback: "Outstanding." }
  ]);

  const [activeStudentId, setActiveStudentId] = useState(1);
  const activeStudent = students.find(s => s.id === activeStudentId) || students[0];

  // Grading State for active student
  const [rubric, setRubric] = useState(activeStudent.rubric);
  const [feedback, setFeedback] = useState(activeStudent.feedback);
  const totalScore = rubric.research + rubric.clarity + rubric.grammar + rubric.relevance;

  // Document UI State
  const [zoom, setZoom] = useState(100);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [hasHighlight, setHasHighlight] = useState(true);
  const [isAILoading, setIsAILoading] = useState(false);
  const [showAIBadge, setShowAIBadge] = useState(false);
  const feedbackEditorRef = useRef<HTMLDivElement>(null);

  const handleFormat = (command: string) => {
    document.execCommand(command, false);
    if (feedbackEditorRef.current) {
      setFeedback(feedbackEditorRef.current.innerHTML);
    }
  };

  const handleStartMarking = async (mapping: any) => {
    setSelectedMapping(mapping);
    setIsMarkingLoading(true);
    try {
      // For now, mirroring the existing students list logic with id strings
      const studentsInClass = [
        { id: '1', name: "Alice Johnson", roll: "21CS01", status: 'present' },
        { id: '2', name: "Bob Smith", roll: "21CS02", status: 'present' },
        { id: '3', name: "Charlie Brown", roll: "21CS03", status: 'absent' },
        { id: '4', name: "Diana Prince", roll: "21CS04", status: 'present' },
        { id: '5', name: "Evan Wright", roll: "21CS05", status: 'present' }
      ];
      setMarkingStudents(studentsInClass);
    } catch (err) {
      console.error(err);
    } finally {
      setIsMarkingLoading(false);
    }

    // Fetch defaulters for this mapping
    try {
      const res = await fetch(`/api/attendance/defaulters/${mapping.id}`);
      const data = await res.json();
      setDefaulters(data);
    } catch (err) {
      console.error("Defaulter fetch failed", err);
    }
  };

  const handleExportCSV = () => {
    if (!defaulters.length) {
      setToastMessage("No defaulters to export.");
      return;
    }
    
    const headers = ["Name,Email,Risk Level,Attendance Percentage,Lectures Needed"];
    const rows = defaulters.map((d: any) => 
      `${d.auth_users?.name || 'N/A'},${d.auth_users?.email || 'N/A'},${d.risk_level},${d.attendance_percentage.toFixed(1)}%,${d.lectures_needed_for_75}`
    );
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `defaulter_list_${selectedMapping?.subject_name || 'export'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage("CSV Exported successfully!");
  };

  const handleToggleStatus = (studentId: string) => {
    setMarkingStudents(prev => prev.map(s => 
      s.id === studentId 
        ? { ...s, status: s.status === 'present' ? 'absent' : 'present' }
        : s
    ));
  };

  const handleSubmitAttendance = async () => {
    if (!selectedMapping || !markingTopic) {
      setToastMessage("Please provide subject and topic.");
      return;
    }

    setIsMarkingLoading(true);
    try {
      const payload = {
        mappingId: selectedMapping.id,
        lectureDate: markingDate,
        topic: markingTopic,
        attendance: markingStudents.map(s => ({ studentId: s.id, status: s.status })),
        facultyId: user?.id
      };

      const res = await fetch('/api/attendance/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setToastMessage("Attendance submitted successfully!");
        setSelectedMapping(null);
        setMarkingTopic('');
      } else {
        throw new Error("Submission failed");
      }
    } catch (err) {
      setToastMessage("Error submitting attendance.");
    } finally {
      setIsMarkingLoading(false);
    }
  };

  const handleAIMock = () => {
    if (activeStudent.status === 'Graded') return;
    setIsAILoading(true);
    setShowAIBadge(false);
    setTimeout(() => {
      setFeedback(`<strong>Excellent work on integrating the sustainability concepts.</strong> Your analysis of urban density could be expanded slightly in the next assignment. The connection to public sentiment is very strong.`);
      setIsAILoading(false);
      setShowAIBadge(true);
      handleShowToast("AI Suggested Feedback applied");
    }, 1500);
  };

  // Sync grading state when active student changes
  useEffect(() => {
    setRubric(activeStudent.rubric);
    setFeedback(activeStudent.feedback);
    setHasHighlight(activeStudent.status !== 'Pending');
    setShowAIBadge(false);
  }, [activeStudentId]);

  // Actions
  const handleShowToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveDraft = () => {
    setStudents(prev => prev.map(s => s.id === activeStudentId ? { ...s, rubric, feedback } : s));
    handleShowToast("Draft saved successfully");
  };

  const handleSubmitGrade = () => {
    const isAlreadyGraded = activeStudent.status === 'Graded';

    setStudents(prev => prev.map(s =>
      s.id === activeStudentId ? { ...s, status: 'Graded', grade: `${totalScore} / 100`, rubric, feedback } : s
    ));

    if (!isAlreadyGraded) {
      setStats(prev => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        pages: prev.pages + 5,
        water: prev.water + 50
      }));
    }

    handleShowToast(isAlreadyGraded ? `Grade for ${activeStudent.name} updated successfully!` : `Grade for ${activeStudent.name} submitted successfully!`);
  };

  const handleExport = () => {
    handleShowToast("Exporting report as PDF...");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen ${t.bg} flex flex-col font-sans transition-colors duration-500`}
    >
      {/* Top Navbar */}
      <header className={`${t.header} border-b flex items-center justify-between px-4 lg:px-8 py-3 lg:py-4 sticky top-0 z-40 transition-all duration-500`}>
        <div className="flex items-center gap-4 lg:gap-12 flex-1 max-w-4xl">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900"
          >
            <div className="flex flex-col gap-1.5 w-6 text-[#22C55E]">
              <div className="h-0.5 w-full bg-current rounded-full"></div>
              <div className="h-0.5 w-full bg-current rounded-full"></div>
              <div className="h-0.5 w-full bg-current rounded-full"></div>
            </div>
          </button>

          <div className="flex items-center gap-2 lg:gap-3 shrink-0 group cursor-pointer" onClick={() => setActiveNav('Notices')}>
            <div className={`p-1.5 lg:p-2 ${t.accentBg} rounded-xl lg:rounded-2xl ${t.accent} shadow-sm transform group-hover:rotate-12 transition-transform`}>
              <Leaf size={24} fill="currentColor" className="lg:w-7 lg:h-7" />
            </div>
            <span className={`text-lg lg:text-2xl font-black tracking-tight ${t.text} italic`}>Campus pace</span>
          </div>
          <div className="relative flex-1 max-w-md hidden lg:block">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${t.muted}`} size={18} />
            <input
              type="text"
              placeholder="Search..."
              onKeyDown={(e) => e.key === 'Enter' && handleShowToast(`Searching for "${(e.target as HTMLInputElement).value}"...`)}
              className={`w-full ${t.search} border-none rounded-2xl py-2.5 pl-11 pr-4 text-sm font-bold focus:ring-2 focus:ring-[#DCFCE7] transition-all ${t.text}`}
            />
          </div>
        </div>
        <nav className="hidden lg:flex items-center gap-8 relative mr-8">
          {['Assignments', 'Notices', 'Students', 'Attendance', 'Settings'].map(nav => (
            <button
              key={nav}
              onClick={() => setActiveNav(nav)}
              className={`text-sm font-bold transition-colors relative py-1 ${activeNav === nav ? t.accent : t.muted + ' hover:' + t.text}`}
            >
              {nav === 'Students' ? 'Student List' : nav}
              {activeNav === nav && (
                <motion.div layoutId="navUnderline" className={`absolute -bottom-1 left-0 right-0 h-0.5 ${t.accent.replace('text-', 'bg-')} rounded-full`} />
              )}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3 lg:gap-4">
          <button onClick={() => setShowLogoutModal(true)} className={`flex items-center gap-2 px-3 lg:px-4 py-2 ${t.bg} ${t.text} border ${t.border} text-xs lg:text-sm font-bold rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500 transition-all duration-300`}>
            <LogOut size={16} /> <span className="hidden sm:inline">Log Out</span>
          </button>
          <div className="relative">
            <div className="flex items-center gap-2 pr-2">
              <div
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`w-10 h-10 lg:w-11 lg:h-11 rounded-2xl overflow-hidden border-2 ${t.border} shadow-sm cursor-pointer hover:scale-105 transition-transform relative z-50`}>
                <img src={facultyProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 ${t.card.replace('bg-', 'border-')}`} />
              </div>
              <div className="hidden sm:block text-left cursor-pointer" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                <p className={`text-[11px] font-black ${t.heading} leading-none`}>{facultyProfile.name}</p>
                <p className={`text-[9px] font-bold ${t.muted} uppercase tracking-wider mt-0.5`}>{facultyProfile.role}</p>
              </div>
            </div>
            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute right-0 mt-3 w-56 ${t.card} rounded-2xl shadow-xl border ${t.border} z-50 overflow-hidden`}
                  >
                    <div className={`p-4 border-b ${t.border} ${t.search}`}>
                      <p className={`font-bold ${t.heading}`}>{facultyProfile.name}</p>
                      <p className={`text-[10px] font-bold ${t.muted} uppercase tracking-widest`}>{facultyProfile.role}</p>
                    </div>
                    <div className="p-2 space-y-1">
                      <button onClick={() => { setShowProfileMenu(false); setActiveNav('Settings'); setSettingsSubTab('profile'); }} className={`w-full flex items-center gap-2 px-3 py-2.5 ${t.sidebarHover} rounded-xl transition-colors text-sm font-bold ${t.text}`}>
                        <User size={16} /> Edit Profile
                      </button>
                      <button onClick={() => { setShowProfileMenu(false); setActiveNav('Settings'); setSettingsSubTab('main'); }} className={`w-full flex items-center gap-2 px-3 py-2.5 ${t.sidebarHover} rounded-xl transition-colors text-sm font-bold ${t.text}`}>
                        <Settings size={16} /> Settings
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 left-0 bottom-0 w-[280px] ${t.sidebar} z-[101] lg:hidden shadow-2xl p-6 flex flex-col gap-8 overflow-y-auto styled-scrollbar border-r ${t.border}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${t.accentBg} rounded-xl ${t.accent}`}>
                    <Leaf size={24} fill="currentColor" />
                  </div>
                  <span className={`text-xl font-black italic ${t.heading}`}>Campus pace</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-2 ${t.muted}`}
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {[
                  { id: 'Assignments', label: 'Assignments', icon: <ClipboardList size={20} /> },
                  { id: 'Notices', label: 'Notices', icon: <Bell size={20} /> },
                  { id: 'Students', label: 'Student List', icon: <Users size={20} /> },
                  { id: 'Attendance', label: 'Attendance', icon: <Calendar size={20} /> },
                  { id: 'Settings', label: 'Settings', icon: <Settings size={20} /> }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveNav(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all ${activeNav === item.id
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : `${t.muted} ${t.sidebarHover}`}`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>

              <div className={`mt-auto p-6 ${t.accentBg} rounded-3xl border ${t.border.replace('border-', 'border-emerald-500/10')}`}>
                <p className={`text-[10px] font-black ${t.muted} uppercase tracking-widest mb-2`}>Paper Saved</p>
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-black ${t.accent}`}>{stats.pages}</span>
                  <FileText className={t.accent} size={20} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Conditional Content rendering */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {activeNav === 'Assignments' ? (
            <motion.main
              key="assignments"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 max-w-[1600px] w-full mx-auto p-4 lg:p-8 flex flex-col gap-6 lg:gap-8 pb-12 overflow-y-auto h-full styled-scrollbar"
            >
              {/* Header Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-4"
              >
                <div className={`flex items-center gap-2 text-xs font-bold ${t.muted}`}>
                  <span className={`cursor-pointer hover:${t.text} transition-colors`}>Courses</span>
                  <ChevronRight size={12} />
                  <span className={`cursor-pointer hover:${t.text} transition-colors`}>Env Science 101</span>
                  <ChevronRight size={12} />
                  <span className={`${t.heading} line-clamp-1`}>ASG 3: Urban Sustainability</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="max-w-3xl">
                    <h1 className={`text-2xl lg:text-4xl font-black ${t.heading} mb-1 lg:mb-2 tracking-tight`}>Assignment Management</h1>
                    <p className={`text-sm lg:text-base ${t.muted} font-medium leading-relaxed`}>Manage submissions, grade papers, and track the environmental impact of digital submissions for "Introduction to Environmental Science".</p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0 mt-2 md:mt-0">
                    <button
                      onClick={handleExport}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3 ${t.card} border ${t.border} ${t.text} text-xs lg:text-sm font-bold rounded-2xl ${t.sidebarHover} transition-all shadow-sm group`}>
                      <Download size={16} className="lg:w-[18px] lg:h-[18px] group-hover:-translate-y-0.5 transition-transform" /> <span className="hidden sm:inline">Export Report</span>
                      <span className="sm:hidden">Export</span>
                    </button>
                    <button
                      onClick={() => setShowNewAssignmentModal(true)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs lg:text-sm font-black rounded-2xl transition-all shadow-lg shadow-emerald-500/20 group">
                      <Plus size={16} className="lg:w-[18px] lg:h-[18px] group-hover:rotate-90 transition-transform" /> <span className="hidden sm:inline">New Assignment</span>
                      <span className="sm:hidden">Create</span>
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                <StatCard icon={<FileText className="text-blue-500" />} title="Total Submissions" value={stats.total} suffix="Target: 50" progress={90} delay={0.1} theme={t} />
                <StatCard icon={<Clock className="text-amber-500" />} title="Pending Grading" value={stats.pending} badge="Urgent" delay={0.2} suffixColor="text-amber-600" theme={t} />
                <StatCard icon={<TreePine className="text-emerald-500" />} title="Paper Saved" value={stats.pages} suffix="sheets" progress={75} delay={0.3} theme={t} />
                <StatCard icon={<Droplets className="text-cyan-500" />} title="Water Saved" value={stats.water} suffix="liters" progress={60} delay={0.4} theme={t} />
              </div>

              <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                {/* Left Panel: Submissions List */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className={`xl:col-span-3 ${t.card} rounded-[2rem] lg:rounded-[2.5rem] border ${t.border} flex flex-col shadow-sm overflow-hidden h-[400px] lg:h-[calc(100vh-420px)] lg:min-h-[500px]`}
                >
                  <div className={`p-6 border-b ${t.border} ${t.card} z-10 sticky top-0`}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className={`text-lg font-black ${t.heading}`}>Submissions</h2>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleShowToast("Filter options coming soon")} className={`p-2 ${t.muted} hover:${t.text} ${t.sidebarHover} rounded-xl transition-colors`}><Filter size={16} /></button>
                        <button onClick={() => handleShowToast("Sorting options coming soon")} className={`p-2 ${t.muted} hover:${t.text} ${t.sidebarHover} rounded-xl transition-colors`}><SortDesc size={16} /></button>
                      </div>
                    </div>
                    <div className="relative">
                      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.muted}`} size={16} />
                      <input type="text" placeholder="Search student..." className={`w-full pl-10 pr-4 py-2.5 ${t.search} border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 transition-all ${t.text}`} />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto styled-scrollbar p-3 space-y-3">
                    {students.map((student) => (
                      <motion.button
                        key={student.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveStudentId(student.id)}
                        className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all duration-300 relative overflow-hidden group ${activeStudentId === student.id
                          ? 'bg-gradient-to-br from-[#F0FDF4] to-white border border-[#22C55E]/30 shadow-md transform'
                          : 'bg-white border border-slate-100 hover:border-[#22C55E]/30 hover:shadow-lg'
                          }`}
                      >
                        {activeStudentId === student.id && (
                          <motion.div layoutId="activeStudentHighlight" className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#22C55E]" />
                        )}
                        <div className={`w-12 h-12 rounded-full overflow-hidden border-2 shadow-sm shrink-0 transition-colors duration-300 ${activeStudentId === student.id ? 'border-[#22C55E]' : 'border-white group-hover:border-[#22C55E]/50'}`}>
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <p className={`text-[13px] font-black truncate transition-colors duration-300 ${activeStudentId === student.id ? 'text-[#166534]' : 'text-slate-900 group-hover:text-[#22C55E]'}`}>{student.name}</p>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${student.status === 'Graded' ? 'bg-[#DCFCE7] text-[#166534]' : student.status === 'Late' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>
                              {student.status}
                            </span>
                          </div>
                          <div className="flex justify-between items-end">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{student.date}</p>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-xs font-black tabular-nums tracking-tight ${activeStudentId === student.id ? 'text-[#22C55E]' : 'text-slate-400 group-hover:text-slate-700'}`}>{student.grade}</span>
                              {student.status === 'Graded' && <CheckCircle2 size={14} className="text-[#22C55E]" />}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Center Panel: Document Viewer */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="xl:col-span-6 bg-white rounded-[2rem] lg:rounded-[2.5rem] border border-[#E5E7EB] shadow-sm flex flex-col h-[600px] lg:h-[calc(100vh-420px)] lg:min-h-[500px] overflow-hidden"
                >
                  <div className="px-4 lg:px-8 py-3 lg:py-4 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-20">
                    <div className="flex items-center gap-2 lg:gap-6">
                      <div className="flex items-center gap-1 lg:gap-2">
                        <button onClick={() => setZoom(prev => Math.max(50, prev - 10))} className="p-1.5 lg:p-2 hover:bg-slate-50 rounded-xl transition-colors"><Scissors size={14} className="lg:w-4 lg:h-4 text-slate-400" /></button>
                        <span className="text-[10px] lg:text-xs font-black text-slate-900 tabular-nums w-8 lg:w-10 text-center">{zoom}%</span>
                        <button onClick={() => setZoom(prev => Math.min(200, prev + 10))} className="p-1.5 lg:p-2 hover:bg-slate-50 rounded-xl transition-colors"><Maximize2 size={14} className="lg:w-4 lg:h-4 text-slate-400" /></button>
                      </div>
                      <div className="w-px h-6 bg-slate-100 hidden sm:block" />
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setIsHighlighting(!isHighlighting)}
                          className={`p-1.5 lg:p-2 rounded-xl transition-all flex items-center gap-2 px-2 lg:px-3 ${isHighlighting ? 'bg-[#22C55E] text-white shadow-lg shadow-[#22C55E]/20' : 'hover:bg-slate-50 text-slate-400'}`}
                        >
                          <Type size={14} className="lg:w-4 lg:h-4" />
                          <span className="text-[10px] lg:text-xs font-bold hidden sm:inline">Highlight</span>
                        </button>
                        <button className="p-1.5 lg:p-2 hover:bg-slate-50 text-slate-400 rounded-xl transition-all flex items-center gap-2 px-2 lg:px-3">
                          <MessageSquare size={14} className="lg:w-4 lg:h-4" />
                          <span className="text-[10px] lg:text-xs font-bold hidden sm:inline">Comment</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 lg:p-12 bg-slate-50/50 flex justify-center styled-scrollbar">
                    <motion.div
                      key={activeStudentId}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white p-6 lg:p-16 shadow-2xl rounded-sm w-full max-w-[800px] min-h-[1000px] h-fit relative transform-gpu origin-top"
                      style={{ scale: zoom / 100 }}
                    >
                      <div className="mb-8 lg:mb-12 border-b border-slate-100 pb-6 lg:pb-8">
                        <h2 className="text-xl lg:text-3xl font-black text-slate-900 mb-4 tracking-tight">Urban Sustainability & Green Spaces</h2>
                        <div className="flex items-center gap-3 text-xs lg:text-sm text-slate-500 font-bold">
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeStudent.name}`} alt="sc" />
                          </div>
                          <span>{activeStudent.name}</span>
                        </div>
                      </div>

                      <div className="space-y-4 lg:space-y-6 text-slate-700 leading-relaxed text-base lg:text-lg font-medium selection:bg-[#DCFCE7] selection:text-[#166534]">
                        <p className="hover:text-slate-900 transition-colors cursor-text">Building sustainable urban environments requires a multi-faceted approach to resource management and community engagement. Traditional urban planning often neglects the critical role that biodiversified green corridors play in mitigating the "urban heat island" effect.</p>

                        <p className={`hover:text-slate-900 transition-colors cursor-text ${hasHighlight ? "bg-yellow-100/60 rounded px-1 transition-colors border-l-4 border-yellow-400 -ml-1 pl-2" : ""}`}>
                          Our research indicates that cities with at least 30% canopy cover experience average summer temperatures 4.5 degrees lower than their less-vegetated counterparts. This reduction in temperature directly leads to lower energy demands for cooling systems, primarily HVAC units.
                        </p>

                        <p className="hover:text-slate-900 transition-colors cursor-text">Furthermore, the integration of permeable surfaces in urban design significantly reduces storm-water runoff, which in metropolitan areas frequently leads to localized flooding and the contamination of local water bodies with untreated urban pollutants.</p>

                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          className="my-6 lg:my-8 p-4 lg:p-6 bg-slate-50 cursor-pointer rounded-2xl border border-slate-100 flex items-center justify-between hover:shadow-md hover:border-[#22C55E]/30 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform"><FileText size={18} className="lg:w-5 lg:h-5 text-[#22C55E]" /></div>
                            <div>
                              <p className="text-[10px] lg:text-xs font-black text-slate-900 group-hover:text-[#22C55E] transition-colors">dataset_urban_emissions.csv</p>
                              <p className="text-[9px] lg:text-[10px] text-slate-400 font-bold">Attached Analysis Target</p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank');
                            }}
                            className="text-[9px] lg:text-xs font-black text-slate-400 hover:text-[#22C55E] transition-colors uppercase tracking-widest"
                          >
                            View Data
                          </button>
                        </motion.div>

                        <p className="hover:text-slate-900 transition-colors cursor-text">Community gardens and localized urban agriculture represent another tier of the green revolution. These initiatives don't just provide fresh produce to "food deserts", but also act as social focal points that strengthen community bonds and resilience.</p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Right Panel: Grading & Rubric */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="xl:col-span-3 space-y-6 lg:space-y-8 h-auto lg:h-[calc(100vh-420px)] lg:min-h-[500px] lg:overflow-y-auto lg:styled-scrollbar pr-0 lg:pr-2"
                >
                  <div className="bg-white rounded-[2.5rem] border border-[#E5E7EB] shadow-sm p-8">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-lg font-black text-slate-900">Grading</h2>
                      <div className="flex flex-col items-end">
                        <span className="text-3xl font-black text-slate-900 tabular-nums">{totalScore}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Score</span>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <InteractiveRubricSlider label="Research Quality" val={rubric.research} max={30} onChange={(v) => setRubric({ ...rubric, research: v })} theme={t} />
                      <InteractiveRubricSlider label="Clarity & Logic" val={rubric.clarity} max={30} onChange={(v) => setRubric({ ...rubric, clarity: v })} theme={t} />
                      <InteractiveRubricSlider label="Grammar & Style" val={rubric.grammar} max={20} onChange={(v) => setRubric({ ...rubric, grammar: v })} theme={t} />
                      <InteractiveRubricSlider label="Topic Relevance" val={rubric.relevance} max={20} onChange={(v) => setRubric({ ...rubric, relevance: v })} theme={t} />
                    </div>

                    <div className="mt-10 pt-8 border-t border-slate-100 relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Feedback Note</label>
                          {showAIBadge && (
                            <span className="text-[9px] font-black bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full border border-purple-200 uppercase tracking-widest flex items-center gap-1">
                              <Sparkles size={10} /> AI Suggested
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleFormat('bold')} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all" title="Bold"><Edit3 size={14} /></button>
                          <button onClick={() => handleFormat('italic')} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all" title="Italic"><Type size={14} /></button>
                        </div>
                      </div>

                      <div className="relative">
                        {isAILoading && (
                          <div className="absolute inset-0 z-10 bg-slate-50 rounded-2xl p-5 flex flex-col gap-3 overflow-hidden">
                            <div className="w-3/4 h-3 bg-slate-200 rounded animate-pulse" />
                            <div className="w-full h-3 bg-slate-200 rounded animate-pulse" />
                            <div className="w-5/6 h-3 bg-slate-200 rounded animate-pulse" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                          </div>
                        )}
                        <div
                          ref={feedbackEditorRef}
                          contentEditable
                          onInput={(e) => setFeedback(e.currentTarget.innerHTML)}
                          placeholder="Type your final feedback here..."
                          className="w-full relative z-0 p-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#DCFCE7] transition-all text-sm font-medium text-slate-700 min-h-[120px] max-h-[120px] overflow-y-auto styled-scrollbar empty:before:content-[attr(placeholder)] empty:before:text-slate-300"
                          dangerouslySetInnerHTML={{ __html: feedback }}
                        />
                      </div>

                      <div className="flex flex-wrap gap-4 mt-6">
                        <motion.button
                          whileHover={{ scale: activeStudent.status === 'Graded' || isAILoading ? 1 : 1.05 }}
                          whileTap={{ scale: activeStudent.status === 'Graded' || isAILoading ? 1 : 0.95 }}
                          onClick={handleAIMock}
                          disabled={activeStudent.status === 'Graded' || isAILoading}
                          className="flex-shrink-0 px-4 py-3.5 bg-purple-50 hover:bg-purple-100 text-purple-600 text-sm font-bold rounded-2xl transition-all border border-purple-100 disabled:opacity-50 flex items-center gap-2 group shadow-sm hover:shadow-purple-100"
                        >
                          <Sparkles size={16} className="group-hover:text-purple-500 animate-pulse" /> Auto-Suggest
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSaveDraft}
                          className="flex-1 py-3.5 bg-white border border-[#E5E7EB] text-slate-700 text-sm font-bold rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 min-w-[120px]"
                        >
                          Save Draft
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSubmitGrade}
                          className="flex-1 py-3.5 bg-[#22C55E] hover:bg-[#16a34a] text-white text-sm font-black rounded-2xl transition-all shadow-lg shadow-[#22C55E]/30 group relative overflow-hidden min-w-[140px]"
                        >
                          <span className="relative z-10 block flex flex-row items-center justify-center gap-2">
                            {activeStudent.status === 'Graded' ? 'Update Grade' : 'Submit Grade'}
                            {!(activeStudent.status === 'Graded' && totalScore === parseInt(activeStudent.grade)) && (
                              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            )}
                          </span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.main>
          ) : activeNav === 'Students' ? (
            <motion.div
              key="students"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 h-full"
            >
              <StudentListView stats={stats} theme={t} themeMode={themeMode} />
            </motion.div>
          ) : activeNav === 'Attendance' ? (
            <FacultyAttendancePage user={user} theme={t} themeMode={themeMode} />
          ) : activeNav === 'Notices' ? (
            <motion.div
              key="notices"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 h-full overflow-hidden"
            >
              <FacultyNotices />
            </motion.div>
          ) : activeNav === 'Settings' ? (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 max-w-4xl mx-auto w-full p-4 lg:p-8 space-y-8 pb-32 overflow-y-auto styled-scrollbar"
            >
              <div className="flex items-center gap-4 mb-8">
                {settingsSubTab !== 'main' && (
                  <button
                    onClick={() => setSettingsSubTab('main')}
                    className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 text-slate-600 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}
                <h1 className="text-3xl lg:text-4xl font-black text-slate-900 capitalize">
                  {settingsSubTab === 'main' ? 'Settings' : settingsSubTab}
                </h1>
              </div>

              <div className={`${t.card} rounded-[2.5rem] border ${t.border} shadow-sm overflow-hidden`}>
                <AnimatePresence mode="wait">
                  {settingsSubTab === 'main' && (
                    <motion.div
                      key="settings-main"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      {[
                        { id: 'profile', icon: <User />, label: 'Profile Information', desc: 'Update your personal details and avatar' },
                        { id: 'notifications', icon: <Bell />, label: 'Notifications', desc: 'Manage how you receive alerts and updates' },
                        { id: 'security', icon: <Shield />, label: 'Security', desc: 'Change password and account access' },
                        { id: 'appearance', icon: <Droplets />, label: 'Appearance', desc: 'Customize the dashboard theme and layout' }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setSettingsSubTab(opt.id as any)}
                          className={`w-full p-6 flex items-center justify-between ${t.sidebarHover} transition-all border-b ${t.border} last:border-0 group`}
                        >
                          <div className="flex items-center gap-6">
                            <div className={`p-4 ${t.search} ${t.muted} group-hover:bg-emerald-500/10 group-hover:${t.accent} rounded-2xl transition-all`}>
                              {opt.icon}
                            </div>
                            <div className="text-left">
                              <p className={`text-base font-black ${t.heading}`}>{opt.label}</p>
                              <p className={`text-xs font-bold ${t.muted} mt-0.5`}>{opt.desc}</p>
                            </div>
                          </div>
                          <ChevronRight size={20} className={`${t.muted} group-hover:${t.accent} group-hover:translate-x-1 transition-all`} />
                        </button>
                      ))}
                    </motion.div>
                  )}

                  {settingsSubTab === 'profile' && (
                    <motion.div
                      key="settings-profile"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-8 space-y-8"
                    >
                      <div className="flex flex-col sm:flex-row items-center gap-8 mb-4">
                        <div className="relative group">
                          <div className={`w-24 h-24 rounded-[2.5rem] ${t.search} border-4 ${t.card.replace('bg-', 'border-')} shadow-xl overflow-hidden`}>
                            <img src={facultyProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          </div>
                          <div className={`absolute -bottom-1 -right-1 p-2.5 bg-emerald-500 text-white rounded-xl shadow-lg`}>
                            <Camera size={18} />
                          </div>
                        </div>
                        <div className="text-center sm:text-left">
                          <h3 className={`text-2xl font-black ${t.heading}`}>{facultyProfile.name}</h3>
                          <p className={`${t.muted} font-bold uppercase text-[10px] tracking-widest mt-1`}>{facultyProfile.role}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className={`text-[10px] font-black ${t.muted} uppercase tracking-widest ml-1`}>Display Name</label>
                          <input type="text" value={facultyProfile.name} onChange={(e) => setFacultyProfile(prev => ({ ...prev, name: e.target.value }))} className={`w-full p-4 ${t.search} border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 font-bold ${t.text} transition-all`} />
                        </div>
                        <div className="space-y-2">
                          <label className={`text-[10px] font-black ${t.muted} uppercase tracking-widest ml-1`}>Contact Email</label>
                          <input type="email" value={facultyProfile.email} onChange={(e) => setFacultyProfile(prev => ({ ...prev, email: e.target.value }))} className={`w-full p-4 ${t.search} border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 font-bold ${t.text} transition-all`} />
                        </div>
                      </div>

                      <button onClick={() => handleShowToast("Profile Updated Successfully")} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all">Save Profile Changes</button>
                    </motion.div>
                  )}

                  {settingsSubTab === 'notifications' && (
                    <motion.div
                      key="settings-notifications"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-8 space-y-4"
                    >
                      {[
                        { id: 'assignmentAlerts', label: 'Assignment Alerts', desc: 'Get notified when new submissions arrive' },
                        { id: 'ecoMilestones', label: 'Eco Milestones', desc: 'Alert me about sustainability goals' },
                        { id: 'securityAlerts', label: 'Security Alerts', desc: 'Immediate notification of login from new devices' },
                        { id: 'emailBriefing', label: 'Email Briefing', desc: 'Receive weekly summary of class progress' }
                      ].map((pref) => (
                        <div key={pref.id} className={`flex items-center justify-between p-5 ${t.search} rounded-2xl border ${t.border}`}>
                          <div>
                            <p className={`font-black ${t.heading} leading-tight`}>{pref.label}</p>
                            <p className={`text-xs ${t.muted} font-medium mt-0.5`}>{pref.desc}</p>
                          </div>
                          <button
                            onClick={() => setNotificationSettings(prev => ({ ...prev, [pref.id]: !prev[pref.id as keyof typeof prev] }))}
                            className={`w-12 h-6.5 rounded-full transition-colors relative p-1 ${notificationSettings[pref.id as keyof typeof notificationSettings] ? 'bg-emerald-500' : 'bg-slate-300'}`}
                          >
                            <motion.div
                              animate={{ x: notificationSettings[pref.id as keyof typeof notificationSettings] ? 22 : 0 }}
                              className="w-4.5 h-4.5 bg-white rounded-full shadow-md"
                            />
                          </button>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {settingsSubTab === 'security' && (
                    <motion.div
                      key="settings-security"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-8 space-y-6"
                    >
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className={`text-[10px] font-black ${t.muted} uppercase tracking-widest ml-1`}>Current Password</label>
                          <input type="password" placeholder="••••••••" className={`w-full p-4 ${t.search} border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 font-bold ${t.text} transition-all`} />
                        </div>
                        <div className="space-y-2">
                          <label className={`text-[10px] font-black ${t.muted} uppercase tracking-widest ml-1`}>New Password</label>
                          <input type="password" placeholder="Min 8 characters" className={`w-full p-4 ${t.search} border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 font-bold ${t.text} transition-all`} />
                        </div>
                        <div className="space-y-2">
                          <label className={`text-[10px] font-black ${t.muted} uppercase tracking-widest ml-1`}>Confirm Password</label>
                          <input type="password" placeholder="Min 8 characters" className={`w-full p-4 ${t.search} border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 font-bold ${t.text} transition-all`} />
                        </div>
                      </div>
                      <button onClick={() => handleShowToast("Password Updated")} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95">Update Security Credentials</button>
                    </motion.div>
                  )}

                  {settingsSubTab === 'appearance' && (
                    <motion.div
                      key="settings-appearance"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-8 space-y-8"
                    >
                      <div>
                        <h4 className={`text-sm font-black ${t.heading} uppercase tracking-widest mb-6`}>Dashboard Theme</h4>
                        <div className="grid grid-cols-3 gap-4">
                          {['Light', 'Dark', 'Eco'].map((mode) => (
                            <button
                              key={mode}
                              onClick={() => setThemeMode(mode as any)}
                              className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 ${themeMode === mode
                                ? 'bg-emerald-500/5 border-emerald-500'
                                : `${t.card} ${t.border} hover:border-emerald-500/20`
                                }`}
                            >
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${mode === 'Light' ? 'bg-orange-100 text-orange-500' :
                                mode === 'Dark' ? 'bg-slate-800 text-white shadow-xl shadow-black/20' :
                                  'bg-emerald-100 text-emerald-500'
                                }`}>
                                {mode === 'Light' ? <Sun size={28} /> : mode === 'Dark' ? <Moon size={28} /> : <Leaf size={28} />}
                              </div>
                              <span className={`text-xs font-black ${t.text}`}>{mode}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className={`p-6 ${t.search} rounded-[2rem] border ${t.border} flex items-center justify-between`}>
                        <div className="flex items-center gap-4">
                          <div className={`p-3 ${t.card} rounded-xl shadow-sm text-emerald-500`}>
                            <HelpCircle size={24} />
                          </div>
                          <div>
                            <p className={`font-black ${t.heading}`}>Theme Persistence</p>
                            <p className={`text-xs ${t.muted} font-medium`}>Your theme choice is cloud-synced automatically</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

          ) : (
            <div className="flex-1 flex items-center justify-center">
              <motion.div
                key="other-module"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-[#DCFCE7] text-[#22C55E] mx-auto rounded-3xl flex items-center justify-center mb-6">
                  <Settings size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">{activeNav} Module</h2>
                <p className="text-slate-500 font-medium">This module is currently being optimized for your experience.</p>
              </motion.div>
            </div>
          )
          }
        </AnimatePresence >
      </div >

      {/* Global CSS injected components styling */}
      < style > {`
        .styled-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .styled-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .styled-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
        .styled-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
        
        /* Custom Range Slider */
        input[type=range] { -webkit-appearance: none; background: transparent; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 16px; width: 16px; border-radius: 50%; background: white; border: 3px solid #22C55E; cursor: pointer; margin-top: -6px; box-shadow: 0 2px 6px rgba(0,0,0,0.15); transition: transform 0.1s, box-shadow 0.1s; }
        input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.2); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.15); }
        input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 6px; cursor: pointer; background: #F1F5F9; border-radius: 10px; }
      `}</style >

      {/* Toast Notification Container */}
      <AnimatePresence>
        {
          toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 20, x: '-50%' }}
              className="fixed bottom-10 left-1/2 z-[100] bg-white text-slate-900 border border-[#E5E7EB] shadow-2xl px-6 py-4 rounded-xl flex items-center gap-3 font-bold text-sm"
            >
              <div className="w-6 h-6 bg-[#DCFCE7] text-[#22C55E] flex items-center justify-center rounded-full shrink-0">
                <CheckCircle2 size={14} />
              </div>
              {toastMessage}
            </motion.div>
          )
        }
      </AnimatePresence >

      {/* New Assignment Modal */}
      <AnimatePresence>
        {
          showNewAssignmentModal && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={() => setShowNewAssignmentModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h2 className="text-xl font-black text-slate-900">Create New Assignment</h2>
                  <button onClick={() => setShowNewAssignmentModal(false)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-full transition-colors"><X size={20} /></button>
                </div>
                <div className="p-8 space-y-5">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Assignment Title</label>
                    <input type="text" placeholder="e.g. Midterm Report" className="w-full p-4 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#DCFCE7] focus:border-[#22C55E] font-bold text-slate-900 transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Course</label>
                      <div className="space-y-3">
                        <select
                          value={newAssignmentCourse}
                          onChange={(e) => setNewAssignmentCourse(e.target.value)}
                          className="w-full p-4 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#DCFCE7] focus:border-[#22C55E] font-bold text-slate-900 transition-all appearance-none"
                        >
                          <option>Env Science 101</option>
                          <option>Geology 201</option>
                          <option value="Other">Other (Add Custom)</option>
                        </select>
                        {newAssignmentCourse === 'Other' && (
                          <input
                            type="text"
                            placeholder="Type course name..."
                            className="w-full p-4 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#DCFCE7] focus:border-[#22C55E] font-bold text-slate-900 transition-all"
                          />
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Due Date</label>
                      <input type="date" className="w-full p-4 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#DCFCE7] focus:border-[#22C55E] font-bold text-slate-900 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Description & Resources</label>
                    <div className="relative group/desc">
                      <textarea placeholder="Describe the assignment details..." className="w-full p-4 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#DCFCE7] focus:border-[#22C55E] font-medium text-slate-700 h-28 resize-none transition-all pb-12" />
                      <div className="absolute bottom-3 left-3 flex gap-2">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 bg-slate-50 hover:bg-[#DCFCE7] text-slate-400 hover:text-[#22C55E] rounded-xl transition-all flex items-center gap-2 px-3 border border-slate-100"
                        >
                          <FileText size={14} />
                          <span className="text-[10px] font-black uppercase tracking-wider">Add PDF</span>
                        </button>
                        <button
                          onClick={() => imageInputRef.current?.click()}
                          className="p-2 bg-slate-50 hover:bg-[#DCFCE7] text-slate-400 hover:text-[#22C55E] rounded-xl transition-all flex items-center gap-2 px-3 border border-slate-100"
                        >
                          <Edit3 size={14} />
                          <span className="text-[10px] font-black uppercase tracking-wider">Add Image</span>
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={(e) => e.target.files && setAssignmentFiles(prev => [...prev, e.target.files![0]])} />
                        <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files && setAssignmentFiles(prev => [...prev, e.target.files![0]])} />
                      </div>
                    </div>
                    {assignmentFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {assignmentFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-[#DCFCE7] text-[#166534] rounded-lg text-xs font-bold border border-[#22C55E]/20">
                            <span className="truncate max-w-[150px]">{file.name}</span>
                            <button onClick={() => setAssignmentFiles(prev => prev.filter((_, i) => i !== idx))} className="hover:text-red-500 transition-colors">
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                  <button onClick={() => setShowNewAssignmentModal(false)} className="px-6 py-3 font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                  <button onClick={() => { setShowNewAssignmentModal(false); handleShowToast("New Assignment Created Successfully!"); }} className="px-6 py-3 bg-[#22C55E] text-white font-black rounded-xl hover:bg-[#16a34a] shadow-lg shadow-[#22C55E]/30 transition-all">Publish Assignment</button>
                </div>
              </motion.div>
            </div>
          )
        }
      </AnimatePresence >

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {
          showLogoutModal && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                  <LogOut size={28} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Log Out?</h2>
                <p className="text-slate-500 font-medium mb-8">Are you sure you want to end your session?</p>
                <div className="flex w-full gap-3">
                  <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-3.5 font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                  <button onClick={logout} className="flex-1 py-3.5 bg-red-500 text-white font-black hover:bg-red-600 rounded-xl shadow-lg shadow-red-500/30 transition-all">Log Out</button>
                </div>
              </motion.div>
            </div>
          )
        }
      </AnimatePresence >
    </motion.div >
  );
}

// Student ListView Component
function StudentListView({ stats, theme: t, themeMode }: { stats: any, theme: any, themeMode: string }) {
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const students = [
    {
      id: 1, name: "Alice Johnson", major: "Env. Science", gpa: 3.8, performance: 92, attendance: "98%", status: "Excellent", assignments: 12, ecoPoints: 450,
      grades: [
        { subject: "Ecosystems", score: 95, color: "#22C55E" },
        { subject: "Geology", score: 88, color: "#3B82F6" },
        { subject: "Chemistry", score: 91, color: "#F59E0B" },
        { subject: "Biology", score: 94, color: "#10B981" }
      ],
      bio: "Top performer in environmental research. Highly active in green campus initiatives."
    },
    {
      id: 2, name: "Bob Smith", major: "Civil Eng.", gpa: 3.5, performance: 85, attendance: "92%", status: "Good", assignments: 10, ecoPoints: 320,
      grades: [
        { subject: "Structures", score: 82, color: "#3B82F6" },
        { subject: "Materials", score: 87, color: "#F59E0B" },
        { subject: "Surveying", score: 85, color: "#22C55E" },
        { subject: "Math", score: 86, color: "#6366F1" }
      ],
      bio: "Strong analytical skills. Excels in practical laboratory sessions."
    },
    {
      id: 3, name: "Charlie Brown", major: "Architecture", gpa: 2.9, performance: 72, attendance: "85%", status: "Average", assignments: 8, ecoPoints: 150,
      grades: [
        { subject: "Design", score: 75, color: "#F59E0B" },
        { subject: "History", score: 70, color: "#6366F1" },
        { subject: "CAD", score: 74, color: "#22C55E" },
        { subject: "Physics", score: 68, color: "#EF4444" }
      ],
      bio: "Creative thinker, needs to focus more on theoretical assessments."
    },
    {
      id: 4, name: "Diana Prince", major: "Biology", gpa: 3.7, performance: 88, attendance: "95%", status: "Good", assignments: 11, ecoPoints: 380,
      grades: [
        { subject: "Genetics", score: 90, color: "#10B981" },
        { subject: "Botany", score: 86, color: "#22C55E" },
        { subject: "Zoology", score: 89, color: "#F59E0B" },
        { subject: "Lab", score: 87, color: "#3B82F6" }
      ],
      bio: "Excellent lab work and documentation skills."
    },
    {
      id: 5, name: "Evan Wright", major: "Comp Science", gpa: 3.2, performance: 80, attendance: "90%", status: "Average", assignments: 9, ecoPoints: 210,
      grades: [
        { subject: "Coding", score: 85, color: "#6366F1" },
        { subject: "DS", score: 78, color: "#F59E0B" },
        { subject: "OS", score: 82, color: "#10B981" },
        { subject: "DB", score: 75, color: "#3B82F6" }
      ],
      bio: "Passionate about software development, working on improving data structure logic."
    },
    {
      id: 6, name: "Fiona Gallagher", major: "Humanities", gpa: 3.9, performance: 95, attendance: "99%", status: "Excellent", assignments: 13, ecoPoints: 520,
      grades: [
        { subject: "History", score: 98, color: "#F59E0B" },
        { subject: "Sociology", score: 94, color: "#6366F1" },
        { subject: "Ethics", score: 96, color: "#10B981" },
        { subject: "Phil", score: 92, color: "#22C55E" }
      ],
      bio: "Extraordinary writing skills. Frequently assists peers in ethics debates."
    },
    { id: 7, name: "George Miller", major: "Env. Science", gpa: 3.4, performance: 82, attendance: "91%", status: "Good", assignments: 10, ecoPoints: 290, grades: [{ subject: "Ecosystems", score: 84, color: "#22C55E" }, { subject: "Geology", score: 80, color: "#3B82F6" }], bio: "Steady progress in core subjects." },
    { id: 8, name: "Hannah Lee", major: "Geology", gpa: 3.6, performance: 84, attendance: "93%", status: "Good", assignments: 11, ecoPoints: 340, grades: [{ subject: "Earth Sci", score: 88, color: "#3B82F6" }, { subject: "Mapping", score: 82, color: "#10B981" }], bio: "Strong research and analytical skills." },
    { id: 9, name: "Ivan Drago", major: "Physics", gpa: 3.8, performance: 90, attendance: "96%", status: "Excellent", assignments: 12, ecoPoints: 410, grades: [{ subject: "Quantum", score: 92, color: "#6366F1" }, { subject: "Thermo", score: 88, color: "#EF4444" }], bio: "Highly focused on advanced physics." },
    { id: 10, name: "Julie Chen", major: "Mathematics", gpa: 4.0, performance: 98, attendance: "100%", status: "Excellent", assignments: 14, ecoPoints: 580, grades: [{ subject: "Calculus", score: 100, color: "#10B981" }, { subject: "Algebra", score: 96, color: "#3B82F6" }], bio: "Remarkable aptitude for mathematics." },
    { id: 11, name: "Kevin Hart", major: "Sociology", gpa: 3.1, performance: 78, attendance: "88%", status: "Average", assignments: 9, ecoPoints: 190, grades: [{ subject: "Research", score: 80, color: "#F59E0B" }, { subject: "Society", score: 76, color: "#6366F1" }], bio: "Good social insight but needs to focus on papers." },
    { id: 12, name: "Lara Croft", major: "History", gpa: 3.7, performance: 89, attendance: "94%", status: "Good", assignments: 11, ecoPoints: 360, grades: [{ subject: "Global Hist", score: 91, color: "#F59E0B" }, { subject: "Anthr", score: 87, color: "#10B981" }], bio: "Excellent archive researcher." },
    { id: 13, name: "Marcus Aurelius", major: "Philosophy", gpa: 3.9, performance: 94, attendance: "97%", status: "Excellent", assignments: 13, ecoPoints: 480, grades: [{ subject: "Logic", score: 96, color: "#6366F1" }, { subject: "Ethics", score: 93, color: "#22C55E" }], bio: "Profound thinker, highly articulated." },
    { id: 14, name: "Nina Simone", major: "Arts", gpa: 3.5, performance: 86, attendance: "95%", status: "Good", assignments: 10, ecoPoints: 310, grades: [{ subject: "Curating", score: 88, color: "#F59E0B" }, { subject: "Theory", score: 84, color: "#3B82F6" }], bio: "Highly creative with unique perspectives." }
  ];

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.major.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const performanceData = [65, 78, 82, 75, 88, 92, 85];
  const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

  return (
    <div className={`flex-1 max-w-[1600px] w-full mx-auto p-4 lg:p-8 flex flex-col gap-8 pb-12 overflow-y-auto h-full styled-scrollbar ${t.bg}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className={`text-3xl lg:text-5xl font-black ${t.heading} leading-tight`}>Student Performance Analytics</h1>
          <p className={`${t.muted} font-medium mt-2`}>Comprehensive overview of academic excellence and environmental engagement.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${t.muted}`} size={18} />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${t.card} border ${t.border} rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 transition-all ${t.text}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Class Performance Graph */}
        <div className={`lg:col-span-2 ${t.card} rounded-[2.5rem] border ${t.border} shadow-sm p-4 lg:p-8 flex flex-col min-h-[400px]`}>
          <div className="flex items-center justify-between mb-8 lg:mb-10">
            <div>
              <h3 className={`text-lg lg:text-xl font-black ${t.heading}`}>Class Performance Trend</h3>
              <p className={`text-[10px] lg:text-xs font-bold ${t.muted} uppercase tracking-widest mt-1`}>Average grades % over time</p>
            </div>
            <div className="flex gap-2">
              <span className={`flex items-center gap-2 text-[10px] font-black ${t.muted} px-3 py-1 ${t.search} rounded-full border ${t.border}`}>
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> Avg Score
              </span>
            </div>
          </div>

          <div className="flex-1 flex items-end justify-between gap-2 lg:gap-4 h-64 lg:h-72 relative pt-12 pb-2">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-10 pt-12">
              {[0, 25, 50, 75, 100].map(val => (
                <div key={val} className={`w-full border-t ${t.border} flex items-center relative opacity-50`}>
                  <span className={`absolute -left-0 lg:-left-10 text-[8px] lg:text-[9px] font-bold ${t.muted}`}>{val}%</span>
                </div>
              ))}
            </div>

            {performanceData.map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-3 lg:gap-4 group cursor-pointer relative z-10 h-full justify-end">
                <div className="w-full flex-1 flex flex-col justify-end min-h-0">
                  <motion.div
                    initial={{ height: "0%" }}
                    animate={{ height: `${val}%` }}
                    transition={{ duration: 1, delay: idx * 0.1, type: "spring", bounce: 0.1 }}
                    className={`w-full bg-gradient-to-t ${themeMode === 'Dark' ? 'from-slate-800 to-emerald-500' : 'from-emerald-50 to-emerald-500'} rounded-t-xl lg:rounded-t-2xl relative overflow-hidden shadow-sm group-hover:brightness-105 group-hover:shadow-lg transition-all`}
                  >
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] lg:text-[10px] font-black text-white bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {val}%
                    </div>
                  </motion.div>
                </div>
                <span className={`text-[9px] lg:text-[10px] font-black ${t.muted} uppercase tracking-widest`}>{months[idx]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Global Stats */}
        <div className="flex flex-col gap-6">
          <div className="flex-1 bg-gradient-to-br from-[#166534] to-[#22C55E] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-[#22C55E]/20">
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <h4 className="text-lg font-black mb-6 flex items-center gap-2">
              <Sparkles size={20} /> Class Insights
            </h4>
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Average GPA</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black">3.48</span>
                  <span className="text-xs text-green-200">+0.12 this sem</span>
                </div>
              </div>
              <div className="h-px bg-white/10" />
              <div>
                <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Total Assignments Graded</p>
                <span className="text-4xl font-black">{stats.total}</span>
              </div>
            </div>
          </div>

          <div className={`bg-white ${t.card} rounded-[2.5rem] border ${t.border} p-8 shadow-sm flex items-center justify-between group hover:border-emerald-500/30 transition-all cursor-pointer`}>
            <div>
              <p className={`text-[10px] font-black ${t.muted} uppercase tracking-widest mb-1`}>Active Students</p>
              <h3 className={`text-2xl font-black ${t.heading}`}>{students.length} <span className={`text-sm font-bold ${t.muted}`}>Total</span></h3>
            </div>
            <div className={`w-14 h-14 ${t.accentBg} ${t.accent} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <Users size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* Student List Table */}
      <div className={`${t.card} rounded-[3rem] border ${t.border} shadow-sm overflow-hidden min-h-[400px]`}>
        <div className={`p-8 border-b ${t.border} ${t.search}`}>
          <h3 className={`text-xl font-black ${t.heading}`}>Enrolled Students</h3>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${t.muted} ${t.card} border ${t.border} px-4 py-2 rounded-xl`}>
              {filteredStudents.length} Students
            </span>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${t.border}`}>
                <th className={`px-8 py-5 text-[10px] font-black ${t.muted} uppercase tracking-[0.2em]`}>Student</th>
                <th className={`px-8 py-5 text-[10px] font-black ${t.muted} uppercase tracking-[0.2em]`}>Academic Info</th>
                <th className={`px-8 py-5 text-[10px] font-black ${t.muted} uppercase tracking-[0.2em]`}>Performance</th>
                <th className={`px-8 py-5 text-[10px] font-black ${t.muted} uppercase tracking-[0.2em]`}>Engagement</th>
                <th className={`px-8 py-5 text-[10px] font-black ${t.muted} uppercase tracking-[0.2em] text-right`}>Progress</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filteredStudents.map((student, idx) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedStudent(student)}
                    className="border-b border-slate-50 last:border-0 hover:bg-[#F0FDF4]/30 transition-all duration-300 group cursor-pointer"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100 group-hover:scale-110 group-hover:rotate-3 transition-all">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} alt="" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">{student.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{student.major}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="text-sm font-black text-slate-700">GPA: {student.gpa}</p>
                        <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase">
                          <CheckCircle2 size={12} className="text-[#22C55E]" /> {student.assignments} Finished
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                        <span className={`w-fit px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${student.status === 'Excellent' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm shadow-emerald-500/5' :
                          student.status === 'Good' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                            'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                          {student.status}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-24">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${student.performance}%` }}
                              className={`h-full ${student.performance > 90 ? 'bg-emerald-500' : student.performance > 80 ? 'bg-blue-500' : 'bg-amber-500'} shadow-[0_0_8px_currentColor] brightness-110`}
                            />
                          </div>
                          <span className="text-[10px] font-black text-slate-900 tabular-nums">{student.performance}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#E8F5E9] text-[#22C55E] rounded-xl group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                          <Sparkles size={16} />
                        </div>
                        <p className="text-xs font-black text-slate-700">{student.ecoPoints} <span className="text-slate-400 font-bold ml-0.5">pts</span></p>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2.5 text-slate-400 group-hover:text-[#22C55E] group-hover:translate-x-1 transition-all">
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudent(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-8 pb-4 flex items-start justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-xl">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudent.name}`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900">{selectedStudent.name}</h2>
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mt-1">{selectedStudent.major} • GPA: {selectedStudent.gpa}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-8 pt-4 styled-scrollbar space-y-8">
                {/* Subject Grades */}
                <section>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Subject-wise Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedStudent.grades?.map((g: any, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-black text-slate-700">{g.subject}</span>
                          <span className="text-sm font-black tabular-nums" style={{ color: g.color }}>{g.score}%</span>
                        </div>
                        <div className="h-2 bg-white rounded-full overflow-hidden border border-slate-100">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${g.score}%` }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: g.color }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* Behavioral & Engagement */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-[#F0FDF4] p-6 rounded-3xl border border-primary/10">
                    <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-2">Attendance</p>
                    <p className="text-2xl font-black text-primary">{selectedStudent.attendance}</p>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Assignments</p>
                    <p className="text-2xl font-black text-blue-600">{selectedStudent.assignments} <span className="text-xs">Done</span></p>
                  </div>
                </div>

                {/* Bio/Notes */}
                {selectedStudent.bio && (
                  <section className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-primary/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                    <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Sparkles size={14} /> Professor's Notes
                    </h3>
                    <p className="text-sm font-medium leading-relaxed opacity-90">{selectedStudent.bio}</p>
                  </section>
                )}
              </div>

              {/* Action */}
              <div className="p-8 bg-slate-50/80 border-t border-slate-100 flex gap-4">
                <button
                  onClick={() => setIsFeedbackOpen(true)}
                  className="flex-1 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Send Direct Feedback
                </button>
                <button
                  onClick={() => setIsReportOpen(true)}
                  className="px-6 py-4 bg-white text-slate-600 rounded-2xl font-black border border-slate-200 hover:bg-slate-100 transition-all"
                >
                  Full Report
                </button>
              </div>

              {/* Feedback Overlay */}
              <AnimatePresence>
                {isFeedbackOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-0 bg-white/95 backdrop-blur-xl z-[210] p-8 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900">Direct Feedback</h3>
                        <p className="text-sm font-bold text-slate-500">Sending to {selectedStudent.name}</p>
                      </div>
                      <button
                        onClick={() => setIsFeedbackOpen(false)}
                        className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Write your constructive feedback here..."
                      className="flex-1 w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-slate-900 font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none mb-6"
                    />

                    <div className="flex gap-4">
                      <button
                        disabled={isSending || !feedbackText.trim()}
                        onClick={() => {
                          setIsSending(true);
                          setTimeout(() => {
                            setIsSending(false);
                            setIsFeedbackOpen(false);
                            setFeedbackText("");
                          }, 1500);
                        }}
                        className="flex-1 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                      >
                        <motion.span animate={isSending ? { y: -40 } : { y: 0 }} className="block">
                          Send Feedback
                        </motion.span>
                        {isSending && (
                          <motion.div
                            initial={{ y: 40 }}
                            animate={{ y: 0 }}
                            className="absolute inset-0 flex items-center justify-center gap-2"
                          >
                            <Loader2 className="animate-spin" size={18} /> Sending...
                          </motion.div>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reports Overlay */}
              <AnimatePresence>
                {isReportOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className={`absolute inset-0 ${t.bg} z-[210] p-8 flex flex-col h-full overflow-hidden`}
                  >
                    <div className="flex items-center justify-between mb-8 shrink-0">
                      <div>
                        <h3 className={`text-2xl font-black ${t.heading}`}>Academic Reports</h3>
                        <p className={`text-sm font-bold ${t.muted}`}>Historical performance data</p>
                      </div>
                      <button
                        onClick={() => setIsReportOpen(false)}
                        className={`p-3 ${t.card} hover:${t.search} rounded-2xl shadow-sm border ${t.border} transition-all ${t.muted}`}
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 styled-scrollbar pb-6">
                      {[
                        { title: "Semester 1 Outcomes", date: "Jan 12, 2024", score: "94%", tag: "Term" },
                        { title: "Mid-Term Assessment", date: "Feb 05, 2024", score: "88%", tag: "Exam" },
                        { title: "Lab Research Thesis", date: "Feb 20, 2024", score: "91%", tag: "Research" },
                        { title: "Interdisciplinary Project", date: "Mar 02, 2024", score: "A+", tag: "Project" }
                      ].map((report, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={`${t.card} p-6 rounded-3xl border ${t.border} flex items-center justify-between hover:border-emerald-500/30 hover:shadow-md transition-all group`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 ${t.search} rounded-2xl flex items-center justify-center ${t.muted} group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors`}>
                              <FileText size={24} />
                            </div>
                            <div>
                              <p className={`text-sm font-black ${t.heading}`}>{report.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[10px] font-black ${t.muted} uppercase tracking-widest`}>{report.date}</span>
                                <span className={`w-1 h-1 rounded-full ${t.muted.replace('text-', 'bg-')} opacity-30`} />
                                <span className={`text-[10px] font-black ${t.accent} uppercase tracking-widest`}>{report.tag}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-black ${t.heading}`}>{report.score}</p>
                            <button className={`text-[10px] font-black ${t.accent} uppercase tracking-widest hover:underline mt-0.5`}>Download PDF</button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-auto shrink-0">
                      <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg shadow-slate-900/10 hover:scale-[1.02] flex items-center justify-center gap-2">
                        <Download size={18} /> Download All Reports
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div >
  );
}

function StatCard({ icon, title, value, suffix, badge, progress, delay, theme: t, suffixColor = "text-slate-500" }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`${t.card} p-6 rounded-[2rem] border ${t.border} flex flex-col gap-3 shadow-sm relative h-[160px] group overflow-hidden hover-lift transition-all`}
    >
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className={`text-[11px] font-bold ${t.muted} mb-0.5 uppercase tracking-wider`}>{title}</p>
          <div className="flex items-baseline gap-1 mt-1">
            <h3
              className={`text-4xl leading-none font-black ${t.heading} tracking-tight`}
            >
              {typeof value === 'number' ? <CountUp end={value} duration={2} separator="," /> : value}
            </h3>
          </div>
        </div>
        <div className={`shrink-0 ${t.search} p-2.5 rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>

      <div className="flex justify-between items-center mt-auto relative z-10">
        <span className={`text-xs font-bold ${suffixColor} ${badge ? 'bg-amber-100/50 text-amber-700 px-3 py-1 rounded-full text-[10px] animate-pulse border border-amber-200/50' : ''}`}>
          {badge || suffix}
        </span>
      </div>
      {progress !== undefined && (
        <div className={`w-full h-1.5 ${t.search} rounded-full mt-3 overflow-hidden relative z-10`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.5, delay: delay + 0.2, ease: "easeOut" }}
            className={`h-full ${t.accent.replace('text-', 'bg-')} rounded-full`}
          />
        </div>
      )}
    </motion.div>
  );
}

function InteractiveRubricSlider({ label, val, max, onChange, theme: t }: { label: string, val: number, max: number, onChange: (v: number) => void, theme: any }) {
  const percent = (val / max) * 100;

  // Color coded logic
  const trackColor = percent <= 40 ? '#EAB308' : percent <= 70 ? '#84CC16' : '#22C55E';
  const trackBgClass = percent <= 40 ? 'bg-yellow-50 text-yellow-600' : percent <= 70 ? 'bg-lime-50 text-lime-600' : 'bg-emerald-50 text-emerald-600';

  return (
    <div className="space-y-4 group">
      <div className="flex justify-between text-xs font-bold items-end mb-1">
        <span className={`${t.muted} uppercase tracking-widest text-[10px] transition-colors group-hover:${t.text}`}>{label}</span>
        <motion.span
          key={val}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`${trackBgClass} tabular-nums transition-colors px-3 py-1 rounded-lg shadow-sm border border-black/5`}
        >
          {val} <span className="opacity-50 text-[10px]">/ {max}</span>
        </motion.span>
      </div>
      <div className="relative group/track">
        <div className="absolute inset-0 top-1/2 -translate-y-1/2 h-2.5 bg-slate-100 rounded-full pointer-events-none border inset-shadow-sm border-black/5" />
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-2.5 rounded-full pointer-events-none shadow-[0_0_10px_currentColor] brightness-110"
          animate={{ width: `${percent}%`, backgroundColor: trackColor, color: trackColor }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
        <input
          type="range"
          min="0"
          max={max}
          value={val}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full relative z-10 opacity-0 cursor-pointer h-8 group-hover/track:scale-105 transition-transform"
        />
      </div>
    </div>
  );
}

