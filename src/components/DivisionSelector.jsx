import React, { useEffect, useState } from 'react';
import { getDivisions } from '../lib/api.js';

export default function DivisionSelector({
  floorCode,
  value,
  onChange,
  disabled = false,
  required = false,
  className = '',
}) {
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!floorCode) {
      setDivisions([]);
      return;
    }

    setLoading(true);
    getDivisions({ floorCode, activeOnly: true })
      .then((data) => {
        if (mounted) setDivisions(data || []);
      })
      .catch((err) => {
        console.error('Failed to load divisions for floor:', err);
        if (mounted) setDivisions([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [floorCode]);

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || !floorCode || loading}
      required={required}
      className={`w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-text font-medium focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-stone-100 disabled:cursor-not-allowed transition ${className}`}
    >
      <option value="">
        {!floorCode ? 'Select a floor first' : loading ? 'Loading divisions...' : 'Select Division'}
      </option>
      {divisions.map((d) => (
        <option key={d.id} value={d.id}>
          {d.name} {d.frequency ? `(${d.frequency})` : ''}
        </option>
      ))}
    </select>
  );
}
