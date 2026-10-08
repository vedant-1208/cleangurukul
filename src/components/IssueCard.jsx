import React from 'react';
import StatusChip from './StatusChip.jsx';
import { MapPin, Clock, User, AlertCircle } from 'lucide-react';

export default function IssueCard({ issue, onClick }) {
  if (!issue) return null;

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-stone-200 hover:border-primary/40 shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden flex flex-col group"
    >
      <div className="relative aspect-video w-full bg-stone-100 overflow-hidden">
        {issue.photo_url ? (
          <img
            src={issue.photo_url}
            alt="Issue photo"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400">
            No Photo
          </div>
        )}
        <div className="absolute top-2.5 right-2.5">
          <StatusChip status={issue.status} />
        </div>
        {issue.priority === 'urgent' && (
          <div className="absolute top-2.5 left-2.5 bg-danger text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 shadow">
            <AlertCircle size={12} /> Urgent
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted mb-1">
            <MapPin size={13} className="text-primary flex-shrink-0" />
            <span className="font-semibold text-stone-700">Floor {issue.floor_code}</span>
            {issue.divisions?.name && (
              <>
                <span>&bull;</span>
                <span className="truncate">{issue.divisions.name}</span>
              </>
            )}
            {issue.room && <span>({issue.room})</span>}
          </div>

          <p className="text-sm text-text font-medium line-clamp-2 mb-3">
            {issue.description || 'No description provided'}
          </p>
        </div>

        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{timeAgo(issue.created_at)}</span>
          </div>
          {issue.assignee?.full_name ? (
            <div className="flex items-center gap-1 text-sky-700 font-medium truncate max-w-[120px]">
              <User size={12} />
              <span className="truncate">{issue.assignee.full_name}</span>
            </div>
          ) : (
            <span className="text-stone-400 italic">Unassigned</span>
          )}
        </div>
      </div>
    </div>
  );
}
