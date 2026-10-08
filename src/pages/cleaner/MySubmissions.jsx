import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/useAuth.js';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import StatusChip from '../../components/StatusChip.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { getMyCleaningLogs } from '../../lib/api.js';
import { Calendar, Clock, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';

export default function MySubmissions() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      getMyCleaningLogs(user.id)
        .then((data) => setLogs(data || []))
        .catch((err) => console.error('Failed to load cleaning submissions:', err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  // Group logs by date (YYYY-MM-DD)
  const groupedLogs = logs.reduce((acc, log) => {
    const dateKey = log.created_at ? log.created_at.slice(0, 10) : 'Unknown Date';
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(log);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedLogs).sort((a, b) => b.localeCompare(a));

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text">
              My Cleaning Submissions Timeline
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Historical record of your daily photo submissions and moderation feedback.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-stone-200 shadow-sm">
            Total Proofs: {logs.length}
          </span>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading your submission history..." />
        ) : logs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-stone-100 text-stone-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="font-serif text-xl font-bold text-text mb-1">
              No Submissions Yet
            </h3>
            <p className="text-sm text-muted max-w-sm mx-auto">
              You haven't submitted any after-cleaning photo proofs yet. Use the Submit Proof button to record your shift.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDates.map((dateStr) => {
              const dayLogs = groupedLogs[dateStr];
              const formattedDate = new Date(dateStr).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              return (
                <div key={dateStr} className="space-y-4">
                  {/* Date Header Badge */}
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                      <Calendar size={16} />
                    </div>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-stone-800">
                      {formattedDate}
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                      {dayLogs.length} division{dayLogs.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {dayLogs.map((log) => (
                      <div
                        key={log.id}
                        className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                      >
                        <div className="relative aspect-video w-full bg-stone-100">
                          <img
                            src={log.photo_url}
                            alt="Cleaning Proof"
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute top-2.5 right-2.5">
                            <StatusChip status={log.status} />
                          </div>
                          <div className="absolute bottom-2.5 left-2.5 bg-black/60 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1.5">
                            <Clock size={12} />
                            {new Date(log.photo_taken_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-text text-base">
                                {log.divisions?.name || 'Assigned Division'}
                              </h4>
                              <span className="text-xs font-medium px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                                Floor {log.floor_code}
                              </span>
                            </div>

                            {log.notes && (
                              <p className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100 mt-2">
                                <span className="font-medium text-stone-900 block mb-0.5">
                                  Cleaner Note:
                                </span>
                                {log.notes}
                              </p>
                            )}

                            {/* Moderator Remark Alert Box */}
                            {log.review_remark && (
                              <div
                                className={`mt-3 p-3 rounded-xl border text-xs leading-relaxed ${
                                  log.status === 'approved'
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                    : log.status === 'needs_redo'
                                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                                    : 'bg-red-50 border-red-200 text-red-900'
                                }`}
                              >
                                <div className="font-semibold flex items-center gap-1 mb-1">
                                  <MessageSquare size={13} />
                                  <span>
                                    Moderator Remark ({log.reviewer?.full_name || 'Staff'}):
                                  </span>
                                </div>
                                <p>{log.review_remark}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
