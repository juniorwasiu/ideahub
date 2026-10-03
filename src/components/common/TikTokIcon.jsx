import React from 'react';

export function TikTokIcon({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.89 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.35 0 .69.06 1 .17V9.45a6.45 6.45 0 0 0-1-.08A6.33 6.33 0 0 0 3 15.67 6.33 6.33 0 0 0 9.33 22a6.33 6.33 0 0 0 6.34-6.33V8.86a8.28 8.28 0 0 0 4.92 1.6V7a4.81 4.81 0 0 1-1-.31z" />
    </svg>
  );
}
