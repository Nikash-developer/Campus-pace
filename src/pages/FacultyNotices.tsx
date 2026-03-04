import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    AlertTriangle, FileText, Bold, Italic, Underline, List,
    Link as LinkIcon, Image as ImageIcon, Calendar, Eye,
    MousePointerClick, TreePine, ChevronRight, History, Send, X, Filter, Clock
} from 'lucide-react';
import CountUp from 'react-countup';

type Priority = 'Normal' | 'Emergency';
type Status = 'Published' | 'Scheduled' | 'Draft';

interface Notice {
    id: string;
    title: string;
    content: string;
    date: string;
    time: string;
    author: string;
    priority: Priority;
    status: Status;
    departments: string[];
    thumbnail?: string;
}

export default function FacultyNotices() {
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
    const [historyFilter, setHistoryFilter] = useState<Status | 'All'>('All');

    // Form State
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [scheduleDate, setScheduleDate] = useState("");
    const [isEmergency, setIsEmergency] = useState(false);
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [selectedNoticeForDetail, setSelectedNoticeForDetail] = useState<Notice | null>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const handleFormat = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        // Refresh content state after formatting
        if (editorRef.current) {
            setContent(editorRef.current.innerHTML);

            // Add click listeners to images for simple resizing logic
            const imgs = editorRef.current.getElementsByTagName('img');
            for (let i = 0; i < imgs.length; i++) {
                const img = imgs[i];
                if (!img.getAttribute('data-listener')) {
                    img.setAttribute('data-listener', 'true');
                    img.style.cursor = 'nwse-resize';
                    img.style.maxWidth = '100%';
                    img.style.borderRadius = '1rem';
                    img.style.transition = 'all 0.3s ease';
                    img.onclick = (e) => {
                        e.stopPropagation();
                        const currentWidth = img.clientWidth;
                        const newWidth = prompt("Enter new width in pixels (or %):", currentWidth.toString());
                        if (newWidth) img.style.width = newWidth.includes('%') ? newWidth : `${newWidth}px`;

                        const currentRotation = img.style.transform || "rotate(0deg)";
                        const deg = prompt("Rotate image (enter degrees, e.g., 90, 180, -90):", "0");
                        if (deg) img.style.transform = `rotate(${deg}deg)`;
                    };
                }
            }
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageUrl = event.target?.result as string;
                handleFormat('insertImage', imageUrl);
                // After inserting, we might want to resize or style the image, 
                // but for now, simple insertion is a good step.
                handleShowToast("Image uploaded and inserted!");
            };
            reader.readAsDataURL(file);
        }
    };

    const [selectedDepts, setSelectedDepts] = useState<string[]>(['All Students']);
    const departmentsList = ['All Students', 'Engineering', 'Arts & Design', 'Sciences', 'Business', 'Faculty Only'];

    // Analytics State
    const [analytics, setAnalytics] = useState({
        views: 12450,
        engagement: 85,
        paper: 450
    });

    // Notices List State
    const [notices, setNotices] = useState<Notice[]>([
        {
            id: '1',
            title: 'Library Hours Extended for Finals',
            content: 'The central library will remain open 24/7 during the finals week...',
            date: 'Today',
            time: '2 hours ago',
            author: 'Admin',
            priority: 'Normal',
            status: 'Published',
            departments: ['All Students'],
            thumbnail: 'https://api.dicebear.com/7.x/avataaars/svg?seed=library'
        },
        {
            id: '2',
            title: 'New Recycling Bins in Science Wing',
            content: 'We have installed 15 new recycling stations across the science building...',
            date: 'Yesterday',
            time: '10:00 AM',
            author: 'Sustainability',
            priority: 'Normal',
            status: 'Published',
            departments: ['Sciences'],
            thumbnail: 'https://api.dicebear.com/7.x/avataaars/svg?seed=recycling'
        },
        {
            id: '3',
            title: 'Fire Drill Reminder - South Campus',
            content: 'A scheduled fire drill will take place on Wednesday at 10 AM...',
            date: '3 days ago',
            time: '9:00 AM',
            author: 'Security',
            priority: 'Emergency',
            status: 'Published',
            departments: ['All Students'],
            thumbnail: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fire'
        },
    ]);

    // Auto-save logic
    useEffect(() => {
        if (title || content) {
            const timer = setTimeout(() => {
                setIsAutoSaving(true);
                setTimeout(() => setIsAutoSaving(false), 2000);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [title, content]);

    const handleShowToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleDeptToggle = (dept: string) => {
        if (dept === 'All Students') {
            setSelectedDepts(['All Students']);
            return;
        }

        let newSelection = selectedDepts.filter(d => d !== 'All Students');
        if (newSelection.includes(dept)) {
            newSelection = newSelection.filter(d => d !== dept);
        } else {
            newSelection.push(dept);
        }

        if (newSelection.length === 0) newSelection = ['All Students'];
        setSelectedDepts(newSelection);
    };

    const handlePublish = () => {
        if (!title.trim()) {
            handleShowToast("Please enter a notice title!");
            return;
        }

        const isScheduled = !!scheduleDate;

        const newNotice: Notice = {
            id: Date.now().toString(),
            title,
            content,
            date: isScheduled ? new Date(scheduleDate).toLocaleDateString() : 'Just now',
            time: isScheduled ? new Date(scheduleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Right now',
            author: 'Dr. Sarah Jenkins',
            priority: isEmergency ? 'Emergency' : 'Normal',
            status: isScheduled ? 'Scheduled' : 'Published',
            departments: selectedDepts,
            thumbnail: `https://api.dicebear.com/7.x/avataaars/svg?seed=${title}`
        };

        setNotices([newNotice, ...notices]);

        // Reset Form
        setTitle("");
        setContent("");
        if (editorRef.current) editorRef.current.innerHTML = "";
        setScheduleDate("");
        setIsEmergency(false);
        setSelectedDepts(['All Students']);

        if (!isScheduled) {
            setAnalytics(prev => ({
                views: prev.views + Math.floor(Math.random() * 50) + 10,
                engagement: Math.min(100, prev.engagement + 1),
                paper: prev.paper + (selectedDepts.includes('All Students') ? 120 : 30)
            }));
        }

        handleShowToast(isScheduled ? "Notice Scheduled Successfully!" : "Notice Published Successfully!");
    };

    const filteredHistory = notices.filter(n => historyFilter === 'All' || n.status === historyFilter);

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAF9] relative overflow-x-hidden">
            <main className="flex-1 max-w-[1400px] w-full mx-auto p-8 flex flex-col gap-8 pb-12">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col gap-4"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="max-w-xl">
                            <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Smart Notice Administration</h1>
                            <p className="text-slate-500 font-medium tracking-tight">Create and manage campus-wide digital announcements to reduce paper usage.</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <button
                                onClick={() => setShowHistoryDrawer(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-white border border-[#E5E7EB] text-slate-700 text-sm font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 group">
                                <History size={18} className="text-slate-500" /> History
                            </button>
                            <button
                                onClick={handlePublish}
                                className="flex items-center gap-2 px-6 py-3 bg-[#22C55E] hover:bg-[#16a34a] text-white text-sm font-black rounded-2xl transition-all shadow-lg shadow-[#22C55E]/20 active:scale-95 group">
                                <Send size={18} /> Publish Notice
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* 2-Column Dashboard Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Create Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className={`lg:col-span-7 xl:col-span-8 bg-white rounded-[2.5rem] border ${isEmergency ? 'border-red-200 shadow-[0_0_25px_rgba(239,68,68,0.1)]' : 'border-[#E5E7EB] shadow-sm'} p-8 transition-all duration-500 relative`}
                    >
                        {isEmergency && (
                            <motion.div
                                animate={{ opacity: [0.1, 0.2, 0.1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute inset-0 rounded-[2.5rem] bg-red-500 pointer-events-none"
                            />
                        )}

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-2xl ${isEmergency ? 'bg-red-100 text-red-500' : 'bg-[#DCFCE7] text-[#22C55E]'}`}>
                                    {isEmergency ? <AlertTriangle size={22} className="animate-pulse" /> : <FileText size={22} />}
                                </div>
                                <h2 className="text-xl font-black text-slate-900">Create New Notice</h2>
                            </div>
                            <AnimatePresence>
                                {isAutoSaving && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                                        Auto-saving...
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="space-y-6 relative z-10">
                            {/* Title Input */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2.5 ml-1">Notice Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Annual Science Fair Registration"
                                    className={`w-full p-4.5 border rounded-2xl focus:outline-none focus:ring-4 font-bold text-slate-900 transition-all text-lg ${isEmergency ? 'border-red-200 focus:ring-red-100 focus:border-red-500 bg-red-50/20 placeholder:text-red-300' : 'border-slate-100 focus:ring-[#DCFCE7] focus:border-[#22C55E] bg-[#F8FAF9] placeholder:text-slate-300'}`}
                                />
                            </div>

                            {/* RTE Toolbar */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2.5 ml-1">Description</label>
                                <div className={`border rounded-[1.5rem] overflow-hidden transition-all bg-white ${isEmergency ? 'border-red-100 focus-within:border-red-400' : 'border-slate-100 focus-within:border-[#22C55E]'}`}>
                                    <div className="bg-white border-b border-slate-50 p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            {[
                                                { icon: Bold, cmd: 'bold', label: 'Bold' },
                                                { icon: Italic, cmd: 'italic', label: 'Italic' },
                                                { icon: Underline, cmd: 'underline', label: 'Underline' },
                                                { icon: List, cmd: 'insertUnorderedList', label: 'List' },
                                                { icon: FileText, cmd: 'strikethrough', label: 'Strikethrough' }
                                            ].map((tool, i) => (
                                                <motion.button
                                                    key={i}
                                                    whileHover={{ scale: 1.1, backgroundColor: '#F8FAF9' }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={(e) => { e.preventDefault(); handleFormat(tool.cmd); }}
                                                    className="p-2 text-slate-400 hover:text-slate-900 rounded-xl transition-all"
                                                    title={tool.label}
                                                >
                                                    <tool.icon size={18} />
                                                </motion.button>
                                            ))}
                                            <motion.button
                                                whileHover={{ scale: 1.1, backgroundColor: '#F8FAF9' }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={(e) => { e.preventDefault(); const url = prompt('Enter URL:'); if (url) handleFormat('createLink', url); }}
                                                className="p-2 text-slate-400 hover:text-slate-900 rounded-xl transition-all"
                                                title="Add Link"
                                            >
                                                <LinkIcon size={18} />
                                            </motion.button>
                                        </div>
                                        <div>
                                            <input
                                                type="file"
                                                ref={imageInputRef}
                                                onChange={handleImageUpload}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                            <motion.button
                                                whileHover={{ scale: 1.1, backgroundColor: '#DCFCE7' }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={(e) => { e.preventDefault(); imageInputRef.current?.click(); }}
                                                className="p-2 text-slate-400 hover:text-[#22C55E] rounded-xl transition-all"
                                                title="Add Image"
                                            >
                                                <ImageIcon size={18} />
                                            </motion.button>
                                        </div>
                                    </div>
                                    <div
                                        ref={editorRef}
                                        contentEditable
                                        onInput={(e) => setContent(e.currentTarget.innerHTML)}
                                        placeholder="Write the details of the notice here..."
                                        className="w-full p-6 focus:outline-none min-h-[180px] text-slate-700 leading-relaxed font-semibold text-base bg-transparent empty:before:content-[attr(placeholder)] empty:before:text-slate-300 styled-scrollbar overflow-y-auto"
                                    />
                                    <div className="p-3 border-t border-slate-50 text-[10px] font-black text-slate-300 flex justify-end tracking-widest">{content.replace(/<[^>]*>/g, '').length} CHARS</div>
                                </div>
                            </div>

                            {/* Scheduling & Urgency */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2.5 ml-1">Schedule Publishing</label>
                                    <motion.div
                                        whileHover={{ y: -2 }}
                                        className="relative group shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden"
                                    >
                                        <input
                                            type="datetime-local"
                                            value={scheduleDate}
                                            onChange={(e) => setScheduleDate(e.target.value)}
                                            className="w-full p-4.5 pl-12 border-2 border-slate-50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#DCFCE7]/50 focus:border-[#22C55E] font-black text-slate-700 bg-white placeholder:text-slate-300 appearance-none cursor-pointer"
                                        />
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-[#DCFCE7] text-[#22C55E] rounded-lg group-focus-within:bg-[#22C55E] group-focus-within:text-white transition-all">
                                            <Clock size={14} strokeWidth={3} />
                                        </div>
                                    </motion.div>
                                    {scheduleDate && (
                                        <motion.p
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="text-[11px] font-black text-[#22C55E] mt-3 ml-1 flex items-center gap-2 tracking-tight"
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                                            Live on: {new Date(scheduleDate).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </motion.p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2.5 ml-1">Urgency Level</label>
                                    <div
                                        onClick={() => setIsEmergency(!isEmergency)}
                                        className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${isEmergency ? 'border-red-400 bg-red-50/50 shadow-md shadow-red-100' : 'border-slate-100 bg-[#F8FAF9] hover:bg-white hover:border-slate-200'}`}
                                    >
                                        <span className={`font-black text-sm uppercase tracking-wider ${isEmergency ? 'text-red-600' : 'text-slate-600'}`}>Emergency Alert</span>
                                        <div className={`w-12 h-6.5 rounded-full relative transition-colors p-1 ${isEmergency ? 'bg-red-500' : 'bg-slate-300'}`}>
                                            <motion.div
                                                animate={{ x: isEmergency ? 22 : 0 }}
                                                className="w-4.5 h-4.5 bg-white rounded-full shadow-lg"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Target Departments */}
                            <div className="pt-6 border-t border-slate-100">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-4 ml-1">Target Departments</label>
                                <div className="flex flex-wrap gap-2.5">
                                    {departmentsList.map(dept => {
                                        const isSelected = selectedDepts.includes(dept);
                                        return (
                                            <button
                                                key={dept}
                                                onClick={() => handleDeptToggle(dept)}
                                                className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all border shrink-0 ${isSelected
                                                    ? 'bg-[#DCFCE7] text-[#16a34a] border-[#22C55E] shadow-lg shadow-[#22C55E]/10 scale-105'
                                                    : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {isSelected && <Send size={10} className="inline-block mr-1.5 -rotate-45" />}
                                                {dept}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>
                    </motion.div>

                    {/* Right Column: Analytics & Feed */}
                    <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-8">

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="bg-white rounded-[2.5rem] border border-[#E5E7EB] shadow-sm p-7"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-black text-slate-900">Notice Reach</h2>
                                <span className="text-[10px] font-black text-[#16a34a] bg-[#DCFCE7] px-3 py-1.5 rounded-xl uppercase tracking-widest border border-[#22C55E]/20">Last 30 Days</span>
                            </div>

                            <div className="space-y-4">
                                <MetricCard icon={<Eye size={20} />} label="Total Views" value={analytics.views} trend="+5%" color="blue" />
                                <MetricCard icon={<MousePointerClick size={20} />} label="Engagement Rate" value={analytics.engagement} trend="+2%" suffix="%" color="purple" />
                                <MetricCard icon={<TreePine size={20} />} label="Paper Saved (Est.)" value={analytics.paper} trend="Eco" suffix="sheets" color="green" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            className="bg-white rounded-[2.5rem] border border-[#E5E7EB] shadow-sm overflow-hidden flex flex-col max-h-[480px]"
                        >
                            <div className="p-7 border-b border-slate-50 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
                                <h2 className="text-xl font-black text-slate-900">Recent Notices</h2>
                                <button
                                    onClick={() => {
                                        setHistoryFilter('All');
                                        setShowHistoryDrawer(true);
                                    }}
                                    className="text-[10px] font-black text-[#22C55E] hover:text-[#16a34a] transition-all uppercase tracking-[0.2em] px-3 py-1.5 bg-[#DCFCE7]/30 rounded-lg hover:bg-[#DCFCE7]/50"
                                >
                                    View All
                                </button>
                            </div>

                            <div className="overflow-y-auto px-4 py-2 pb-6 styled-scrollbar space-y-1">
                                <AnimatePresence initial={false}>
                                    {notices.slice(0, 5).map((notice) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            key={notice.id}
                                            className={`flex items-center gap-4 p-4 rounded-3xl group cursor-pointer transition-all hover:translate-x-1 ${notice.priority === 'Emergency' ? 'hover:bg-red-50/50' : 'hover:bg-[#F8FAF9]'}`}
                                            onClick={() => setSelectedNoticeForDetail(notice)}
                                        >
                                            <div className="shrink-0 relative">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110 shadow-sm ${notice.priority === 'Emergency' ? 'bg-red-100 text-red-500' : 'bg-[#F8FAF9] border border-slate-100'}`}>
                                                    {notice.priority === 'Emergency' ? <AlertTriangle size={20} /> : <img src={notice.thumbnail} className="w-10 h-10 object-cover" />}
                                                </div>
                                                {notice.status === 'Scheduled' && (
                                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                                        <Clock size={10} className="text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className={`text-sm font-black truncate ${notice.priority === 'Emergency' ? 'text-red-700' : 'text-slate-900group-hover:text-[#22C55E]'} transition-colors`}>{notice.title}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                                                    {notice.date === 'Just now' ? <span className="text-[#22C55E]">Just now</span> : notice.time}
                                                </p>
                                            </div>
                                            <div className="shrink-0 text-slate-200 group-hover:text-slate-400 transition-all group-hover:translate-x-1">
                                                <ChevronRight size={18} />
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </main>

            {/* History Drawer Modal */}
            <AnimatePresence>
                {showHistoryDrawer && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowHistoryDrawer(false)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
                            className="fixed top-2 right-2 bottom-2 w-full max-w-lg bg-white rounded-[3rem] shadow-2xl z-[60] flex flex-col border border-slate-100 overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-[#DCFCE7] text-[#22C55E] rounded-2xl"><History size={24} /></div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Notice History</h2>
                                </div>
                                <button onClick={() => setShowHistoryDrawer(false)} className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-[#F8FAF9] rounded-2xl transition-all"><X size={24} /></button>
                            </div>

                            <div className="px-8 py-4 bg-[#F8FAF9]/50 border-b border-slate-50 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
                                {['All', 'Published', 'Scheduled', 'Draft'].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setHistoryFilter(f as any)}
                                        className={`px-5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${historyFilter === f ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 styled-scrollbar space-y-6 bg-[#F8FAF9]/30">
                                {filteredHistory.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                        <div className="p-6 bg-white rounded-[2rem] border border-slate-100 mb-4 shadow-sm"><Filter size={40} className="opacity-20" /></div>
                                        <p className="font-bold">No {historyFilter.toLowerCase()} notices found</p>
                                    </div>
                                ) : (
                                    filteredHistory.map(notice => (
                                        <motion.div layout key={notice.id} className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-white transition-all group relative overflow-hidden">
                                            {notice.priority === 'Emergency' && <div className="absolute top-0 left-0 w-1.5 h-full bg-red-400" />}
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-lg ${notice.status === 'Scheduled' ? 'bg-blue-100 text-blue-600' :
                                                        notice.priority === 'Emergency' ? 'bg-red-100 text-red-600' :
                                                            'bg-[#DCFCE7] text-[#16a34a]'
                                                        }`}>
                                                        {notice.status === 'Scheduled' ? 'Scheduled' : notice.priority === 'Emergency' ? 'Emergency' : 'Published'}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{notice.date}</span>
                                            </div>
                                            <h3 className="font-black text-slate-900 mb-2 text-lg group-hover:text-[#22C55E] transition-colors">{notice.title}</h3>
                                            <p className="text-sm text-slate-500 font-semibold line-clamp-2 mb-5 leading-relaxed">{notice.content}</p>
                                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                                <div className="flex -space-x-2">
                                                    {notice.departments.slice(0, 3).map((d, i) => (
                                                        <div key={i} className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-400" title={d}>{d[0]}</div>
                                                    ))}
                                                </div>
                                                <button
                                                    onClick={() => setSelectedNoticeForDetail(notice)}
                                                    className="flex items-center gap-1.5 text-xs font-black text-[#22C55E] group/btn hover:scale-105 transition-all"
                                                >
                                                    View Details <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Notice Detail Modal */}
            <AnimatePresence>
                {selectedNoticeForDetail && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedNoticeForDetail(null)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl z-[80] overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl ${selectedNoticeForDetail.priority === 'Emergency' ? 'bg-red-100 text-red-500' : 'bg-[#DCFCE7] text-[#22C55E]'}`}>
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{selectedNoticeForDetail.title}</h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedNoticeForDetail.author}</span>
                                            <span className="text-slate-300">•</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedNoticeForDetail.date} at {selectedNoticeForDetail.time}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedNoticeForDetail(null)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all"><X size={24} /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 styled-scrollbar space-y-8">
                                {selectedNoticeForDetail.thumbnail && (
                                    <div className="w-full h-64 rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm relative group">
                                        <img src={selectedNoticeForDetail.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Notice Thumbnail" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                    </div>
                                )}

                                <div className="prose prose-slate max-w-none">
                                    <div
                                        className="text-slate-700 leading-relaxed font-semibold text-lg"
                                        dangerouslySetInnerHTML={{ __html: selectedNoticeForDetail.content }}
                                    />
                                </div>

                                <div className="pt-8 border-t border-slate-50">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-4">Acknowledge By</label>
                                    <div className="flex flex-wrap gap-2.5">
                                        {selectedNoticeForDetail.departments.map(dept => (
                                            <span key={dept} className="px-4 py-2 bg-slate-50 text-slate-500 border border-slate-100 rounded-xl text-xs font-black">
                                                {dept}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                                <button
                                    onClick={() => setSelectedNoticeForDetail(null)}
                                    className="px-8 py-4 bg-white border border-slate-200 text-slate-700 font-black rounded-2xl hover:bg-slate-100 transition-all active:scale-95 shadow-sm"
                                >
                                    Close Preview
                                </button>
                                <button
                                    onClick={() => {
                                        handleShowToast("Notice forwarded to relevant portal!");
                                        setSelectedNoticeForDetail(null);
                                    }}
                                    className="px-8 py-4 bg-[#22C55E] text-white font-black rounded-2xl hover:bg-[#16a34a] shadow-lg shadow-[#22C55E]/20 transition-all active:scale-95"
                                >
                                    Share Notice
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Toast Notification */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 30, x: '-50%' }}
                        className="fixed bottom-10 left-1/2 z-[100] bg-white text-slate-900 border border-[#E5E7EB] shadow-2xl px-7 py-5 rounded-[2rem] flex items-center gap-4 font-black text-sm"
                    >
                        <div className="w-8 h-8 bg-[#DCFCE7] text-[#22C55E] flex items-center justify-center rounded-2xl shrink-0 shadow-lg shadow-[#22C55E]/10">
                            <CheckIcon className="w-5 h-5" strokeWidth={3} />
                        </div>
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Internal Helper Components
function MetricCard({ icon, label, value, trend, suffix = "", color }: any) {
    const colorClasses: any = {
        blue: 'bg-blue-50 text-blue-500 border-blue-100',
        purple: 'bg-purple-50 text-purple-500 border-purple-100',
        green: 'bg-[#F0FDF4] text-[#22C55E] border-[#DCFCE7]'
    };

    return (
        <motion.div whileHover={{ y: -5 }} className="p-6 rounded-[2rem] border border-slate-50 bg-[#F8FAF9]/50 flex items-center justify-between group transition-all hover:bg-white hover:shadow-2xl hover:border-white cursor-default">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all ${colorClasses[color]}`}>{icon}</div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 mb-0.5 uppercase tracking-[0.15em]">{label}</p>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-slate-900 tracking-tight">
                            <CountUp end={value} duration={2} separator="," />{suffix}
                        </span>
                    </div>
                </div>
            </div>
            <div className={`px-2.5 py-1 ${color === 'green' ? 'bg-[#DCFCE7] text-[#16a34a]' : 'bg-slate-100 text-slate-400'} text-[10px] font-black rounded-lg uppercase tracking-wide`}>
                {trend}
            </div>
        </motion.div>
    );
}

function CheckIcon(props: any) {
    return (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
    );
}
