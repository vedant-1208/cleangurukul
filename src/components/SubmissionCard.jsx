import React from 'react';
import StatusChip from './StatusChip.jsx';
import { Camera, Clock, CheckCircle2, ChevronRight, Eye } from 'lucide-react';

export default function SubmissionCard({
  submission,
  division,
  onAction,
  actionType = 'submit', // 'submit' | 'view'
}) {
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

  const name = division?.name || submission?.divisions?.name || 'Assigned Division';
  const floor = division?.floor_code || submission?.floor_code || '';
  const photo = submission?.photo_url;
  const status = submission?.status;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div className="relative aspect-video w-full bg-stone-100 flex items-center justify-center">
        {photo ? (
          <img
            src={photo}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-stone-400 p-4">
            <Camera className="w-8 h-8 mb-1 stroke-1" />
            <span className="text-xs">No proof uploaded yet</span>
          </div>
        )}

        {status && (
          <div className="absolute top-2.5 right-2.5">
            <StatusChip status={status} />
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-text text-base truncate">{name}</h4>
            {floor && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium">
                Floor {floor}
              </span>
            )}
          </div>
          {submission?.notes && (
            <p className="text-xs text-muted line-clamp-2 mt-1 italic">
              "{submission.notes}"
            </p>
          )}
          {submission?.review_remark && (
            <div className="mt-2 p-2 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-700">
              <span className="font-medium text-stone-900">Remark:</span> {submission.review_remark}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted">
            <Clock size={12} />
            <span>
              {submission?.created_at ? timeAgo(submission.created_at) : 'Not submitted today'}
            </span>
          </div>

          {actionType === 'submit' ? (
            <button
              onClick={() => onAction && onAction(division || submission)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-primaryDark text-white text-xs font-semibold shadow-sm transition"
            >
              <Camera size={13} />
              Submit Proof
            </button>
          ) : (
            <button
              onClick={() => onAction && onAction(submission)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium transition"
            >
              <Eye size={13} />
              View
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
