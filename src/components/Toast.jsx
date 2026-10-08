import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ id, type = 'info', message, onClose }) {
  const configs = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
    },
    error: {
      bg: 'bg-red-50 border-red-200 text-red-900',
      icon: <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />,
    },
  };

  const current = configs[type] || configs.info;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg max-w-sm w-full transition-all duration-300 transform translate-y-0 ${current.bg}`}
      role="alert"
    >
      {current.icon}
      <div className="flex-1 text-sm font-medium leading-relaxed">{message}</div>
      <button
        onClick={() => onClose(id)}
        className="text-stone-400 hover:text-stone-700 transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
