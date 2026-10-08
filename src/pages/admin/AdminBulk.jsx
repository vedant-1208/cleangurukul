import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/useAuth.js';
import { useToast } from '../../components/ToastProvider.jsx';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import StatusChip from '../../components/StatusChip.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import {
  getAllIssues,
  getAllUsers,
  bulkAssignIssues,
  bulkUpdateStatus,
  adminDeleteIssue,
} from '../../lib/api.js';
import { CheckSquare, Square, User, Trash2, ArrowRight } from 'lucide-react';

export default function AdminBulk() {
  const { user, profile } = useAuth();
  const toast = useToast();

  const [issues, setIssues] = useState([]);
  const [cleaners, setCleaners] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bulk action states
  const [targetCleaner, setTargetCleaner] = useState('');
  const [targetStatus, setTargetStatus] = useState('in_progress');
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [processing, setProcessing] = useState(false);

  const loadData = async () => {
    try {
      const [issueList, cleanerList] = await Promise.all([
        getAllIssues(),
        getAllUsers({ role: 'cleaner' }),
      ]);
      setIssues(issueList || []);
      setCleaners(cleanerList || []);
      setSelectedIds([]);
    } catch (err) {
      console.error('Error loading bulk issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleSelectAll = () => {
    if (selectedIds.length === issues.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(issues.map((i) => i.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkAssign = async () => {
    if (!targetCleaner || selectedIds.length === 0) {
      toast.warning('Select issues and a cleaner to assign.');
      return;
    }
    setProcessing(true);
    try {
      await bulkAssignIssues(selectedIds, targetCleaner, user.id, {
        id: user.id,
        role: profile?.role || 'admin',
      });
      toast.success(`${selectedIds.length} tickets assigned successfully.`);
      loadData();
    } catch (err) {
      console.error('Bulk assign failed:', err);
      toast.error('Bulk assignment failed.');
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkStatusChange = async () => {
    if (selectedIds.length === 0) {
      toast.warning('Select at least one issue.');
      return;
    }
    setProcessing(true);
    try {
      await bulkUpdateStatus(selectedIds, targetStatus, user.id, {
        id: user.id,
        role: profile?.role || 'admin',
      });
      toast.success(`Updated status to ${targetStatus} for ${selectedIds.length} issues.`);
      loadData();
    } catch (err) {
      console.error('Bulk status update failed:', err);
      toast.error('Bulk status update failed.');
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    setProcessing(true);
    try {
      for (const id of selectedIds) {
        await adminDeleteIssue(id, user.id, {
          id: user.id,
          role: profile?.role || 'admin',
        });
      }
      toast.success(`Deleted ${selectedIds.length} issues.`);
      setIsBulkDeleting(false);
      loadData();
    } catch (err) {
      console.error('Bulk delete failed:', err);
      toast.error('Failed to complete all deletions.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text">
            Bulk Issue Operations
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Batch reassign sanitation tickets, bulk-update progress states, or prune records.
          </p>
        </div>

        {/* Bulk Action Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-semibold hover:bg-stone-50 flex items-center gap-2"
            >
              {selectedIds.length === issues.length && issues.length > 0 ? (
                <CheckSquare size={16} className="text-primary" />
              ) : (
                <Square size={16} className="text-stone-400" />
              )}
              Select All ({selectedIds.length} / {issues.length})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Assign */}
            <div className="flex items-center gap-1.5">
              <select
                value={targetCleaner}
                onChange={(e) => setTargetCleaner(e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-300 bg-white"
              >
                <option value="">Select Cleaner</option>
                {cleaners.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name || c.email}
                  </option>
                ))}
              </select>
              <button
                onClick={handleBulkAssign}
                disabled={processing || selectedIds.length === 0 || !targetCleaner}
                className="px-3.5 py-2 bg-primary hover:bg-primaryDark text-white font-semibold rounded-xl shadow disabled:opacity-50"
              >
                Assign
              </button>
            </div>

            {/* Status Update */}
            <div className="flex items-center gap-1.5">
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-300 bg-white"
              >
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
                <option value="pending">Pending</option>
              </select>
              <button
                onClick={handleBulkStatusChange}
                disabled={processing || selectedIds.length === 0}
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-900 text-white font-semibold rounded-xl shadow disabled:opacity-50"
              >
                Set Status
              </button>
            </div>

            {/* Delete */}
            <button
              onClick={() => setIsBulkDeleting(true)}
              disabled={processing || selectedIds.length === 0}
              className="px-3.5 py-2 bg-rose-50 text-danger border border-rose-200 hover:bg-rose-100 font-semibold rounded-xl disabled:opacity-50 flex items-center gap-1"
            >
              <Trash2 size={14} /> Delete Selected
            </button>
          </div>
        </div>

        {/* Table of issues */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <LoadingSpinner message="Loading batch tickets..." />
            </div>
          ) : issues.length === 0 ? (
            <div className="p-12 text-center text-muted text-sm">No issues found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200">
                    <th className="p-3.5 w-10 text-center">Select</th>
                    <th className="p-3.5 font-semibold text-stone-700">Floor & Room</th>
                    <th className="p-3.5 font-semibold text-stone-700">Description</th>
                    <th className="p-3.5 font-semibold text-stone-700">Status</th>
                    <th className="p-3.5 font-semibold text-stone-700">Priority</th>
                    <th className="p-3.5 font-semibold text-stone-700">Assignee</th>
                    <th className="p-3.5 font-semibold text-stone-700">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {issues.map((i) => {
                    const isSelected = selectedIds.includes(i.id);
                    return (
                      <tr
                        key={i.id}
                        onClick={() => toggleSelectOne(i.id)}
                        className={`cursor-pointer transition ${
                          isSelected ? 'bg-amber-50/60' : 'hover:bg-stone-50'
                        }`}
                      >
                        <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(i.id)}
                            className="rounded text-primary focus:ring-primary"
                          />
                        </td>
                        <td className="p-3.5 font-medium text-stone-900 whitespace-nowrap">
                          Floor {i.floor_code} {i.room ? `(${i.room})` : ''}
                        </td>
                        <td className="p-3.5 text-stone-600 max-w-xs truncate">
                          {i.description || 'No description'}
                        </td>
                        <td className="p-3.5">
                          <StatusChip status={i.status} />
                        </td>
                        <td className="p-3.5 uppercase font-bold text-[10px]">
                          {i.priority}
                        </td>
                        <td className="p-3.5 text-stone-600">
                          {i.assignee?.full_name || 'Unassigned'}
                        </td>
                        <td className="p-3.5 text-stone-400 whitespace-nowrap">
                          {new Date(i.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <ConfirmDialog
          isOpen={isBulkDeleting}
          title="Delete Selected Issues?"
          message={`Are you sure you want to permanently delete ${selectedIds.length} issues?`}
          confirmText="Yes, Delete All"
          onCancel={() => setIsBulkDeleting(false)}
          onConfirm={handleBulkDelete}
          loading={processing}
        />
      </main>

      <Footer />
    </div>
  );
}
