import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth.js';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import SubmissionCard from '../../components/SubmissionCard.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { getDivisions, getMyCleaningLogs, getIssuesForCleaner } from '../../lib/api.js';
import {
  Camera,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  ArrowRight,
  Sparkles,
  ClipboardList,
} from 'lucide-react';

export default function CleanerDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [divisions, setDivisions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      const [allDivs, myLogs, myIssues] = await Promise.all([
        getDivisions(),
        getMyCleaningLogs(user.id),
        getIssuesForCleaner(user.id),
      ]);

      // Filter divisions assigned to this cleaner
      const myAssignedDivs = (allDivs || []).filter((div) =>
        div.division_assignments?.some(
          (a) => a.cleaner_id === user.id && a.is_active
        )
      );

      setDivisions(myAssignedDivs.length > 0 ? myAssignedDivs : allDivs || []);
      setLogs(myLogs || []);
      setIssues(myIssues || []);
    } catch (err) {
      console.error('Failed to load cleaner dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Check if a division has been cleaned today
  const isCleanedToday = (divId) => {
    const today = new Date().toISOString().slice(0, 10);
    return logs.some(
      (log) =>
        log.division_id === divId &&
        log.created_at &&
        log.created_at.slice(0, 10) === today
    );
  };

  const pendingIssues = issues.filter((i) => i.status === 'pending' || i.status === 'in_progress');

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cleaner Hero Greeting */}
        <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-2xl p-6 sm:p-8 shadow-lg mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles size={14} /> Cleaning Shift Portal
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold">
              Namaste, {profile?.full_name || 'Staff Member'}
            </h1>
            <p className="text-stone-300 text-sm mt-1 max-w-xl">
              Upload mandatory after-cleaning photos for your assigned Gurukul divisions. Your photos are verified daily by hostel moderators.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            <Link
              to="/cleaner/submit"
              className="px-5 py-3 rounded-xl bg-primary hover:bg-primaryDark text-white font-semibold shadow flex items-center gap-2 transition"
            >
              <Camera size={18} />
              <span>Submit Proof</span>
            </Link>
            <Link
              to="/cleaner/submissions"
              className="px-4 py-3 rounded-xl bg-stone-700 hover:bg-stone-600 text-white font-medium transition flex items-center gap-2"
            >
              <ClipboardList size={18} />
              <span>Log History</span>
            </Link>
          </div>
        </div>

        {/* Section: Today's Status Chips per Division */}
        <div className="mb-8">
          <h2 className="font-serif text-lg sm:text-xl font-bold text-text mb-3 flex items-center gap-2">
            <Layers size={18} className="text-primary" />
            Today's Scheduled Divisions Status
          </h2>

          <div className="flex flex-wrap gap-2.5">
            {divisions.length === 0 ? (
              <span className="text-xs text-muted italic">No assigned divisions found.</span>
            ) : (
              divisions.map((div) => {
                const done = isCleanedToday(div.id);
                return (
                  <div
                    key={div.id}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border shadow-sm transition ${
                      done
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        done ? 'bg-emerald-600' : 'bg-amber-500 animate-pulse'
                      }`}
                    />
                    <span>
                      {div.name} (Fl {div.floor_code}):
                    </span>
                    <span className="font-bold">{done ? 'Done Today' : 'Pending'}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Layout with Main Area and Collapsible/Side Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List: Assigned Divisions with Proof Submit Action */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl font-bold text-text">
                Assigned Divisions ({divisions.length})
              </h3>
              <span className="text-xs text-muted font-medium">Shift Checklist</span>
            </div>

            {loading ? (
              <LoadingSpinner message="Loading your assigned divisions..." />
            ) : divisions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-muted text-sm shadow-sm">
                No divisions have been assigned to your profile yet. Please inform the Superadmin or Hostel Warden.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {divisions.map((div) => {
                  const todayLog = logs.find(
                    (l) =>
                      l.division_id === div.id &&
                      l.created_at?.slice(0, 10) === new Date().toISOString().slice(0, 10)
                  );
                  return (
                    <SubmissionCard
                      key={div.id}
                      division={div}
                      submission={todayLog}
                      actionType={todayLog ? 'view' : 'submit'}
                      onAction={() => {
                        navigate(`/cleaner/submit?divisionId=${div.id}&floor=${div.floor_code}`);
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Sidebar: Quick Pending Issues & Recent Log History */}
          <div className="space-y-6">
            {/* Pending Issues Box */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-rose-100 text-danger rounded-lg">
                    <AlertTriangle size={16} />
                  </div>
                  <h4 className="font-serif text-base font-bold text-text">
                    Assigned Issues ({pendingIssues.length})
                  </h4>
                </div>
                <Link
                  to="/cleaner/issues"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  View All &rarr;
                </Link>
              </div>

              {pendingIssues.length === 0 ? (
                <p className="text-xs text-stone-400 py-3 text-center">
                  No pending student issues in your zone. Great job!
                </p>
              ) : (
                <div className="space-y-3">
                  {pendingIssues.slice(0, 3).map((issue) => (
                    <Link
                      key={issue.id}
                      to="/cleaner/issues"
                      className="block p-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 transition text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold text-stone-800 mb-1">
                        <span>Floor {issue.floor_code}</span>
                        <span className="text-[10px] text-primary uppercase font-bold">
                          {issue.priority}
                        </span>
                      </div>
                      <p className="text-stone-600 line-clamp-1">{issue.description}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Submissions Sidebar */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-serif text-base font-bold text-text">
                  Recent Submissions
                </h4>
                <Link
                  to="/cleaner/submissions"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  History &rarr;
                </Link>
              </div>

              {logs.length === 0 ? (
                <p className="text-xs text-stone-400 py-3 text-center">
                  No cleaning proof submissions recorded yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {logs.slice(0, 4).map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-50 border border-stone-100"
                    >
                      <img
                        src={log.photo_url}
                        alt="Proof"
                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1 text-xs">
                        <div className="font-semibold text-text truncate">
                          {log.divisions?.name || 'Division'}
                        </div>
                        <div className="text-[10px] text-muted">
                          {new Date(log.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <span
                          className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-medium uppercase mt-0.5 ${
                            log.status === 'approved'
                              ? 'text-emerald-700 bg-emerald-100'
                              : log.status === 'needs_redo'
                              ? 'text-orange-700 bg-orange-100'
                              : 'text-amber-700 bg-amber-100'
                          }`}
                        >
                          {log.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
