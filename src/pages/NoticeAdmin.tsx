import React, { useState, useEffect, ReactNode } from 'react';
import { motion } from 'motion/react';
import {
  Leaf, Search, Bell, LayoutDashboard, BookOpen,
  TreePine, Settings, LogOut, FileText, CloudOff,
  Zap, Plus, Download, ChevronRight, Users,
  CheckCircle2, Clock, AlertCircle, History, Send,
  Bold, Italic, Underline, List, Link as LinkIcon, Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { Notice } from '../types';

export default function NoticeAdmin() {
  const { user, logout } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetDept, setTargetDept] = useState('all');
  const [isEmergency, setIsEmergency] = useState(false);

  useEffect(() => {
    fetch('/api/notices').then(res => res.json()).then(setNotices);
  }, []);

  const handlePublish = async () => {
    if (!title || !content) return;

    const res = await fetch('/api/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        content,
        target_department: targetDept,
        is_emergency: isEmergency,
        author_id: user?.id
      })
    });

    if (res.ok) {
      setTitle('');
      setContent('');
      setIsEmergency(false);
      // Refresh list
      fetch('/api/notices').then(res => res.json()).then(setNotices);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col fixed h-full z-20">
        <div className="p-8 flex items-center gap-2 text-slate-900">
          <Leaf className="text-primary w-8 h-8" />
          <span className="text-xl font-bold">Green-Sync</span>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem icon={<Megaphone active size={20} />} label="Notices" active />
          <NavItem icon={<BookOpen size={20} />} label="Assignments" />
          <NavItem icon={<TreePine size={20} />} label="Eco-Tracking" />
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
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2">
              <History size={18} /> History
            </button>
            <button
              onClick={handlePublish}
              className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              <Send size={18} /> Publish Notice
            </button>
          </div>
        </header>

        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 mb-2">Smart Notice Administration</h1>
          <p className="text-slate-500">Create and manage campus-wide digital announcements to reduce paper usage.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Create Notice Form */}
          <div className="lg:col-span-8">
            <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <Plus size={20} />
                </div>
                <h2 className="text-xl font-black">Create New Notice</h2>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Notice Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Annual Science Fair Registration"
                    className="w-full px-6 py-4 bg-bg-light border border-slate-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Description</label>
                  <div className="border border-slate-50 rounded-[2rem] overflow-hidden bg-bg-light">
                    <div className="flex items-center gap-4 px-6 py-3 border-b border-slate-100 bg-white">
                      <button className="text-slate-400 hover:text-primary transition-colors"><Bold size={18} /></button>
                      <button className="text-slate-400 hover:text-primary transition-colors"><Italic size={18} /></button>
                      <button className="text-slate-400 hover:text-primary transition-colors"><Underline size={18} /></button>
                      <div className="w-px h-4 bg-slate-100 mx-2" />
                      <button className="text-slate-400 hover:text-primary transition-colors"><List size={18} /></button>
                      <button className="text-slate-400 hover:text-primary transition-colors"><LinkIcon size={18} /></button>
                      <div className="flex-1" />
                      <button className="text-slate-400 hover:text-primary transition-colors"><ImageIcon size={18} /></button>
                    </div>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write the details of the notice here..."
                      className="w-full px-8 py-6 bg-transparent border-none focus:ring-0 min-h-[200px] resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Schedule Publishing</label>
                    <input type="datetime-local" className="w-full px-6 py-4 bg-bg-light border border-slate-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Urgency Level</label>
                    <div className="flex items-center justify-between px-6 py-4 bg-bg-light border border-slate-50 rounded-2xl">
                      <span className="text-sm font-medium text-slate-500">Emergency Alert</span>
                      <button
                        onClick={() => setIsEmergency(!isEmergency)}
                        className={`w-12 h-6 rounded-full relative transition-colors ${isEmergency ? 'bg-primary' : 'bg-slate-200'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${isEmergency ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700">Target Departments</label>
                  <div className="flex flex-wrap gap-3">
                    {['All Students', 'Engineering', 'Arts & Design', 'Sciences', 'Business', 'Faculty Only'].map((dept) => (
                      <button
                        key={dept}
                        onClick={() => setTargetDept(dept)}
                        className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all border ${targetDept === dept
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-white border-slate-100 text-slate-400 hover:border-primary/20 hover:text-slate-600'
                          }`}
                      >
                        {targetDept === dept && <CheckCircle2 size={14} className="inline mr-2" />}
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar Stats */}
          <div className="lg:col-span-4 space-y-8">
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black">Notice Reach</h2>
                <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold">Last 30 Days</span>
              </div>
              <div className="space-y-6">
                <ReachStat icon={<Users />} label="Total Views" value="12,450" trend="+5%" />
                <ReachStat icon={<Zap />} label="Engagement Rate" value="85%" trend="+2%" />
                <ReachStat icon={<Leaf />} label="Paper Saved (Est.)" value="450" sub="sheets" />
              </div>
            </section>

            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black">Recent Notices</h2>
                <button className="text-xs font-bold text-primary hover:underline">View All</button>
              </div>
              <div className="space-y-4">
                {notices.slice(0, 3).map((notice) => (
                  <div key={notice.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-bg-light transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {notice.is_emergency ? <AlertCircle size={20} /> : <Megaphone size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{notice.title}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Posted {new Date(notice.publish_date).toLocaleDateString()}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold text-sm ${active ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-bg-light hover:text-slate-600'
      }`}>
      {icon}
      {label}
    </button>
  );
}

function ReachStat({ icon, label, value, trend, sub }: { icon: React.ReactNode, label: string, value: string, trend?: string, sub?: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-bg-light/50 border border-slate-50">
      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-black text-slate-900">{value}</span>
          {trend && <span className="text-[10px] font-bold text-green-600">↑ {trend}</span>}
          {sub && <span className="text-[10px] font-medium text-slate-400">{sub}</span>}
        </div>
      </div>
    </div>
  );
}

function Megaphone({ active, size }: { active?: boolean, size: number }) {
  return <div className={active ? 'text-primary' : 'text-slate-400'}><AlertCircle size={size} /></div>;
}
