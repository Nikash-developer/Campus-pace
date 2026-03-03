import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Leaf, Mail, Lock, BadgeCheck, ArrowRight, ShieldCheck,
  ChevronLeft, User, GraduationCap, Building2, AlertCircle,
  CheckCircle2, Send, Eye, EyeOff, Sparkles
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { auth, db } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
const loginBgImg = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80&auto=format&fit=crop';

type ViewState = 'login' | 'forgot-password' | 'signup';

export default function LoginPage() {
  const [view, setView] = useState<ViewState>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (view === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Fetch detailed user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          login({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: userData.name || 'User',
            role: userData.role || 'student',
            department: userData.department || '',
            avatar: userData.avatar
          } as any);

          if (userData.role === 'student') navigate('/student');
          else if (userData.role === 'admin') navigate('/admin');
          else navigate('/faculty');
        } else {
          // If profile hasn't been created yet, allow access but prompt for setup or use defaults
          navigate('/student');
        }
      } else if (view === 'forgot-password') {
        await sendPasswordResetEmail(auth, email);
        setSuccess('Password reset link sent to your email!');
      } else {
        // Signup Flow
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Update display name
        await updateProfile(firebaseUser, { displayName: fullName });

        // Create detailed profile in Firestore
        const profileData = {
          name: fullName,
          email: email,
          role: role,
          idNumber: idNumber,
          department: department,
          designation: designation || '',
          createdAt: new Date().toISOString(),
          eco_stats: {
            total_pages_saved: 0,
            total_water_saved: 0,
            total_co2_prevented: 0,
          }
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), profileData);

        setSuccess(`Registration successful! Welcome to Green-Sync.`);
        setTimeout(() => {
          if (role === 'student') navigate('/student');
          else navigate('/faculty');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = 'Authentication failed. Please try again.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered.';
      } else if (err.code === 'auth/network-request-failed') {
        msg = 'Network error. Please check your connection.';
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const roleInfo = {
    student: {
      title: 'Student Portal',
      desc: 'Submit assignments, track your eco-impact, and view notices.',
      icon: <GraduationCap className="w-6 h-6" />,
      idLabel: 'Student ID'
    },
    faculty: {
      title: 'Faculty Hub',
      desc: 'Grade assignments, manage subjects, and post smart notices.',
      icon: <User className="w-6 h-6" />,
      idLabel: 'Employee ID'
    },
    admin: {
      title: 'Administrator',
      desc: 'System-wide management, user reviews, and global settings.',
      icon: <ShieldCheck className="w-6 h-6" />,
      idLabel: 'Admin ID'
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center p-4 md:p-6 font-sans">
      {/* Back to Home */}
      <Link
        to="/"
        className="fixed top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-primary font-bold transition-all group z-50"
      >
        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
          <ChevronLeft size={20} />
        </div>
        <span className="hidden md:block">Back to Home</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[1150px] bg-white rounded-[2.5rem] shadow-2xl shadow-primary/5 overflow-hidden flex flex-col md:flex-row min-h-[700px] border border-slate-100"
      >
        {/* Left: Form Area */}
        <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col overflow-y-auto max-h-[90vh] md:max-h-none">
          <div className="mb-10 flex items-center gap-3 group">
            <div className="p-2 bg-primary/10 rounded-xl text-primary transform group-hover:rotate-12 transition-transform">
              <Leaf size={32} fill="currentColor" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900 italic">Green-Sync</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col justify-center"
            >
              <div className="mb-6">
                <h1 className="text-3xl font-black text-slate-900 mb-2">
                  {view === 'login' ? 'Welcome Back' : view === 'forgot-password' ? 'Reset Password' : 'Create Account'}
                </h1>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {view === 'login'
                    ? 'Enter your campus credentials to access your sustainable dashboard.'
                    : view === 'forgot-password'
                      ? 'Enter your registered email to receive a password recovery link.'
                      : 'Provide your details to set up your new Green-Sync account instantly.'}
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-3"
                >
                  <AlertCircle size={18} />
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 bg-green-50 text-green-600 rounded-2xl text-sm font-bold border border-green-100 flex items-center gap-3"
                >
                  <CheckCircle2 size={18} />
                  {success}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {view === 'signup' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-primary" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full pl-11 pr-4 py-3 bg-[#F8FAF9] border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-primary" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="campus.email@university.edu"
                      className="w-full pl-11 pr-4 py-3 bg-[#F8FAF9] border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium"
                      required
                    />
                  </div>
                </div>

                {(view === 'login' || view === 'signup') && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{view === 'signup' ? 'Create Password' : 'Password'}</label>
                      {view === 'login' && (
                        <button
                          type="button"
                          onClick={() => setView('forgot-password')}
                          className="text-[10px] font-bold text-primary hover:underline"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-primary" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-12 py-3 bg-[#F8FAF9] border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors p-1"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}

                {(view === 'login' || view === 'signup') && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
                    <div className="grid grid-cols-2 gap-4">
                      {(['student', 'faculty'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 group ${role === r
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-slate-100 hover:border-slate-200 text-slate-400'
                            }`}
                        >
                          <div className={`p-1.5 rounded-lg transition-colors ${role === r ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'
                            }`}>
                            {React.cloneElement(roleInfo[r as keyof typeof roleInfo]?.icon || <ShieldCheck size={16} />, { size: 16 })}
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-wider">{r}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {view === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 pt-2"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          {roleInfo[role as keyof typeof roleInfo].idLabel}
                        </label>
                        <div className="relative group">
                          <BadgeCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-primary" />
                          <input
                            type="text"
                            value={idNumber}
                            onChange={(e) => setIdNumber(e.target.value)}
                            placeholder="ID-12345"
                            className="w-full pl-11 pr-4 py-3 bg-[#F8FAF9] border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                        <div className="relative group">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-primary" />
                          <input
                            type="text"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            placeholder="Computer Science"
                            className="w-full pl-11 pr-4 py-3 bg-[#F8FAF9] border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {role === 'faculty' && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Designation / Office</label>
                        <div className="relative group">
                          <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-primary" />
                          <input
                            type="text"
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            placeholder="Senior Professor"
                            className="w-full pl-11 pr-4 py-3 bg-[#F8FAF9] border border-slate-100 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {view === 'login' && (
                  <motion.div
                    key={role}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <p className="text-[10px] font-bold text-slate-900 mb-0.5">{roleInfo[role as keyof typeof roleInfo].title}</p>
                    <p className="text-[9px] text-slate-500 leading-relaxed">
                      {roleInfo[role as keyof typeof roleInfo].desc}
                    </p>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {view === 'login' ? 'Sign In to Dashboard' : view === 'forgot-password' ? 'Send Reset Link' : 'Create Account Now'}
                      {view === 'login' ? <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" /> : <Send className="w-4 h-4" />}
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                {view === 'login' ? (
                  <p className="text-xs text-slate-400 font-medium">
                    Don't have an account?{' '}
                    <button onClick={() => setView('signup')} className="text-primary font-bold hover:underline">Create Account</button>
                  </p>
                ) : (
                  <button
                    onClick={() => setView('login')}
                    className="text-xs font-bold text-slate-500 hover:text-primary flex items-center gap-2 mx-auto transition-colors"
                  >
                    <ChevronLeft size={14} /> Back to Login
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Visual Side */}
        <div className="hidden md:block w-1/2 bg-[#111827] relative overflow-hidden">
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.4 }}
            transition={{ duration: 1.5 }}
            src={loginBgImg}
            alt="Futuristic premium greenhouse layout"
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/40 to-transparent" />

          <div className="absolute inset-0 p-16 flex flex-col justify-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-16 h-16 bg-primary/20 backdrop-blur-md rounded-2xl border border-primary/30 flex items-center justify-center mb-8"
            >
              <Sparkles className="text-primary w-10 h-10" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-5xl font-black mb-6 leading-tight tracking-tight"
            >
              Welcome back to the <span className="text-primary">Green Revolution</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-lg text-slate-300 leading-relaxed mb-10 max-w-md"
            >
              Seamlessly manage your academic life while tracking your eco-footprint. Together, let's create a sustainable, paperless campus.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap gap-4"
            >
              <div className="px-5 py-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                  <Leaf size={18} fill="currentColor" />
                </div>
                <span className="text-sm font-bold">Eco-Tracking</span>
              </div>
              <div className="px-5 py-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                  <BadgeCheck size={18} />
                </div>
                <span className="text-sm font-bold">Digital Portal</span>
              </div>
            </motion.div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
        </div>
      </motion.div>
    </div>
  );
}
