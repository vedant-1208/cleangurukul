import React from 'react';

export default function LoadingSpinner({ size = 'md', message = '' }) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-3">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full border-primary/20 border-t-primary animate-spin`}
      />
      {message && <p className="text-sm font-medium text-muted">{message}</p>}
    </div>
  );
}
