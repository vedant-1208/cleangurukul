import React from 'react';

export default function RoleBadge({ role }) {
  const normalized = (role || 'student').toLowerCase();

  const configs = {
    student: {
      label: 'Student',
      cls: 'bg-stone-100 text-stone-700 border-stone-300',
    },
    cleaner: {
      label: 'Cleaner',
      cls: 'bg-sky-100 text-sky-800 border-sky-300',
    },
    moderator: {
      label: 'Moderator',
      cls: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    admin: {
      label: 'Admin',
      cls: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    superadmin: {
      label: 'Superadmin',
      cls: 'bg-primaryDark text-amber-100 border-amber-900',
    },
  };

  const current = configs[normalized] || configs.student;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${current.cls}`}
    >
      {current.label}
    </span>
  );
}
