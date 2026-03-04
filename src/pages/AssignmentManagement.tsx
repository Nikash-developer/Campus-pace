import React, { useState, useEffect, ReactNode } from 'react';
import { motion } from 'motion/react';
import { 
  Leaf, Search, Bell, LayoutDashboard, BookOpen, 
  TreePine, Settings, LogOut, FileText, CloudOff, 
  Zap, Plus, Download, ChevronRight, Users,
  CheckCircle2, Clock, AlertCircle, ArrowLeft,
  Edit3, MessageSquare, Scissors, Type, Maximize2,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useParams, useNavigate } from 'react-router-dom';

export default function AssignmentManagement() {
  const { user, logout } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeStudent, setActiveStudent] = useState("Alice Johnson");

  return (
    <div className="min-h-screen bg-bg-light flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col fixed h-full z-20">
        <div className="p-8 flex items-center gap-2 text-slate-900">
          <Leaf className="text-primary w-8 h-8" />
          <span className="text-xl font-bold">Green-Sync</span>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Menu</p>
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem icon={<BookOpen size={20} />} label="Assignments" active />
          <NavItem icon={<Users size={20} />} label="Courses" />
          <NavItem icon={<Bell size={20} />} label="Reports" />
          <NavItem icon={<Settings size={20} />} label="Settings" />
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-bg-light transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
              <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt="Avatar" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase">{user?.role}</p>
            </div>
            <button onClick={logout} className="text-slate-400 hover:text-red-500 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <header className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
              <span>Courses</span>
              <ChevronRight size={12} />
              <span>Env Science 101</span>
              <ChevronRight size={12} />
              <span className="text-primary">ASG 3: Urban Sustainability</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900">Assignment Management</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2">
              <Download size={18} /> Export Report
            </button>
            <button className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
              <Plus size={18} /> New Assignment
            </button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard icon={<Users className="text-slate-400" />} label="Total Submissions" value="45" subValue="/ 50 Students" />
          <StatCard icon={<Clock className="text-orange-400" />} label="Pending Grading" value="12" subValue="High Priority" badge="High Priority" />
          <StatCard icon={<Leaf className="text-primary" />} label="Paper Saved" value="225" subValue="sheets" />
          <StatCard icon={<Zap className="text-blue-400" />} label="Water Saved" value="2,250 L" subValue="Equivalent to 45 showers" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Submissions List */}
          <div className="lg:col-span-4">
            <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden h-full">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <h2 className="text-xl font-black">Submissions</h2>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-primary transition-colors"><Maximize2 size={18} /></button>
                  <button className="p-2 text-slate-400 hover:text-primary transition-colors"><MoreVertical size={18} /></button>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { name: "Alice Johnson", date: "Oct 24, 2:30 PM", status: "Pending", grade: "-" },
                  { name: "Bob Smith", date: "Oct 24, 4:15 PM", status: "Graded", grade: "92 / 100" },
                  { name: "Charlie Brown", date: "Oct 25, 9:00 AM", status: "Late", grade: "-" },
                  { name: "Diana Prince", date: "Oct 24, 1:00 PM", status: "Graded", grade: "88 / 100" },
                  { name: "Evan Wright", date: "Oct 24, 3:45 PM", status: "Pending", grade: "-" },
                  { name: "Fiona Gallagher", date: "Oct 24, 2:10 PM", status: "Graded", grade: "95 / 100" }
                ].map((row, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveStudent(row.name)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all text-left ${
                      activeStudent === row.name ? 'bg-primary/10 border border-primary/20' : 'hover:bg-bg-light border border-transparent'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.name}`} alt="Avatar" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${activeStudent === row.name ? 'text-primary' : 'text-slate-900'}`}>{row.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{row.date}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold block mb-1 ${
                        row.status === 'Graded' ? 'bg-green-50 text-green-600' : 
                        row.status === 'Late' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {row.status}
                      </span>
                      <p className="text-[10px] font-bold text-slate-900">{row.grade}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Inline PDF Viewer & Grading */}
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
              {/* Toolbar */}
              <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-primary transition-colors"><ArrowLeft size={20} /></button>
                  <span className="font-bold text-slate-900">{activeStudent}</span>
                  <button className="p-2 text-slate-400 hover:text-primary transition-colors"><ChevronRight size={20} /></button>
                </div>
                <div className="flex items-center gap-2 bg-bg-light p-1 rounded-xl">
                  <button className="p-2 text-slate-400 hover:text-primary transition-colors bg-white rounded-lg shadow-sm"><Edit3 size={18} /></button>
                  <button className="p-2 text-slate-400 hover:text-primary transition-colors"><MessageSquare size={18} /></button>
                  <button className="p-2 text-slate-400 hover:text-primary transition-colors"><Scissors size={18} /></button>
                  <button className="p-2 text-slate-400 hover:text-primary transition-colors"><Type size={18} /></button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                    <button className="p-1 hover:text-primary transition-colors">-</button>
                    <span>100%</span>
                    <button className="p-1 hover:text-primary transition-colors">+</button>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-primary transition-colors"><Download size={20} /></button>
                </div>
              </div>

              {/* Document Content */}
              <div className="flex-1 overflow-y-auto p-12 bg-slate-50 flex justify-center">
                <div className="w-full max-w-2xl bg-white shadow-2xl p-16 rounded-sm min-h-[800px] relative">
                  <h2 className="text-3xl font-black text-slate-900 mb-2 text-center">Urban Sustainability: A Comprehensive Review</h2>
                  <p className="text-sm text-slate-400 text-center mb-12 italic">{activeStudent} - Environmental Science 101 - Assignment 3</p>
                  
                  <div className="space-y-6 text-slate-700 leading-relaxed text-lg">
                    <p>Urban sustainability refers to the idea that a city can be organized without excessive reliance on the surrounding countryside and be able to power itself with renewable sources of energy. The aim is to create the smallest possible ecological footprint and to produce the lowest quantity of pollution possible.</p>
                    <p className="bg-yellow-100/50 relative">
                      Sustainable cities are becoming increasingly important as the world population continues to urbanize. Currently, more than half of the world's population lives in cities, and this number is expected to rise to 68% by 2050. This rapid urbanization presents significant challenges, including increased demand for resources, waste generation, and pollution.
                      <span className="absolute -right-4 top-0 translate-x-full bg-white p-4 rounded-xl shadow-xl border border-slate-100 w-48 text-xs">
                        <span className="font-bold text-primary block mb-1">Prof. Jenkins</span>
                        Great point! Consider adding a link to frame this within the global context of the problem.
                      </span>
                    </p>
                    <p>To achieve urban sustainability, cities must adopt a holistic approach that integrates environmental, social, and economic considerations. This includes promoting energy efficiency, reducing waste, improving public transportation, and creating green spaces.</p>
                  </div>
                </div>
              </div>

              {/* Grading Panel (Right Side in Design, but here we can put it below or floating) */}
              <div className="p-8 border-t border-slate-100 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h3 className="text-lg font-black">Grading</h3>
                    <div className="space-y-4">
                      <RubricItem label="Research Quality" score="28/30" val={93} />
                      <RubricItem label="Argument Clarity" score="25/30" val={83} />
                      <RubricItem label="Grammar & Format" score="18/20" val={90} />
                      <RubricItem label="Eco-Topic Relevance" score="20/20" val={100} />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-lg font-black">Overall Feedback</h3>
                    <textarea 
                      className="w-full p-6 bg-bg-light border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[120px] text-sm"
                      placeholder="Excellent work on integrating the sustainability concepts..."
                      defaultValue="Excellent work on integrating the sustainability concepts. Your analysis of urban density could be expanded slightly in the next assignment."
                    />
                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-slate-400">Total Score</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-slate-900">91</span>
                          <span className="text-sm font-bold text-slate-400">/ 100</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all">Save Draft</button>
                        <button className="px-6 py-3 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-primary/20">Submit Grade</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function RubricItem({ label, score, val }: { label: string, score: string, val: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <span>{label}</span>
        <span className="text-primary">{score}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${val}%` }}
          transition={{ duration: 1 }}
          className="h-full bg-primary rounded-full" 
        />
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-sm ${
      active ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-bg-light hover:text-slate-600'
    }`}>
      {icon}
      {label}
    </button>
  );
}

function StatCard({ icon, label, value, subValue, badge }: { icon: React.ReactNode, label: string, value: string, subValue: string, badge?: string }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-primary/20 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        {badge && <span className="text-[10px] font-bold bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">{badge}</span>}
      </div>
      <div>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-black text-slate-900">{value}</h3>
          <span className="text-[10px] font-medium text-slate-400">{subValue}</span>
        </div>
      </div>
    </div>
  );
}
