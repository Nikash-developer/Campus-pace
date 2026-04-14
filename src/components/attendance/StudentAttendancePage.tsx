// Campus Pace - Ultimate Force Update - 2026-04-11
// Campus Pace - Global Synchronization & Stabilization Update - 2026-04-11
// Campus Pace - Stable Upload & Sync Update - 2026-04-11
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar, Clock, AlertTriangle, CheckCircle2, XCircle,
  ChevronRight, ArrowLeft, BarChart3, TrendingUp, TrendingDown,
  Sparkles, FileText, MapPin, Bell, Info, Share2, Printer,
  LayoutDashboard, BookOpen, GraduationCap, Leaf, Bot
} from 'lucide-react';
import { WhatIfSimulator } from './WhatIfSimulator';
import { PredictiveWarning } from './PredictiveWarning';

interface StudentAttendancePageProps {
  user: any;
  theme: any;
  attendanceSummary: any;
}

const mockAlerts = [
  { id: '1', type: 'critical', subject: 'Data Structures', pct: 58.3, message: 'You need 7 of next 16 lectures to reach 75% eligibility.' },
  { id: '2', type: 'warning', subject: 'Database Systems', pct: 71.0, message: 'Attend next 2 lectures to move into the safe zone.' }
];

const mockSchedule = [
  { id: '1', time: '9:00 AM', subject: 'Data Structures', room: 'Room 302', faculty: 'Dr. Sharma' },
  { id: '2', time: '11:00 AM', subject: 'Algorithms', room: 'Room 305', faculty: 'Dr. Gupta' },
  { id: '3', time: '2:00 PM', subject: 'Database Systems', room: 'Lab 102', faculty: 'Dr. Reddy' }
];

const mockRecentActivity = [
  { date: 'Apr 10', subject: 'Data Structures', status: 'absent', remarks: 'Marked by Dr. Sharma' },
  { date: 'Apr 10', subject: 'Algorithms', status: 'present', remarks: '' },
  { date: 'Apr 09', subject: 'Data Structures', status: 'absent', remarks: 'Marked by Dr. Sharma' },
  { date: 'Apr 09', subject: 'Computer Networks', status: 'present', remarks: '' },
  { date: 'Apr 08', subject: 'Data Structures', status: 'absent', remarks: 'Marked by Dr. Sharma' },
  { date: 'Apr 08', subject: 'Database Systems', status: 'present', remarks: '' }
];

export const StudentAttendancePage: React.FC<StudentAttendancePageProps> = ({ user, theme: t, attendanceSummary }) => {
  const [view, setView] = useState<'main' | 'recovery'>('main');
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  const subjects = attendanceSummary?.subjects || [
    { id: '1', name: 'Data Structures', percentage: 58.3, risk: 'critical', lectures_needed: 7, remaining: 16 },
    { id: '2', name: 'Algorithms', percentage: 82.0, risk: 'safe', lectures_needed: 0, can_miss: 3 },
    { id: '3', name: 'Database Systems', percentage: 71.0, risk: 'warning', lectures_needed: 2, remaining: 14 },
    { id: '4', name: 'Computer Networks', percentage: 88.5, risk: 'excellent', lectures_needed: 0, can_miss: 5 },
    { id: '5', name: 'Operating Systems', percentage: 76.2, risk: 'safe', lectures_needed: 0, can_miss: 2 }
  ];

  const overallPct = attendanceSummary?.overall_percentage || 78;

  const handleViewRecovery = (subject: any) => {
    setSelectedSubject(subject);
    setView('recovery');
  };

  if (view === 'recovery' && selectedSubject) {
    return (
      <motion.div
        key="recovery-view"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6 pb-32"
      >
        <div className="flex items-center justify-between">
          <button
            onClick={() => setView('main')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${t.border} ${t.muted} hover:bg-slate-50 transition-all text-sm font-bold`}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <div className="flex gap-2">
            <button className={`p-2 rounded-xl border ${t.border} ${t.muted} hover:bg-slate-50`}><Share2 size={16} /></button>
            <button className={`p-2 rounded-xl border ${t.border} ${t.muted} hover:bg-slate-50`}><Printer size={16} /></button>
          </div>
        </div>

        <div className={`${t.card} rounded-[2.5rem] border ${t.border} shadow-sm overflow-hidden p-8`}>
           <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-500 flex items-center justify-center">
                 <AlertTriangle size={24} />
              </div>
              <div>
                 <h2 className={`text-2xl font-black ${t.heading}`}>Recovery Plan: {selectedSubject.name}</h2>
                 <p className={`${t.muted} font-medium`}>Specialized strategy to regain academic eligibility.</p>
              </div>
           </div>

           <div className="space-y-8">
              <div className="p-6 bg-red-50 border border-red-100 rounded-3xl">
                 <h3 className="text-sm font-black text-red-900 uppercase tracking-widest mb-4">🚨 Current Situation - Attention Needed</h3>
                 <div className="space-y-4">
                    <div className="flex justify-between items-end">
                       <div>
                          <p className="text-3xl font-black text-red-600">{selectedSubject.percentage}%</p>
                          <p className="text-xs font-bold text-red-700">Current Attendance</p>
                       </div>
                       <div className="text-right">
                          <p className="text-xl font-black text-slate-800">75%</p>
                          <p className="text-xs font-bold text-slate-500">Required Threshold</p>
                       </div>
                    </div>
                    <div className="w-full h-4 bg-red-100 rounded-full overflow-hidden relative">
                       <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${selectedSubject.percentage}%` }}
                          transition={{ duration: 1 }}
                          className="h-full bg-red-500 rounded-full"
                       />
                       <div className="absolute top-0 bottom-0 w-1 bg-slate-800" style={{ left: '75%' }} />
                    </div>
                    <div className="flex justify-between text-[10px] font-black text-slate-400">
                       <span>0%</span>
                       <span style={{ marginLeft: '70%' }}>TARGET (75%)</span>
                       <span>100%</span>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className={`${t.search} p-6 rounded-3xl border ${t.border}`}>
                    <h4 className={`text-xs font-black ${t.muted} uppercase tracking-widest mb-4`}>The Math</h4>
                    <div className="space-y-3">
                       <div className="flex justify-between">
                          <span className={`text-sm font-bold ${t.muted}`}>Lectures Attended</span>
                          <span className={`text-sm font-black ${t.heading}`}>14</span>
                       </div>
                       <div className="flex justify-between">
                          <span className={`text-sm font-bold ${t.muted}`}>Target Percentage</span>
                          <span className={`text-sm font-black ${t.heading}`}>75%</span>
                       </div>
                       <div className="flex justify-between pt-3 border-t border-slate-200">
                          <span className="text-sm font-black text-primary">Required Lectures</span>
                          <span className="text-sm font-black text-primary">{selectedSubject.lectures_needed} of next {selectedSubject.remaining}</span>
                       </div>
                    </div>
                 </div>

                 <div className={`${t.card} p-6 rounded-3xl border ${t.border} shadow-sm border-emerald-100 bg-emerald-50/30`}>
                    <h4 className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-4">Projections</h4>
                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <TrendingUp className="text-emerald-500" size={20} />
                           <div>
                              <p className="text-sm font-black text-emerald-900">Attend All Remaining</p>
                              <p className="text-xs font-bold text-emerald-600">Reach up to 95.0% by semester end</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <TrendingDown className="text-red-500" size={20} />
                           <div>
                              <p className="text-sm font-black text-red-900">Current Rate</p>
                              <p className="text-xs font-bold text-red-600">Will end at 62.5% (Ineligible)</p>
                           </div>
                        </div>
                     </div>
                 </div>
              </div>
           </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="attendance-main"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-32"
    >
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className={`text-4xl font-black ${t.heading}`}>Hello, {user?.name?.split(' ')[0] || 'Student'}!</h1>
          <p className={`${t.muted} font-medium mt-1`}>
            {user?.dept || 'CSE'} - {user?.year || '3rd Year'} {user?.division || 'A'} | Roll No: {user?.roll_no || 'CS20103'}
          </p>
        </div>
        <div className={`flex items-center gap-3 px-5 py-3 ${t.card} rounded-2xl border ${t.border} shadow-sm`}>
          <Calendar size={18} className="text-primary" />
          <span className={`text-sm font-bold ${t.heading}`}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </div>
      </div>

      {/* Urgent Alerts */}
      {mockAlerts.length > 0 && (
        <div className="space-y-3">
          <h4 className={`text-[10px] font-black uppercase tracking-widest ${t.muted} px-2`}>Urgent Attention Required</h4>
          {mockAlerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 rounded-3xl border flex items-center justify-between gap-4 ${
                alert.type === 'critical' ? 'bg-red-50 border-red-100 text-red-900' : 'bg-orange-50 border-orange-100 text-orange-900'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  alert.type === 'critical' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'
                }`}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <p className="text-sm font-black">
                    {alert.type.toUpperCase()}: {alert.subject} attendance is {alert.pct}%
                  </p>
                  <p className="text-xs font-bold opacity-70">{alert.message}</p>
                </div>
              </div>
              <button
                onClick={() => handleViewRecovery(subjects.find(s => s.name === alert.subject))}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${
                  alert.type === 'critical' ? 'bg-red-900/10 text-red-900 hover:bg-red-900/20' : 'bg-orange-900/10 text-orange-900 hover:bg-orange-900/20'
                }`}
              >
                Action Plan &rarr;
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Stats & Breakdown */}
        <div className="lg:col-span-8 space-y-8">
           {/* Overall Card */}
           <div className={`grid grid-cols-1 md:grid-cols-2 gap-6`}>
              <div className={`${t.card} p-8 rounded-[2.5rem] border ${t.border} shadow-sm flex flex-col items-center justify-center relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                   <TrendingUp size={120} className="text-primary" />
                </div>
                <div className="relative w-32 h-32 mb-4">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle className="text-slate-100 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" />
                    <motion.circle
                      initial={{ strokeDasharray: "0 251.2" }}
                      animate={{ strokeDasharray: `${(overallPct / 100) * 251.2} 251.2` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="text-primary stroke-current" strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-2xl font-black ${t.heading}`}>{overallPct}%</span>
                    <span className={`text-[8px] font-black ${t.muted} uppercase`}>Overall</span>
                  </div>
                </div>
                <p className="text-xs font-black text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Above 75% Threshold
                </p>
              </div>

              <div className={`${t.card} p-8 rounded-[2.5rem] border ${t.border} shadow-sm`}>
                <div className="flex items-center justify-between mb-6">
                   <h3 className={`text-lg font-black ${t.heading}`}>Today's Schedule</h3>
                   <span className="text-[10px] font-black text-primary px-3 py-1 bg-primary/10 rounded-full italic">LIVE</span>
                </div>
                <div className="space-y-4">
                   {mockSchedule.map((item, idx) => (
                      <div key={idx} className="flex gap-4 group">
                         <div className="flex flex-col items-center pt-1">
                            <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-primary' : 'bg-slate-200'}`} />
                            {idx !== mockSchedule.length - 1 && <div className="w-0.5 h-full bg-slate-100 my-1" />}
                         </div>
                         <div className="flex-1 pb-4">
                            <div className="flex justify-between items-start">
                               <p className={`text-xs font-black ${t.heading}`}>{item.subject}</p>
                               <span className={`text-[10px] font-bold ${t.muted}`}>{item.time}</span>
                            </div>
                            <p className={`text-[10px] font-bold ${t.muted}`}>{item.faculty} · {item.room}</p>
                         </div>
                      </div>
                   ))}
                </div>
              </div>
           </div>

           {/* Subject Breakdown */}
           <div className={`${t.card} rounded-[2.5rem] border ${t.border} shadow-sm overflow-hidden`}>
              <div className="p-8 border-b border-slate-50">
                 <h3 className={`text-xl font-black ${t.heading}`}>Subject Analytics Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className={`bg-slate-50/50 text-[10px] font-black ${t.muted} uppercase tracking-[0.2em]`}>
                       <tr>
                          <th className="px-8 py-5">Subject</th>
                          <th className="px-8 py-5 text-center">Percentage</th>
                          <th className="px-8 py-5 text-center">Status</th>
                          <th className="px-8 py-5 text-right">Action</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {subjects.map((sub: any) => (
                          <tr key={sub.id} className="hover:bg-slate-50/30 transition-colors group">
                             <td className="px-8 py-6">
                                <p className={`text-sm font-black ${t.heading}`}>{sub.name}</p>
                                <p className={`text-[10px] font-bold ${t.muted} mt-1`}>
                                   {sub.lectures_needed > 0 ? `Need ${sub.lectures_needed} more` : `Can miss ${sub.can_miss || 0} classes`}
                                </p>
                             </td>
                             <td className="px-8 py-6">
                                <div className="flex flex-col items-center">
                                   <span className={`text-sm font-black ${sub.percentage < 75 ? 'text-red-500' : 'text-emerald-500'}`}>
                                      {sub.percentage.toFixed(1)}%
                                   </span>
                                   <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${sub.percentage}%` }}
                                        className={`h-full rounded-full ${sub.percentage < 65 ? 'bg-red-500' : sub.percentage < 75 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                                      />
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-6 text-center">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                   sub.risk === 'critical' ? 'bg-red-50 text-red-500' :
                                   sub.risk === 'warning' ? 'bg-orange-50 text-orange-500' : 
                                   sub.risk === 'excellent' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'
                                }`}>
                                   {sub.risk}
                                </span>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <button
                                   onClick={() => handleViewRecovery(sub)}
                                   className={`p-2 rounded-xl transition-all ${sub.risk === 'critical' || sub.risk === 'warning' ? 'bg-primary/5 text-primary hover:bg-primary/10' : 'bg-slate-50 text-slate-400 hover:text-primary'}`}
                                >
                                   <ChevronRight size={18} />
                                </button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        {/* Right Column: Insights & Activity */}
        <div className="lg:col-span-4 space-y-8">
           {/* Smart Insights */}
           <div className={`p-8 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 p-8 opacity-20">
                 <Bot size={80} />
              </div>
              <h3 className="text-lg font-black mb-4 flex items-center gap-2 italic">
                 <Sparkles size={20} className="text-indigo-200" /> Smart Insights
              </h3>
              <div className="space-y-4 relative z-10">
                 <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                    <p className="text-xs font-bold leading-relaxed">
                       If you maintain your current streak, your final CS201 attendance will be <span className="text-red-300 font-orange">62.5%</span>.
                    </p>
                 </div>
                 <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                    <p className="text-xs font-bold leading-relaxed">
                       You missed 3 consecutive lectures. Attendance drops fastest when you miss multiple classes in a row.
                    </p>
                 </div>
                 <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                    <p className="text-xs font-bold leading-relaxed">
                       Recovery is <span className="text-emerald-300">POSSIBLE</span>. You need a 44% attendance rate for the next 16 lectures.
                    </p>
                 </div>
              </div>
           </div>

           {/* Recent Activity */}
           <div className={`${t.card} rounded-[2.5rem] border ${t.border} shadow-sm overflow-hidden`}>
              <div className="p-6 border-b border-slate-50">
                 <h3 className={`text-base font-black ${t.heading}`}>Recent Activity</h3>
              </div>
              <div className="divide-y divide-slate-50">
                 {mockRecentActivity.map((item, idx) => (
                    <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                       <div className="flex justify-between items-start mb-1">
                          <p className={`text-xs font-black ${t.heading}`}>{item.subject}</p>
                          <span className={`text-[8px] font-black uppercase text-slate-400`}>{item.date}</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${item.status === 'present' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          <span className={`text-[10px] font-bold ${item.status === 'present' ? 'text-emerald-600' : 'text-red-500'} capitalize`}>
                             {item.status}
                          </span>
                       </div>
                       {item.remarks && <p className="text-[9px] font-medium text-slate-400 mt-1">{item.remarks}</p>}
                    </div>
                 ))}
                 <button className="w-full py-4 text-center text-xs font-black text-primary hover:bg-slate-50 transition-all">
                    View Full History &rarr;
                 </button>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
};
