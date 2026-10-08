import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import FloorSelector from '../../components/FloorSelector.jsx';
import { getCleaningLogsForReview } from '../../lib/api.js';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Filter,
  Users,
  CheckSquare,
  BarChart2,
  FileText,
  Shield,
  RefreshCw,
} from 'lucide-react';

const STATUS_CONFIG = {
  pending_review: {
    label: 'Pending Review',
    color: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  approved: {
    label: 'Approved',
    color: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  needs_redo: {
    label: 'Needs Redo',
    color: 'bg-orange-500',
    badge: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-rose-500',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
  },
};

export default function AdminProofs() {
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending_review');
  const [floorFilter, setFloorFilter] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await getCleaningLogsForReview({
        status: statusFilter || undefined,
        floorCode: floorFilter || undefined,
      });
      setLogs(data || []);
    } catch (err) {
      console.error('Error loading proofs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [statusFilter, floorFilter]);

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Navigation Sub-bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-stone-200">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider block">
              Hostel Administration
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text">
              Cleaning Proof Review
            </h1>
            <p className="text-xs text-muted mt-0.5">
              Review, approve, or reject cleaning proofs submitted by cleaners.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin"
              className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-sm flex items-center gap-1.5 transition"
            >
              <Shield size={14} /> Board
            </Link>
            <Link
              to="/admin/users"
              className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-sm flex items-center gap-1.5 transition"
            >
              <Users size={14} /> Users
            </Link>
            <Link
              to="/admin/bulk"
              className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-sm flex items-center gap-1.5 transition"
            >
              <CheckSquare size={14} /> Bulk Actions
            </Link>
            <Link
              to="/admin/notices"
              className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-sm flex items-center gap-1.5 transition"
            >
              <FileText size={14} /> Notices
            </Link>
            <Link
              to="/admin/analytics"
              className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-sm flex items-center gap-1.5 transition"
            >
              <BarChart2 size={14} /> Analytics
            </Link>
            <Link
              to="/admin/audit"
              className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-sm flex items-center gap-1.5 transition"
            >
              <Shield size={14} /> Audit Log
            </Link>
          </div>
        </div>

        {/* Stats Bar — clickable status filter cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            // Count across ALL logs regardless of current filter
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(statusFilter === key ? '' : key)}
                className={`p-4 rounded-2xl border shadow-sm text-left transition hover:shadow-md ${
                  statusFilter === key
                    ? 'border-primary/40 bg-primary/5 ring-2 ring-primary/20'
                    : 'bg-white border-stone-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${cfg.color}`} />
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    {cfg.label}
                  </span>
                </div>
                <div className="text-2xl font-serif font-bold text-text">
                  {logs.filter((l) => l.status === key).length}
                </div>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-600 uppercase tracking-wider">
            <Filter size={14} /> Filters:
          </div>

          <div className="w-44">
            <FloorSelector
              value={floorFilter}
              onChange={setFloorFilter}
              className="text-xs py-2"
            />
          </div>

          <div className="w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white font-medium focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">All Statuses</option>
              <option value="pending_review">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="needs_redo">Needs Redo</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {(floorFilter || statusFilter !== 'pending_review') && (
            <button
              onClick={() => {
                setFloorFilter('');
                setStatusFilter('pending_review');
              }}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Reset Filters
            </button>
          )}

          <button
            onClick={loadLogs}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-stone-700 transition"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {/* Proof Grid */}
        {loading ? (
          <LoadingSpinner message="Loading cleaning proof submissions..." />
        ) : logs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-sm">
            <CheckCircle2 size={36} className="text-emerald-600 mx-auto mb-3" />
            <h3 className="font-serif text-xl font-bold text-text mb-1">No Submissions Found</h3>
            <p className="text-sm text-muted max-w-sm mx-auto">
              {statusFilter === 'pending_review'
                ? 'There are no cleaning proofs pending review right now.'
                : 'No submissions match the selected filters.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {logs.map((log) => {
              const cfg = STATUS_CONFIG[log.status] || STATUS_CONFIG['pending_review'];
              return (
                <div
                  key={log.id}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  {/* Photo thumbnail */}
                  <div className="relative aspect-video w-full bg-stone-100">
                    <img
                      src={log.photo_url}
                      alt="Cleaning proof"
                      className="w-full h-full object-cover"
                    />
                    <span
                      className={`absolute top-2.5 right-2.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase shadow border ${cfg.badge}`}
                    >
                      {cfg.label}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-text text-base truncate">
                          {log.divisions?.name || 'Division'}
                        </h4>
                        <span className="text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-medium whitespace-nowrap ml-2">
                          Floor {log.floor_code}
                        </span>
                      </div>
                      <p className="text-xs text-muted mb-1">
                        Submitted by:{' '}
                        <span className="font-medium text-stone-800">
                          {log.cleaner?.full_name || 'Cleaner'}
                        </span>
                      </p>
                      <p className="text-xs text-stone-500">
                        <Clock size={11} className="inline mr-1" />
                        {new Date(log.photo_taken_at).toLocaleString([], {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                      {log.notes && (
                        <p className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100 italic mt-2 line-clamp-2">
                          "{log.notes}"
                        </p>
                      )}
                      {log.review_remark && (
                        <div className="mt-2 text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                          <span className="font-semibold text-stone-800">Review Remark: </span>
                          {log.review_remark}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100">
                      <button
                        onClick={() => navigate(`/admin/proofs/${log.id}/review`)}
                        className="w-full px-4 py-2.5 rounded-xl bg-primary hover:bg-primaryDark text-white text-xs font-semibold shadow transition flex items-center justify-center gap-1.5"
                      >
                        <ShieldCheck size={14} />
                        {log.status === 'pending_review' ? 'Review Proof' : 'View & Re-review'}
                      </button>
                    </div>
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
