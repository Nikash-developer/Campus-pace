import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Leaf, Search, Bell, LayoutDashboard, BookOpen,
  TreePine, Settings, LogOut, FileText, CloudOff,
  Zap, AlertCircle, Megaphone, Trophy,
  GraduationCap, Calculator, Code, FileDown,
  User, Shield, BellRing, Palette, HelpCircle,
  Clock, CheckCircle2, ChevronRight, MessageSquare,
  Send, X, Sparkles, FileQuestion, ExternalLink,
  Upload, File, ChevronLeft, Camera, ShieldAlert,
  Sun, Moon, Trash2, Eye, RefreshCcw, Database,
  Bot, ArrowUpRight
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import confetti from 'canvas-confetti';
import CountUp from 'react-countup';
import { useAuth } from '../AuthContext';
import { calculateImpact } from '../lib/utils';
import { Notice, Assignment } from '../types';

import { AssignmentSubmissionView } from '../components/AssignmentSubmissionView';
import { allQuestionPapers } from '../lib/mockPapers';

type Tab = 'dashboard' | 'courses' | 'eco-tracker' | 'settings' | 'papers' | 'notes' | 'assignment-submission';

interface Note {
  id: number;
  title: string;
  subject: string;
  semester: number;
  category: string;
  url: string;
}

interface QuestionPaper {
  id: number;
  subject: string;
  year: string;
  semester: string;
  type: 'Regular' | 'KT';
  url: string;
}

interface Course {
  id: number;
  title: string;
  instructor: string;
  progress: number;
  color: string;
  icon: React.ReactNode;
  syllabus: string[];
  syllabusUrl?: string;
  semester: number;
}

interface AssignmentWithFile extends Assignment {
  uploadedFile?: File;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const mockPapers: QuestionPaper[] = [
  ...allQuestionPapers
];

const themes = {
  Light: {
    bg: 'bg-[#F8F9FA]',
    header: 'bg-white border-slate-100',
    text: 'text-slate-900',
    heading: 'text-slate-800',
    card: 'bg-white border-slate-100',
    navActive: 'text-primary bg-primary/5',
    navInactive: 'text-slate-500 hover:bg-slate-50',
    search: 'bg-[#F1F3F5]',
    input: 'bg-slate-50 border-slate-100',
    muted: 'text-slate-400',
    border: 'border-slate-100',
    accent: 'text-primary',
    accentBg: 'bg-primary/5',
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

// Sub-components
const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string | number, trend: string, color: string, isNumeric?: boolean, theme: any }> = ({ icon, label, value, trend, color, isNumeric, theme: t }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className={`${t.card} p-5 lg:p-8 rounded-2xl lg:rounded-[2rem] shadow-sm border ${t.border} flex flex-col justify-between group transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/50`}
  >
    <div className="flex justify-between items-start mb-6">
      <div className={`${t.accentBg} ${t.accent} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className={`flex items-center gap-1 ${trend.startsWith('+') ? 'text-green-500' : 'text-slate-400'} text-xs font-black`}>
        {trend}
      </div>
    </div>
    <div>
      <p className={`text-[10px] lg:text-xs font-black ${t.muted} uppercase tracking-widest mb-1`}>{label}</p>
      <div className={`text-2xl lg:text-4xl font-black ${t.heading} tracking-tight`}>
        {isNumeric ? <CountUp end={Number(value)} duration={2} /> : value}
      </div>
    </div>
  </motion.div>
);

const NoticeItem: React.FC<{ notice: Notice, theme: any }> = ({ notice, theme: t }) => (
  <div className={`p-5 lg:p-6 rounded-3xl lg:rounded-[2.5rem] ${t.card} border ${t.border} hover:border-primary/20 transition-all duration-500 group relative overflow-hidden`}>
    <div className="flex items-start gap-4 lg:gap-6 relative z-10">
      <div className={`p-3 lg:p-4 rounded-2xl lg:rounded-3xl ${notice.is_emergency ? 'bg-red-50 text-red-500' : t.accentBg + ' ' + t.accent} group-hover:scale-110 transition-transform`}>
        {notice.is_emergency ? <AlertCircle size={24} className="lg:w-7 lg:h-7" /> : <Megaphone size={24} className="lg:w-7 lg:h-7" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${notice.is_emergency ? 'text-red-500' : t.accent}`}>{notice.is_emergency ? 'Emergency' : 'Announcement'}</span>
          <span className={`text-[10px] font-bold ${t.muted}`}>{new Date(notice.publish_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <h4 className={`text-lg font-black ${t.heading} mb-2 leading-tight`}>{notice.title}</h4>
        <p className={`text-sm ${t.muted} font-medium leading-relaxed line-clamp-2 mb-4`}>{notice.content}</p>

        {notice.attachment_url && (
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ x: 4 }}
              onClick={(e) => {
                e.stopPropagation();
                window.open(notice.attachment_url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank');
              }}
              className={`flex items-center gap-3 p-3 ${t.bg} rounded-2xl border ${t.border} cursor-pointer group/file`}
            >
              <div className={`p-2 ${t.accentBg} ${t.accent} rounded-xl`}>
                <FileText size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold ${t.heading} group-hover/file:text-primary transition-colors truncate`}>
                  {notice.attachment_url ? notice.attachment_url.split('/').pop() : 'Document.pdf'}
                </p>
                <p className={`text-[8px] font-black ${t.muted} uppercase tracking-widest mt-0.5`}>PDF Attachment • Click to view</p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  </div>
);

const AssignmentItem: React.FC<{
  assignment: AssignmentWithFile,
  onRemind: () => void,
  onAction: (action: 'submit' | 'start') => void,
  onDetails: () => void,
  onUpload: (file: File) => void,
  onDeleteUpload: () => void,
  isActive: boolean,
  timeLeft?: string,
  theme: any
}> = ({ assignment, onRemind, onAction, onDetails, onUpload, onDeleteUpload, isActive, timeLeft, theme: t }) => {
  const isSubmitted = assignment.status === 'submitted';
  const isInProgress = assignment.status === 'in-progress';
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const getTimeLeftString = () => {
    if (isSubmitted) return 'Done';
    const deadline = new Date(assignment.deadline).getTime();
    const now = Date.now();
    const diff = deadline - now;
    if (diff <= 0) return 'Late';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  const isUrgent = !isSubmitted && (new Date(assignment.deadline).getTime() - Date.now()) < (24 * 60 * 60000);

  return (
    <motion.div
      layout
      id={`assignment-${assignment.id}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      className={`relative w-full p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border transition-all duration-500 group overflow-hidden ${isSubmitted
        ? 'bg-green-50/20 border-green-100 opacity-90'
        : isActive
          ? `${t.card} border-primary shadow-2xl shadow-primary/10 ring-2 ring-primary/20`
          : `${t.card} ${t.border} hover:border-primary/20 hover:shadow-xl`
        }`}
    >
      {/* Background Glow */}
      {isActive && (
        <motion.div
          layoutId="active-glow"
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none"
        />
      )}

      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 relative z-10">
        {/* Progress/Time Indicator */}
        <div className="flex items-center sm:block w-full sm:w-auto justify-between">
          <motion.div
            animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
            transition={isUrgent ? { repeat: Infinity, duration: 2 } : {}}
            className={`relative w-12 h-12 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center ${t.search} rounded-2xl p-1.5 border ${t.border}`}
          >
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" className="stroke-current opacity-10" />
              <motion.circle
                initial={{ strokeDashoffset: 100 }}
                animate={{
                  strokeDashoffset: isSubmitted ? 0 : 75,
                  stroke: isSubmitted ? "#22C55E" : isUrgent ? "#EF4444" : "currentColor"
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                cx="18" cy="18" r="16" fill="none" strokeWidth="3"
                strokeDasharray="100, 100"
                className={!isSubmitted && !isUrgent ? t.accent : ""}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-[10px] sm:text-[11px] font-black tracking-tighter ${isSubmitted ? 'text-green-600' : isUrgent ? 'text-red-500' : t.heading}`}>
                {getTimeLeftString()}
              </span>
            </div>
          </motion.div>

          <div className="sm:hidden flex items-center gap-2">
            {!isSubmitted && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={(e) => { e.stopPropagation(); onRemind(); }}
                className="p-2.5 bg-slate-50 text-slate-400 hover:text-primary rounded-xl transition-all border border-slate-100"
                title="Reminder"
              >
                <Clock size={16} />
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={(e) => { e.stopPropagation(); onDetails(); }}
              className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-all border border-slate-100"
              title="Details"
            >
              <FileText size={16} />
            </motion.button>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`text-base sm:text-lg font-black truncate transition-colors ${isSubmitted ? 'text-green-800/80 line-through' : t.heading}`}>
              {assignment.title}
            </h4>
            {isUrgent && !isSubmitted && (
              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[8px] font-black rounded-full animate-pulse uppercase">Urgent</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`text-[9px] sm:text-[11px] font-black ${t.accent} uppercase tracking-widest ${t.accentBg} px-2 py-0.5 rounded-lg border ${t.border}`}>
              {assignment.subject}
            </span>
            <span className={`text-[9px] sm:text-[11px] font-bold ${t.muted}`}>@ {assignment.department.replace('Prof. ', '')}</span>
            {isActive && (
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className={`text-[9px] sm:text-[11px] font-black ${t.accent} px-2`}
              >
                {timeLeft}
              </motion.span>
            )}
          </div>

          {/* Action/File Bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUpload(file);
                }}
                accept=".pdf"
                className="hidden"
              />

              {!isSubmitted && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs transition-all shadow-sm ${assignment.uploadedFile
                    ? 'bg-[#22C55E] text-white shadow-green-500/20'
                    : `${t.search} ${t.heading} border ${t.border} hover:border-primary/20`
                    }`}
                >
                  {assignment.uploadedFile ? <CheckCircle2 size={14} /> : <Upload size={14} />}
                  <span className="hidden xs:inline">{assignment.uploadedFile ? 'Ready' : 'Upload PDF'}</span>
                </motion.button>
              )}

              {assignment.uploadedFile && (
                <div className="flex items-center gap-1.5">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const url = URL.createObjectURL(assignment.uploadedFile!);
                      window.open(url, '_blank');
                    }}
                    className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    <Eye size={14} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={(e) => { e.stopPropagation(); onDeleteUpload(); }}
                    className="p-2 bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"
                  >
                    <Trash2 size={14} />
                  </motion.button>
                </div>
              )}

              <div className="hidden sm:flex items-center gap-2">
                {!isSubmitted && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={(e) => { e.stopPropagation(); onRemind(); }}
                    className="p-2 bg-slate-50 text-slate-400 hover:text-primary rounded-lg transition-all border border-transparent hover:border-slate-200"
                    title="Reminder"
                  >
                    <Clock size={14} />
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={(e) => { e.stopPropagation(); onDetails(); }}
                  className="text-[10px] sm:text-xs font-black text-slate-400 hover:text-slate-600 px-2 uppercase tracking-widest"
                >
                  Details
                </motion.button>
              </div>
            </div>

            <motion.button
              disabled={isSubmitted || !assignment.uploadedFile}
              whileHover={!(isSubmitted || !assignment.uploadedFile) ? { scale: 1.1, backgroundColor: "#1e612c" } : {}}
              whileTap={!(isSubmitted || !assignment.uploadedFile) ? { scale: 0.9 } : {}}
              onClick={(e) => {
                e.stopPropagation();
                if (isSubmitted || !assignment.uploadedFile) return;
                onAction((isInProgress || assignment.id === 1) ? 'submit' : 'start');
              }}
              className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all shadow-lg ${isSubmitted
                ? 'bg-slate-50 text-green-500 shadow-none'
                : assignment.uploadedFile
                  ? 'bg-[#22C55E] text-white shadow-green-500/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
            >
              {isSubmitted ? (
                <CheckCircle2 size={20} className="sm:w-6 sm:h-6" />
              ) : (isInProgress || assignment.id === 1) ? (
                <Send size={18} className="sm:w-6 sm:h-6" />
              ) : (
                <Zap size={18} className="sm:w-6 sm:h-6" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ReminderModal: React.FC<{ onClose: () => void, onSet: (time: string) => void, theme: any }> = ({ onClose, onSet, theme: t }) => {
  const [customTime, setCustomTime] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className={`relative w-full max-w-md ${t.card} rounded-[2rem] shadow-2xl p-8 border ${t.border}`}
      >
        <h3 className={`text-xl font-black ${t.heading} mb-2`}>Set Reminder</h3>
        <p className={`text-sm ${t.muted} mb-6`}>When should we remind you about this assignment?</p>

        <div className="space-y-3">
          {!showCustom ? (
            <>
              {['In 1 hour', 'In 4 hours', 'Tomorrow morning'].map((time) => (
                <button
                  key={time}
                  onClick={() => onSet(time)}
                  className={`w-full p-4 text-left font-bold ${t.text} ${t.search} hover:bg-primary/10 hover:text-primary rounded-2xl transition-all border ${t.border} hover:border-primary/20`}
                >
                  {time}
                </button>
              ))}
              <button
                onClick={() => setShowCustom(true)}
                className={`w-full p-4 text-left font-bold ${t.muted} ${t.search} rounded-2xl transition-all border border-dashed ${t.border}`}
              >
                Custom time...
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <input
                type="datetime-local"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className={`w-full p-4 ${t.search} border ${t.border} rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold ${t.text}`}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCustom(false)}
                  className={`flex-1 py-3 text-sm font-bold ${t.muted} hover:opacity-80`}
                >
                  Back
                </button>
                <button
                  disabled={!customTime}
                  onClick={() => onSet(new Date(customTime).toLocaleString())}
                  className="flex-[2] py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  Set Custom Reminder
                </button>
              </div>
            </div>
          )}
        </div>

        {!showCustom && (
          <button
            onClick={onClose}
            className={`mt-6 w-full py-3 text-sm font-bold ${t.muted} hover:opacity-80 transition-colors`}
          >
            Cancel
          </button>
        )}
      </motion.div>
    </div>
  );
};

const AIAssistant: React.FC<{ onClose: () => void, theme: any }> = ({ onClose, theme: t }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "Hi there! I'm your Green-Sync assistant. I can help you find courses, check your eco-impact, or find question papers. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    const token = localStorage.getItem('token');
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMsg })
      });

      const data = await response.json();

      if (data.response) {
        setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
      } else {
        throw new Error(data.error || "Failed to get AI response");
      }
    } catch (error) {
      console.error("AI Assistant Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "I'm having trouble connecting to my brain right now. Please check your internet or try again in a moment!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-end p-8 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        className={`w-full max-w-md ${t.card} rounded-[2.5rem] shadow-2xl border ${t.border} flex flex-col overflow-hidden pointer-events-auto h-[600px]`}
      >
        <div className="p-6 bg-primary text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-black text-sm">Green-Sync AI</h3>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Always Online</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto p-6 space-y-4 ${t.search}`}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium shadow-sm ${msg.role === 'user'
                ? 'bg-primary text-white rounded-tr-none'
                : `${t.card} ${t.text} rounded-tl-none border ${t.border}`
                }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className={`${t.card} p-4 rounded-2xl rounded-tl-none border ${t.border} flex gap-1`}>
                <span className={`w-1.5 h-1.5 ${t.muted} bg-current rounded-full animate-bounce`} />
                <span className={`w-1.5 h-1.5 ${t.muted} bg-current rounded-full animate-bounce [animation-delay:0.2s]`} />
                <span className={`w-1.5 h-1.5 ${t.muted} bg-current rounded-full animate-bounce [animation-delay:0.4s]`} />
              </div>
            </div>
          )}
        </div>

        <div className={`p-6 ${t.card} border-t ${t.border}`}>
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything..."
              className={`w-full pl-6 pr-14 py-4 ${t.search} border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium ${t.text}`}
            />
            <button
              onClick={handleSend}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-primary text-white rounded-xl hover:scale-105 transition-transform shadow-lg shadow-primary/20"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const LeaderboardItem: React.FC<{ rank: number, name: string, score: string, icon: React.ReactNode, active?: boolean, onClick?: () => void, theme: any }> = ({ rank, name, score, icon, active = false, onClick, theme: t }) => (
  <motion.div
    whileHover={{ x: 5 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 cursor-pointer border ${active
      ? `${t.accentBg} ${t.border.replace('border-', 'border-')}`
      : `bg-transparent border-transparent hover:${t.search}`
      }`}
  >
    <div className={`font-black text-lg w-6 text-center ${active ? t.accent : t.muted}`}>{rank}</div>
    <div className={`w-11 h-11 rounded-xl ${t.search} shadow-sm flex items-center justify-center ${t.muted} border ${t.border} group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <div className="flex-1">
      <p className={`font-bold text-sm ${t.heading} leading-tight`}>{name}</p>
      <p className={`text-[10px] font-black ${t.muted} uppercase tracking-widest mt-0.5`}>{score}</p>
    </div>
    {active ? <Trophy className={`${t.accent} w-5 h-5 animate-pulse`} /> : <ChevronRight className={`${t.muted} w-4 h-4`} />}
  </motion.div>
);

const CustomDropdown: React.FC<{
  options: string[],
  value: string,
  onChange: (val: string) => void,
  label?: string,
  theme: any
}> = ({ options, value, onChange, label, theme: t }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative min-w-[160px]">
      {label && <p className={`text-[10px] font-black ${t.muted} uppercase tracking-widest mb-1.5 ml-1`}>{label}</p>}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 ${t.card} border ${t.border} rounded-xl text-sm font-bold flex items-center justify-between hover:border-primary/30 transition-all shadow-sm ${t.text}`}
      >
        <span className="truncate">{value}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight size={16} className={`rotate-90 ${t.muted}`} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 5, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`absolute top-full left-0 right-0 z-[70] ${t.card} border ${t.border} rounded-2xl shadow-2xl py-2 max-h-60 overflow-y-auto scrollbar-hide`}
            >
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm font-bold transition-colors ${t.sidebarHover} ${value === opt ? t.accent + ' ' + t.accentBg : t.text
                    }`}
                >
                  {opt}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const MultiSelectDropdown: React.FC<{
  options: string[],
  value: string[],
  onChange: (val: string[]) => void,
  label?: string,
  theme: any
}> = ({ options, value, onChange, label, theme: t }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (opt: string) => {
    if (opt === 'All Semesters') {
      if (value.includes('All Semesters')) {
        onChange([]);
      } else {
        onChange(['All Semesters']);
      }
      return;
    }

    let newValue = value.filter(v => v !== 'All Semesters');
    if (newValue.includes(opt)) {
      newValue = newValue.filter(v => v !== opt);
    } else {
      newValue = [...newValue, opt];
    }

    if (newValue.length === 0) {
      onChange(['All Semesters']);
    } else {
      onChange(newValue);
    }
  };

  return (
    <div className="relative min-w-[200px]">
      {label && <p className={`text-[10px] font-black ${t.muted} uppercase tracking-widest mb-1.5 ml-1`}>{label}</p>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 ${t.card} border ${t.border} rounded-xl text-sm font-bold flex items-center justify-between hover:border-primary/30 transition-all shadow-sm ${t.text}`}
      >
        <span className="truncate">
          {value.length === 0 ? 'Select Semesters' : value.join(', ')}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight size={16} className={`rotate-90 ${t.muted}`} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 5, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`absolute top-full left-0 right-0 z-[70] ${t.card} border ${t.border} rounded-2xl shadow-2xl py-2 max-h-60 overflow-y-auto scrollbar-hide`}
            >
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleOption(opt)}
                  className={`w-full px-4 py-2.5 text-left text-sm font-bold transition-colors flex items-center justify-between ${t.sidebarHover} ${value.includes(opt) ? t.accent + ' ' + t.accentBg : t.text
                    }`}
                >
                  <span>{opt === 'All Semesters' ? opt : `Semester ${opt}`}</span>
                  {value.includes(opt) && <CheckCircle2 size={14} className={t.accent} />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};


const CourseCard: React.FC<{ course: Course, onClick: () => void, index: number, theme: any }> = ({ course, onClick, index, theme: t }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    green: 'bg-green-500',
    pink: 'bg-pink-500'
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{
        y: -10,
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 10 },
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)"
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`${t.card} border ${t.border} p-8 rounded-[2.5rem] group cursor-pointer hover:shadow-2xl hover:shadow-primary/5 transition-all relative overflow-hidden`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 ${colors[course.color]} opacity-[0.03] rounded-bl-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-700`} />

      <div className={`w-14 h-14 ${colors[course.color]} rounded-2xl mb-8 flex items-center justify-center text-white shadow-xl shadow-${course.color}-500/20 group-hover:rotate-6 transition-transform`}>
        {course.icon}
      </div>
      <h3 className="text-2xl font-black mb-1 group-hover:text-primary transition-colors leading-tight">{course.title}</h3>
      <p className="text-sm text-slate-400 font-bold mb-8 uppercase tracking-widest">{course.instructor}</p>

      <div className="space-y-3">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <span>Mastery</span>
          <span className="text-slate-900">{course.progress}%</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${course.progress}%` }}
            transition={{ duration: 1.5, delay: 0.5 + (index * 0.1), ease: [0.34, 1.56, 0.64, 1] }}
            className={`h-full ${colors[course.color]} rounded-full shadow-sm`}
          />
        </div>
      </div>
    </motion.div>
  );
};

const ImpactMetric: React.FC<{ label: string, value: string, color: string, theme: any }> = ({ label, value, color, theme: t }) => {
  const colors: Record<string, string> = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500'
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <p className={`text-sm font-bold ${t.muted}`}>{label}</p>
        <p className={`text-lg font-black ${t.heading}`}>{value}</p>
      </div>
      <div className={`h-2 ${t.search} rounded-full overflow-hidden`}>
        <div className={`h-full ${colors[color]} rounded-full`} style={{ width: value }} />
      </div>
    </div>
  );
};

const SettingsOption: React.FC<{
  icon: React.ReactNode,
  label: string,
  description: string,
  onClick?: () => void,
  theme: any
}> = ({ icon, label, description, onClick, theme: t }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-6 hover:${t.search} transition-all group border-b ${t.border} last:border-0`}
  >
    <div className={`p-3 ${t.card} ${t.muted} rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-all group-hover:scale-110 border ${t.border}`}>
      {React.cloneElement(icon as React.ReactElement, { size: 20 })}
    </div>
    <div className="text-left flex-1">
      <p className={`font-bold ${t.heading} group-hover:text-primary transition-colors`}>{label}</p>
      <p className={`text-xs ${t.muted}`}>{description}</p>
    </div>
    <ChevronRight className={`${t.muted} group-hover:text-primary transition-all group-hover:translate-x-1`} size={20} />
  </button>
);

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [notices, setNotices] = useState<Notice[]>([]);
  const [impact, setImpact] = useState({ total_pages: 1240 });
  const [showAllNotices, setShowAllNotices] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [reminderModal, setReminderModal] = useState<{ isOpen: boolean, assignmentId: number | null }>({ isOpen: false, assignmentId: null });
  const [activeAssignmentId, setActiveAssignmentId] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentWithFile | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLeaderboardDept, setSelectedLeaderboardDept] = useState<{ name: string, rank: number, pages: string, icon: any } | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showSemesters, setShowSemesters] = useState(false);
  const [showEnroll, setShowEnroll] = useState(false);
  const [showUploadPaper, setShowUploadPaper] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<number>(3);
  const [selectedPaperSemester, setSelectedPaperSemester] = useState<string>('All Semesters');
  const [selectedPaperYear, setSelectedPaperYear] = useState<string>('All Years');
  const [searchQuery, setSearchQuery] = useState('');
  const [paperSearchQuery, setPaperSearchQuery] = useState('');
  const [papers, setPapers] = useState<QuestionPaper[]>([]);

  // Consolidate papers source by MERGING mock and real data
  const allPapersSource = useMemo(() => {
    // Start with a copy of mockPapers
    const combined = [...mockPapers];

    // Add real papers from API if they don't already exist in mock
    if (Array.isArray(papers)) {
      papers.forEach(p => {
        if (!combined.some(mp =>
          mp.subject.toLowerCase() === p.subject.toLowerCase() &&
          mp.year === p.year
        )) {
          combined.push(p);
        }
      });
    }
    return combined;
  }, [papers]);

  const filteredPapers = useMemo(() => {
    return allPapersSource
      .filter(p => {
        const matchSemester = selectedPaperSemester === 'All Semesters' || p.semester === selectedPaperSemester;
        const matchYear = selectedPaperYear === 'All Years' || p.year === selectedPaperYear;
        const matchSearch = (p.subject?.toLowerCase() || '').includes(paperSearchQuery.toLowerCase());
        return matchSemester && matchYear && matchSearch;
      })
      .sort((a, b) => {
        // Prioritize COMP/Computer Engineering papers
        const aIsComp = (a.subject?.toUpperCase().includes('COMP') || a.subject?.toUpperCase().includes('COMPUTER'));
        const bIsComp = (b.subject?.toUpperCase().includes('COMP') || b.subject?.toUpperCase().includes('COMPUTER'));

        if (aIsComp && !bIsComp) return -1;
        if (!aIsComp && bIsComp) return 1;

        // Secondary sort: Year (Newest first)
        const yearA = parseInt(a.year) || 0;
        const yearB = parseInt(b.year) || 0;
        if (yearB !== yearA) return yearB - yearA;

        // Tertiary sort: Subject Alphabetical
        return (a.subject || '').localeCompare(b.subject || '');
      });
  }, [allPapersSource, selectedPaperSemester, selectedPaperYear, paperSearchQuery]);

  const semesterOptions = useMemo(() => {
    const semSet = new Set<string>();
    allPapersSource.forEach(p => {
      if (p.semester) {
        // Normalize "3" to "Semester 3" if necessary, though mock uses full string
        const s = p.semester.toString();
        semSet.add(s.startsWith('Semester') ? s : `Semester ${s}`);
      }
    });

    // Fallback if empty
    if (semSet.size === 0) return ['All Semesters', 'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];

    return ['All Semesters', ...Array.from(semSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))];
  }, [allPapersSource]);

  const yearOptions = useMemo(() => {
    const yearSet = new Set<string>();
    allPapersSource.forEach(p => {
      if (p.year) yearSet.add(p.year.toString());
    });

    // Fallback if empty
    if (yearSet.size === 0) return ['All Years', '2025', '2024', '2023', '2022', '2021', '2020'];

    return ['All Years', ...Array.from(yearSet).sort((a, b) => Number(b) - Number(a))];
  }, [allPapersSource]);
  const [showAssistant, setShowAssistant] = useState(false);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState([
    { role: 'assistant', text: "Hello! I'm your Green-Sync AI assistant. How can I help you save paper and master your courses today?" }
  ]);
  const [assistantInput, setAssistantInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [assistantMessages, isAssistantTyping]);

  const handleAssistantSend = async (text: string) => {
    if (!text.trim()) return;
    setAssistantInput('');
    setAssistantMessages(prev => [...prev, { role: 'user', text }]);
    setIsAssistantTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      let response = "";
      const lower = text.toLowerCase();
      if (lower.includes('assignment')) {
        response = "You can view your upcoming assignments on the main dashboard. Don't forget to upload your PDF before the deadline!";
      } else if (lower.includes('paper') || lower.includes('mumbai')) {
        response = "The Mumbai University question papers are in the 'Mumbai Paper' tab. You can search by subject, year, or semester.";
      } else if (lower.includes('syllabus')) {
        response = "You can find wait the syllabus for any course in the 'Courses' tab by clicking on a course card and selecting 'View Syllabus'.";
      } else if (lower.includes('profile') || lower.includes('name')) {
        response = "You can update your profile in Settings > Profile. Changes reflect instantly in your header!";
      } else if (lower.includes('notic')) {
        response = "Check the notifications bell in the header! You can mark them all as read once you've seen them.";
      } else {
        response = "That's a great question! I'm constantly learning from Green-Sync data. Is there anything specific about your assignments or Mumbai papers I can help with?";
      }

      setAssistantMessages(prev => [...prev, { role: 'assistant', text: response }]);
      setIsAssistantTyping(false);
    }, 1500);
  };
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<AssignmentWithFile[]>(() => {
    const saved = localStorage.getItem('greensync_assignments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((a: any) => ({
            ...a,
            uploadedFile: a.uploadedFileMeta ? new File([], a.uploadedFileMeta.name, { type: 'application/pdf' }) : undefined
          }));
        }
      } catch (e) {
        console.error("Failed to parse saved assignments", e);
      }
    }
    return [];
  });
  const [showQuickUpload, setShowQuickUpload] = useState(false);
  const [settingsSubTab, setSettingsSubTab] = useState<'main' | 'profile' | 'notifications' | 'security' | 'appearance' | 'help'>('main');

  const [studentProfile, setStudentProfile] = useState({
    name: user?.name || 'Nikash Developer',
    email: user?.email || 'student@greensync.edu',
    phone: '+91 98765 43210',
    dept: 'Computer Engineering',
    year: 'TE-Sem 6',
    avatar: user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nikash'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    assignmentAlerts: true,
    ecoMilestones: true,
    paperUploads: false,
    securityAlerts: true,
    emailBriefing: true
  });

  const [themeMode, setThemeMode] = useState<'Light' | 'Dark' | 'Eco'>('Light');
  const [saveStatus, setSaveStatus] = useState<boolean>(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [submissionCount, setSubmissionCount] = useState<number>(0);
  const [readNotifications, setReadNotifications] = useState<string[]>([]);

  // Quiz State
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [activeQuizPhase, setActiveQuizPhase] = useState<'topic' | 'quiz' | 'results' | 'answer-key'>('topic');
  const [selectedQuizTopic, setSelectedQuizTopic] = useState<string>('');
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<QuizQuestion[]>([]);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [isAnswerChecking, setIsAnswerChecking] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  const handleStartAIQuiz = async (topic: string) => {
    setSelectedQuizTopic(topic);
    setIsGeneratingQuiz(true);
    setActiveQuizPhase('quiz'); // Transition early but show loading state

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic })
      });

      const contentType = response.headers.get("content-type");
      if (!response.ok) {
        let errorMessage = "Server error";
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } else {
          const textError = await response.text();
          console.error("Non-JSON Error:", textError);
          errorMessage = `Server Error (${response.status}): ${textError.slice(0, 100)}...`;
        }
        throw new Error(errorMessage);
      }

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (data.questions) {
          setActiveQuizQuestions(data.questions);
          setQuizScore(0);
          setCurrentQuizIndex(0);
          setUserAnswers(new Array(data.questions.length).fill(null));
        } else {
          throw new Error("Invalid response format from server");
        }
      } else {
        throw new Error("Server did not return JSON. Please check backend logs.");
      }
    } catch (error: any) {
      console.error("Quiz Generation Error:", error);
      alert(error.message || "Failed to generate AI quiz. Please try again.");
      setActiveQuizPhase('topic');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const [notes] = useState<Note[]>([
    { id: 1, title: 'Politics SEM 1 English', subject: 'Political Science', semester: 1, category: 'BA', url: 'https://www.munotes.in/uploads/notes/BA/Semester%201/FYBA%20Politics%20SEM%201%20English-munotes.pdf' },
    { id: 2, title: 'Psychology English Sem 1', subject: 'Psychology', semester: 1, category: 'BA', url: 'https://www.munotes.in/uploads/notes/BA/Semester%201/FYBA%20Psychology%20English%20Semester%201-munotes.pdf' },
    { id: 3, title: 'History of Modern India', subject: 'History', semester: 1, category: 'BA', url: 'https://www.munotes.in/uploads/notes/BA/Semester%201/FYBA%20History%20SEM-%20I%2C%20HISTORY%20OF%20MODERN%20INDIA%20%20%28English%20Version%29-munotes.pdf' },
    { id: 4, title: 'Microeconomics Sem 1', subject: 'Economics', semester: 1, category: 'BA', url: 'https://www.munotes.in/uploads/notes/BA/Semester%201/Microeconomics%20Semester%20I%20%28English%20Version%29-munotes.pdf' },
    { id: 5, title: 'Political Science Sem 2', subject: 'Political Science', semester: 2, category: 'BA', url: 'https://www.munotes.in/uploads/notes/BA/Semester%202/FYBA%20Political%20Science%20Sem%202%20%28English%29-munotes.pdf' },
    { id: 6, title: 'Microeconomics II', subject: 'Economics', semester: 2, category: 'BA', url: 'https://www.munotes.in/uploads/notes/BA/Semester%202/Economics%20Paper%20II%20%E2%80%93%20Microeconomics%20%E2%80%93%20II%20%28English%20Version%29-munotes.pdf' },
    { id: 7, title: 'Indian History Society & Economy', subject: 'History', semester: 2, category: 'BA', url: 'https://www.munotes.in/uploads/notes/BA/Semester%202/FYBA%20History%20SEM-II%20HISTORY%20OF%20MODERN%20INDIA%20%20SOCIETY%20%26%20ECONOMY%20%20%28English%20Version%29-munotes.pdf' },
    { id: 8, title: 'Public Finance Sem 3', subject: 'Economics', semester: 3, category: 'BA', url: 'https://www.munotes.in/uploads/notes/BA/Semester%203/Economics%20Paper%20IV%20%E2%80%93%20Public%20Finance%20%28English%20Version%29-munotes.pdf' },
    { id: 9, title: 'Sociology Paper II Sem 3', subject: 'Sociology', semester: 3, category: 'BA', url: 'https://www.munotes.in/uploads/notes/BA/Semester%203/SOCIOLOGY%20PAPER%20II%20%28English%20Version%29-munotes.pdf' },
    { id: 10, title: 'Ancient India Sem 3', subject: 'History', semester: 3, category: 'BA', url: 'https://www.munotes.in/uploads/notes/BA/Semester%203/History%20Paper%20III%20HISTORY%20ANCIENT%20INDIA%20%28English%20Version%29-munotes.pdf' },
    { id: 11, title: 'Macroeconomics II Sem 4', subject: 'Economics', semester: 4, category: 'BA', url: 'https://www.munotes.in/uploads/notes/BA/Semester%204/Economics/SYBA-SEM-IV-Economics-Paper-V-Macro-Economics-II-English-Version-1-munotes.pdf' },
    { id: 12, title: 'World History Landmarks', subject: 'History', semester: 4, category: 'BA', url: 'https://www.munotes.in/uploads/notes/BA/Semester%204/History/SYBA-History-SEM-IV-Paper-II-Landmarks-in-World-History-English-Version-munotes.pdf' },
    { id: 13, title: 'Ancient India (to 1000 AD)', subject: 'History', semester: 4, category: 'BA', url: 'https://www.munotes.in/uploads/notes/BA/Semester%204/History/SYBA-History-SEM-IV-Paper-III-Ancient-India-from-Earliest-Times-to-1000-A.D.-English-Version-munotes.pdf' },
    { id: 14, title: 'History of Medieval India', subject: 'History', semester: 5, category: 'BA', url: 'https://www.munotes.in/uploads/notes/BA/Semester%205/History/Paper-4-History-of-Medieval-India-1000-CE-1526-CE-Engilish-Version-munotes.pdf' },
    { id: 15, title: 'Intro to Archaeology', subject: 'History', semester: 5, category: 'BA', url: 'https://www.munotes.in/uploads/notes/BA/Semester%205/History/Paper-6-Introduction-to-Archaeology-English-Version-munotes.pdf' },
    { id: 16, title: 'Cognitive Psychology', subject: 'Psychology', semester: 6, category: 'BA', url: 'https://www.munotes.in/uploads/notes/BA/Semester%206/Psychology/TYBA-SEM-VI-book-Cognitive-Psychology-English-Version-munotes.pdf' },
    { id: 17, title: 'Psych Testing & Statistics', subject: 'Psychology', semester: 6, category: 'BA', url: 'https://www.munotes.in/uploads/notes/BA/Semester%206/Psychology/TYBA-SEM-VI-Psychologycal-Testing-and-statistics-English-Version-munotes.pdf' },
  ]);

  const [noteSearchQuery, setNoteSearchQuery] = useState('');
  const [selectedNoteSemesters, setSelectedNoteSemesters] = useState<string[]>(['All Semesters']);

  useEffect(() => {
    const dataToSave = assignments.map(a => ({
      ...a,
      uploadedFile: undefined,
      uploadedFileMeta: a.uploadedFile ? { name: a.uploadedFile.name, lastModified: a.uploadedFile.lastModified } : undefined
    }));
    localStorage.setItem('greensync_assignments', JSON.stringify(dataToSave));
  }, [assignments]);

  useEffect(() => {
    // Reset settings sub-tab when leaving settings tab
    if (activeTab !== 'settings') {
      setSettingsSubTab('main');
    }
  }, [activeTab]);

  useEffect(() => {
    if (themeMode === 'Eco' || themeMode === 'Dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  const t = themes[themeMode];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeAssignmentId && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setActiveAssignmentId(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeAssignmentId, timeLeft]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  useEffect(() => {
    // Simulated API calls
    const mockNotices: Notice[] = [
      {
        id: 1,
        title: 'Urgent: Biology 101 Deadline Extended',
        content: 'Paperless submission deadline extended by 2 hours due to server maintenance. Please submit by 4:00 PM.',
        publish_date: new Date(Date.now() - 10 * 60000).toISOString(),
        is_emergency: true,
        target_department: 'Biology',
        author_id: 1,
      },
      {
        id: 2,
        title: 'Green Council Announcement',
        content: 'Campus-wide recycling drive starts tomorrow at the Student Center. Bring your e-waste!',
        publish_date: new Date(Date.now() - 60 * 60000).toISOString(),
        is_emergency: false,
        target_department: 'General',
        author_id: 1,
      },
      {
        id: 3,
        title: 'New Eco-Study Material Uploaded',
        content: 'Prof. Wilson has uploaded new reading material for the Environmental Ethics module. Access it via the Courses tab.',
        publish_date: new Date(Date.now() - 120 * 60000).toISOString(),
        is_emergency: false,
        target_department: 'CS',
        author_id: 2,
      },
      {
        id: 4,
        title: 'System Maintenance: ID Verification',
        content: 'Student portal login will be down for 30 minutes tonight at 11 PM for security upgrades. Plan your submissions accordingly.',
        publish_date: new Date(Date.now() - 180 * 60000).toISOString(),
        is_emergency: true,
        target_department: 'General',
        author_id: 3,
      },
      {
        id: 5,
        title: 'Hackathon Registration Open!',
        content: 'Green-Sync Dev Hack is now accepting registrations. Build sustainable solutions and win eco-friendly prizes.',
        publish_date: new Date(Date.now() - 240 * 60000).toISOString(),
        is_emergency: false,
        target_department: 'CS',
        author_id: 1,
      },
      {
        id: 6,
        title: 'Guest Lecture: Renewable Energy',
        content: 'Join us for a virtual seminar by Dr. Clara Oswald on the future of solar grid integration this Friday at 2 PM.',
        publish_date: new Date(Date.now() - 300 * 60000).toISOString(),
        is_emergency: false,
        target_department: 'General',
        author_id: 4,
      }
    ];

    const mockAssignments: AssignmentWithFile[] = [
      {
        id: 1,
        title: 'Sustainable Architecture Essay',
        description: 'Write a comprehensive essay on the principles of sustainable architecture.',
        long_description: 'Write a comprehensive essay on the principles of sustainable architecture and its impact on modern urban planning. Focus on renewable materials, energy efficiency, and community well-being. This assignment requires at least 3 primary sources.',
        subject: 'Environmental Science 204',
        department: 'Prof. Miller',
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60000).toISOString(),
        max_marks: 100,
        faculty_id: 1,
        status: 'pending',
        topic: 'Urban Planning',
        tags: ['Eco-Design', 'Sustainability', 'Architecture']
      },
      {
        id: 2,
        title: 'Calculus Midterm Prep',
        description: 'Solve the practice set for the upcoming midterm covering integration.',
        long_description: 'Solve the practice set for the upcoming midterm covering integration and series. This includes definite and indefinite integrals, volume by shells, and Taylor series expansions. Show all step-by-step working.',
        subject: 'Math 101',
        department: 'Prof. Davis',
        deadline: new Date(Date.now() + 4 * 60 * 60000).toISOString(),
        max_marks: 100,
        faculty_id: 1,
        status: 'pending',
        topic: 'Integration',
        tags: ['Derivatives', 'Series', 'Calculus']
      },
      {
        id: 3,
        title: 'History Research Paper',
        description: 'Research the impact of the Industrial Revolution on social structures.',
        long_description: 'Research and write about the impact of the Industrial Revolution on social structures, laborers, and the emergence of the middle class in 19th-century Europe. Minimum 1500 words.',
        subject: 'History 304',
        department: 'Dr. Evans',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60000).toISOString(),
        max_marks: 100,
        faculty_id: 1,
        status: 'pending',
        topic: 'Modern History',
        tags: ['Society', 'Industry', 'Revolution']
      },
      {
        id: 4,
        title: 'Database Schema Design',
        description: 'Create an ER diagram for a university management system.',
        long_description: 'Create an ER diagram and normalized schema for a university management system. Ensure 3NF compliance and include all primary and foreign key constraints. Use Mermaid or MySQL Workbench for the diagram.',
        subject: 'DBMS 202',
        department: 'Prof. Wilson',
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60000).toISOString(),
        max_marks: 50,
        faculty_id: 2,
        status: 'pending',
        topic: 'Normalization',
        tags: ['SQL', 'Database', 'ERD']
      }
    ];

    const mockCourses: Course[] = [
      // Semester 1
      { id: 101, title: "Applied Mathematics I", instructor: "Dr. A. Sharma", progress: 100, color: "blue", icon: <Calculator size={24} />, semester: 1, syllabus: ["Matrices", "Complex Numbers", "Integration Basics"], syllabusUrl: "/uploads/syllabus/computer-engineering-syllabus.pdf" },
      { id: 102, title: "Engineering Physics I", instructor: "Prof. R. Mehta", progress: 100, color: "purple", icon: <Zap size={24} />, semester: 1, syllabus: ["Quantum Mechanics", "Crystallography", "Semiconductors"], syllabusUrl: "/uploads/syllabus/computer-engineering-syllabus.pdf" },
      { id: 103, title: "Basic Electronics", instructor: "Dr. K. Patel", progress: 100, color: "orange", icon: <Zap size={24} />, semester: 1, syllabus: ["Diodes", "BJTs", "Digital Circuits"], syllabusUrl: "/uploads/syllabus/computer-engineering-syllabus.pdf" },
      { id: 104, title: "Eng. Mechanics", instructor: "Prof. S. Gupta", progress: 100, color: "pink", icon: <Settings size={24} />, semester: 1, syllabus: ["Statics", "Kinematics", "Friction"], syllabusUrl: "/uploads/syllabus/computer-engineering-syllabus.pdf" },
      { id: 105, title: "Intro. to Computing", instructor: "Dr. Shah", progress: 100, color: "green", icon: <Code size={24} />, semester: 1, syllabus: ["Algorithms", "C Basics", "Flowcharts"], syllabusUrl: "/uploads/syllabus/computer-engineering-syllabus.pdf" },

      // Semester 2
      { id: 201, title: "Applied Mathematics II", instructor: "Dr. A. Sharma", progress: 100, color: "blue", icon: <Calculator size={24} />, semester: 2, syllabus: ["Diff. Equations", "Beta-Gamma", "Numerical Methods"], syllabusUrl: "/uploads/syllabus/computer-engineering-syllabus.pdf" },
      { id: 202, title: "Engineering Chemistry", instructor: "Dr. P. Desai", progress: 100, color: "green", icon: <Search size={24} />, semester: 2, syllabus: ["Water Tech", "Corrosion", "Nanomaterials"], syllabusUrl: "/uploads/syllabus/computer-engineering-syllabus.pdf" },
      { id: 203, title: "Structured Prog.", instructor: "Prof. V. Shah", progress: 100, color: "blue", icon: <Code size={24} />, semester: 2, syllabus: ["Pointers", "Structures", "File Handling"], syllabusUrl: "/uploads/syllabus/computer-engineering-syllabus.pdf" },
      { id: 204, title: "Eng. Graphics", instructor: "Mr. A. Kulkarni", progress: 100, color: "purple", icon: <Palette size={24} />, semester: 2, syllabus: ["Orthographic", "Projections", "CAD"], syllabusUrl: "/uploads/syllabus/computer-engineering-syllabus.pdf" },
      { id: 205, title: "Env. Studies", instructor: "Dr. L. Green", progress: 100, color: "green", icon: <Leaf size={24} />, semester: 2, syllabus: ["Ecosystems", "Biodiversity", "Pollution"], syllabusUrl: "/uploads/syllabus/computer-engineering-syllabus.pdf" },

      // Semester 3
      { id: 1, title: "Data Structures", instructor: "Dr. Sarah Miller", progress: 85, color: "blue", icon: <Code size={24} />, semester: 3, syllabus: ["Linked Lists", "Stack & Queue", "Trees & Graphs"], syllabusUrl: "/uploads/syllabus/comp-sem3.pdf" },
      { id: 2, title: "Discrete Structures", instructor: "Prof. James Davis", progress: 45, color: "purple", icon: <Calculator size={24} />, semester: 3, syllabus: ["Logic", "Sets", "Graph Theory"], syllabusUrl: "/uploads/syllabus/comp-sem3.pdf" },
      { id: 3, title: "Digital Logic", instructor: "Dr. Robert Evans", progress: 92, color: "orange", icon: <Zap size={24} />, semester: 3, syllabus: ["Logic Gates", "K-Maps", "Registers"], syllabusUrl: "/uploads/syllabus/comp-sem3.pdf" },
      { id: 304, title: "Computer Graphics", instructor: "Dr. N. Kumar", progress: 10, color: "blue", icon: <Palette size={24} />, semester: 3, syllabus: ["Scan Conversion", "2D/3D Transforms", "Clipping"], syllabusUrl: "/uploads/syllabus/comp-sem3.pdf" },
      { id: 305, title: "Digital Logic Design", instructor: "Prof. M. Rao", progress: 5, color: "pink", icon: <Zap size={24} />, semester: 3, syllabus: ["Logic Minimalism", "Sequential Circuits", "FSMs"], syllabusUrl: "/uploads/syllabus/comp-sem3.pdf" },

      // Semester 4
      { id: 4, title: "Operating Systems", instructor: "Prof. Lisa Green", progress: 0, color: "green", icon: <LayoutDashboard size={24} />, semester: 4, syllabus: ["Process Mgmt", "Memory Mgmt", "File Systems"], syllabusUrl: "/uploads/syllabus/comp-sem4.pdf" },
      { id: 5, title: "Analysis of Algos", instructor: "Dr. Emily White", progress: 0, color: "pink", icon: <Code size={24} />, semester: 4, syllabus: ["Asymptotic Notations", "Greedy", "DP"], syllabusUrl: "/uploads/syllabus/comp-sem4.pdf" },
      { id: 403, title: "Comp. Architecture", instructor: "Dr. S. Nadar", progress: 0, color: "blue", icon: <Settings size={24} />, semester: 4, syllabus: ["CPU Design", "Pipelining", "Microprog"], syllabusUrl: "/uploads/syllabus/comp-sem4.pdf" },
      { id: 404, title: "Microprocessors", instructor: "Prof. D. Joshi", progress: 0, color: "purple", icon: <Zap size={24} />, semester: 4, syllabus: ["8086 Intel", "Memory Interfacing", "Interrupts"], syllabusUrl: "/uploads/syllabus/comp-sem4.pdf" },
      { id: 405, title: "Applied Math IV", instructor: "Dr. H. Iyer", progress: 0, color: "orange", icon: <Calculator size={24} />, semester: 4, syllabus: ["Probability", "Sampling", "Line Integrals"], syllabusUrl: "/uploads/syllabus/comp-sem4.pdf" },

      // Semester 5-8
      { id: 501, title: "Database Systems", instructor: "Dr. Y. Rao", progress: 0, color: "blue", icon: <FileText size={24} />, semester: 5, syllabus: ["RDBMS", "SQL", "Transaction Mgmt"], syllabusUrl: "/uploads/syllabus/comp-sem5.pdf" },
      { id: 502, title: "Computer Networks", instructor: "Prof. S. Sen", progress: 0, color: "purple", icon: <LayoutDashboard size={24} />, semester: 5, syllabus: ["OSI Model", "TCP/IP", "Routing"], syllabusUrl: "/uploads/syllabus/comp-sem5.pdf" },
      { id: 601, title: "Software Engineering", instructor: "Dr. A. Paul", progress: 0, color: "green", icon: <Sparkles size={24} />, semester: 6, syllabus: ["SDLC", "Agile", "Testing"], syllabusUrl: "/uploads/syllabus/comp-sem6.pdf" },
      { id: 602, title: "System Programming", instructor: "Prof. K. Verma", progress: 0, color: "purple", icon: <Settings size={24} />, semester: 6, syllabus: ["Assemblers", "Macros", "Compilers"], syllabusUrl: "/uploads/syllabus/comp-sem6.pdf" },
      { id: 603, title: "Mobile Computing", instructor: "Dr. S. Reddy", progress: 0, color: "orange", icon: <LayoutDashboard size={24} />, semester: 6, syllabus: ["GSM", "Wireless LAN", "Mobile IP"], syllabusUrl: "/uploads/syllabus/comp-sem6.pdf" },
      { id: 701, title: "Art. Intelligence", instructor: "Dr. P. Mani", progress: 0, color: "blue", icon: <Sparkles size={24} />, semester: 7, syllabus: ["Heuristics", "ML", "Expert Sys"], syllabusUrl: "/uploads/syllabus/comp-sem7.pdf" },
      { id: 702, title: "Cloud Computing", instructor: "Dr. S. Kale", progress: 0, color: "purple", icon: <LayoutDashboard size={24} />, semester: 7, syllabus: ["Virtualization", "AWS/Azure", "Cloud Storage"], syllabusUrl: "/uploads/syllabus/comp-sem7.pdf" },
      { id: 801, title: "Project Phase II", instructor: "Dept. Head", progress: 0, color: "orange", icon: <GraduationCap size={24} />, semester: 8, syllabus: ["Thesis", "Implementation", "Viva"], syllabusUrl: "/uploads/syllabus/comp-sem8.pdf" },
      { id: 802, title: "Big Data Analytics", instructor: "Dr. V. Rao", progress: 0, color: "green", icon: <Database size={24} />, semester: 8, syllabus: ["Hadoop", "Spark", "NoSQL"], syllabusUrl: "/uploads/syllabus/comp-sem8.pdf" }
    ];

    const fetchPapers = async () => {
      try {
        const res = await fetch('/api/question-papers');
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data) && data.length > 0) {
            setPapers(data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch papers', err);
      }
    };

    setNotices(mockNotices);
    // Only set assignments if none are saved or the saved list is empty
    const saved = localStorage.getItem('greensync_assignments');
    let hasSavedAssignments = false;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        hasSavedAssignments = Array.isArray(parsed) && parsed.length > 0;
      } catch (e) { }
    }

    if (!hasSavedAssignments) {
      setAssignments(mockAssignments);
    }
    setCourses(mockCourses);

    // Fetch real papers from DB instead of mocks, but keep mocks if fetch fails
    fetchPapers();
  }, []);

  const handleAssignmentAction = (id: number, action: 'submit' | 'start') => {
    setAssignments(prev => prev.map(a => {
      if (a.id === id) {
        if (action === 'start') {
          setActiveAssignmentId(id);
          const deadlineDate = new Date(a.deadline).getTime();
          const now = Date.now();
          const diffInSeconds = Math.max(0, Math.floor((deadlineDate - now) / 1000));
          setTimeLeft(diffInSeconds);
        }
        if (action === 'submit' && a.id === 1 && !a.uploadedFile) {
          alert('Please upload a PDF file before submitting.');
          return a;
        }
        return { ...a, status: action === 'submit' ? 'submitted' : 'in-progress' };
      }
      return a;
    }));

    if (action === 'submit') {
      const assignment = assignments.find(a => a.id === id);
      if (id === 1 && !assignment?.uploadedFile) return;

      setSubmissionCount(prev => prev + 1);

      // Eco Confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22C55E', '#16A34A', '#86EFAC', '#4ADE80'],
        shapes: ['circle', 'square']
      });

      // alert(`Successfully submitted the assignment!`);
    } else {
      // alert(`Successfully started the assignment!`);
    }
  };

  const handleFileUpload = (id: number, file: File) => {
    setAssignments(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, uploadedFile: file };
      }
      return a;
    }));
  };

  const [uploadPaperForm, setUploadPaperForm] = useState({
    year: '2024',
    semester: 'Semester 1',
    type: 'Regular' as 'Regular' | 'KT'
  });
  const [uploadPaperFile, setUploadPaperFile] = useState<File | null>(null);
  const [isUploadingPaper, setIsUploadingPaper] = useState(false);

  const handlePaperUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const subject = formData.get('subject') as string;
    const file = formData.get('file') as File;

    if (!subject || !file || !file.name) {
      alert("Please provide the subject and a valid PDF file.");
      return;
    }

    try {
      setIsUploadingPaper(true);
      formData.append('year', uploadPaperForm.year);
      formData.append('semester', uploadPaperForm.semester);
      formData.append('examType', uploadPaperForm.type);

      // Sanitize token to avoid "Bearer null"
      const rawToken = localStorage.getItem('token');
      const authHeader = rawToken && rawToken !== 'undefined' && rawToken !== 'null'
        ? `Bearer ${rawToken}`
        : '';

      const res = await fetch('/api/upload-paper', {
        method: 'POST',
        headers: authHeader ? { 'Authorization': authHeader } : {},
        body: formData
      });

      if (res.ok) {
        let newPaper;
        try {
          newPaper = await res.json();
        } catch (jsonErr) {
          throw new Error("Server responded successfully but sent invalid data format.");
        }

        setPapers(prev => [newPaper, ...prev]);

        // Eco Confetti on Upload Success
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#22C55E', '#3B82F6', '#86EFAC'],
        });

        alert(`Question paper for "${subject}" uploaded successfully!`);
        setShowUploadPaper(false);
        setUploadPaperForm({ year: '2024', semester: 'Semester 1', type: 'Regular' });
        setUploadPaperFile(null);
      } else {
        // Handle non-JSON errors (like Vercel production 500 errors)
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const err = await res.json();
          alert(`Upload Failed: ${err.error || 'Unknown server error'}`);
        } else {
          const textErr = await res.text();
          console.error("Server Error:", textErr);
          alert(`Upload Failed (Status ${res.status}): The server encountered an error. Please try a smaller file or check your connection.`);
        }
      }
    } catch (error: any) {
      console.error("Upload Catch Error:", error);
      alert(`Error uploading file: ${error.message || "Please check your internet connection or try again later."}`);
    } finally {
      setIsUploadingPaper(false);
    }
  };

  const handleDeleteUpload = (id: number) => {
    setAssignments(prev => prev.map(a => {
      if (a.id === id) {
        const { uploadedFile, ...rest } = a;
        return { ...rest, status: 'in-progress' } as AssignmentWithFile;
      }
      return a;
    }));
  };

  const handleViewPaper = (paper: QuestionPaper) => {
    window.open(paper.url, '_blank', 'noopener,noreferrer');
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };
  const siteNotifications = useMemo(() => {
    const items: { id: string, originalId: number, type: 'notice' | 'assignment', title: string, subtitle: string, time: string, isUnread: boolean, isUrgent: boolean, rawDate: number }[] = [];

    notices.forEach(n => {
      items.push({
        id: `notice-${n.id}`,
        originalId: n.id,
        type: 'notice',
        title: n.title,
        subtitle: n.is_emergency ? 'Urgent Notice' : 'Campus Notice',
        time: new Date(n.publish_date).toLocaleString(undefined, { hour: 'numeric', minute: 'numeric', day: 'numeric', month: 'short' }),
        isUnread: !readNotifications.includes(`notice-${n.id}`),
        isUrgent: n.is_emergency,
        rawDate: new Date(n.publish_date).getTime()
      });
    });

    assignments.filter(a => a.status === 'pending').forEach(a => {
      // Simulate recent publish time for demo purposes
      const postDate = new Date(Date.now() - Math.random() * 48 * 3600000).getTime();
      items.push({
        id: `assignment-${a.id}`,
        originalId: a.id,
        type: 'assignment',
        title: `New assignment: ${a.title}`,
        subtitle: `Course: ${a.subject}`,
        time: new Date(postDate).toLocaleString(undefined, { hour: 'numeric', minute: 'numeric', day: 'numeric', month: 'short' }),
        isUnread: !readNotifications.includes(`assignment-${a.id}`),
        isUrgent: (new Date(a.deadline).getTime() - Date.now()) < (24 * 60 * 60000),
        rawDate: postDate
      });
    });

    return items.sort((a, b) => b.rawDate - a.rawDate).slice(0, 15);
  }, [notices, assignments, readNotifications]);

  const unreadCount = siteNotifications.filter(n => n.isUnread).length;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={`min-h-screen transition-all duration-500 font-sans ${t.bg} ${t.text} overflow-x-hidden pb-28 lg:pb-0`}>
      {/* Top Navigation Bar */}
      <header className={`sticky top-0 z-50 ${t.header} border-b px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between shadow-sm transition-all duration-500`}>
        <div className="flex items-center gap-3 lg:gap-12">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 text-primary hover:bg-primary/5 rounded-xl transition-colors"
          >
            <div className="flex flex-col gap-1.5 w-6">
              <div className="h-0.5 w-full bg-current rounded-full"></div>
              <div className="h-0.5 w-full bg-current rounded-full"></div>
              <div className="h-0.5 w-3/4 bg-current rounded-full"></div>
            </div>
          </button>

          <div className="flex items-center gap-2 lg:gap-3 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
            <div className="bg-primary p-2 rounded-lg lg:p-2.5 lg:rounded-2xl shadow-lg transform group-hover:rotate-12 transition-transform">
              <Leaf size={20} className="text-white lg:w-7 lg:h-7" />
            </div>
            <span className={`text-lg lg:text-2xl font-black tracking-tight ${t.heading} italic transition-colors`}>Green-Sync</span>
          </div>

          <div className="relative w-64 xl:w-80 hidden lg:block">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${t.muted} w-4 h-4 transition-colors`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses, docs..."
              className={`w-full pl-11 pr-4 py-2.5 ${t.search} border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm ${t.text}`}
            />
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {['dashboard', 'courses', 'papers', 'notes', 'assignment-submission', 'eco-tracker', 'settings'].map((tab) => {
            const labels: Record<string, string> = {
              'dashboard': 'Dashboard',
              'courses': 'Courses',
              'papers': 'Question Papers',
              'notes': 'Notes',
              'assignment-submission': 'Assignments',
              'eco-tracker': 'Eco Tracker',
              'settings': 'Settings'
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as Tab)}
                className={`relative py-2 text-sm font-bold transition-all duration-300 ${activeTab === tab ? t.accent : t.muted + ' hover:text-primary'}`}
              >
                {labels[tab]}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-[21px] left-0 right-0 h-1 bg-primary rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 lg:gap-6">
          <button
            onClick={() => {
              const pending = [...assignments]
                .filter(a => a.status !== 'submitted')
                .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

              const target = pending[0];

              if (target) {
                setActiveTab('dashboard');
                setActiveAssignmentId(target.id);

                setTimeout(() => {
                  const el = document.getElementById(`assignment-${target.id}`);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.animate([
                      { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.7)' },
                      { boxShadow: '0 0 0 25px rgba(34, 197, 94, 0)' }
                    ], { duration: 1500, iterations: 2, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
                  }
                }, 100);
              } else {
                alert("You have no pending assignments! Great job.");
              }
            }}
            className="flex items-center justify-center bg-[#22C55E] text-white p-2 lg:px-5 lg:py-2.5 rounded-xl lg:rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#22C55E]/30 group"
          >
            <Upload size={18} className="lg:w-4 lg:h-4 group-hover:-translate-y-0.5 transition-transform" />
            <span className="hidden lg:inline ml-2">Quick Upload</span>
          </button>
          <div className="flex items-center gap-2 lg:gap-3">
            <button
              onClick={() => setShowNotifications(true)}
              className={`p-2 ${t.muted} hover:${t.accent} transition-colors relative`}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className={`absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 ${t.header} animate-pulse`} />
              )}
            </button>
            <div className={`hidden sm:flex items-center gap-3 ${t.search} px-5 py-2 rounded-2xl border ${t.border}`}>
              <div className="text-right">
                <p className={`text-[10px] font-black ${t.muted} uppercase tracking-widest leading-tight mb-0.5`}>Welcome back</p>
                <p className={`text-sm font-black ${t.heading} leading-tight`}>{studentProfile.name}</p>
              </div>
              <div
                onClick={() => setShowProfile(true)}
                className={`w-10 h-10 rounded-full ${t.search} overflow-hidden border-2 border-white/50 shadow-md cursor-pointer hover:scale-105 transition-transform`}
              >
                <img src={studentProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
            <div
              onClick={() => setShowProfile(true)}
              className="sm:hidden w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 shadow-sm cursor-pointer active:scale-95 transition-transform"
            >
              <img src={studentProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
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
              className={`fixed top-0 left-0 bottom-0 w-[300px] ${t.sidebar} backdrop-blur-xl bg-opacity-95 z-[101] lg:hidden shadow-2xl p-7 flex flex-col h-full overflow-y-auto scrollbar-hide`}
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="bg-primary p-2.5 rounded-2xl shadow-lg shadow-primary/20">
                    <Leaf size={24} className="text-white" />
                  </div>
                  <span className={`text-2xl font-black italic tracking-tight ${t.heading}`}>Green-Sync</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-2.5 ${t.search} rounded-xl ${t.muted}`}
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col gap-2.5 flex-1">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
                  { id: 'courses', label: 'My Courses', icon: <BookOpen size={20} /> },
                  { id: 'papers', label: 'Question Papers', icon: <FileQuestion size={20} /> },
                  { id: 'notes', label: 'Student Notes', icon: <FileText size={20} /> },
                  { id: 'assignment-submission', label: 'Assignments', icon: <Upload size={20} /> },
                  { id: 'eco-tracker', label: 'Eco Tracker', icon: <TreePine size={20} /> },
                  { id: 'settings', label: 'Settings', icon: <Settings size={20} /> }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as Tab);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all group ${activeTab === item.id
                      ? `${t.navActive} border border-primary/10 shadow-sm`
                      : `${t.navInactive} border border-transparent`
                      }`}
                  >
                    <span className={`${activeTab === item.id ? 'text-primary' : t.muted} group-hover:scale-110 transition-transform`}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-4">
                <div className={`p-6 ${t.accentBg} rounded-3xl border ${t.border}`}>
                  <p className={`text-[10px] font-black ${t.muted} uppercase tracking-widest mb-2`}>Your Eco Rank</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-3xl font-black ${t.heading}`}>#12</span>
                    <Trophy className="text-primary" size={24} />
                  </div>
                </div>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full flex items-center gap-4 px-5 py-5 rounded-2xl font-bold text-sm text-red-500 bg-red-50 hover:bg-red-100 transition-all border border-red-100/50"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto p-4 lg:p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 lg:space-y-10"
            >
              {/* Mobile Welcome & Quick Stats */}
              <motion.div variants={itemVariants} className="lg:hidden flex flex-col gap-6 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className={`text-2xl font-black ${t.heading}`}>Hello,</h1>
                    <p className={`text-4xl font-black text-primary`}>{studentProfile.name.split(' ')[0]}!</p>
                  </div>
                  <div className={`p-4 ${t.card} rounded-3xl border ${t.border} shadow-sm flex flex-col items-center justify-center min-w-[100px]`}>
                    <span className="text-2xl font-black text-primary">A+</span>
                    <span className={`text-[10px] font-black ${t.muted} uppercase tracking-widest`}>Eco Rank</span>
                  </div>
                </div>

                {/* Quick Action Pills */}
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide no-scrollbar -mx-4 px-4">
                  {[
                    { id: 'papers', label: 'Papers', icon: <FileQuestion size={16} /> },
                    { id: 'notes', label: 'Notes', icon: <BookOpen size={16} /> },
                    { id: 'courses', label: 'Study', icon: <LayoutDashboard size={16} /> },
                    { id: 'eco-tracker', label: 'Impact', icon: <TreePine size={16} /> }
                  ].map(action => (
                    <button
                      key={action.id}
                      onClick={() => setActiveTab(action.id as Tab)}
                      className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl whitespace-nowrap font-black text-xs transition-all border ${t.border} ${t.search} hover:scale-105 active:scale-95 shadow-sm`}
                    >
                      <span className="text-primary">{action.icon}</span>
                      {action.label}
                    </button>
                  ))}
                </div>
              </motion.div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column */}
                <div className="lg:col-span-8 space-y-8">
                  {/* Notice Feed */}
                  <motion.section variants={itemVariants} className={`${t.card} p-5 lg:p-8 rounded-3xl lg:rounded-[2.5rem] shadow-sm border ${t.border}`}>
                    <div className="flex items-center justify-between mb-6 lg:mb-8 px-1">
                      <h2 className={`text-lg lg:text-xl font-black ${t.heading} flex items-center gap-2.5`}>
                        <BellRing className="text-primary w-5 h-5 lg:w-6 lg:h-6" />
                        Live Notice Feed
                      </h2>
                      <button
                        onClick={() => setShowAllNotices(true)}
                        className="text-xs lg:text-sm font-bold text-primary hover:underline transition-all"
                      >
                        View All
                      </button>
                    </div>
                    <div className="space-y-4">
                      {notices
                        .filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase()))
                        .sort((a, b) => (b.is_emergency ? 1 : 0) - (a.is_emergency ? 1 : 0))
                        .slice(0, 3)
                        .map((notice: Notice) => (
                          <NoticeItem key={notice.id} notice={notice} theme={t} />
                        ))}
                    </div>
                  </motion.section>

                  {/* Assignments */}
                  <motion.section variants={itemVariants} className={`${t.card} p-5 lg:p-8 rounded-3xl lg:rounded-[2.5rem] shadow-sm border ${t.border}`}>
                    <div className="flex items-center justify-between mb-6 lg:mb-8 px-1">
                      <h2 className={`text-lg lg:text-xl font-black ${t.heading} flex items-center gap-2.5`}>
                        <CheckCircle2 className="text-primary w-5 h-5 lg:w-6 lg:h-6" />
                        Upcoming Tasks
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-5">
                      {assignments
                        .filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.subject.toLowerCase().includes(searchQuery.toLowerCase()))
                        .sort((a, b) => {
                          const subA = a.status === 'submitted' ? 1 : 0;
                          const subB = b.status === 'submitted' ? 1 : 0;
                          if (subA !== subB) return subA - subB;
                          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
                        })
                        .map((assignment: AssignmentWithFile) => (
                          <AssignmentItem
                            key={assignment.id}
                            assignment={assignment}
                            onRemind={() => setReminderModal({ isOpen: true, assignmentId: Number(assignment.id) })}
                            onAction={(action) => handleAssignmentAction(Number(assignment.id), action)}
                            onDetails={() => setSelectedAssignment(assignment)}
                            onUpload={(file) => handleFileUpload(Number(assignment.id), file)}
                            onDeleteUpload={() => handleDeleteUpload(Number(assignment.id))}
                            isActive={activeAssignmentId === assignment.id}
                            timeLeft={activeAssignmentId === assignment.id ? formatTime(timeLeft) : undefined}
                            theme={t}
                          />
                        ))}
                    </div>
                  </motion.section>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-4 space-y-8">
                  {/* Leaderboard */}
                  <motion.section variants={itemVariants} className={`${t.card} p-5 lg:p-8 rounded-3xl lg:rounded-[2.5rem] shadow-sm border ${t.border}`}>
                    <div className="flex items-center justify-between mb-6 lg:mb-8 px-1">
                      <h2 className={`text-lg lg:text-xl font-black flex items-center gap-3 ${t.heading}`}>
                        <Trophy className={`${t.accent} w-5 h-5 lg:w-6 lg:h-6`} />
                        Eco-Leaderboard
                      </h2>
                      <LayoutDashboard className={`${t.muted} hidden lg:block`} size={20} />
                    </div>
                    <div className="space-y-4">
                      {[
                        { rank: 1, name: "Biology Dept", score: "24k pages saved", icon: <GraduationCap /> },
                        { rank: 2, name: "History Dept", score: "18k pages saved", icon: <BookOpen /> },
                        { rank: 3, name: "Math Dept", score: "15k pages saved", icon: <Calculator /> },
                        { rank: 4, name: "CS Dept", score: "12k pages saved", icon: <Code /> }
                      ].map((dept) => (
                        <LeaderboardItem
                          key={dept.rank}
                          rank={dept.rank}
                          name={dept.name}
                          score={dept.score}
                          icon={dept.icon}
                          active={user?.department === dept.name.split(' ')[0]}
                          onClick={() => setSelectedLeaderboardDept({ ...dept, pages: dept.score.split(' ')[0] })}
                          theme={t}
                        />
                      ))}
                    </div>
                    <div className={`mt-8 pt-6 lg:mt-10 lg:pt-8 border-t ${t.border}`}>
                      <div className="bg-primary/5 p-6 lg:p-8 rounded-3xl lg:rounded-[2rem] text-center border border-primary/10">
                        <p className={`text-[9px] lg:text-[10px] font-bold ${t.muted} uppercase tracking-widest mb-1 lg:mb-2`}>Your Rank</p>
                        <p className="text-4xl lg:text-5xl font-black text-primary mb-1 lg:mb-2">#{(user?.department === 'Biology' || user?.department === 'History' || user?.department === 'Math' || user?.department === 'CS') ? '1-4' : '5'}</p>
                        <p className={`text-[10px] lg:text-xs font-bold ${t.muted}`}>{user?.department && user.department !== 'General' ? user.department : 'IT Dept'}</p>
                      </div>
                    </div>
                  </motion.section>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'assignment-submission' && (
            <motion.div
              key="assignment-submission"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <AssignmentSubmissionView theme={t} />
            </motion.div>
          )}

          {activeTab === 'grades' && (
            <motion.div
              key="grades"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${t.card} p-12 rounded-[3rem] shadow-sm border ${t.border} text-center`}
            >
              <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
                <Trophy size={40} />
              </div>
              <h2 className={`text-3xl font-black ${t.heading} mb-2`}>Academic Grades</h2>
              <p className={`${t.muted} font-medium`}>Your semester performance reports will appear here.</p>
            </motion.div>
          )}

          {activeTab === 'courses' && (
            <motion.div
              key="courses"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h1 className={`text-3xl font-black ${t.heading}`}>My Courses</h1>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSemesters(true)}
                    className={`px-4 py-2 ${t.card} border ${t.border} rounded-xl text-sm font-bold hover:opacity-80 transition-all ${t.text}`}
                  >
                    All Semesters
                  </button>
                  <button
                    onClick={() => setShowEnroll(true)}
                    className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                  >
                    Enroll New
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses
                  .filter(c => c.semester === selectedSemester)
                  .filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.instructor.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((course, index) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      index={index}
                      onClick={() => setSelectedCourse(course)}
                      theme={t}
                    />
                  ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'eco-tracker' && (
            <motion.div
              key="eco-tracker"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <h1 className={`text-3xl font-black ${t.heading}`}>Eco-Impact Analysis</h1>

              {/* Weekly Goal Area */}
              <div className={`${t.card} p-8 rounded-[3rem] shadow-sm border ${t.border} flex flex-col md:flex-row items-center gap-12 relative overflow-hidden group transition-all duration-500`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 -z-10 blur-3xl group-hover:bg-primary/10 transition-colors" />

                <div className="relative w-48 h-48 flex-shrink-0">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="96" cy="96" r="88" fill="none" stroke={themeMode === 'Light' ? '#F1F5F9' : themeMode === 'Dark' ? '#1E293B' : '#064E3B20'} strokeWidth="16" />
                    <motion.circle
                      cx="96" cy="96" r="88" fill="none" stroke="currentColor" strokeWidth="16"
                      strokeDasharray="552.92"
                      initial={{ strokeDashoffset: 552.92 }}
                      animate={{ strokeDashoffset: 552.92 - (552.92 * 0.72) }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="text-primary"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-black ${t.heading} leading-none`}>72%</span>
                    <span className={`text-[10px] font-black ${t.muted} uppercase tracking-widest mt-1`}>Goal Progress</span>
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                  <div>
                    <h2 className={`text-2xl font-black ${t.heading} mb-2`}>Excellent Progress, {studentProfile.name.split(' ')[0]}!</h2>
                    <p className={`${t.muted} font-medium max-w-lg`}>You've saved 4kg of CO2 this month. That's equivalent to planting 12 new saplings in our virtual forest.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 ${t.search} rounded-2xl border ${t.border}`}>
                      <p className={`text-[10px] font-black ${t.muted} uppercase tracking-widest mb-1`}>Projected Saving</p>
                      <p className={`text-xl font-bold ${t.heading}`}>12.5 kg/yr</p>
                    </div>
                    <div className={`p-4 ${t.search} rounded-2xl border ${t.border}`}>
                      <p className={`text-[10px] font-black ${t.muted} uppercase tracking-widest mb-1`}>Paper Equivalent</p>
                      <p className={`text-xl font-bold ${t.heading}`}>2.4 Reams</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  icon={<FileText />}
                  label="Pages Saved"
                  value="1,240"
                  trend="+12% this week"
                  color="green"
                  theme={t}
                />
                <StatCard
                  icon={<TreePine />}
                  label="Trees Saved"
                  value="0.5"
                  trend="+5% this week"
                  color="green"
                  theme={t}
                />
                <StatCard
                  icon={<CloudOff />}
                  label="Carbon Offset"
                  value="4.2 kg"
                  trend="+8% this week"
                  color="green"
                  theme={t}
                />
              </div>

              {/* Enhanced Analytics Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Monthly Contribution Chart */}
                <div className={`lg:col-span-2 ${t.card} p-8 rounded-[2rem] shadow-sm border ${t.border} relative overflow-hidden group`}>
                  <div className="flex items-center justify-between mb-8 z-10 relative">
                    <div>
                      <h3 className={`text-xl font-black ${t.heading}`}>Projected Carbon Savings</h3>
                      <p className={`text-xs ${t.muted} font-bold uppercase tracking-widest mt-1`}>6-Month Trend Analysis</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="bg-slate-50 text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 text-slate-400 hover:text-primary transition-colors border border-slate-100">Export PDF</button>
                      <select className="bg-slate-50 border-none text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 focus:ring-0 text-slate-600 outline-none cursor-pointer">
                        <option>Last 6 Months</option>
                        <option>This Year</option>
                      </select>
                    </div>
                  </div>
                  <div className="h-64 flex items-end justify-between px-4 z-10 relative gap-3">
                    {[
                      { m: 'Jan', v: 45, co2: '2.1kg' }, { m: 'Feb', v: 62, co2: '3.0kg' }, { m: 'Mar', v: 85, co2: '4.2kg' },
                      { m: 'Apr', v: 48, co2: '2.4kg' }, { m: 'May', v: 92, co2: '4.6kg' }, { m: 'Jun', v: 75, co2: '3.8kg' }
                    ].map((d, i) => (
                      <div key={i} className="flex flex-col items-center gap-3 flex-1 group/bar">
                        <div className="w-full relative flex flex-col justify-end h-48">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${d.v}%` }}
                            transition={{ duration: 1, delay: i * 0.1, type: "spring" }}
                            className={`w-full rounded-t-2xl transition-all duration-500 overflow-hidden relative ${i === 4 ? 'bg-gradient-to-t from-[#1b612c] to-[#2B8A3E] shadow-lg shadow-[#2B8A3E]/30' : `${t.search} group-hover/bar:opacity-80`}`}
                          >
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"
                            />
                          </motion.div>
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-3 py-2 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-all pointer-events-none mb-2 font-black transform -translate-y-2 group-hover/bar:translate-y-0 shadow-xl z-20 whitespace-nowrap">
                            <div className="flex flex-col items-center">
                              <span>{d.v} Pages</span>
                              <span className="text-primary text-[8px]">{d.co2} CO2 Saving</span>
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                          </div>
                        </div>
                        <span className={`text-[10px] font-black ${t.muted} uppercase tracking-widest`}>{d.m}</span>
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 z-0 pointer-events-none flex flex-col justify-between pt-32 pb-16 px-8">
                    {[1, 2, 3, 4].map(l => <div key={l} className={`border-b ${t.border} w-full`} />)}
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Detailed Analysis Card */}
                  <div className={`${t.card} p-8 rounded-[2rem] shadow-sm border ${t.border}`}>
                    <h3 className={`text-lg font-black ${t.heading} mb-6`}>Impact Composition</h3>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className={`text-xs font-bold ${t.muted} flex items-center gap-2`}>
                            <div className="w-2 h-2 rounded-full bg-primary" /> Assignments
                          </span>
                          <span className={`text-sm font-black ${t.heading}`}>820 pgs</span>
                        </div>
                        <div className={`h-1.5 w-full ${t.search} rounded-full overflow-hidden`}>
                          <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} className="h-full bg-primary" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-500 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500" /> Test Papers
                          </span>
                          <span className={`text-sm font-black ${t.heading}`}>310 pgs</span>
                        </div>
                        <div className={`h-1.5 w-full ${t.search} rounded-full overflow-hidden`}>
                          <motion.div initial={{ width: 0 }} animate={{ width: '25%' }} className="h-full bg-blue-500" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className={`text-xs font-bold ${t.muted} flex items-center gap-2`}>
                            <div className="w-2 h-2 rounded-full bg-orange-500" /> Misc Docs
                          </span>
                          <span className={`text-sm font-black ${t.heading}`}>110 pgs</span>
                        </div>
                        <div className={`h-1.5 w-full ${t.search} rounded-full overflow-hidden`}>
                          <motion.div initial={{ width: 0 }} animate={{ width: '10%' }} className="h-full bg-orange-500" />
                        </div>
                      </div>
                    </div>

                    <button className={`w-full mt-8 py-4 ${t.search} hover:opacity-80 rounded-2xl text-[10px] font-black uppercase tracking-widest ${t.muted} transition-all border ${t.border}`}>
                      View Comprehensive Report
                    </button>
                  </div>

                  {/* Dynamic Tip */}
                  <div className="bg-gradient-to-br from-[#1e612c] via-[#2B8A3E] to-[#37b24d] p-8 rounded-[2rem] shadow-xl shadow-[#2B8A3E]/20 text-white relative overflow-hidden group">
                    <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                      <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                        <Zap size={24} className="text-yellow-300" />
                      </div>
                      <h4 className="font-black text-lg">Environmental Score</h4>
                    </div>
                    <div className="flex items-end gap-3 mb-4">
                      <span className="text-5xl font-black">A+</span>
                      <span className="text-xs font-bold opacity-80 mb-2">Top 5% Eco-Users</span>
                    </div>
                    <p className="text-xs font-medium leading-relaxed text-white/90 relative z-10">
                      Your digital-first approach in <span className="text-yellow-200">Biology 101</span> has saved more CO2 than 85% of your peers. Keep leading!
                    </p>
                  </div>
                </div>
              </div>

              {/* Weekly Performance Benchmarks */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Weekly Carbon Output - FIXED */}
                <div className={`${t.card} p-8 rounded-[2rem] shadow-sm border ${t.border} flex flex-col relative group`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`text-lg font-black ${t.heading}`}>Weekly Carbon Shield</h3>
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                      <Shield size={16} />
                    </div>
                  </div>
                  <p className={`text-[10px] ${t.muted} font-black uppercase tracking-widest mb-8`}>Daily Prevention (g CO2)</p>

                  <div className="flex-1 flex items-end gap-3 h-48 px-2 mt-auto">
                    {[
                      { d: 'M', v: 65 }, { d: 'T', v: 45 }, { d: 'W', v: 82 },
                      { d: 'T', v: 56 }, { d: 'F', v: 95 }, { d: 'S', v: 30 }, { d: 'S', v: 20 }
                    ].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-3 group/wbar">
                        <div className="w-full relative h-[140px] flex flex-col justify-end">
                          <motion.div
                            className={`w-full rounded-t-xl transition-all duration-300 relative ${i === 4 ? 'bg-primary shadow-lg shadow-primary/20' : `${t.search} group-hover/wbar:opacity-80`}`}
                            initial={{ height: 0 }}
                            animate={{ height: `${h.v}%` }}
                            transition={{ delay: 0.3 + (i * 0.05), duration: 0.8, type: "spring" }}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] px-2 py-1 rounded-lg opacity-0 group-hover/wbar:opacity-100 transition-all font-bold">
                              {h.v}g
                            </div>
                          </motion.div>
                        </div>
                        <span className={`text-[10px] font-black ${t.muted} mt-2`}>{h.d}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Efficiency Analytics */}
                <div className={`${t.card} p-8 rounded-[2rem] shadow-sm border ${t.border}`}>
                  <h3 className={`text-lg font-black ${t.heading} mb-8`}>Efficiency Benchmarks</h3>
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <p className={`text-xs font-black ${t.muted} uppercase tracking-widest`}>Submission Speed</p>
                        <p className="text-xs font-black text-primary">Fast (+15%)</p>
                      </div>
                      <div className={`h-6 ${t.search} rounded-xl flex items-center px-1`}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '85%' }}
                          className="h-4 bg-primary rounded-lg flex items-center justify-end pr-2 text-[8px] font-black text-white"
                        >85%</motion.div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <p className={`text-xs font-black ${t.muted} uppercase tracking-widest`}>Digital Retention</p>
                        <p className="text-xs font-black text-blue-500">Peak</p>
                      </div>
                      <div className={`h-6 ${t.search} rounded-xl flex items-center px-1`}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '92%' }}
                          className="h-4 bg-blue-500 rounded-lg flex items-center justify-end pr-2 text-[8px] font-black text-white"
                        >92%</motion.div>
                      </div>
                    </div>

                    <div className={`pt-4 border-t ${t.border}`}>
                      <p className={`text-[10px] ${t.muted} font-medium italic`}>Based on your last 10 digital submissions compared to physical printing offsets.</p>
                    </div>
                  </div>
                </div>

                {/* Departmental Carbon Leader */}
                <div className={`${t.card} p-8 rounded-[2rem] shadow-sm border ${t.border} flex flex-col justify-between overflow-hidden relative`}>
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
                  <div>
                    <h3 className={`text-lg font-black ${t.heading} mb-2`}>Dept. Achievement</h3>
                    <p className={`text-xs ${t.muted} font-bold uppercase tracking-widest mb-6`}>Computer Engineering</p>

                    <div className="flex items-center gap-6 mb-8">
                      <div className={`w-20 h-20 rounded-[2rem] bg-slate-900 text-white flex flex-col items-center justify-center shadow-2xl`}>
                        <span className="text-2xl font-black">#3</span>
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-60 text-center">In Univ</span>
                      </div>
                      <div className="space-y-1">
                        <p className={`text-sm font-black ${t.heading}`}>Sustainability Excellence</p>
                        <p className={`text-xs font-medium ${t.muted}`}>Your department has saved over 12,000kg of CO2 this year.</p>
                      </div>
                    </div>
                  </div>

                  <button className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
                    Explore Dept Leaderboard
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'papers' && (
            <motion.div
              key="papers"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className={`text-3xl font-black ${t.heading}`}>Mumbai University Papers</h1>
                  <p className={`${t.muted} font-medium mt-1`}>Previous year question papers for Engineering</p>
                </div>
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="relative w-64">
                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${t.muted} w-4 h-4`} />
                    <input
                      type="text"
                      value={paperSearchQuery}
                      onChange={(e) => setPaperSearchQuery(e.target.value)}
                      placeholder="Search paper subjects..."
                      className={`w-full pl-11 pr-4 py-2.5 ${t.search} border ${t.border} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold shadow-sm ${t.text}`}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setActiveQuizPhase('topic');
                      setShowQuizModal(true);
                    }}
                    className={`h-[42px] px-4 ${t.search} border ${t.border} rounded-xl flex items-center justify-center text-primary hover:bg-primary/10 transition-all shadow-sm group`}
                    title="Start Practice Quiz"
                  >
                    <Bot size={20} className="group-hover:rotate-12 transition-transform" />
                    <span className="ml-2 text-xs font-black uppercase tracking-wider hidden sm:inline">AI Quiz</span>
                  </motion.button>
                  <CustomDropdown
                    label="Semester"
                    options={semesterOptions}
                    value={selectedPaperSemester}
                    onChange={setSelectedPaperSemester}
                    theme={t}
                  />
                  <CustomDropdown
                    label="Year"
                    options={yearOptions}
                    value={selectedPaperYear}
                    onChange={setSelectedPaperYear}
                    theme={t}
                  />
                  <div className="pb-0.5">
                    <button
                      onClick={() => setShowUploadPaper(true)}
                      className="flex items-center gap-2 bg-[#22C55E] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#22C55E]/30 h-[42px]"
                    >
                      <Upload size={16} />
                      Upload Paper
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] overflow-hidden">
                {/* Desktop View */}
                <div className={`hidden lg:block ${t.card} border ${t.border} rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-sm`}>
                  <table className="w-full text-left">
                    <thead>
                      <tr className={`${t.search} border-b ${t.border}`}>
                        <th className={`px-10 py-6 text-xs font-black uppercase tracking-widest ${t.muted}`}>Subject</th>
                        <th className={`px-10 py-6 text-xs font-black uppercase tracking-widest ${t.muted}`}>Year</th>
                        <th className={`px-10 py-6 text-xs font-black uppercase tracking-widest ${t.muted}`}>Semester</th>
                        <th className={`px-10 py-6 text-xs font-black uppercase tracking-widest ${t.muted}`}>Type</th>
                        <th className={`px-10 py-6 text-xs font-black uppercase tracking-widest ${t.muted} text-right`}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPapers.map((paper) => (
                        <motion.tr
                          key={paper.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.002, x: 4 }}
                          className={`border-b ${t.border} last:border-0 hover:${t.search} transition-all duration-300 group cursor-pointer`}
                        >
                          <td className="px-10 py-7">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 ${t.search} rounded-2xl shadow-sm group-hover:bg-primary/10 transition-colors`}>
                                <GraduationCap size={20} className="text-primary" />
                              </div>
                              <span className={`text-base font-black ${t.heading} group-hover:text-primary transition-colors`}>{paper.subject}</span>
                            </div>
                          </td>
                          <td className={`px-10 py-7 text-sm font-black ${t.muted}`}>{paper.year}</td>
                          <td className={`px-10 py-7 text-sm font-black ${t.muted}`}>{paper.semester}</td>
                          <td className="px-10 py-7">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${paper.type === 'Regular'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                              }`}>
                              {paper.type}
                            </span>
                          </td>
                          <td className="px-10 py-7 text-right">
                            <motion.a
                              href={paper.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className={`p-3 ${t.search} ${t.muted} hover:text-primary transition-all inline-flex items-center justify-center rounded-xl shadow-sm`}
                              title="Open Question Paper"
                            >
                              <ExternalLink size={20} />
                            </motion.a>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View */}
                <div className="lg:hidden grid grid-cols-1 gap-4">
                  {filteredPapers.map((paper) => (
                    <motion.div
                      key={paper.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`${t.card} p-5 rounded-3xl border ${t.border} shadow-sm flex flex-col gap-4 relative overflow-hidden group`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 ${t.search} text-primary rounded-2xl shadow-sm`}>
                            <GraduationCap size={22} />
                          </div>
                          <div>
                            <h3 className={`text-base font-black ${t.heading} leading-tight mb-1.5`}>{paper.subject}</h3>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-black ${t.muted} ${t.search} px-3 py-1 rounded-lg`}>{paper.year}</span>
                              <span className={`text-[10px] font-black ${t.muted} ${t.search} px-3 py-1 rounded-lg`}>{paper.semester}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${paper.type === 'Regular' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' : 'bg-orange-500/10 text-orange-600 border border-orange-500/10'}`}>
                          {paper.type}
                        </span>
                      </div>
                      <motion.a
                        href={paper.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/25 transition-all"
                      >
                        <ExternalLink size={16} /> View Question Paper
                      </motion.a>
                    </motion.div>
                  ))}
                </div>
              </div>
              {filteredPapers.length === 0 && (
                <div className="p-24 text-center">
                  <div className={`${t.search} w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-primary/20 shadow-inner`}>
                    <GraduationCap size={44} />
                  </div>
                  <p className={`text-lg font-black ${t.heading}`}>No papers found</p>
                  <p className={`${t.muted} font-bold mt-2 text-sm`}>Try adjusting your semester or year filters.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, scale: 0.98, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -30 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="space-y-6 lg:space-y-10"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-gradient-to-br from-primary/10 to-transparent p-6 lg:p-10 rounded-3xl lg:rounded-[3rem] border border-primary/10 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-primary group-hover:rotate-12 transition-transform duration-500">
                      <BookOpen size={24} />
                    </div>
                    <h1 className={`text-4xl font-black ${t.heading}`}>Mumbai University Notes</h1>
                  </div>
                  <p className={`${t.muted} font-medium text-lg`}>Download comprehensive BA study notes for all semesters</p>
                </div>

                <div className="flex flex-wrap gap-4 items-end relative z-10">
                  <div className="relative min-w-[280px]">
                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${t.muted} w-4 h-4`} />
                    <input
                      type="text"
                      value={noteSearchQuery}
                      onChange={(e) => setNoteSearchQuery(e.target.value)}
                      placeholder="Search for subjects or topics..."
                      className={`w-full pl-11 pr-4 py-3.5 ${t.search} border ${t.border} rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm font-bold shadow-lg ${t.text}`}
                    />
                  </div>
                  <MultiSelectDropdown
                    label="Semesters"
                    options={['All Semesters', '1', '2', '3', '4', '5', '6']}
                    value={selectedNoteSemesters}
                    onChange={setSelectedNoteSemesters}
                    theme={t}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {notes
                    .filter(n => selectedNoteSemesters.includes('All Semesters') || selectedNoteSemesters.includes(n.semester.toString()))
                    .filter(n => n.title.toLowerCase().includes(noteSearchQuery.toLowerCase()) || n.subject.toLowerCase().includes(noteSearchQuery.toLowerCase()))
                    .map((note, index) => (
                      <motion.div
                        key={note.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ delay: index * 0.05, duration: 0.4 }}
                        whileHover={{ y: -8 }}
                        className={`${t.card} p-8 rounded-[2.5rem] border ${t.border} shadow-xl shadow-black/5 hover:shadow-primary/10 transition-all group relative overflow-hidden`}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 transition-colors group-hover:bg-primary/10" />

                        <div className="flex items-start justify-between mb-6 relative z-10">
                          <div className={`w-14 h-14 ${t.search} rounded-2xl flex items-center justify-center text-primary shadow-inner border border-white/50`}>
                            <FileDown size={28} className="group-hover:scale-110 transition-transform" />
                          </div>
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${t.search} ${t.heading} border ${t.border}`}>
                            Sem {note.semester}
                          </span>
                        </div>

                        <div className="relative z-10 h-24">
                          <h3 className={`text-xl font-black ${t.heading} leading-tight mb-2 group-hover:text-primary transition-colors`}>{note.title}</h3>
                          <p className={`text-xs font-bold leading-relaxed ${t.muted} flex items-center gap-2 uppercase tracking-wide`}>
                            <Leaf size={12} className="text-primary" /> {note.subject}
                          </p>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between relative z-10">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${t.muted}`}>Category: {note.category}</span>
                          <motion.a
                            href={note.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ x: 4 }}
                            className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest hover:underline"
                          >
                            Get PDF <ChevronRight size={14} />
                          </motion.a>
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>

              {notes.filter(n => (selectedNoteSemesters.includes('All Semesters') || selectedNoteSemesters.includes(n.semester.toString())) && (n.title.toLowerCase().includes(noteSearchQuery.toLowerCase()) || n.subject.toLowerCase().includes(noteSearchQuery.toLowerCase()))).length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-32 text-center"
                >
                  <div className={`${t.search} w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${t.muted} opacity-20`}>
                    <Search size={48} />
                  </div>
                  <h3 className={`text-xl font-black ${t.heading}`}>No notes discovered</h3>
                  <p className={`${t.muted} font-medium mt-2`}>Try adjusting your search or semester filter.</p>
                </motion.div>
              )}

              {/* Scroll to Top Hint */}
              <div className="flex justify-center pt-10">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className={`flex flex-col items-center gap-2 ${t.muted} hover:text-primary transition-colors group`}
                >
                  <div className="w-10 h-10 rounded-full border border-current flex items-center justify-center group-hover:-translate-y-2 transition-transform">
                    <RefreshCcw size={18} className="rotate-90" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Scroll Up</span>
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <div className="flex items-center gap-4 mb-8">
                {settingsSubTab !== 'main' && (
                  <button
                    onClick={() => setSettingsSubTab('main')}
                    className={`p-2 ${t.search} rounded-full shadow-sm hover:opacity-80 transition-colors ${t.text}`}
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}
                <h1 className={`text-3xl font-black capitalize ${t.heading}`}>
                  {settingsSubTab === 'main' ? 'Settings' : settingsSubTab}
                </h1>
              </div>

              <div className={`${t.card} rounded-[2rem] shadow-sm border ${t.border} overflow-hidden`}>
                <AnimatePresence mode="wait">
                  {settingsSubTab === 'main' && (
                    <motion.div
                      key="settings-main"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <SettingsOption
                        icon={<User />}
                        label="Profile Information"
                        description="Update your personal details and avatar"
                        onClick={() => setSettingsSubTab('profile')}
                        theme={t}
                      />
                      <SettingsOption
                        icon={<BellRing />}
                        label="Notifications"
                        description="Manage how you receive alerts and updates"
                        onClick={() => setSettingsSubTab('notifications')}
                        theme={t}
                      />
                      <SettingsOption
                        icon={<Shield />}
                        label="Security"
                        description="Change password and manage account access"
                        onClick={() => setSettingsSubTab('security')}
                        theme={t}
                      />
                      <SettingsOption
                        icon={<Palette />}
                        label="Appearance"
                        description="Customize the dashboard theme and layout"
                        onClick={() => setSettingsSubTab('appearance')}
                        theme={t}
                      />
                      <SettingsOption
                        icon={<HelpCircle />}
                        label="Help & Support"
                        description="Get assistance or report an issue"
                        onClick={() => setSettingsSubTab('help')}
                        theme={t}
                      />
                    </motion.div>
                  )}

                  {settingsSubTab === 'profile' && (
                    <motion.div
                      key="settings-profile"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-8 space-y-6"
                    >
                      <div className="flex items-center gap-6 mb-8">
                        <div className="relative group">
                          <div className="w-24 h-24 rounded-[2rem] bg-slate-200 overflow-hidden border-4 border-white shadow-xl">
                            <img src={studentProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          </div>
                          <button className="absolute -bottom-2 -right-2 p-3 bg-primary text-white rounded-2xl shadow-lg hover:scale-110 transition-transform">
                            <Camera size={18} />
                          </button>
                        </div>
                        <div>
                          <h3 className={`text-xl font-black ${t.heading}`}>{studentProfile.name}</h3>
                          <p className={`text-sm font-bold ${t.muted}`}>{studentProfile.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className={`text-[10px] font-black ${t.muted} uppercase ml-1`}>Full Name</label>
                          <input
                            type="text"
                            value={studentProfile.name}
                            onChange={(e) => setStudentProfile(prev => ({ ...prev, name: e.target.value }))}
                            className={`w-full p-4 ${t.search} border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold ${t.text}`}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className={`text-[10px] font-black ${t.muted} uppercase ml-1`}>Phone Number</label>
                          <input
                            type="text"
                            value={studentProfile.phone}
                            onChange={(e) => setStudentProfile(prev => ({ ...prev, phone: e.target.value }))}
                            className={`w-full p-4 ${t.search} border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold ${t.text}`}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className={`text-[10px] font-black ${t.muted} uppercase ml-1`}>Department</label>
                          <input
                            type="text"
                            value={studentProfile.dept}
                            onChange={(e) => setStudentProfile(prev => ({ ...prev, dept: e.target.value }))}
                            className={`w-full p-4 ${t.search} border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold ${t.text}`}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className={`text-[10px] font-black ${t.muted} uppercase ml-1`}>Year / Semester</label>
                          <input
                            type="text"
                            value={studentProfile.year}
                            onChange={(e) => setStudentProfile(prev => ({ ...prev, year: e.target.value }))}
                            className={`w-full p-4 ${t.search} border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold ${t.text}`}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSaveStatus(true);
                          setTimeout(() => setSaveStatus(false), 3000);
                        }}
                        className={`w-full py-4 bg-primary text-white rounded-2xl font-black hover:opacity-90 transition-all shadow-xl shadow-primary/20 mt-4 active:scale-95`}
                      >
                        Save Changes
                      </button>
                    </motion.div>
                  )}

                  {settingsSubTab === 'notifications' && (
                    <motion.div
                      key="settings-notifications"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-8 space-y-4"
                    >
                      {[
                        { id: 'assignmentAlerts', label: 'Assignment Alerts', desc: 'Get notified 24h before submission deadlines' },
                        { id: 'ecoMilestones', label: 'Eco Milestones', desc: 'Alert me when I Reach a new impact level' },
                        { id: 'paperUploads', label: 'Paper Uploads', desc: 'Notify when new papers are added to my semester' },
                        { id: 'securityAlerts', label: 'Security Alerts', desc: 'Immediate notification of login from new devices' },
                        { id: 'emailBriefing', label: 'Email Briefing', desc: 'Receive weekly summary of academic progress' }
                      ].map((pref) => (
                        <div key={pref.id} className={`flex items-center justify-between p-4 ${t.search} rounded-2xl`}>
                          <div>
                            <p className={`font-bold ${t.heading} leading-tight`}>{pref.label}</p>
                            <p className={`text-xs ${t.muted} font-medium`}>{pref.desc}</p>
                          </div>
                          <button
                            onClick={() => setNotificationSettings(prev => ({ ...prev, [pref.id]: !prev[pref.id as keyof typeof prev] }))}
                            className={`w-12 h-6 rounded-full transition-colors relative ${notificationSettings[pref.id as keyof typeof notificationSettings] ? 'bg-primary' : (themeMode === 'Dark' ? 'bg-slate-700' : 'bg-slate-300')}`}
                          >
                            <motion.div
                              animate={{ x: notificationSettings[pref.id as keyof typeof notificationSettings] ? 24 : 4 }}
                              className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                            />
                          </button>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {settingsSubTab === 'security' && (
                    <motion.div
                      key="settings-security"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-8 space-y-6"
                    >
                      <div className={`p-4 bg-orange-50/10 border border-orange-500/20 rounded-2xl flex gap-4 text-orange-500`}>
                        <ShieldAlert size={20} className="flex-shrink-0" />
                        <p className="text-xs font-bold leading-relaxed">Your last password change was 6 months ago. We recommend updating it for better security.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className={`text-[10px] font-black ${t.muted} uppercase ml-1`}>Current Password</label>
                          <input type="password" placeholder="••••••••" className={`w-full p-4 ${t.search} border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold ${t.text}`} />
                        </div>
                        <div className="space-y-1.5">
                          <label className={`text-[10px] font-black ${t.muted} uppercase ml-1`}>New Password</label>
                          <input type="password" placeholder="Min 8 characters" className={`w-full p-4 ${t.search} border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold ${t.text}`} />
                        </div>
                        <div className="space-y-1.5">
                          <label className={`text-[10px] font-black ${t.muted} uppercase ml-1`}>Confirm New Password</label>
                          <input type="password" placeholder="Min 8 characters" className={`w-full p-4 ${t.search} border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold ${t.text}`} />
                        </div>
                      </div>

                      <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95">
                        Update Password
                      </button>
                    </motion.div>
                  )}

                  {settingsSubTab === 'appearance' && (
                    <motion.div
                      key="settings-appearance"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-8 space-y-8"
                    >
                      <div>
                        <h4 className={`text-sm font-black ${t.heading} uppercase tracking-widest mb-4`}>Dashboard Theme</h4>
                        <div className="grid grid-cols-3 gap-4">
                          {['Light', 'Dark', 'Eco'].map((mode) => (
                            <button
                              key={mode}
                              onClick={() => setThemeMode(mode as any)}
                              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${themeMode === mode
                                ? 'bg-primary/5 border-primary'
                                : `${t.card} ${t.border} hover:border-primary/20`
                                }`}
                            >
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${mode === 'Light' ? 'bg-orange-100 text-orange-500' :
                                mode === 'Dark' ? 'bg-slate-800 text-white' :
                                  'bg-green-100 text-green-500'
                                }`}>
                                {mode === 'Light' ? <Sun size={24} /> : mode === 'Dark' ? <Moon size={24} /> : <Leaf size={24} />}
                              </div>
                              <span className={`text-xs font-black ${t.text}`}>{mode}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className={`flex items-center justify-between p-4 ${t.search} rounded-2xl`}>
                          <div>
                            <p className={`font-bold ${t.heading}`}>Reduced Motion</p>
                            <p className={`text-[10px] ${t.muted} font-medium`}>Minimize animations for better accessibility</p>
                          </div>
                          <button className={`w-12 h-6 ${themeMode === 'Dark' ? 'bg-slate-700' : 'bg-slate-300'} rounded-full relative`}>
                            <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {settingsSubTab === 'help' && (
                    <motion.div
                      key="settings-help"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-8 space-y-6"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <button className={`p-6 ${t.search} rounded-3xl border ${t.border} text-left space-y-3 hover:opacity-80 transition-all group`}>
                          <div className={`w-12 h-12 ${t.card} rounded-2xl flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform`}>
                            <HelpCircle size={24} />
                          </div>
                          <p className={`font-bold ${t.heading}`}>Knowledge Base</p>
                          <p className={`text-[10px] ${t.muted} font-medium`}>Read guides and common FAQs</p>
                        </button>
                        <button
                          onClick={() => {
                            setShowAssistant(true);
                          }}
                          className={`p-6 ${t.search} rounded-3xl border ${t.border} text-left space-y-3 hover:opacity-80 transition-all group`}
                        >
                          <div className={`w-12 h-12 ${t.card} rounded-2xl flex items-center justify-center text-blue-500 shadow-sm group-hover:scale-110 transition-transform`}>
                            <MessageSquare size={24} />
                          </div>
                          <p className={`font-bold ${t.heading}`}>Direct Chat</p>
                          <p className={`text-[10px] ${t.muted} font-medium`}>Talk to our assistant</p>
                        </button>
                      </div>

                      <div className="space-y-4">
                        <h4 className={`text-sm font-black ${t.heading} uppercase tracking-widest px-2`}>Feedback</h4>
                        <textarea
                          placeholder="Describe your issue or suggestion..."
                          className={`w-full p-4 ${t.search} border-none rounded-3xl focus:ring-2 focus:ring-primary/20 ${t.text} font-medium h-32 resize-none`}
                        />
                        <button
                          onClick={() => {
                            setSaveStatus(true);
                            setTimeout(() => setSaveStatus(false), 3000);
                          }}
                          className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:opacity-90 transition-all"
                        >
                          Submit Feedback
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-8 border-t border-slate-50">
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="w-full flex items-center gap-4 p-6 hover:bg-red-50 transition-all group"
                  >
                    <div className="p-3 bg-red-100 text-red-600 rounded-2xl group-hover:scale-110 transition-transform">
                      <LogOut size={20} />
                    </div>
                    <div className="text-left">
                      <p className={`font-bold ${t.heading}`}>Sign Out</p>
                      <p className={`text-xs ${t.muted}`}>Logout from your current session</p>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>


      {/* AI Assistant Floating Button */}
      <button
        onClick={() => setIsAIChatOpen(true)}
        className="fixed bottom-32 lg:bottom-8 right-6 lg:right-8 w-14 h-14 lg:w-16 lg:h-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group pointer-events-auto"
      >
        <Sparkles className="w-6 h-6 lg:w-8 lg:h-8 group-hover:rotate-12 transition-transform" />
        <div className={`absolute -top-12 right-0 ${t.card} ${t.text} px-4 py-2 rounded-xl text-xs font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border ${t.border} hidden lg:block`}>
          Need help? Ask AI
        </div>
      </button>

      {/* AI Assistant Chat Modal */}
      <AnimatePresence>
        {isAIChatOpen && (
          <AIAssistant onClose={() => setIsAIChatOpen(false)} theme={t} />
        )}
      </AnimatePresence>

      {/* Notice View All Modal */}
      <AnimatePresence>
        {showAllNotices && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAllNotices(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-4xl max-h-[90vh] ${t.card} rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col`}
            >
              <div className={`p-8 border-b ${t.border} flex items-center justify-between ${t.header} sticky top-0 z-10`}>
                <h2 className={`text-2xl font-black ${t.heading}`}>Official Announcements</h2>
                <button onClick={() => setShowAllNotices(false)} className={`p-2 hover:${t.search} rounded-full transition-colors ${t.text}`}>
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {notices
                  .sort((a, b) => (b.is_emergency ? 1 : 0) - (a.is_emergency ? 1 : 0))
                  .map((notice) => (
                    <div key={notice.id} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${notice.is_emergency ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {notice.is_emergency ? <AlertCircle size={20} /> : <Megaphone size={20} />}
                          </div>
                          <div>
                            <h3 className={`font-black text-lg ${t.heading}`}>{notice.title}</h3>
                            <p className={`text-xs ${t.muted} font-bold uppercase tracking-widest`}>
                              {notice.target_department} • {new Date(notice.publish_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className={`${t.text} leading-relaxed text-lg`}>{notice.content}</p>
                      <div className={`h-px ${t.border} w-full`} />
                    </div>
                  ))}
              </div>
            </motion.div>
          </div>
        )
        }
      </AnimatePresence >

      {/* Reminder Modal */}
      <AnimatePresence>
        {reminderModal.isOpen && (
          <ReminderModal
            onClose={() => setReminderModal({ isOpen: false, assignmentId: null })}
            onSet={(time) => {
              alert(`Reminder set for ${time}!`);
              setReminderModal({ isOpen: false, assignmentId: null });
            }}
            theme={t}
          />
        )}
      </AnimatePresence>

      {/* Assignment Details Modal */}
      <AnimatePresence>
        {selectedAssignment && (
          <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAssignment(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className={`relative w-full max-w-xl ${t.card} rounded-[3rem] shadow-2xl p-10 overflow-hidden`}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className={`text-2xl font-black ${t.heading} leading-tight`}>{selectedAssignment.title}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-primary font-black uppercase tracking-widest text-[10px] bg-primary/5 px-3 py-1 rounded-full border border-primary/10">{selectedAssignment.subject}</span>
                    <span className={`font-bold text-[10px] uppercase tracking-widest ${t.muted}`}>{selectedAssignment.department}</span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedAssignment(null)}
                  className={`p-3 ${t.search} hover:opacity-80 ${t.muted} hover:${t.text} rounded-2xl transition-all border ${t.border}`}
                >
                  <X size={20} />
                </motion.button>
              </div>

              <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
                <div className={`${t.search} p-6 rounded-[2rem] border ${t.border}`}>
                  <h4 className={`text-[10px] font-black ${t.muted} mb-2 uppercase tracking-[0.2em]`}>Assignment Mission</h4>
                  <p className={`${t.text} leading-relaxed font-medium`}>{selectedAssignment.long_description || selectedAssignment.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4 text-left">
                    <h4 className={`text-[10px] font-black ${t.muted} uppercase tracking-widest ml-1`}>Key Details</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shadow-sm">
                          <Clock size={16} />
                        </div>
                        <div>
                          <p className={`text-[10pt] font-black ${t.heading}`}>{new Date(selectedAssignment.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          <p className={`text-[8px] font-bold ${t.muted} uppercase`}>Submission Window</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shadow-sm">
                          <Trophy size={16} />
                        </div>
                        <div>
                          <p className={`text-[10pt] font-black ${t.heading}`}>{selectedAssignment.max_marks} Points</p>
                          <p className={`text-[8px] font-bold ${t.muted} uppercase`}>Weightage</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 text-left">
                    <h4 className={`text-[10px] font-black ${t.muted} uppercase tracking-widest ml-1`}>Focus Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {(selectedAssignment.tags || ['Sustainable Living', 'Modern Ethics', 'Case Study']).map((tag: string, idx: number) => (
                        <span key={idx} className={`text-[10px] font-black ${t.card} border ${t.border} ${t.text} px-3 py-1.5 rounded-xl shadow-sm`}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-[#E7F5ED]/30 p-6 rounded-[2rem] border border-[#8CE09F]/20">
                  <h4 className="text-[10px] font-black text-[#2B8A3E] mb-3 uppercase tracking-widest">Environment Impact Checklist</h4>
                  <div className="space-y-2">
                    <div className={`flex items-center gap-2 text-xs font-bold ${t.text}`}>
                      <CheckCircle2 size={14} className="text-[#2B8A3E]" />
                      <span>Digital-only submission (Required)</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-bold ${t.text}`}>
                      <CheckCircle2 size={14} className="text-[#2B8A3E]" />
                      <span>Referenced peer-reviewed e-papers</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button
                  onClick={() => setSelectedAssignment(null)}
                  className={`flex-1 py-4 ${t.search} ${t.muted} rounded-2xl font-black hover:opacity-80 transition-all border ${t.border}`}
                >
                  Back to Grid
                </button>
                <button
                  onClick={() => {
                    handleAssignmentAction(selectedAssignment.id, selectedAssignment.status === 'in-progress' ? 'submit' : 'start');
                    setSelectedAssignment(null);
                  }}
                  className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] transform transition-all active:scale-95"
                >
                  {selectedAssignment.status === 'submitted' ? 'Resubmit' : selectedAssignment.status === 'in-progress' ? 'Submit Mission' : 'Accept Assignment'}
                </button>
              </div>
            </motion.div>
          </div>
        )
        }
      </AnimatePresence >

      {/* Course Syllabus Modal */}
      <AnimatePresence>
        {
          selectedCourse && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedCourse(null)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30, rotateX: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30, rotateX: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`relative w-full max-w-xl ${t.card} rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] p-10 overflow-hidden border ${t.border}`}
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />

                <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center gap-6">
                    <motion.div
                      initial={{ rotate: -20, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className={`p-5 rounded-3xl ${t.accentBg} ${t.accent} shadow-inner`}
                    >
                      {React.cloneElement(selectedCourse.icon as React.ReactElement, { size: 32 })}
                    </motion.div>
                    <div>
                      <h2 className={`text-3xl font-black ${t.heading} leading-tight`}>{selectedCourse.title}</h2>
                      <p className={`${t.muted} font-bold text-xs uppercase tracking-[0.2em] mt-2`}>{selectedCourse.instructor} • Sem {selectedCourse.semester}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ rotate: 90, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedCourse(null)}
                    className={`p-3 ${t.search} hover:opacity-80 ${t.muted} hover:${t.text} rounded-2xl transition-all border ${t.border}`}
                  >
                    <X size={24} />
                  </motion.button>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className={`text-[10px] font-black ${t.muted} mb-6 uppercase tracking-[0.3em] ml-1`}>Academic Curriculum</h4>
                    <div className="grid gap-4">
                      {selectedCourse.syllabus.map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + (i * 0.1) }}
                          className={`flex items-center gap-4 p-5 ${t.search} rounded-[1.5rem] group hover:opacity-80 transition-all border ${t.border}`}
                        >
                          <div className={`w-8 h-8 rounded-xl ${t.card} ${t.accent} flex items-center justify-center text-xs font-black shadow-sm group-hover:bg-primary group-hover:text-white transition-colors`}>
                            0{i + 1}
                          </div>
                          <span className={`font-bold ${t.text} leading-tight`}>{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (selectedCourse.syllabusUrl && selectedCourse.syllabusUrl !== '#') {
                        window.open(selectedCourse.syllabusUrl, '_blank');
                      } else {
                        alert("Syllabus PDF is currently being digitized. Please check back later!");
                      }
                    }}
                    className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black hover:bg-primary-dark transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-3"
                  >
                    <FileDown size={20} />
                    Download Complete Syllabus PDF
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )
        }
      </AnimatePresence >

      {/* Notifications Modal */}
      <AnimatePresence>
        {
          showNotifications && (
            <div className="fixed inset-0 z-[120] flex items-start justify-end p-8 pointer-events-none">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNotifications(false)} className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px] pointer-events-auto" />
              <motion.div initial={{ opacity: 0, x: 20, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 20, scale: 0.95 }} className={`relative w-80 ${t.card} rounded-3xl shadow-2xl border ${t.border} pointer-events-auto overflow-hidden`}>
                <div className={`p-6 border-b ${t.border} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <h3 className={`font-black ${t.heading}`}>Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest leading-none flex items-center">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  <button onClick={() => setShowNotifications(false)} className={`${t.muted} hover:${t.text}`}><X size={16} /></button>
                </div>
                <div className="max-h-96 overflow-y-auto scrollbar-hide py-2">
                  <AnimatePresence>
                    {siteNotifications.length > 0 ? siteNotifications.map((notif, i) => (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: i * 0.05, type: "spring", stiffness: 300, damping: 20 }}
                        onClick={() => {
                          if (notif.isUnread) {
                            setReadNotifications(prev => [...prev, notif.id]);
                          }

                          if (notif.type === 'assignment') {
                            setActiveTab('dashboard');
                            setActiveAssignmentId(notif.originalId);
                            setShowNotifications(false);

                            setTimeout(() => {
                              const el = document.getElementById(`assignment-${notif.originalId}`);
                              if (el) {
                                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                el.animate([
                                  { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.7)' },
                                  { boxShadow: '0 0 0 25px rgba(34, 197, 94, 0)' }
                                ], { duration: 1500, iterations: 2, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
                              }
                            }, 300);
                          } else {
                            const notice = notices.find(n => n.id === notif.originalId);
                            if (notice) {
                              setSelectedNotice(notice);
                              setShowNotifications(false);
                            }
                          }
                        }}
                        className={`p-4 mx-2 rounded-2xl transition-all cursor-pointer group mb-1 ${notif.isUnread ? `${t.accentBg} hover:opacity-80` : `bg-transparent hover:${t.search}`}`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${notif.isUnread ? (notif.isUrgent ? 'bg-red-500 animate-pulse' : 'bg-primary') : `${t.muted}`}`} />
                          <div>
                            <p className={`text-sm leading-tight transition-colors ${notif.isUnread ? `font-black ${t.heading} group-hover:text-primary` : `font-bold ${t.muted} group-hover:text-slate-700`}`}>
                              {notif.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <p className={`text-[9px] font-black uppercase tracking-widest ${notif.isUrgent ? 'text-red-500' : 'text-primary'}`}>
                                {notif.subtitle}
                              </p>
                              <span className={`text-[10px] font-bold ${t.muted} opacity-30`}>•</span>
                              <p className={`text-[9px] font-bold ${t.muted} uppercase tracking-widest`}>{notif.time}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )) : (
                      <div className="text-center py-10">
                        <Bell className={`mx-auto ${t.muted} opacity-20 mb-3`} size={32} />
                        <p className={`text-xs font-bold ${t.muted} uppercase tracking-widest`}>All caught up!</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
                <button
                  onClick={() => {
                    const allIds = siteNotifications.map(n => n.id);
                    setReadNotifications(allIds);
                  }}
                  disabled={unreadCount === 0}
                  className={`w-full py-4 text-xs font-black text-primary disabled:${t.muted} hover:not-disabled:${t.accentBg} transition-colors uppercase tracking-widest border-t ${t.border}`}
                >
                  Mark all as read
                </button>
              </motion.div>
            </div>
          )
        }
      </AnimatePresence >

      {/* Profile Modal */}
      <AnimatePresence>
        {
          showProfile && (
            <div className="fixed inset-0 z-[120] flex items-start justify-end p-8 pointer-events-none">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowProfile(false)} className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px] pointer-events-auto" />
              <motion.div initial={{ opacity: 0, x: 20, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 20, scale: 0.95 }} className={`relative w-80 ${t.card} rounded-3xl shadow-2xl border ${t.border} pointer-events-auto overflow-hidden`}>
                <div className={`p-8 text-center ${t.search}`}>
                  <div className={`w-20 h-20 rounded-full ${t.search} mx-auto mb-4 border-4 ${t.card} shadow-lg overflow-hidden`}>
                    <img src={studentProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <h3 className={`font-black text-lg ${t.heading}`}>{studentProfile.name}</h3>
                  <p className={`text-xs font-bold ${t.muted} uppercase tracking-widest`}>{studentProfile.email}</p>
                </div>
                <div className="p-4">
                  <button onClick={() => { setActiveTab('settings'); setShowProfile(false); }} className={`w-full flex items-center gap-3 p-4 hover:${t.search} rounded-2xl transition-all font-bold ${t.text}`}>
                    <User size={18} /> Profile Settings
                  </button>
                  <button onClick={logout} className="w-full flex items-center gap-3 p-4 hover:bg-red-50 rounded-2xl transition-all font-bold text-red-600 mt-2">
                    <LogOut size={18} /> Sign Out
                  </button>
                </div>
              </motion.div>
            </div>
          )
        }
      </AnimatePresence >

      {/* Semesters Modal */}
      <AnimatePresence>
        {
          showSemesters && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSemesters(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`relative w-full max-w-md ${t.card} rounded-[2.5rem] shadow-2xl p-8 border ${t.border}`}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-2xl font-black ${t.heading}`}>All Semesters</h2>
                  <button onClick={() => setShowSemesters(false)} className={`p-2 hover:${t.search} rounded-full transition-colors ${t.muted} hover:${t.text}`}><X size={20} /></button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <button
                      key={sem}
                      onClick={() => {
                        setSelectedSemester(sem);
                        setShowSemesters(false);
                        setActiveTab('courses');
                      }}
                      className={`p-6 rounded-2xl font-black transition-all border ${selectedSemester === sem
                        ? 'bg-primary text-white border-primary'
                        : `${t.search} ${t.text} hover:bg-primary hover:text-white border-transparent hover:border-primary/20`
                        }`}
                    >
                      Semester {sem}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          )
        }
      </AnimatePresence >

      {/* Upload Paper Modal */}
      <AnimatePresence>
        {
          showUploadPaper && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowUploadPaper(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={`relative w-full max-w-lg ${t.card} rounded-[2.5rem] shadow-2xl p-8 max-h-[90vh] overflow-y-auto scrollbar-hide border ${t.border}`}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-2xl font-black ${t.heading}`}>Upload Question Paper</h2>
                  <button onClick={() => setShowUploadPaper(false)} className={`p-2 hover:${t.search} rounded-full transition-colors ${t.muted} hover:${t.text}`}><X size={20} /></button>
                </div>

                <form
                  onSubmit={handlePaperUpload}
                  className="space-y-6"
                >
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-black ${t.muted} uppercase ml-2`}>Subject Name</label>
                    <input name="subject" required placeholder="e.g. Applied Mathematics-III" className={`w-full p-4 ${t.search} border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold text-sm ${t.text}`} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <CustomDropdown
                      label="Exam Year"
                      options={['2024', '2023', '2022', '2021', '2020']}
                      value={uploadPaperForm.year}
                      onChange={(val) => setUploadPaperForm(prev => ({ ...prev, year: val }))}
                      theme={t}
                    />
                    <CustomDropdown
                      label="Semester"
                      options={['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8']}
                      value={uploadPaperForm.semester}
                      onChange={(val) => setUploadPaperForm(prev => ({ ...prev, semester: val }))}
                      theme={t}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <CustomDropdown
                      label="Exam Type"
                      options={['Regular', 'KT']}
                      value={uploadPaperForm.type}
                      onChange={(val) => setUploadPaperForm(prev => ({ ...prev, type: val as 'Regular' | 'KT' }))}
                      theme={t}
                    />
                    <div className="space-y-1.5">
                      <label className={`text-[10px] font-black ${t.muted} uppercase ml-2`}>File (PDF)</label>
                      <div className="relative border border-transparent rounded-2xl overflow-hidden group/upload transition-all hover:border-primary/20">
                        <input
                          name="file"
                          type="file"
                          accept=".pdf"
                          required
                          onChange={(e) => setUploadPaperFile(e.target.files?.[0] || null)}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <div className={`w-full p-4 border-2 border-dashed rounded-2xl flex items-center justify-center gap-2 font-bold text-sm h-[42px] transition-colors ${uploadPaperFile ? 'bg-primary/5 border-primary/20 text-primary' : `${t.search} ${t.border} ${t.muted} group-hover/upload:opacity-80`}`}>
                          <Upload size={16} className={uploadPaperFile ? 'text-primary' : ''} />
                          <span className="truncate max-w-[120px]">{uploadPaperFile ? uploadPaperFile.name : 'Select PDF'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`${t.accentBg} p-4 rounded-2xl border border-primary/10`}>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Note</p>
                    <p className={`text-xs ${t.text} opacity-80 leading-relaxed`}>Your contribution helps other students. Please ensure the paper is clear and complete.</p>
                  </div>

                  <button
                    disabled={isUploadingPaper}
                    type="submit"
                    className="w-full py-4 bg-primary text-white rounded-2xl font-black hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isUploadingPaper ? (
                      <>
                        <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                        Uploading to Grid...
                      </>
                    ) : 'Upload & Share'}
                  </button>
                </form>
              </motion.div>
            </div>
          )
        }
      </AnimatePresence >

      {/* Quiz Modal */}
      <AnimatePresence>
        {showQuizModal && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowQuizModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className={`relative w-full max-w-2xl ${t.card} rounded-[3rem] shadow-2xl overflow-hidden border ${t.border} flex flex-col max-h-[90vh]`}
            >
              {/* Quiz Header */}
              <div className={`p-8 border-b ${t.border} flex items-center justify-between ${t.header} sticky top-0 z-10`}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                    <Bot size={28} />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-black ${t.heading}`}>AI Practice Quiz</h2>
                    <p className={`text-[10px] font-black ${t.muted} uppercase tracking-widest`}>Test your knowledge with 20 questions</p>
                  </div>
                </div>
                <button onClick={() => setShowQuizModal(false)} className={`p-2 hover:${t.search} rounded-full transition-colors ${t.text}`}>
                  <X size={24} />
                </button>
              </div>

              {/* Quiz Content Phases */}
              <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
                <AnimatePresence mode="wait">
                  {activeQuizPhase === 'topic' && (
                    <motion.div
                      key="topic-selection"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="text-center space-y-2">
                        <h3 className={`text-3xl font-black ${t.heading}`}>Select a Subject</h3>
                        <p className={`${t.muted} font-medium`}>We'll pull 20 questions from past papers and key syllabus modules.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.from(new Set(papers.map(p => p.subject))).length > 0 ? (
                          Array.from(new Set(papers.map(p => p.subject))).map((topic, i) => (
                            <button
                              key={i}
                              onClick={() => handleStartAIQuiz(topic as string)}
                              className={`p-6 ${t.search} border ${t.border} rounded-3xl text-left hover:border-primary/50 hover:bg-primary/5 transition-all group`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`font-black ${t.heading} group-hover:text-primary transition-colors`}>{topic as string}</span>
                                <ArrowUpRight size={18} className={`${t.muted} group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all`} />
                              </div>
                            </button>
                          ))
                        ) : (
                          ['Computer Networks', 'Operating Systems', 'Discrete Mathematics', 'Database Management', 'Artificial Intelligence'].map((topic, i) => (
                            <button
                              key={i}
                              onClick={() => handleStartAIQuiz(topic)}
                              className={`p-6 ${t.search} border ${t.border} rounded-3xl text-left hover:border-primary/50 hover:bg-primary/5 transition-all group`}
                            >
                              <span className={`font-black ${t.heading} group-hover:text-primary transition-colors`}>{topic}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}

                  {activeQuizPhase === 'quiz' && (
                    <motion.div
                      key="active-quiz"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-10"
                    >
                      {isGeneratingQuiz ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-6">
                          <Bot size={64} className="text-primary animate-bounce" />
                          <div className="text-center space-y-2">
                            <h3 className={`text-2xl font-black ${t.heading}`}>AI is generating your quiz...</h3>
                            <p className={`${t.muted} font-medium`}>Searching Mumbai University patterns and web sources.</p>
                          </div>
                          <div className={`w-64 h-2 ${t.search} rounded-full overflow-hidden`}>
                            <motion.div
                              animate={{ x: [-256, 256] }}
                              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                              className="w-1/2 h-full bg-primary"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className={`text-[10px] font-black ${t.muted} uppercase tracking-widest`}>Current Subject</p>
                              <h4 className={`text-xl font-black ${t.heading}`}>{selectedQuizTopic}</h4>
                            </div>
                            <div className="text-right">
                              <p className={`text-[10px] font-black ${t.muted} uppercase tracking-widest`}>Question PROGRESS</p>
                              <h4 className={`text-xl font-black text-primary`}>{currentQuizIndex + 1} / {activeQuizQuestions.length}</h4>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className={`h-2 ${t.search} rounded-full overflow-hidden`}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${((currentQuizIndex + 1) / activeQuizQuestions.length) * 100}%` }}
                              className="h-full bg-primary"
                            />
                          </div>

                          <div className="space-y-6">
                            <h3 className={`text-2xl font-black ${t.heading} leading-tight`}>
                              {activeQuizQuestions[currentQuizIndex]?.question}
                            </h3>

                            <div className="grid grid-cols-1 gap-4">
                              {activeQuizQuestions[currentQuizIndex]?.options.map((option, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    if (isAnswerChecking) return;
                                    setSelectedQuizAnswer(idx);
                                  }}
                                  className={`p-5 rounded-2xl border-2 text-left font-bold transition-all flex items-center gap-4 ${selectedQuizAnswer === idx
                                    ? 'bg-primary/5 border-primary text-primary'
                                    : `${t.search} ${t.border} ${t.text} hover:border-primary/20`
                                    }`}
                                >
                                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${selectedQuizAnswer === idx ? 'bg-primary text-white' : `${t.card} ${t.muted} border ${t.border}`
                                    }`}>
                                    {String.fromCharCode(65 + idx)}
                                  </div>
                                  {option}
                                </button>
                              ))}
                            </div>
                          </div>

                          <button
                            disabled={selectedQuizAnswer === null || isAnswerChecking}
                            onClick={() => {
                              setIsAnswerChecking(true);

                              // Track user answer
                              const newAnswers = [...userAnswers];
                              newAnswers[currentQuizIndex] = selectedQuizAnswer;
                              setUserAnswers(newAnswers);

                              if (selectedQuizAnswer === activeQuizQuestions[currentQuizIndex].correctAnswer) {
                                setQuizScore(prev => prev + 1);
                              }

                              setTimeout(() => {
                                if (currentQuizIndex < activeQuizQuestions.length - 1) {
                                  setCurrentQuizIndex(prev => prev + 1);
                                  setSelectedQuizAnswer(null);
                                  setIsAnswerChecking(false);
                                } else {
                                  setActiveQuizPhase('results');
                                  setIsAnswerChecking(false);
                                }
                              }, 200);
                            }}
                            className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50 flex items-center justify-center gap-3"
                          >
                            {currentQuizIndex < activeQuizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                            <ChevronRight size={20} />
                          </button>
                        </>
                      )}
                    </motion.div>
                  )}

                  {activeQuizPhase === 'results' && (
                    <motion.div
                      key="quiz-results"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center space-y-10 py-6"
                    >
                      <div className="space-y-4">
                        <div className="w-24 h-24 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                          <Trophy size={48} />
                        </div>
                        <h3 className={`text-4xl font-black ${t.heading}`}>Quiz Complete!</h3>
                        <p className={`${t.muted} font-medium`}>You've mastered the <span className="text-primary font-bold">#{selectedQuizTopic}</span> session.</p>
                      </div>

                      <div className="flex justify-center gap-12">
                        <div className="space-y-1">
                          <p className={`text-[10px] font-black ${t.muted} uppercase tracking-widest`}>Final Score</p>
                          <p className={`text-4xl font-black ${t.heading}`}>{quizScore} <span className="text-xl text-slate-400">/ {activeQuizQuestions.length}</span></p>
                        </div>
                        <div className="space-y-1">
                          <p className={`text-[10px] font-black ${t.muted} uppercase tracking-widest`}>Accuracy</p>
                          <p className={`text-4xl font-black text-primary`}>{Math.round((quizScore / activeQuizQuestions.length) * 100)}%</p>
                        </div>
                      </div>

                      <div className={`${t.accentBg} p-8 rounded-[3rem] border ${t.border} space-y-4`}>
                        <div className="flex items-center justify-center gap-3 text-primary">
                          <Sparkles size={24} />
                          <h4 className="text-lg font-black">Eco-Bonus Earned!</h4>
                        </div>
                        <p className={`text-sm ${t.text} font-medium leading-relaxed`}>By performing this digital quiz instead of printing physical mock papers, you've saved <span className="font-bold underline">12 pages</span> of paper today.</p>
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="flex gap-4">
                          <button
                            onClick={() => {
                              setActiveQuizPhase('topic');
                              setSelectedQuizAnswer(null);
                            }}
                            className={`flex-1 py-5 ${t.search} ${t.heading} rounded-[2rem] font-black hover:opacity-80 transition-all border ${t.border} flex items-center justify-center gap-2`}
                          >
                            <RefreshCcw size={20} /> Retake
                          </button>
                          <button
                            onClick={() => setShowQuizModal(false)}
                            className="flex-1 py-5 bg-primary text-white rounded-[2rem] font-black hover:opacity-90 transition-all shadow-xl shadow-primary/20"
                          >
                            Done
                          </button>
                        </div>
                        <button
                          onClick={() => setActiveQuizPhase('answer-key')}
                          className={`w-full py-5 ${t.card} ${t.heading} border ${t.border} rounded-[2rem] font-black hover:bg-primary/5 hover:text-primary transition-all flex items-center justify-center gap-2`}
                        >
                          <Eye size={20} /> View Answer Key & Explanations
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {activeQuizPhase === 'answer-key' && (
                    <motion.div
                      key="answer-key"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6 pb-6"
                    >
                      <div className="flex items-center justify-between mb-4 sticky top-0 bg-inherit py-2 z-10">
                        <h3 className={`text-2xl font-black ${t.heading}`}>Detailed Answer Key</h3>
                        <button
                          onClick={() => setActiveQuizPhase('results')}
                          className={`flex items-center gap-2 text-sm font-bold ${t.muted} hover:${t.text}`}
                        >
                          <ChevronLeft size={16} /> Back to Score
                        </button>
                      </div>

                      <div className="space-y-8">
                        {activeQuizQuestions.map((q, idx) => {
                          const userAns = userAnswers[idx];
                          const isCorrect = userAns === q.correctAnswer;
                          return (
                            <div key={idx} className={`p-6 rounded-3xl border-2 transition-all ${isCorrect ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <h4 className={`text-lg font-black ${t.heading}`}>{idx + 1}. {q.question}</h4>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                  {isCorrect ? 'Correct' : 'Incorrect'}
                                </div>
                              </div>

                              <div className="space-y-2 mb-4">
                                {q.options.map((opt, oIdx) => (
                                  <div key={oIdx} className={`flex items-center gap-3 text-sm ${oIdx === q.correctAnswer
                                    ? 'text-green-600 font-bold'
                                    : oIdx === userAns
                                      ? 'text-red-500 font-bold'
                                      : `${t.muted}`
                                    }`}>
                                    <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${oIdx === q.correctAnswer
                                      ? 'bg-green-500 text-white'
                                      : oIdx === userAns
                                        ? 'bg-red-500 text-white'
                                        : `${t.search} border ${t.border}`
                                      }`}>
                                      {String.fromCharCode(65 + oIdx)}
                                    </div>
                                    <span>{opt}</span>
                                    {oIdx === q.correctAnswer && <CheckCircle2 size={14} />}
                                    {oIdx === userAns && !isCorrect && <X size={14} />}
                                  </div>
                                ))}
                              </div>

                              <div className={`p-4 ${t.card} rounded-2xl border ${t.border} mt-4`}>
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Explanation</p>
                                <p className={`text-xs ${t.text} opacity-80 leading-relaxed font-medium`}>{q.explanation}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setShowQuizModal(false)}
                        className="w-full py-5 bg-primary text-white rounded-[2rem] font-black hover:opacity-90 transition-all shadow-xl shadow-primary/20 mt-8"
                      >
                        Finish Review
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Dept Leaderboard Modal */}
      <AnimatePresence>
        {
          selectedLeaderboardDept && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedLeaderboardDept(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className={`relative w-full max-w-2xl ${t.card} rounded-[3rem] shadow-2xl p-10 overflow-hidden border ${t.border}`}
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-5">
                    <div className={`w-16 h-16 rounded-[1.5rem] ${t.accentBg} ${t.accent} flex items-center justify-center shadow-inner`}>
                      {selectedLeaderboardDept.icon}
                    </div>
                    <div>
                      <h2 className={`text-3xl font-black ${t.heading}`}>{selectedLeaderboardDept.name} Overview</h2>
                      <p className={`${t.muted} font-bold uppercase tracking-widest text-[10px] mt-1`}>Rank #{selectedLeaderboardDept.rank} Global Leaderboard</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedLeaderboardDept(null)} className={`p-3 hover:${t.search} rounded-2xl transition-colors ${t.muted} hover:${t.text}`}><X size={20} /></button>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-10">
                  <div className="space-y-4">
                    <h4 className={`text-[10px] font-black ${t.muted} uppercase tracking-widest ml-1`}>Department Impact</h4>
                    <div className={`p-6 ${themeMode === 'Eco' ? 'bg-[#E7F5ED]' : t.search} rounded-[2rem] border ${t.border} relative overflow-hidden group`}>
                      <TreePine className={`absolute -right-4 -bottom-4 w-24 h-24 ${themeMode === 'Eco' ? 'text-[#2B8A3E]/10' : 'opacity-10'} group-hover:scale-110 transition-transform`} />
                      <p className={`text-4xl font-black ${themeMode === 'Eco' ? 'text-[#2B8A3E]' : t.heading}`}>{selectedLeaderboardDept.pages}</p>
                      <p className={`text-xs font-bold ${t.muted} mt-1 uppercase tracking-wider`}>Total Pages Digitized</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className={`text-[10px] font-black ${t.muted} uppercase tracking-widest ml-1`}>Student Engagement</h4>
                    <div className={`p-6 ${themeMode === 'Eco' ? 'bg-blue-50' : t.search} rounded-[2rem] border ${themeMode === 'Eco' ? 'border-blue-100' : t.border} relative overflow-hidden group`}>
                      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/10 rounded-full group-hover:scale-110 transition-transform" />
                      <p className={`text-4xl font-black ${themeMode === 'Eco' ? 'text-blue-600' : t.heading}`}>92%</p>
                      <p className={`text-xs font-bold ${t.muted} mt-1 uppercase tracking-wider`}>Active Participation</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className={`text-sm font-black ${t.heading} mb-4 uppercase tracking-widest`}>Recent Dept. Announcements</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                    {notices
                      .filter(n => n.target_department === selectedLeaderboardDept.name.split(' ')[0] || n.target_department === 'General')
                      .slice(0, 3)
                      .map((notice, idx) => (
                        <div key={idx} className={`p-4 ${t.search} rounded-2xl border ${t.border} hover:opacity-80 transition-all group`}>
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-xl shrink-0 ${notice.is_emergency ? 'bg-red-50 text-red-500' : `${t.accentBg} ${t.accent}`}`}>
                              {notice.is_emergency ? <AlertCircle size={16} /> : <Megaphone size={16} />}
                            </div>
                            <div>
                              <p className={`font-black ${t.heading} group-hover:text-primary transition-colors`}>{notice.title}</p>
                              <p className={`text-[10px] ${t.muted} line-clamp-1 mt-1`}>{notice.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    {notices.filter(n => n.target_department === selectedLeaderboardDept.name.split(' ')[0]).length === 0 && (
                      <div className={`p-8 text-center ${t.search} rounded-2xl border border-dashed border ${t.border}`}>
                        <p className={`text-xs font-bold ${t.muted}`}>No specific assignment notices for this department yet.</p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedLeaderboardDept(null)}
                  className="w-full mt-10 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
                >
                  Return to Dashboard
                </button>
              </motion.div>
            </div>
          )
        }
      </AnimatePresence >

      <AnimatePresence>
        {showEnroll && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEnroll(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-lg ${t.card} rounded-[2.5rem] shadow-2xl p-8 max-h-[90vh] overflow-y-auto scrollbar-hide scroll-smooth border ${t.border}`}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-black ${t.heading}`}>Enroll in New Course</h2>
                <button onClick={() => setShowEnroll(false)} className={`p-2 hover:${t.search} rounded-full transition-colors ${t.muted} hover:${t.text}`}><X size={20} /></button>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className={`text-sm font-black ${t.muted} uppercase tracking-widest mb-4`}>Available Courses</h3>
                  <div className="space-y-4">
                    {[
                      { title: 'Machine Learning', dept: 'CS Dept', icon: <Code />, semester: 5 },
                      { title: 'Digital Marketing', dept: 'Arts Dept', icon: <Palette />, semester: 2 },
                      { title: 'Quantum Physics', dept: 'Science Dept', icon: <Sparkles />, semester: 6 }
                    ].map((course, i) => (
                      <div key={i} className={`flex items-center justify-between p-4 ${t.search} rounded-2xl hover:opacity-80 transition-all border ${t.border} group`}>
                        <div className="flex items-center gap-4">
                          <div className={`p-3 ${t.card} rounded-xl text-primary shadow-sm group-hover:scale-110 transition-transform border ${t.border}`}>
                            {course.icon}
                          </div>
                          <div>
                            <p className={`font-black ${t.heading}`}>{course.title}</p>
                            <p className={`text-[10px] font-bold ${t.muted} uppercase tracking-widest`}>{course.dept} • Sem {course.semester}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const newCourse: Course = {
                              id: courses.length + 1,
                              title: course.title,
                              instructor: "Assigned Faculty",
                              progress: 0,
                              color: "blue",
                              icon: course.icon,
                              semester: course.semester,
                              syllabus: ["Introduction", "Core Concepts", "Advanced Topics"]
                            };
                            setCourses(prev => [...prev, newCourse]);
                            alert(`Successfully enrolled in ${course.title}!`);
                            setShowEnroll(false);
                          }}
                          className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-black hover:bg-primary-dark transition-all"
                        >
                          Enroll
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`pt-8 border-t ${t.border}`}>
                  <h3 className={`text-sm font-black ${t.muted} uppercase tracking-widest mb-4`}>Add Custom Course</h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const title = formData.get('title') as string;
                      const instructor = formData.get('instructor') as string;
                      const semester = parseInt(formData.get('semester') as string);

                      if (title && instructor && semester) {
                        const newCourse: Course = {
                          id: courses.length + 1,
                          title,
                          instructor,
                          progress: 0,
                          color: "green",
                          icon: <BookOpen size={24} />,
                          semester,
                          syllabus: ["Course Overview", "Module 1", "Module 2"]
                        };
                        setCourses(prev => [...prev, newCourse]);
                        alert(`Custom course "${title}" added successfully!`);
                        setShowEnroll(false);
                      }
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className={`text-[10px] font-black ${t.muted} uppercase ml-2`}>Course Title</label>
                        <input name="title" required placeholder="e.g. Advanced AI" className={`w-full p-4 ${t.search} border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold text-sm ${t.text}`} />
                      </div>
                      <div className="space-y-1.5">
                        <label className={`text-[10px] font-black ${t.muted} uppercase ml-2`}>Instructor</label>
                        <input name="instructor" required placeholder="e.g. Dr. Strange" className={`w-full p-4 ${t.search} border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold text-sm ${t.text}`} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className={`text-[10px] font-black ${t.muted} uppercase ml-2`}>Semester</label>
                      <select name="semester" required className={`w-full p-4 ${t.search} border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold text-sm appearance-none ${t.text}`}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                      </select>
                    </div>
                    <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
                      Add & Enroll
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Upload Modal */}
      <AnimatePresence>
        {showQuickUpload && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowQuickUpload(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`relative w-full max-w-sm ${t.card} rounded-[2.5rem] shadow-2xl p-8 text-center overflow-hidden border ${t.border}`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-[#22C55E]" />
              <div className="w-16 h-16 bg-[#DCFCE7] text-[#22C55E] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Upload size={32} />
              </div>
              <h3 className={`text-xl font-black ${t.heading} mb-2`}>Instant Upload</h3>
              {(() => {
                const pending = [...assignments]
                  .filter(a => a.status !== 'submitted')
                  .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
                const target = pending[0];
                return target ? (
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">
                    Target: {target.title}
                  </p>
                ) : (
                  <p className={`text-[10px] font-black ${t.muted} uppercase tracking-widest mb-4`}>
                    No pending assignments found
                  </p>
                );
              })()}
              <p className={`text-[10px] font-black ${t.muted} uppercase tracking-widest mb-8`}>Fast submission portal</p>

              <div className="space-y-3">
                <label className="block w-full py-4 bg-[#22C55E] text-white rounded-2xl font-black cursor-pointer hover:bg-[#16A34A] transition-all shadow-lg shadow-[#22C55E]/20">
                  Select Assignment File
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        const file = e.target.files[0];
                        const pending = [...assignments]
                          .filter(a => a.status !== 'submitted')
                          .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
                        const target = pending[0] || assignments[0];

                        if (target) {
                          handleFileUpload(target.id, file);
                          // Force its status to submitted since this is an "Instant Upload"
                          handleAssignmentAction(target.id, 'submit');
                        }

                        setShowQuickUpload(false);
                        setActiveTab('assignment-submission');
                      }
                    }}
                  />
                </label>
                <button onClick={() => setShowQuickUpload(false)} className={`w-full py-4 ${t.search} ${t.muted} rounded-2xl font-black hover:opacity-80 transition-all border ${t.border}`}>
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Modals & Toasts */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative ${t.card} w-full max-w-sm rounded-[3rem] p-8 text-center space-y-6 shadow-2xl border ${t.border}`}
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertCircle size={40} />
              </div>
              <div>
                <h3 className={`text-2xl font-black ${t.heading}`}>Sign Out?</h3>
                <p className={`${t.muted} font-medium mt-2`}>Are you sure you want to sign out? You will need to login again.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className={`py-4 rounded-2xl font-black ${t.muted} hover:${t.search} transition-colors border ${t.border}`}
                >
                  Cancel
                </button>
                <button
                  onClick={logout}
                  className="py-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all shadow-xl shadow-red-600/20"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedNotice && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedNotice(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className={`relative w-full max-w-lg ${t.card} rounded-[3rem] shadow-2xl p-10 overflow-hidden border ${t.border}`}
            >
              <div className={`absolute top-0 left-0 w-full h-2 ${selectedNotice.is_emergency ? 'bg-red-500' : 'bg-primary'}`} />

              <div className="flex justify-between items-start mb-8">
                <div className={`p-4 rounded-3xl ${selectedNotice.is_emergency ? 'bg-red-50 text-red-500' : 'bg-primary/10 text-primary'}`}>
                  {selectedNotice.is_emergency ? <ShieldAlert size={32} /> : <Megaphone size={32} />}
                </div>
                <button onClick={() => setSelectedNotice(null)} className={`p-2 hover:${t.search} rounded-full transition-colors ${t.muted} hover:${t.text}`}><X size={20} /></button>
              </div>

              <h2 className={`text-2xl font-black ${t.heading} mb-2 leading-tight`}>{selectedNotice.title}</h2>
              <p className={`text-[10px] font-black ${t.muted} uppercase tracking-[0.2em] mb-8`}>
                {new Date(selectedNotice.publish_date).toLocaleString()} • {selectedNotice.target_department}
              </p>

              <div className={`${t.search} p-6 rounded-3xl mb-8 border ${t.border}`}>
                <p className={`${t.text} font-medium leading-relaxed`}>{selectedNotice.content}</p>
              </div>

              <div className="flex gap-4">
                {selectedNotice.attachment_url && (
                  <button
                    onClick={() => window.open(selectedNotice.attachment_url, '_blank')}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    <FileDown size={18} /> View Attachment
                  </button>
                )}
                <button
                  onClick={() => setSelectedNotice(null)}
                  className={`flex-1 py-4 ${t.search} ${t.text} rounded-2xl font-black hover:opacity-80 transition-all border ${t.border}`}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {saveStatus && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[310] bg-slate-900 text-white px-8 py-4 rounded-3xl flex items-center gap-4 shadow-2xl"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
            <span className="font-bold">Preferences updated successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating AI Assistant Button */}
      <motion.button
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAssistant(!showAssistant)}
        className={`fixed bottom-32 lg:bottom-8 right-6 lg:right-8 w-14 h-14 lg:w-16 lg:h-16 rounded-[2rem] flex items-center justify-center z-[400] shadow-2xl transition-all ${showAssistant ? 'bg-red-500 text-white' : 'bg-[#22C55E] text-white'
          }`}
      >
        {showAssistant ? <X size={24} className="lg:w-7 lg:h-7" /> : <Bot size={24} className="lg:w-7 lg:h-7" />}
      </motion.button>

      {/* AI Assistant Chat Modal */}
      <AnimatePresence>
        {showAssistant && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 50, scale: 0.9, x: 20 }}
            className={`fixed bottom-0 lg:bottom-32 right-0 lg:right-8 w-full lg:w-[400px] h-[92vh] lg:h-[600px] ${t.card} rounded-t-[3rem] lg:rounded-[3rem] shadow-[-20px_20px_60px_rgba(0,0,0,0.1)] z-[400] overflow-hidden flex flex-col border ${t.border}`}
          >
            {/* Mobile Close Bar */}
            <div className="lg:hidden w-12 h-1.5 bg-primary/20 rounded-full mx-auto mt-4 mb-2" onClick={() => setShowAssistant(false)} />
            {/* Header */}
            <div className={`${t.card} p-8 ${t.heading} relative overflow-hidden border-b ${t.border}`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-12 translate-x-12" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                  <Bot className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className={`text-xl font-black ${t.heading}`}>Green-Sync AI</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className={`text-[10px] font-bold ${t.muted} uppercase tracking-widest leading-none`}>AI ONLINE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth scrollbar-hide">
              {assistantMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-3xl text-sm font-medium leading-relaxed ${msg.role === 'user'
                    ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/10'
                    : `${t.search} ${t.text} rounded-tl-none border ${t.border}`
                    }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isAssistantTyping && (
                <div className="flex justify-start">
                  <div className={`${t.search} p-4 rounded-3xl rounded-tl-none border ${t.border} flex gap-1`}>
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className={`w-1.5 h-1.5 ${t.muted} bg-current rounded-full`} />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className={`w-1.5 h-1.5 ${t.muted} bg-current rounded-full`} />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className={`w-1.5 h-1.5 ${t.muted} bg-current rounded-full`} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className={`p-6 pb-10 lg:pb-6 border-t ${t.border} ${t.search} backdrop-blur-xl`}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAssistantSend(assistantInput);
                }}
                className="relative"
              >
                <input
                  type="text"
                  placeholder="Ask anything..."
                  value={assistantInput}
                  onChange={(e) => setAssistantInput(e.target.value)}
                  className={`w-full pl-6 pr-14 py-4 ${t.card} border-none rounded-2xl focus:ring-2 focus:ring-primary/40 font-bold text-sm ${t.text} shadow-inner shadow-primary/5`}
                />
                <button
                  type="submit"
                  disabled={!assistantInput.trim() || isAssistantTyping}
                  className="absolute right-2 top-2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-30 shadow-lg shadow-primary/20"
                >
                  <ArrowUpRight size={20} />
                </button>
              </form>
              <p className={`text-[9px] text-center ${t.muted} mt-4 font-black uppercase tracking-widest`}>
                Powered by Green-Sync Knowledge Hub
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Mobile Bottom Navigation */}
      <div className={`lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] w-[95vw] sm:w-[90vw] max-w-md ${t.header} border ${t.border} rounded-[2.5rem] shadow-2xl p-2.5 flex items-center justify-between backdrop-blur-xl border-white/20`}>
        {[
          { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Home' },
          { id: 'courses', icon: <BookOpen size={18} />, label: 'Study' },
          { id: 'notes', icon: <FileText size={18} />, label: 'Notes' },
          { id: 'assignment-submission', icon: <Upload size={18} />, label: 'Submit' },
          { id: 'papers', icon: <GraduationCap size={18} />, label: 'Papers' },
          { id: 'eco-tracker', icon: <TreePine size={18} />, label: 'Eco' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as Tab)}
            className="flex-1 relative group py-2"
          >
            <div className={`mx-auto flex flex-col items-center justify-center transition-all duration-300 ${activeTab === item.id ? 'scale-110' : 'opacity-60 grayscale hover:opacity-100'}`}>
              <div className={`p-2 rounded-xl transition-all duration-500 ${activeTab === item.id ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-transparent'}`}>
                {item.icon}
              </div>
              <motion.span
                initial={false}
                animate={{
                  opacity: activeTab === item.id ? 1 : 0,
                  height: activeTab === item.id ? 'auto' : 0
                }}
                className={`text-[8px] font-black uppercase tracking-tighter mt-1 whitespace-nowrap ${activeTab === item.id ? 'text-primary' : 'text-slate-400'}`}
              >
                {item.label}
              </motion.span>
            </div>
          </button>
        ))}
      </div>
    </div >
  );
}

