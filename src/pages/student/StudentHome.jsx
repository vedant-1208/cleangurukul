import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth.js';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { getMyIssues, getNoticesForUser } from '../../lib/api.js';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  PlusCircle,
  Bell,
  ListOrdered,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function StudentHome() {
  const { user, profile } = useAuth();
  const [issues, setIssues] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (user?.id) {
      Promise.all([getMyIssues(user.id), getNoticesForUser(user.id)])
        .then(([issuesData, noticesData]) => {
          if (mounted) {
            setIssues(issuesData || []);
            setNotices(noticesData || []);
          }
        })
        .catch((err) => console.error('Error loading student dashboard:', err))
        .finally(() => {
          if (mounted) setLoading(false);
        });
    }
    return () => {
      mounted = false;
    };
  }, [user]);

  const pendingCount = issues.filter((i) => i.status === 'pending' || i.status === 'in_progress').length;
  const resolvedCount = issues.filter((i) => i.status === 'resolved').length;
  const unreadNotices = notices.filter((n) => !n.read_at);

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primaryDark to-primary text-white rounded-2xl p-6 sm:p-8 shadow-lg mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-secondary/80 text-xs font-semibold uppercase tracking-wider block mb-1">
              Hostel Resident Portal
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold mb-2">
              Namaste, {profile?.full_name || 'Student'}!
            </h1>
            <p className="text-amber-100 text-sm max-w-xl">
              {profile?.floor ? `Floor ${profile.floor}` : 'Campus Resident'} {profile?.room ? `• Room ${profile.room}` : ''}
              . Help maintain Shantigram Gurukul's cleanliness standards by reporting any hygiene or sanitation issue promptly.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/student/report"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-primaryDark font-semibold shadow hover:bg-secondary transition"
              >
                <PlusCircle size={18} />
                Report an Issue
              </Link>
              <Link
                to="/student/issues"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primaryDark/60 border border-white/20 text-white font-medium hover:bg-primaryDark/80 transition"
              >
                <ListOrdered size={18} />
                My Reports ({issues.length})
              </Link>
            </div>
          </div>
          <Sparkles className="absolute right-4 bottom-4 w-32 h-32 text-white/5 pointer-events-none" />
        </div>

        {/* Unread Notice Banner */}
        {unreadNotices.length > 0 && (
          <div className="mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-warning/20 text-warning">
                <Bell size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text">
                  You have {unreadNotices.length} unread administrative notice{unreadNotices.length > 1 ? 's' : ''}
                </h4>
                <p className="text-xs text-muted">
                  "{unreadNotices[0].title}" — check your inbox for updates.
                </p>
              </div>
            </div>
            <Link
              to="/student/inbox"
              className="text-xs font-semibold text-primary hover:text-primaryDark flex items-center gap-1 group whitespace-nowrap"
            >
              View Inbox <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        )}

        {/* Stats Row */}
        {loading ? (
          <LoadingSpinner message="Loading your activity..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-warning flex items-center justify-center flex-shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-text">{pendingCount}</div>
                <div className="text-xs text-muted font-medium uppercase tracking-wider">
                  Pending / In Progress Issues
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-accent flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-text">{resolvedCount}</div>
                <div className="text-xs text-muted font-medium uppercase tracking-wider">
                  Resolved Issues
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent reports list summary */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-bold text-text">Recent Cleanliness Reports</h3>
            <Link to="/student/issues" className="text-xs text-primary font-semibold hover:underline">
              View all &rarr;
            </Link>
          </div>

          {issues.length === 0 ? (
            <div className="py-8 text-center text-muted text-sm">
              You haven't reported any cleanliness issues yet.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {issues.slice(0, 3).map((issue) => (
                <div key={issue.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-text">
                      {issue.description || 'Cleanliness Concern'}
                    </div>
                    <div className="text-xs text-muted">
                      Floor {issue.floor_code} {issue.room ? `• Room ${issue.room}` : ''} •{' '}
                      <span className="capitalize">{issue.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <Link
                    to="/student/issues"
                    className="text-xs px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium"
                  >
                    Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
