import React from 'react';

export default function StatusChip({ status }) {
  const normalized = (status || '').toLowerCase();

  const configs = {
    // Issue statuses
    pending: {
      label: 'Pending',
      cls: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    in_progress: {
      label: 'In Progress',
      cls: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    resolved: {
      label: 'Resolved',
      cls: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    rejected: {
      label: 'Rejected',
      cls: 'bg-rose-100 text-rose-800 border-rose-300',
    },

    // Cleaning Log statuses
    pending_review: {
      label: 'Pending Review',
      cls: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    approved: {
      label: 'Approved',
      cls: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    needs_redo: {
      label: 'Needs Redo',
      cls: 'bg-orange-100 text-orange-800 border-orange-300',
    },
  };

  const current = configs[normalized] || {
    label: status || 'Unknown',
    cls: 'bg-stone-100 text-stone-700 border-stone-300',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${current.cls}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {current.label}
    </span>
  );
}
