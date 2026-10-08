import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import SubmissionCard from '../../components/SubmissionCard.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { getCleaningLogsForReview, getDivisions, getComplianceSummary } from '../../lib/api.js';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function ModeratorDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'compliance'
  const [pendingLogs, setPendingLogs] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [todayLogs, setTodayLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const [pending, allDivs, compLogs] = await Promise.all([
        getCleaningLogsForReview({ status: 'pending_review' }),
        getDivisions({ activeOnly: true }),
        getComplianceSummary({ from: today }),
      ]);

      setPendingLogs(pending || []);
      setDivisions(allDivs || []);
      setTodayLogs(compLogs || []);
    } catch (err) {
      console.error('Moderator dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute compliance
  const cleanedDivIds = new Set(todayLogs.map((l) => l.division_id));
  const cleanedCount = divisions.filter((d) => cleanedDivIds.has(d.id)).length;
  const totalDivCount = divisions.length;

  const getDivisionStatus = (divId) => {
    const log = todayLogs.find((l) => l.division_id === divId);
    if (!log) return { status: 'not_submitted', color: 'bg-red-500', text: 'Not Submitted', border: 'border-red-200 bg-red-50' };
    if (log.status === 'approved') return { status: 'approved', color: 'bg-emerald-500', text: 'Approved', border: 'border-emerald-200 bg-emerald-50' };
    if (log.status === 'needs_redo') return { status: 'needs_redo', color: 'bg-orange-500', text: 'Needs Redo', border: 'border-orange-200 bg-orange-50' };
    return { status: 'pending_review', color: 'bg-amber-500', text: 'Submitted (Pending Review)', border: 'border-amber-200 bg-amber-50' };
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner with Summary */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck size={14} /> Cleanliness Verification Desk
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold">
              Moderator Dashboard
            </h1>
            <p className="text-emerald-100 text-sm mt-1 max-w-xl">
              Inspect submitted after-cleaning photos, enforce hygiene quality, and audit Gurukul compliance across all divisions.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-right">
            <div className="text-2xl sm:text-3xl font-bold font-serif text-emerald-300">
              {cleanedCount} of {totalDivCount}
            </div>
            <div className="text-xs text-emerald-100 uppercase tracking-wider font-medium">
              Divisions Cleaned Today
            </div>
            <Link
              to="/moderator/compliance"
              className="inline-flex items-center gap-1 text-xs text-secondary mt-2 underline font-semibold"
            >
              Full Compliance Matrix &rarr;
            </Link>
          </div>
        </div>

        {/* Tabs Control */}
        <div className="flex border-b border-stone-200 mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-3 px-5 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'border-primary text-primaryDark'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileCheck size={16} />
            Pending Verification ({pendingLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`py-3 px-5 text-sm font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'compliance'
                ? 'border-primary text-primaryDark'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Layers size={16} />
            Today's Division Compliance
          </button>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading verification queue..." />
        ) : activeTab === 'pending' ? (
          /* Tab 1: Pending Verification Queue */
          pendingLogs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-sm">
              <CheckCircle2 size={36} className="text-emerald-600 mx-auto mb-3" />
              <h3 className="font-serif text-xl font-bold text-text mb-1">
                All Submissions Verified!
              </h3>
              <p className="text-sm text-muted max-w-sm mx-auto">
                There are no cleaning proof submissions pending moderator review right now.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="relative aspect-video w-full bg-stone-100">
                    <img
                      src={log.photo_url}
                      alt="Submitted proof"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 right-2.5 bg-amber-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase shadow">
                      Pending Review
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-text text-base">
                          {log.divisions?.name || 'Division'}
                        </h4>
                        <span className="text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-medium">
                          Floor {log.floor_code}
                        </span>
                      </div>
                      <p className="text-xs text-muted mb-2">
                        Submitted by: <span className="font-medium text-stone-800">{log.cleaner?.full_name || 'Cleaner'}</span>
                      </p>
                      {log.notes && (
                        <p className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100 italic">
                          "{log.notes}"
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-[11px] text-muted">
                        {new Date(log.photo_taken_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        onClick={() => navigate(`/moderator/verify/${log.id}`)}
                        className="px-4 py-2 rounded-xl bg-primary hover:bg-primaryDark text-white text-xs font-semibold shadow transition flex items-center gap-1.5"
                      >
                        <ShieldCheck size={14} />
                        Verify Proof
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Tab 2: Today's Compliance Grid */
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-text">
                  Campus Divisions Status
                </h3>
                <p className="text-xs text-muted">
                  Color-coded live status for all building zones today.
                </p>
              </div>

              {/* Status Legend */}
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>Approved</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span>Pending Review</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-orange-500" />
                  <span>Needs Redo</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Not Submitted</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {divisions.map((div) => {
                const statusInfo = getDivisionStatus(div.id);
                return (
                  <div
                    key={div.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between ${statusInfo.border} shadow-sm`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-stone-600">
                          Floor {div.floor_code}
                        </span>
                        <span className={`w-2.5 h-2.5 rounded-full ${statusInfo.color}`} />
                      </div>
                      <h4 className="font-semibold text-text text-sm mb-1">{div.name}</h4>
                      <div className="text-[11px] text-muted">
                        Freq: {div.frequency || 'Daily'}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-stone-200/50 flex items-center justify-between text-xs">
                      <span className="font-medium text-stone-700">{statusInfo.text}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
