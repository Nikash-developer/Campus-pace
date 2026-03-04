import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Leaf, Clock, Upload, FileText, CheckCircle2,
    AlertCircle, Shield, TreePine, ChevronRight,
    User, MessageSquare, X, Loader2, RefreshCcw,
    Trash2, Eye, ExternalLink
} from 'lucide-react';

interface Feedback {
    id: number;
    assignmentName: string;
    timeAgo: string;
    quote: string;
    instructor: {
        name: string;
        avatar: string;
    };
}

const mockFeedback: Feedback[] = [
    {
        id: 1,
        assignmentName: "Week 3 Essay",
        timeAgo: "2 days ago",
        quote: "Great analysis of the carbon cycle. Consider expanding on the oceanic impact next time.",
        instructor: {
            name: "Dr. Sarah Jenkins",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
        }
    },
    {
        id: 2,
        assignmentName: "Lab Report 2",
        timeAgo: "1 week ago",
        quote: "Solid data collection. Your graphs need better labeling.",
        instructor: {
            name: "Dr. Sarah Jenkins",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
        }
    }
];

interface UpcomingAssignment {
    id: number;
    title: string;
    course: string;
    courseCode: string;
    deadline: Date;
    color: string;
    description: string;
    status: 'pending' | 'submitted';
    uploadedFile: File | null;
}

const mockUpcomingData: UpcomingAssignment[] = [
    {
        id: 1,
        title: "Biodiversity Research Paper",
        course: "Ecosystems & Conservation",
        courseCode: "BIO-101",
        deadline: new Date(Date.now() + 2 * 24 * 3600000 + 4 * 3600000 + 15 * 60000),
        color: "#22C55E",
        description: "Upload your research paper on local biodiversity and its conservation strategies.",
        status: 'pending',
        uploadedFile: null
    },
    {
        id: 2,
        title: "Database Normalization Lab",
        course: "Database Systems",
        courseCode: "CS-202",
        deadline: new Date(Date.now() + 5 * 24 * 3600000),
        color: "#3B82F6",
        description: "Submit your normalized schema (up to 3NF) for the provided case study.",
        status: 'pending',
        uploadedFile: null
    },
    {
        id: 3,
        title: "Modern History Essay",
        course: "World History",
        courseCode: "HIS-105",
        deadline: new Date(Date.now() + 22 * 3600000), // Less than 24h
        color: "#F59E0B",
        description: "Analyzation of the post-war industrial boom and its long-term effects.",
        status: 'pending',
        uploadedFile: null
    }
];

export const AssignmentSubmissionView: React.FC<{ theme: any }> = ({ theme: t }) => {
    const [assignments, setAssignments] = useState<UpcomingAssignment[]>(mockUpcomingData);
    const [selectedId, setSelectedId] = useState<number>(() => {
        const pending = mockUpcomingData
            .filter(a => a.status === 'pending')
            .sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
        return pending.length > 0 ? pending[0].id : mockUpcomingData[0].id;
    });
    const selectedAssignment = assignments.find(a => a.id === selectedId) || assignments[0];

    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [plagiarismStatus, setPlagiarismStatus] = useState<'ready' | 'scanning' | 'completed'>('ready');
    const [plagiarismPercent, setPlagiarismPercent] = useState(0);
    const [co2Saved, setCo2Saved] = useState(0);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hrs: 0, min: 0, sec: 0 });
    const [isDragOver, setIsDragOver] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState<Feedback | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const uploadSectionRef = React.useRef<HTMLElement>(null);

    useEffect(() => {
        if (selectedAssignment.status === 'submitted') {
            setUploadStatus('success');
            setPlagiarismStatus('completed');
            setPlagiarismPercent(Math.floor(Math.random() * 8) + 2);
            setCo2Saved(Math.max(1, Math.ceil((selectedAssignment.uploadedFile?.size || 102400) / 51200)) * 0.5);
        } else if (selectedAssignment.uploadedFile) {
            setUploadStatus('success');
            setPlagiarismStatus('completed');
            setPlagiarismPercent(Math.floor(Math.random() * 8) + 2);
            setCo2Saved(Math.max(1, Math.ceil((selectedAssignment.uploadedFile?.size || 102400) / 51200)) * 0.5);
        } else {
            setUploadStatus('idle');
            setPlagiarismStatus('ready');
            setPlagiarismPercent(0);
            setCo2Saved(0);
        }
    }, [selectedAssignment.id]);

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date().getTime();
            const diff = selectedAssignment.deadline.getTime() - now;

            if (diff <= 0) {
                setTimeLeft({ days: 0, hrs: 0, min: 0, sec: 0 });
                return;
            }

            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hrs: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                min: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                sec: Math.floor((diff % (1000 * 60)) / 1000)
            });
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);
        return () => clearInterval(timer);
    }, [selectedAssignment]);

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        validateAndSetFile(droppedFile);
    };

    const validateAndSetFile = (selectedFile: File) => {
        if (!selectedFile) return;
        const allowedFormats = ['.pdf', '.docx'];
        const extension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
        if (!allowedFormats.includes(extension)) {
            alert("Only PDF and DOCX files are supported.");
            return;
        }
        if (selectedFile.size > 25 * 1024 * 1024) {
            alert("File size exceeds 25MB limit.");
            return;
        }
        simulateUpload(selectedFile);
    };

    const simulateUpload = (selectedFile: File) => {
        setUploadStatus('uploading');
        setUploadProgress(0);
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setUploadStatus('success');

                    // Update global assignment state
                    setAssignments(prevArr => prevArr.map(a =>
                        a.id === selectedAssignment.id
                            ? { ...a, status: 'submitted', uploadedFile: selectedFile }
                            : a
                    ));

                    triggerPlagiarismScan();
                    calculateEcoImpact(selectedFile);
                    return 100;
                }
                return prev + 10;
            });
        }, 100);
    };

    const triggerPlagiarismScan = () => {
        setPlagiarismStatus('scanning');
        setPlagiarismPercent(0);
        setTimeout(() => {
            const interval = setInterval(() => {
                setPlagiarismPercent(prev => {
                    const target = Math.floor(Math.random() * 15) + 2; // Random safe %
                    if (prev >= target) {
                        clearInterval(interval);
                        setPlagiarismStatus('completed');
                        return target;
                    }
                    return prev + 1;
                });
            }, 100);
        }, 1000);
    };

    const calculateEcoImpact = (selectedFile: File) => {
        const estimatedPages = Math.max(1, Math.ceil(selectedFile.size / 51200));
        const co2PerSheet = 0.5;
        const totalSaved = estimatedPages * co2PerSheet;
        let current = 0;
        const interval = setInterval(() => {
            current += 0.5;
            if (current >= totalSaved) {
                setCo2Saved(totalSaved);
                clearInterval(interval);
            } else {
                setCo2Saved(current);
            }
        }, 50);
    };

    const formatNumber = (n: number) => n.toString().padStart(2, '0');

    const handleAssignmentSwitch = (assignment: UpcomingAssignment) => {
        setSelectedId(assignment.id);
        // Smooth scroll to upload area on mobile for better UX
        if (window.innerWidth < 1024) {
            setTimeout(() => {
                uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    };

    const handleDeleteFile = () => {
        setAssignments(prev => prev.map(a =>
            a.id === selectedAssignment.id
                ? { ...a, status: 'pending', uploadedFile: null }
                : a
        ));
        setUploadStatus('idle');
        setPlagiarismStatus('ready');
        setPlagiarismPercent(0);
        setCo2Saved(0);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Left Sidebar - Upcoming & Feedback */}
            <aside className="w-full lg:w-80 space-y-8 flex-shrink-0">
                <section className="space-y-4">
                    <h3 className={`text-[10px] font-black ${t.muted} uppercase tracking-widest ml-1`}>Upcoming Tasks</h3>
                    <div className="space-y-3">
                        {assignments
                            .sort((a, b) => {
                                const subA = a.status === 'submitted' ? 1 : 0;
                                const subB = b.status === 'submitted' ? 1 : 0;
                                if (subA !== subB) return subA - subB;
                                return a.deadline.getTime() - b.deadline.getTime();
                            })
                            .map((item) => {
                                const isSelected = selectedAssignment.id === item.id;
                                const isDone = item.status === 'submitted';
                                return (
                                    <motion.button
                                        key={item.id}
                                        layout
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleAssignmentSwitch(item)}
                                        className={`w-full text-left p-5 rounded-3xl border transition-all ${isSelected
                                            ? `bg-primary/5 border-primary shadow-xl shadow-primary/5 ring-1 ring-primary/20`
                                            : isDone ? `${t.search} ${t.border} opacity-50` : `${t.card} ${t.border} hover:border-primary/20`
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div
                                                className={`w-2 h-2 rounded-full ${isDone ? 'bg-green-500' : ''}`}
                                                style={isDone ? {} : { backgroundColor: item.color }}
                                            />
                                            <span className={`text-[10px] font-black ${t.muted} uppercase tracking-widest`}>
                                                {item.courseCode} • {isDone ? 'Finished' : 'Upcoming'}
                                            </span>
                                        </div>
                                        <h4 className={`text-sm font-black leading-tight ${isSelected ? 'text-primary' : isDone ? `${t.muted}` : t.heading
                                            }`}>
                                            {item.title}
                                        </h4>
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className={`flex items-center gap-1.5 text-[10px] font-bold ${t.muted}`}>
                                                <Clock size={12} className="text-primary/60" />
                                                <span>{new Date(item.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' })}</span>
                                            </div>
                                            <ChevronRight size={14} className={isSelected ? 'text-primary' : t.muted} />
                                        </div>
                                    </motion.button>
                                );
                            })}
                    </div>
                </section>

                <div className="hidden lg:block">
                    <section className="space-y-4">
                        <h3 className={`text-[10px] font-black ${t.muted} uppercase tracking-widest ml-1`}>Recent Feedback</h3>
                        <div className="space-y-3">
                            {mockFeedback.map((fb) => (
                                <motion.div
                                    key={fb.id}
                                    whileHover={{ y: -6, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowFeedbackModal(fb)}
                                    className={`${t.card} p-6 rounded-3xl shadow-sm border ${t.border} cursor-pointer transition-all hover:shadow-2xl hover:border-primary/30 group relative overflow-hidden`}
                                >
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-2xl -translate-y-6 translate-x-6" />
                                    <div className="flex justify-between items-start mb-3 relative z-10">
                                        <span className="text-[9px] font-black text-primary px-3 py-1 bg-primary/10 rounded-full uppercase tracking-wider">{fb.assignmentName}</span>
                                        <span className={`text-[10px] font-bold ${t.muted}`}>{fb.timeAgo}</span>
                                    </div>
                                    <p className={`text-xs ${t.text} font-medium line-clamp-3 italic mb-5 leading-relaxed relative z-10`}>
                                        "{fb.quote}"
                                    </p>
                                    <div className="flex items-center gap-3 relative z-10">
                                        <img src={fb.instructor.avatar} alt={fb.instructor.name} className={`w-7 h-7 rounded-xl border-2 ${t.border} shadow-sm`} />
                                        <span className={`text-[10px] font-black ${t.muted}`}>{fb.instructor.name}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                </div>
            </aside>

            {/* Main Submission Area */}
            <div className="flex-1 space-y-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedAssignment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-8"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                            <div className="space-y-3 flex-1 w-full">
                                <span
                                    className="px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-full inline-block"
                                    style={{ backgroundColor: `${selectedAssignment.color}15`, color: selectedAssignment.color }}
                                >
                                    {selectedAssignment.courseCode} • {selectedAssignment.course}
                                </span>
                                <h1 className={`text-3xl lg:text-5xl font-black ${t.heading} leading-tight`}>
                                    {selectedAssignment.title}
                                </h1>
                                <p className={`${t.muted} font-medium text-sm lg:text-base max-w-2xl leading-relaxed`}>{selectedAssignment.description}</p>
                            </div>

                            <div className={`${t.card} p-5 lg:p-6 rounded-[2.5rem] shadow-xl border ${t.border} flex items-center justify-center gap-6 px-10 w-full md:w-auto`}>
                                <div className="text-center">
                                    <p className={`text-2xl lg:text-3xl font-black ${t.heading} tabular-nums mb-0.5`}>{formatNumber(timeLeft.days)}</p>
                                    <p className={`text-[8px] font-black ${t.muted} uppercase tracking-[0.2em] text-opacity-60`}>Days</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className={`${t.muted} opacity-30 font-black text-xl mb-4 leading-none`}>:</span>
                                </div>
                                <div className="text-center">
                                    <p className={`text-2xl lg:text-3xl font-black ${t.heading} tabular-nums mb-0.5`}>{formatNumber(timeLeft.hrs)}</p>
                                    <p className={`text-[8px] font-black ${t.muted} uppercase tracking-[0.2em] text-opacity-60`}>Hrs</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className={`${t.muted} opacity-30 font-black text-xl mb-4 leading-none`}>:</span>
                                </div>
                                <div className="text-center">
                                    <p className={`text-2xl lg:text-3xl font-black tabular-nums mb-0.5 ${timeLeft.days === 0 && timeLeft.hrs < 24 ? 'text-red-500' : t.heading}`}>
                                        {formatNumber(timeLeft.min)}
                                    </p>
                                    <p className={`text-[8px] font-black ${t.muted} uppercase tracking-[0.2em] text-opacity-60`}>Min</p>
                                </div>
                            </div>
                        </div>

                        <section
                            ref={uploadSectionRef}
                            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                            onDragLeave={() => setIsDragOver(false)}
                            onDrop={handleFileDrop}
                            className={`relative h-[20rem] lg:h-96 rounded-[2.5rem] lg:rounded-[4rem] border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 lg:p-12 text-center ${t.card} shadow-sm overflow-hidden ${isDragOver ? 'border-primary bg-primary/5 scale-[0.99] ring-8 ring-primary/5' : `${t.border} hover:border-primary/40 hover:bg-primary/[0.01]`
                                }`}
                        >
                            {uploadStatus === 'idle' ? (
                                <div className="space-y-6">
                                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto group-hover:scale-110 transition-transform">
                                        <Leaf size={40} className="animate-pulse" />
                                    </div>
                                    <div>
                                        <h3 className={`text-2xl font-black ${t.heading} mb-2`}>Upload your assignment</h3>
                                        <p className={`${t.muted} text-sm font-medium max-w-xs mx-auto`}>
                                            Drag & drop your PDF or DOCX file here to save a tree.<br />
                                            <span className={`text-[10px] font-bold ${t.muted} opacity-60 uppercase mt-2 block`}>Maximum file size: 25MB</span>
                                        </p>
                                    </div>
                                    <label className="cursor-pointer bg-primary text-white px-8 py-4 rounded-2xl font-black hover:scale-105 transition-all shadow-xl shadow-primary/20 inline-block pointer-events-auto">
                                        Browse Files
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept=".pdf,.docx"
                                            onChange={(e) => e.target.files && validateAndSetFile(e.target.files[0])}
                                        />
                                    </label>
                                </div>
                            ) : (
                                <div className="w-full max-w-sm space-y-8">
                                    <AnimatePresence mode="wait">
                                        {uploadStatus === 'uploading' && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                className="space-y-6"
                                            >
                                                <div className={`flex items-center gap-4 ${t.search} p-4 rounded-3xl border ${t.border}`}>
                                                    <div className={`p-3 ${t.card} rounded-2xl shadow-sm text-primary`}>
                                                        <FileText size={24} />
                                                    </div>
                                                    <div className="text-left flex-1 min-w-0">
                                                        <p className={`font-bold ${t.heading} truncate`}>{selectedAssignment.uploadedFile?.name}</p>
                                                        <p className={`text-[10px] font-bold ${t.muted} uppercase`}>{((selectedAssignment.uploadedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB</p>
                                                    </div>
                                                    <button onClick={handleDeleteFile} className={`p-2 hover:${t.card} rounded-full ${t.muted} hover:text-red-500 transition-colors pointer-events-auto`}>
                                                        <X size={18} />
                                                    </button>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-end">
                                                        <p className={`text-xs font-black ${t.heading} flex items-center gap-2`}>
                                                            <Loader2 size={14} className="animate-spin text-primary" />
                                                            Uploading...
                                                        </p>
                                                        <p className="text-xs font-black text-primary">{uploadProgress}%</p>
                                                    </div>
                                                    <div className={`h-3 ${t.search} rounded-full overflow-hidden`}>
                                                        <motion.div
                                                            className="h-full bg-primary"
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${uploadProgress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {uploadStatus === 'success' && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="space-y-6 text-center"
                                            >
                                                <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-white mx-auto shadow-2xl shadow-primary/40">
                                                    <CheckCircle2 size={40} />
                                                </div>
                                                <div>
                                                    <h3 className={`text-2xl font-black ${t.heading} mb-1`}>Upload Successful!</h3>
                                                    <p className={`${t.muted} text-sm font-bold`}>{selectedAssignment.uploadedFile?.name}</p>
                                                </div>
                                                <div className="flex flex-col gap-3 items-center">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                if (selectedAssignment.uploadedFile) {
                                                                    const url = URL.createObjectURL(selectedAssignment.uploadedFile);
                                                                    window.open(url, '_blank');
                                                                }
                                                            }}
                                                            className={`flex items-center gap-2 px-6 py-3 ${t.card} border ${t.border} rounded-xl text-xs font-black ${t.text} hover:opacity-80 transition-all shadow-sm pointer-events-auto`}
                                                        >
                                                            <Eye size={14} /> View Document
                                                        </button>
                                                        <button
                                                            onClick={() => fileInputRef.current?.click()}
                                                            className={`flex items-center gap-2 px-6 py-3 ${t.card} border ${t.border} rounded-xl text-xs font-black text-blue-500 hover:bg-blue-50/10 transition-all shadow-sm pointer-events-auto`}
                                                        >
                                                            <RefreshCcw size={14} /> Change PDF
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={handleDeleteFile}
                                                        className="flex items-center gap-2 text-xs font-black text-red-400 hover:text-red-500 transition-colors uppercase tracking-widest mt-2 pointer-events-auto"
                                                    >
                                                        <Trash2 size={12} /> Remove Submission
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </section>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                            <motion.div
                                initial={false}
                                animate={{ borderColor: plagiarismStatus === 'completed' ? (plagiarismPercent > 15 ? '#FCA5A5' : '#10B981') : (t.border.includes('slate-100') ? '#F1F5F9' : '#334155') }}
                                className={`${t.card} p-7 lg:p-8 rounded-[2.5rem] lg:rounded-[3rem] shadow-sm border-2 transition-colors space-y-7`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-2xl shadow-sm ${plagiarismStatus === 'completed' ? (plagiarismPercent > 15 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500') : `${t.search} ${t.muted}`}`}>
                                            <Shield size={24} />
                                        </div>
                                        <div>
                                            <h4 className={`text-lg font-black ${t.heading}`}>Plagiarism Check</h4>
                                            <p className={`text-[10px] font-black ${t.muted} uppercase tracking-[0.2em]`}>
                                                {plagiarismStatus === 'ready' && 'Ready to scan'}
                                                {plagiarismStatus === 'scanning' && 'Analyzing content...'}
                                                {plagiarismStatus === 'completed' && 'Analysis complete'}
                                            </p>
                                        </div>
                                    </div>
                                    {plagiarismStatus === 'completed' && (
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${plagiarismPercent > 15 ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'}`}>
                                            {plagiarismPercent > 15 ? 'Major Similarity' : 'Verified Unique'}
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-5">
                                    <div className={`h-3 ${t.search} rounded-full overflow-hidden p-0.5`}>
                                        <motion.div
                                            className={`h-full rounded-full ${plagiarismStatus === 'completed' ? (plagiarismPercent > 15 ? 'bg-red-500' : 'bg-emerald-500') : 'bg-primary'}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: plagiarismStatus === 'scanning' ? '70%' : (plagiarismStatus === 'completed' ? `${plagiarismPercent}%` : '0%') }}
                                            transition={{ duration: plagiarismStatus === 'scanning' ? 3 : 0.8, ease: "circOut" }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center bg-primary/5 p-4 rounded-2xl">
                                        <p className={`text-xs ${t.muted} font-bold leading-relaxed pr-8`}>
                                            {plagiarismStatus === 'ready' && 'Upload a document to start the AI-powered integrity scan.'}
                                            {plagiarismStatus === 'scanning' && 'Cross-referencing with 4.2 billion web pages and journals...'}
                                            {plagiarismStatus === 'completed' && plagiarismPercent > 15 ? 'High similarity detected. Please review citations.' : 'Your work is effectively original. Great job!'}
                                        </p>
                                        {plagiarismStatus === 'completed' && (
                                            <p className={`text-3xl font-black ${plagiarismPercent > 15 ? 'text-red-500' : 'text-emerald-500'} tabular-nums`}>
                                                {plagiarismPercent}%
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>

                            <div className={`${t.card} p-7 lg:p-8 rounded-[2.5rem] lg:rounded-[3rem] shadow-sm border ${t.border} space-y-7 group`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl shadow-sm">
                                            <TreePine size={24} />
                                        </div>
                                        <div>
                                            <h4 className={`text-lg font-black ${t.heading}`}>Eco-Savings</h4>
                                            <p className={`text-[10px] font-black ${t.muted} uppercase tracking-[0.2em]`}>Digital Footprint</p>
                                        </div>
                                    </div>
                                    <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
                                        Eco Level 4
                                    </span>
                                </div>
                                <div className="flex items-center gap-8 bg-primary/5 p-5 lg:p-6 rounded-[2rem] border border-primary/10">
                                    <div className="flex-1">
                                        <div className={`text-4xl font-black ${t.heading} mb-1 flex items-baseline gap-1`}>
                                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-primary">
                                                {co2Saved.toFixed(1)}
                                            </motion.span>
                                            <span className="text-lg">g</span>
                                        </div>
                                        <p className={`text-xs ${t.muted} font-bold leading-relaxed`}>
                                            CO2 emissions prevented by bypassing the paper-based submission cycle.
                                        </p>
                                    </div>
                                    <div className={`w-20 h-20 lg:w-24 lg:h-24 rounded-full border-4 ${t.search} flex items-center justify-center relative shadow-sm`}>
                                        <svg className="w-full h-full -rotate-90">
                                            <circle cx="50%" cy="50%" r="42%" fill="none" stroke={t.border.includes('slate-100') ? '#F1F5F9' : '#334155'} strokeWidth="8" />
                                            <motion.circle
                                                cx="50%" cy="50%" r="42%" fill="none" stroke="#primary" strokeWidth="8"
                                                strokeDasharray="213"
                                                initial={{ strokeDashoffset: 213 }}
                                                animate={{ strokeDashoffset: 213 - (213 * (co2Saved / 25)) }}
                                                style={{ stroke: 'var(--primary)' }}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Leaf className="text-primary group-hover:scale-125 transition-transform duration-500" size={28} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Feedback - Only visible on mobile/tablet here */}
                        <div className="lg:hidden pt-8 border-t border-dashed border-primary/20">
                            <section className="space-y-4">
                                <h3 className={`text-[10px] font-black ${t.muted} uppercase tracking-widest ml-1`}>Recent Feedback</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {mockFeedback.map((fb) => (
                                        <motion.div
                                            key={fb.id}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setShowFeedbackModal(fb)}
                                            className={`${t.card} p-6 rounded-3xl shadow-sm border ${t.border} cursor-pointer transition-all hover:border-primary/30 group relative overflow-hidden`}
                                        >
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-2xl -translate-y-6 translate-x-6" />
                                            <div className="flex justify-between items-start mb-3 relative z-10">
                                                <span className="text-[9px] font-black text-primary px-3 py-1 bg-primary/10 rounded-full uppercase tracking-wider">{fb.assignmentName}</span>
                                                <span className={`text-[10px] font-bold ${t.muted}`}>{fb.timeAgo}</span>
                                            </div>
                                            <p className={`text-xs ${t.text} font-medium line-clamp-2 italic mb-5 leading-relaxed relative z-10`}>
                                                "{fb.quote}"
                                            </p>
                                            <div className="flex items-center gap-3 relative z-10">
                                                <img src={fb.instructor.avatar} alt={fb.instructor.name} className={`w-7 h-7 rounded-xl border-2 ${t.border} shadow-sm`} />
                                                <span className={`text-[10px] font-black ${t.muted}`}>{fb.instructor.name}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {showFeedbackModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFeedbackModal(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className={`relative w-full max-w-lg ${t.card} rounded-[3rem] shadow-2xl p-8 overflow-hidden`}>
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex items-center gap-4">
                                    <img src={showFeedbackModal.instructor.avatar} alt="" className={`w-12 h-12 rounded-2xl shadow-sm border ${t.border}`} />
                                    <div>
                                        <h3 className={`text-xl font-black ${t.heading}`}>{showFeedbackModal.instructor.name}</h3>
                                        <p className={`text-xs font-bold ${t.muted} uppercase tracking-widest`}>{showFeedbackModal.assignmentName} • {showFeedbackModal.timeAgo}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowFeedbackModal(null)} className={`p-2 hover:${t.search} rounded-full ${t.muted} hover:${t.text} transition-colors`}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="space-y-6 relative z-10">
                                <div className={`p-6 ${t.search} rounded-[2rem] border ${t.border}`}>
                                    <MessageSquare className="text-primary mb-3" size={24} />
                                    <p className={`${t.text} font-medium leading-relaxed italic`}>"{showFeedbackModal.quote}"</p>
                                </div>
                                <button onClick={() => setShowFeedbackModal(null)} className="w-full py-4 bg-primary text-white rounded-2xl font-black hover:opacity-90 transition-all shadow-xl shadow-primary/10">
                                    Close Review
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

