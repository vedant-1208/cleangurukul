import React, { useEffect, useState } from 'react';
import { getFloors } from '../lib/api.js';

export default function FloorSelector({ value, onChange, disabled = false, required = false, className = '' }) {
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback default floors if network fails
  const fallbackFloors = [
    { code: 'B2', label: 'Basement 2 (B2)' },
    { code: 'B1', label: 'Basement 1 (B1)' },
    ...Array.from({ length: 11 }, (_, i) => ({
      code: String(i + 1),
      label: `Floor ${i + 1}`,
    })),
  ];

  useEffect(() => {
    let mounted = true;
    getFloors()
      .then((data) => {
        if (mounted && data && data.length > 0) {
          setFloors(data);
        } else if (mounted) {
          setFloors(fallbackFloors);
        }
      })
      .catch(() => {
        if (mounted) setFloors(fallbackFloors);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || loading}
      required={required}
      className={`w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-text font-medium focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-stone-100 disabled:cursor-not-allowed transition ${className}`}
    >
      <option value="">Select Floor / Zone</option>
      {floors.map((f) => (
        <option key={f.code} value={f.code}>
          {f.label}
        </option>
      ))}
    </select>
  );
}
