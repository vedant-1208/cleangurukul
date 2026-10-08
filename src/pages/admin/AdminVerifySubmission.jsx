import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth.js';
import { useToast } from '../../components/ToastProvider.jsx';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { getCleaningLogsForReview, reviewCleaningLog } from '../../lib/api.js';
import {
  CheckCircle2,
  RefreshCw,
  XCircle,
  ArrowLeft,
  Clock,
  User,
  ShieldCheck,
} from 'lucide-react';

export default function AdminVerifySubmission() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [log, setLog] = useState(null);
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCleaningLogsForReview()
      .then((logs) => {
        const found = (logs || []).find((l) => l.id === id);
        setLog(found || null);
        // Pre-fill remark if already reviewed
        if (found?.review_remark) setRemark(found.review_remark);
      })
      .catch((err) => console.error('Error fetching submission:', err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleReview = async (newStatus) => {
    /* if (!remark.trim()) {
       toast.warning('A remark is required for verification.');
       return;
     }*/

    setSubmitting(true);
    try {
      await reviewCleaningLog(
        id,
        newStatus,
        user.id,
        remark.trim(),
        { id: user.id, role: profile?.role || 'admin' }
      );

      const statusLabels = {
        approved: 'Cleaning proof approved!',
        needs_redo: 'Marked as Needs Redo. Cleaner will be notified.',
        rejected: 'Proof rejected.',
      };

      toast.success(statusLabels[newStatus] || 'Review recorded.');
      navigate('/admin/proofs');
    } catch (err) {
      console.error('Failed to submit review:', err);
      toast.error('Failed to submit verification.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-surface">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" message="Loading proof submission..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (!log) {
    return (
      <div className="min-h-screen flex flex-col bg-surface">
        <Header />
        <div className="flex-1 max-w-lg mx-auto p-8 text-center flex flex-col justify-center">
          <h2 className="font-serif text-2xl font-bold mb-2">Submission Not Found</h2>
          <p className="text-sm text-muted mb-4">
            This cleaning proof might have already been reviewed or does not exist.
          </p>
          <button
            onClick={() => navigate('/admin/proofs')}
            className="px-4 py-2 bg-primary text-white rounded-xl text-sm"
          >
            Return to Proof Queue
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate('/admin/proofs')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-text mb-4 transition"
        >
          <ArrowLeft size={16} /> Back to Proof Queue
        </button>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden">
          {/* Top Title Bar */}
          <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-1">
                Admin Proof Review
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text">
                {log.divisions?.name || 'Division'} (Floor {log.floor_code})
              </h1>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted">
              <div className="flex items-center gap-1">
                <User size={14} className="text-stone-500" />
                <span className="font-medium text-stone-800">{log.cleaner?.full_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} className="text-stone-500" />
                <span>
                  {new Date(log.photo_taken_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Large Submitted Photo */}
            <div className="relative aspect-video max-h-[460px] w-full bg-stone-900 rounded-xl overflow-hidden flex items-center justify-center">
              <img
                src={log.photo_url}
                alt="Submitted cleaning proof"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Cleaner Notes */}
            {log.notes && (
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-700">
                <span className="font-semibold text-stone-900 block mb-1">Cleaner Shift Notes:</span>
                "{log.notes}"
              </div>
            )}

            {/* Existing review remark (if re-reviewing) */}
            {log.review_remark && log.status !== 'pending_review' && (
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs sm:text-sm text-amber-900">
                <span className="font-semibold block mb-1">
                  Previous Review Remark ({log.status?.replace('_', ' ')}):
                </span>
                {log.review_remark}
              </div>
            )}

            {/* Remark Field */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Admin Remark (Mandatory) *
              </label>
              <textarea
                rows={3}
                required
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="State your observations: e.g., 'Floor thoroughly sanitized and dry', 'Corridor dustbins require re-emptying'..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-primary focus:border-primary text-text transition text-sm"
              />
            </div>

            {/* Decision Buttons */}
            <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleReview('rejected')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-danger font-semibold text-sm transition flex items-center justify-center gap-2"
              >
                <XCircle size={16} />
                Reject Proof
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleReview('needs_redo')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-sm transition flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                Needs Redo
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleReview('approved')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-accent hover:bg-green-800 text-white font-semibold text-sm shadow transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} />
                Approve Submission
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
