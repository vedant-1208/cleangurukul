import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider.jsx';
import { ToastProvider } from './components/ToastProvider.jsx';
import RequireRole from './auth/RequireRole.jsx';

// Public pages
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import NotFound from './pages/NotFound.jsx';

// Student pages
import StudentHome from './pages/student/StudentHome.jsx';
import ReportIssue from './pages/student/ReportIssue.jsx';
import MyIssues from './pages/student/MyIssues.jsx';
import Inbox from './pages/student/Inbox.jsx';

// Cleaner pages
import CleanerDashboard from './pages/cleaner/CleanerDashboard.jsx';
import SubmitCleaning from './pages/cleaner/SubmitCleaning.jsx';
import MySubmissions from './pages/cleaner/MySubmissions.jsx';
import AssignedIssues from './pages/cleaner/AssignedIssues.jsx';

// Moderator pages
import ModeratorDashboard from './pages/moderator/ModeratorDashboard.jsx';
import VerifySubmission from './pages/moderator/VerifySubmission.jsx';
import ComplianceView from './pages/moderator/ComplianceView.jsx';

// Admin pages
import AdminBoard from './pages/admin/AdminBoard.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminIssueDetail from './pages/admin/AdminIssueDetail.jsx';
import AdminBulk from './pages/admin/AdminBulk.jsx';
import AdminNotices from './pages/admin/AdminNotices.jsx';
import AdminAnalytics from './pages/admin/AdminAnalytics.jsx';
import AdminAudit from './pages/admin/AdminAudit.jsx';
import AdminProofs from './pages/admin/AdminProofs.jsx';
import AdminVerifySubmission from './pages/admin/AdminVerifySubmission.jsx';

// Superadmin pages
import SuperDashboard from './pages/superadmin/SuperDashboard.jsx';
import ManageDivisions from './pages/superadmin/ManageDivisions.jsx';
import ManageAssignments from './pages/superadmin/ManageAssignments.jsx';
import ManageRoles from './pages/superadmin/ManageRoles.jsx';
import SystemSettings from './pages/superadmin/SystemSettings.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Student & Resident Routes */}
            <Route
              path="/student"
              element={
                <RequireRole role={['student', 'moderator']}>
                  <StudentHome />
                </RequireRole>
              }
            />
            <Route
              path="/student/report"
              element={
                <RequireRole role={['student', 'moderator']}>
                  <ReportIssue />
                </RequireRole>
              }
            />
            <Route
              path="/student/issues"
              element={
                <RequireRole role={['student', 'moderator']}>
                  <MyIssues />
                </RequireRole>
              }
            />
            <Route
              path="/student/inbox"
              element={
                <RequireRole role={['student', 'moderator']}>
                  <Inbox />
                </RequireRole>
              }
            />

            {/* Cleaner Routes */}
            <Route
              path="/cleaner"
              element={
                <RequireRole role="cleaner">
                  <CleanerDashboard />
                </RequireRole>
              }
            />
            <Route
              path="/cleaner/submit"
              element={
                <RequireRole role="cleaner">
                  <SubmitCleaning />
                </RequireRole>
              }
            />
            <Route
              path="/cleaner/submissions"
              element={
                <RequireRole role="cleaner">
                  <MySubmissions />
                </RequireRole>
              }
            />
            <Route
              path="/cleaner/issues"
              element={
                <RequireRole role="cleaner">
                  <AssignedIssues />
                </RequireRole>
              }
            />

            {/* Moderator Routes */}
            <Route
              path="/moderator"
              element={
                <RequireRole role="moderator">
                  <ModeratorDashboard />
                </RequireRole>
              }
            />
            <Route
              path="/moderator/verify/:id"
              element={
                <RequireRole role="moderator">
                  <VerifySubmission />
                </RequireRole>
              }
            />
            <Route
              path="/moderator/compliance"
              element={
                <RequireRole role="moderator">
                  <ComplianceView />
                </RequireRole>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <RequireRole role={['admin', 'superadmin']}>
                  <AdminBoard />
                </RequireRole>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RequireRole role={['admin', 'superadmin']}>
                  <AdminUsers />
                </RequireRole>
              }
            />
            <Route
              path="/admin/issues/:id"
              element={
                <RequireRole role={['admin', 'superadmin']}>
                  <AdminIssueDetail />
                </RequireRole>
              }
            />
            <Route
              path="/admin/bulk"
              element={
                <RequireRole role={['admin', 'superadmin']}>
                  <AdminBulk />
                </RequireRole>
              }
            />
            <Route
              path="/admin/notices"
              element={
                <RequireRole role={['admin', 'superadmin']}>
                  <AdminNotices />
                </RequireRole>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <RequireRole role={['admin', 'superadmin']}>
                  <AdminAnalytics />
                </RequireRole>
              }
            />
            <Route
              path="/admin/audit"
              element={
                <RequireRole role={['admin', 'superadmin']}>
                  <AdminAudit />
                </RequireRole>
              }
            />
            <Route
              path="/admin/proofs"
              element={
                <RequireRole role={['admin', 'superadmin']}>
                  <AdminProofs />
                </RequireRole>
              }
            />
            <Route
              path="/admin/proofs/:id/review"
              element={
                <RequireRole role={['admin', 'superadmin']}>
                  <AdminVerifySubmission />
                </RequireRole>
              }
            />

            {/* Superadmin Routes */}
            <Route
              path="/super"
              element={
                <RequireRole role="superadmin">
                  <SuperDashboard />
                </RequireRole>
              }
            />
            <Route
              path="/super/divisions"
              element={
                <RequireRole role="superadmin">
                  <ManageDivisions />
                </RequireRole>
              }
            />
            <Route
              path="/super/assignments"
              element={
                <RequireRole role="superadmin">
                  <ManageAssignments />
                </RequireRole>
              }
            />
            <Route
              path="/super/roles"
              element={
                <RequireRole role="superadmin">
                  <ManageRoles />
                </RequireRole>
              }
            />
            <Route
              path="/super/settings"
              element={
                <RequireRole role="superadmin">
                  <SystemSettings />
                </RequireRole>
              }
            />

            {/* Fallback 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
