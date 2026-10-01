'use client';

import React from 'react';

const SIZES = {
  sm: 'w-7 h-7',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

const TONES = {
  blue: { dot: '#8b5cf6', ring: '#8b5cf6' },
  pink: { dot: '#22d3ee', ring: '#22d3ee' },
  warning: { dot: '#f59e0b', ring: '#f59e0b' },
  alert: { dot: '#f59e0b', ring: '#f59e0b' },
};

export default function MascotAvatar({ type = 'blue', size = 'md', className = '' }) {
  const tone = TONES[type] || TONES.blue;
  const box = SIZES[size] || SIZES.md;
  const isWarning = type === 'warning' || type === 'alert';
  return (
    <div className={`${box} flex-shrink-0 rounded-control bg-bg-2 border border-line flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 24 24" className="w-[60%] h-[60%]" aria-hidden="true">
        {isWarning ? (
          <>
            <circle cx="12" cy="12" r="9" fill="none" stroke={tone.ring} strokeWidth="2" />
            <rect x="11" y="6.5" width="2" height="7" rx="1" fill={tone.dot} />
            <circle cx="12" cy="16.5" r="1.3" fill={tone.dot} />
          </>
        ) : (
          <>
            <circle cx="7" cy="7" r="3.2" fill="#f4f4f6" />
            <circle cx="17" cy="7" r="3.2" fill={tone.dot} />
            <circle cx="7" cy="17" r="3.2" fill="#f4f4f6" opacity="0.55" />
            <circle cx="17" cy="17" r="3.2" fill="#f4f4f6" />
          </>
        )}
      </svg>
    </div>
  );
}
