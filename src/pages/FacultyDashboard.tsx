import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Leaf, Search, Bell, LayoutDashboard, BookOpen,
  TreePine, Settings, LogOut, FileText, CloudOff,
  Zap, Plus, Download, ChevronRight, Users,
  CheckCircle2, Clock, AlertCircle, ArrowLeft, ArrowRight,
  Edit3, MessageSquare, Scissors, Type, Maximize2,
  MoreVertical, Filter, SortDesc, Folder, ClipboardList, Droplets, User, X, Sparkles
} from 'lucide-react';
import CountUp from 'react-countup';
import { useAuth } from '../AuthContext';
import FacultyNotices from './FacultyNotices';

export default function FacultyDashboard() {
  const { user, logout } = useAuth();

  // Navigation State
  const [activeNav, setActiveNav] = useState("Assignments");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNewAssignmentModal, setShowNewAssignmentModal] = useState(false);
  const [newAssignmentCourse, setNewAssignmentCourse] = useState("Env Science 101");
  const [assignmentFiles, setAssignmentFiles] = useState<File[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
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
      className="min-h-screen bg-[#F8FAF9] flex flex-col font-sans"
    >
      {/* Top Navbar */}
      <header className="bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 lg:px-8 py-3 lg:py-4 sticky top-0 z-40">
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
            <div className="p-1.5 lg:p-2 bg-[#E8F5E9] rounded-xl lg:rounded-2xl text-[#22C55E] shadow-sm transform group-hover:rotate-12 transition-transform">
              <Leaf size={24} fill="currentColor" className="lg:w-7 lg:h-7" />
            </div>
            <span className="text-lg lg:text-2xl font-black tracking-tight text-slate-900 italic">Green-Sync</span>
          </div>
          <div className="relative flex-1 max-w-md hidden lg:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              onKeyDown={(e) => e.key === 'Enter' && handleShowToast(`Searching for "${(e.target as HTMLInputElement).value}"...`)}
              className="w-full bg-[#F8FAF9] border-none rounded-2xl py-2.5 pl-11 pr-4 text-sm font-bold focus:ring-2 focus:ring-[#DCFCE7] transition-all"
            />
          </div>
        </div>
        <nav className="hidden lg:flex items-center gap-8 relative mr-8">
          {['Notices', 'Assignments'].map(nav => (
            <button
              key={nav}
              onClick={() => setActiveNav(nav)}
              className={`text-sm font-bold transition-colors relative py-1 ${activeNav === nav ? 'text-[#22C55E]' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {nav}
              {activeNav === nav && (
                <motion.div layoutId="navUnderline" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#22C55E] rounded-full" />
              )}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3 lg:gap-4">
          <button onClick={() => setShowLogoutModal(true)} className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-[#F8FAF9] text-slate-600 border border-[#E5E7EB] text-xs lg:text-sm font-bold rounded-xl hover:bg-[#DCFCE7] hover:text-[#22C55E] hover:border-[#DCFCE7] transition-all duration-300">
            <LogOut size={16} /> <span className="hidden sm:inline">Log Out</span>
          </button>
          <div className="relative">
            <div
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-transform flex items-center justify-center relative z-50">
              <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "prof"}`} alt="Avatar" />
            </div>
            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                      <p className="font-bold text-slate-900">{user?.name || "Professor"}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{user?.role || "Faculty"}</p>
                    </div>
                    <div className="p-2 space-y-1">
                      <button onClick={() => { setShowProfileMenu(false); handleShowToast("Profile context opened"); }} className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-colors text-sm font-bold text-slate-700">
                        <User size={16} /> Edit Profile
                      </button>
                      <button onClick={() => { setShowProfileMenu(false); handleShowToast("Settings context opened"); }} className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-colors text-sm font-bold text-slate-700">
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
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[101] lg:hidden shadow-2xl p-6 flex flex-col gap-8 overflow-y-auto styled-scrollbar"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-[#E8F5E9] p-2 rounded-xl text-[#22C55E]">
                    <Leaf size={24} fill="currentColor" />
                  </div>
                  <span className="text-xl font-black italic text-slate-900">Green-Sync</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-400"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {[
                  { id: 'Notices', label: 'Notices', icon: <Bell size={20} /> },
                  { id: 'Assignments', label: 'Assignments', icon: <ClipboardList size={20} /> },
                  { id: 'Students', label: 'Student List', icon: <Users size={20} /> },
                  { id: 'Stats', label: 'Eco Stats', icon: <TreePine size={20} /> },
                  { id: 'Settings', label: 'Settings', icon: <Settings size={20} /> }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'Notices' || item.id === 'Assignments') {
                        setActiveNav(item.id);
                      } else {
                        handleShowToast(`${item.label} module coming soon`);
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all ${activeNav === item.id
                      ? 'bg-[#22C55E] text-white shadow-lg shadow-[#22C55E]/20'
                      : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="mt-auto p-6 bg-[#F0FDF4] rounded-3xl border border-[#DCFCE7]">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Paper Saved</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-[#166534]">{stats.pages}</span>
                  <FileText className="text-[#22C55E]" size={20} />
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
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <span className="cursor-pointer hover:text-slate-600 transition-colors">Courses</span>
                  <ChevronRight size={12} />
                  <span className="cursor-pointer hover:text-slate-600 transition-colors">Env Science 101</span>
                  <ChevronRight size={12} />
                  <span className="text-slate-900 line-clamp-1">ASG 3: Urban Sustainability</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="max-w-3xl">
                    <h1 className="text-2xl lg:text-4xl font-black text-slate-900 mb-1 lg:mb-2 tracking-tight">Assignment Management</h1>
                    <p className="text-sm lg:text-base text-slate-500 font-medium leading-relaxed">Manage submissions, grade papers, and track the environmental impact of digital submissions for "Introduction to Environmental Science".</p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0 mt-2 md:mt-0">
                    <button
                      onClick={handleExport}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3 bg-white border border-[#E5E7EB] text-slate-700 text-xs lg:text-sm font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm group">
                      <Download size={16} className="lg:w-[18px] lg:h-[18px] group-hover:-translate-y-0.5 transition-transform" /> <span className="hidden sm:inline">Export Report</span>
                      <span className="sm:hidden">Export</span>
                    </button>
                    <button
                      onClick={() => setShowNewAssignmentModal(true)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 lg:px-6 py-2.5 lg:py-3 bg-[#22C55E] hover:bg-[#16a34a] text-white text-xs lg:text-sm font-black rounded-2xl transition-all shadow-lg shadow-[#22C55E]/20 group">
                      <Plus size={16} className="lg:w-[18px] lg:h-[18px] group-hover:rotate-90 transition-transform" /> <span className="hidden sm:inline">New Assignment</span>
                      <span className="sm:hidden">Create</span>
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                <StatCard icon={<FileText className="text-blue-500" />} title="Total Submissions" value={stats.total} suffix="Target: 50" progress={90} delay={0.1} />
                <StatCard icon={<Clock className="text-amber-500" />} title="Pending Grading" value={stats.pending} badge="Urgent" delay={0.2} suffixColor="text-amber-600" />
                <StatCard icon={<TreePine className="text-[#22C55E]" />} title="Paper Saved" value={stats.pages} suffix="sheets" progress={75} delay={0.3} />
                <StatCard icon={<Droplets className="text-cyan-500" />} title="Water Saved" value={stats.water} suffix="liters" progress={60} delay={0.4} />
              </div>

              <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                {/* Left Panel: Submissions List */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="xl:col-span-3 bg-white rounded-[2rem] lg:rounded-[2.5rem] border border-[#E5E7EB] flex flex-col shadow-sm overflow-hidden h-[400px] lg:h-[calc(100vh-420px)] lg:min-h-[500px]"
                >
                  <div className="p-6 border-b border-slate-100 bg-white z-10 sticky top-0">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-black text-slate-900">Submissions</h2>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleShowToast("Filter options coming soon")} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"><Filter size={16} /></button>
                        <button onClick={() => handleShowToast("Sorting options coming soon")} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"><SortDesc size={16} /></button>
                      </div>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input type="text" placeholder="Search student..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#DCFCE7] transition-all" />
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
                      <InteractiveRubricSlider label="Research Quality" val={rubric.research} max={30} onChange={(v) => setRubric({ ...rubric, research: v })} />
                      <InteractiveRubricSlider label="Clarity & Logic" val={rubric.clarity} max={30} onChange={(v) => setRubric({ ...rubric, clarity: v })} />
                      <InteractiveRubricSlider label="Grammar & Style" val={rubric.grammar} max={20} onChange={(v) => setRubric({ ...rubric, grammar: v })} />
                      <InteractiveRubricSlider label="Topic Relevance" val={rubric.relevance} max={20} onChange={(v) => setRubric({ ...rubric, relevance: v })} />
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

// Sub-components
function StatCard({ icon, title, value, suffix, badge, progress, delay, suffixColor = "text-slate-500" }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white p-6 rounded-[2rem] border border-[#E5E7EB] flex flex-col gap-3 shadow-sm relative h-[160px] group overflow-hidden hover-lift transition-all"
    >
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[11px] font-bold text-slate-500 mb-0.5 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-1 mt-1">
            <h3
              className="text-4xl leading-none font-black text-slate-900 tracking-tight"
            >
              {typeof value === 'number' ? <CountUp end={value} duration={2} separator="," /> : value}
            </h3>
          </div>
        </div>
        <div className="shrink-0 bg-slate-50 p-2.5 rounded-2xl group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </div>

      <div className="flex justify-between items-center mt-auto relative z-10">
        <span className={`text-xs font-bold ${suffixColor} ${badge ? 'bg-amber-100/50 text-amber-700 px-3 py-1 rounded-full text-[10px] animate-pulse border border-amber-200/50' : ''}`}>
          {badge || suffix}
        </span>
      </div>
      {progress !== undefined && (
        <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden relative z-10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.5, delay: delay + 0.2, ease: "easeOut" }}
            className="h-full bg-[#22C55E] rounded-full"
          />
        </div>
      )}
    </motion.div>
  );
}

function InteractiveRubricSlider({ label, val, max, onChange }: { label: string, val: number, max: number, onChange: (v: number) => void }) {
  const percent = (val / max) * 100;

  // Color coded logic
  const trackColor = percent <= 40 ? '#EAB308' : percent <= 70 ? '#84CC16' : '#22C55E';
  const trackBgClass = percent <= 40 ? 'bg-yellow-50 text-yellow-600' : percent <= 70 ? 'bg-lime-50 text-lime-600' : 'bg-[#DCFCE7] text-[#22C55E]';

  return (
    <div className="space-y-4 group">
      <div className="flex justify-between text-xs font-bold items-end mb-1">
        <span className="text-slate-500 uppercase tracking-widest text-[10px] transition-colors group-hover:text-slate-900">{label}</span>
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
