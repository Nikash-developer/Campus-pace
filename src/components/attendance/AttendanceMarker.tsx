// Campus Pace - Ultimate Force Update - 2026-04-11
// Campus Pace - Global Synchronization & Stabilization Update - 2026-04-11
// Campus Pace - Stable Upload & Sync Update - 2026-04-11
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Search, Users, Calendar, Save, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AttendanceMarkerProps {
  mappingId: string;
  subjectName: string;
  students: Student[];
  facultyId: string;
  theme: any;
  onSuccess: () => void;
}

export const AttendanceMarker: React.FC<AttendanceMarkerProps> = ({
  mappingId,
  subjectName,
  students,
  facultyId,
  theme: t,
  onSuccess
}) => {
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent'>>(
    students.reduce((acc, s) => ({ ...acc, [s.id]: 'present' }), {})
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // 1 for right (present), -1 for left (absent)

  // Sort students by Roll Number (assumes format like CS101 or 101)
  const sortedStudents = [...students].sort((a: any, b: any) => {
    const rollA = String(a.rollNo || a.id).toLowerCase();
    const rollB = String(b.rollNo || b.id).toLowerCase();
    return rollA.localeCompare(rollB, undefined, { numeric: true, sensitivity: 'base' });
  });

  const currentStudent = sortedStudents[currentIndex];
  const isFinished = currentIndex >= sortedStudents.length;

  const handleMark = (status: 'present' | 'absent') => {
    if (!currentStudent) return;
    
    setDirection(status === 'present' ? 1 : -1);
    setAttendance(prev => ({
      ...prev,
      [currentStudent.id]: status
    }));
    
    // Smooth delay before next student pops up
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setDirection(0);
    }, 200);
  };

  const handleSave = async () => {
    if (!topic.trim()) {
      toast.error('Please enter the lecture topic');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Syncing session to database...');

    try {
      const formattedAttendance = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        status
      }));

      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mappingId,
          facultyId,
          lectureDate: date,
          topic,
          attendance: formattedAttendance
        })
      });

      if (res.ok) {
        toast.success('Attendance synced successfully!', { id: loadingToast });
        onSuccess();
      } else {
        throw new Error('Failed to save');
      }
    } catch (err) {
      toast.error('Failed to sync. Please try again.', { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`space-y-6 ${t.text}`}>
      {/* Session Metadata Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <label className="block">
            <span className={`text-xs font-black uppercase tracking-wider ${t.muted} mb-2 block`}>Lecture Topic</span>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Introduction to React Hooks"
              className={`w-full p-4 rounded-xl ${t.input} border ${t.border} outline-none focus:border-primary transition-all font-medium`}
            />
          </label>
        </div>
        <div className="space-y-4">
          <label className="block">
            <span className={`text-xs font-black uppercase tracking-wider ${t.muted} mb-2 block`}>Lecture Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full p-4 rounded-xl ${t.input} border ${t.border} outline-none focus:border-primary transition-all font-medium`}
            />
          </label>
        </div>
      </div>

      {/* Main Interaction Area */}
      <div className={`${t.card} rounded-[2.5rem] border ${t.border} overflow-hidden shadow-2xl relative min-h-[500px] flex flex-col`}>
        {/* Progress Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${t.accentBg} ${t.accent}`}>
              <Users size={20} />
            </div>
            <div>
              <h3 className={`text-sm font-black ${t.heading}`}>Progress</h3>
              <p className={`text-[10px] font-bold ${t.muted}`}>
                {Math.min(currentIndex, sortedStudents.length)} of {sortedStudents.length} marked
              </p>
            </div>
          </div>
          <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
             <motion.div 
               animate={{ width: `${(currentIndex / sortedStudents.length) * 100}%` }}
               className="h-full bg-primary" 
             />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {!isFinished ? (
              <motion.div
                key={currentStudent.id}
                custom={direction}
                initial={{ opacity: 0, scale: 0.8, x: direction * 100 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.8, 
                  x: direction !== 0 ? direction * 200 : 0,
                  transition: { duration: 0.2 } 
                }}
                className="w-full max-w-sm"
              >
                {/* Active Student Card */}
                <div className={`${t.card} rounded-[3rem] border-2 ${t.border} p-10 shadow-xl text-center space-y-6 relative group transition-all hover:border-primary/30`}>
                  <div className="relative mx-auto w-32 h-32">
                    <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-primary to-blue-400 blur-[6px] opacity-20 animate-pulse" />
                    <img 
                      src={currentStudent.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentStudent.name}`} 
                      className="w-32 h-32 rounded-full relative border-4 border-white shadow-lg bg-slate-100"
                      alt="" 
                    />
                  </div>
                  
                  <div>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                      Roll No: {currentStudent.rollNo || 'N/A'}
                    </span>
                    <h2 className={`text-2xl font-black ${t.heading} mt-3`}>{currentStudent.name}</h2>
                    <p className={`text-xs font-bold ${t.muted}`}>{currentStudent.email}</p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleMark('absent')}
                      className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-sm border-2 border-red-200/50 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} /> Absent
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleMark('present')}
                      className="flex-1 py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-sm border-2 border-emerald-200/50 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={18} /> Present
                    </motion.button>
                  </div>

                  {currentIndex > 0 && (
                    <button 
                      onClick={() => setCurrentIndex(prev => prev - 1)}
                      className="absolute -left-12 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-primary transition-all shadow-sm"
                    >
                      <ArrowLeft size={20} />
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className={`text-2xl font-black ${t.heading}`}>Marking Complete</h3>
                <p className={`${t.muted} font-medium`}>
                  You've reached the end of the roll call. <br />
                  Review the stats below and sync to save.
                </p>
                <div className="flex gap-4 justify-center">
                   <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center min-w-[100px]">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Present</p>
                      <p className="text-xl font-black text-emerald-600">{Object.values(attendance).filter(v => v === 'present').length}</p>
                   </div>
                   <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center min-w-[100px]">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Absent</p>
                      <p className="text-xl font-black text-red-500">{Object.values(attendance).filter(v => v === 'absent').length}</p>
                   </div>
                </div>
                <button 
                  onClick={() => setCurrentIndex(0)}
                  className="text-sm font-bold text-primary hover:underline"
                >
                  Restart Roll Call
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Save Area */}
        {isFinished && (
          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isSubmitting}
              onClick={handleSave}
              className="flex items-center gap-3 px-12 py-4 bg-primary text-white rounded-[2rem] font-black text-lg shadow-xl shadow-primary/20 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
              {isSubmitting ? 'Syncing...' : 'Complete & Save'}
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};
