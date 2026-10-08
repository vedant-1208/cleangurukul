import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { ShieldAlert, LogOut } from 'lucide-react';

export default function RequireRole({ role, children }) {
  const { user, profile, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <LoadingSpinner size="lg" message="Verifying authorization..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if deactivated
  if (profile && profile.is_active === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-stone-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 text-danger rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={36} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-text mb-2">Account Deactivated</h2>
          <p className="text-muted mb-6">
            Your Shantigram Gurukul account has been deactivated by an administrator. If you believe this is an error, please contact the hostel warden or administration office.
          </p>
          <button
            onClick={() => signOut()}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-text font-medium transition"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Check role authorization
  const allowedRoles = Array.isArray(role) ? role : [role];
  const userRole = profile?.role || 'student';

  // Superadmin can access admin routes
  const hasAccess = allowedRoles.includes(userRole) || (userRole === 'superadmin' && allowedRoles.includes('admin'));

  if (!hasAccess) {
    // If authenticated but wrong role, route to their own role dashboard
    const roleRedirects = {
      student: '/student',
      cleaner: '/cleaner',
      moderator: '/moderator',
      admin: '/admin',
      superadmin: '/super',
    };
    return <Navigate to={roleRedirects[userRole] || '/login'} replace />;
  }

  return children;
}
