import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AssignmentManagement from './pages/AssignmentManagement';
import NoticeAdmin from './pages/NoticeAdmin';
import { AnimatePresence } from 'motion/react';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="h-screen w-screen flex items-center justify-center bg-bg-light">
    <div className="animate-leaf text-primary">
      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8.13,20C11,20 14.29,17.89 15.77,14.93L20,15V13.5L15.82,13.28C16.41,11.5 17,9.5 17,8M12.72,12.77C11.71,14.79 9.5,16.37 7.38,15.81C8.4,13.58 10.09,11.42 12.22,10.5C12.38,11.23 12.55,12 12.72,12.77Z" />
      </svg>
    </div>
  </div>;
  
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/student/*" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/faculty/*" element={
              <ProtectedRoute allowedRoles={['faculty', 'hod']}>
                <FacultyDashboard />
              </ProtectedRoute>
            } />

            <Route path="/faculty/assignment/:id" element={
              <ProtectedRoute allowedRoles={['faculty', 'hod']}>
                <AssignmentManagement />
              </ProtectedRoute>
            } />

            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/admin/notices" element={
              <ProtectedRoute allowedRoles={['admin', 'faculty', 'hod']}>
                <NoticeAdmin />
              </ProtectedRoute>
            } />
          </Routes>
        </AnimatePresence>
      </Router>
    </AuthProvider>
  );
}
