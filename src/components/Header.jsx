import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import RoleBadge from './RoleBadge.jsx';
import { getNoticesForUser } from '../lib/api.js';
import { LogOut, Bell, Sparkles, Building2 } from 'lucide-react';

export default function Header() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    if (user?.id) {
      getNoticesForUser(user.id)
        .then((notices) => {
          if (mounted && notices) {
            const unread = notices.filter((n) => !n.read_at).length;
            setUnreadCount(unread);
          }
        })
        .catch(() => {});
    }
    return () => {
      mounted = false;
    };
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!profile) return '/';
    switch (profile.role) {
      case 'cleaner':
        return '/cleaner';
      case 'moderator':
        return '/moderator';
      case 'admin':
        return '/admin';
      case 'superadmin':
        return '/super';
      default:
        return '/student';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-primary/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Logo + App Name */}
        <Link to={getDashboardPath()} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primaryDark flex items-center justify-center text-secondary shadow-md group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-primaryDark block leading-none">
              Shantigram Gurukul
            </span>
            <span className="text-[10px] sm:text-xs font-medium text-primary tracking-wider uppercase">
              Cleanliness System
            </span>
          </div>
        </Link>

        {/* Right: User actions or Login */}
        {user ? (
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Student/Staff Inbox with unread indicator */}
            <Link
              to="/student/inbox"
              className="relative p-2 rounded-xl text-stone-600 hover:text-primary hover:bg-stone-100 transition"
              title="Notices & Inbox"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-danger rounded-full ring-2 ring-surface animate-pulse" />
              )}
            </Link>

            {/* Profile info & role badge */}
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-sm font-semibold text-text truncate max-w-[150px]">
                {profile?.full_name || user.email?.split('@')[0]}
              </span>
              <RoleBadge role={profile?.role || 'student'} />
            </div>

            <div className="sm:hidden">
              <RoleBadge role={profile?.role || 'student'} />
            </div>

            {/* Logout button */}
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-2 rounded-xl text-stone-500 hover:text-danger hover:bg-rose-50 transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-sm font-medium text-primaryDark hover:bg-stone-100 transition"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-xl text-sm font-medium bg-primary hover:bg-primaryDark text-white shadow-sm transition"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
