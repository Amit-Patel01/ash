import React from 'react'

const ROTATIONS = {
  'top-left': 0,
  'top-right': 90,
  'bottom-right': 180,
  'bottom-left': 270 }

const POSITIONS = {
  'top-left':     { top: 0, left: 0 },
  'top-right':    { top: 0, right: 0 },
  'bottom-left':  { bottom: 0, left: 0 },
  'bottom-right': { bottom: 0, right: 0 } }

export default function CornerAccent({ position = 'top-left', accentColor = '#b8912a', navyColor = '#1a3564' }) {
  const posStyle = POSITIONS[position] || POSITIONS['top-left']
  const rotation = ROTATIONS[position] ?? 0

  return (
    <div
      className="pointer-events-none absolute z-10"
      style={{
        ...posStyle,
        width: 'clamp(34px, 5cqw, 68px)',
        height: 'clamp(34px, 5cqw, 68px)',
        transform: `rotate(${rotation}deg)` }}
    >
      <svg
        viewBox="0 0 68 68"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Outer navy L-bracket */}
        <path d="M0 0 H52 V5 H5 V52 H0 Z" fill={navyColor} />
        {/* Inner gold L-bracket */}
        <path d="M7 7 H42 V10 H10 V42 H7 Z" fill={accentColor} />
        {/* Gold accent dot at corner */}
        <rect x="0" y="0" width="8" height="8" fill={accentColor} />
        {/* Decorative ticks along horizontal */}
        <rect x="20" y="1" width="4" height="3" rx="0.5" fill={accentColor} opacity="0.55" />
        <rect x="30" y="1" width="4" height="3" rx="0.5" fill={accentColor} opacity="0.35" />
        {/* Decorative ticks along vertical */}
        <rect x="1" y="20" width="3" height="4" rx="0.5" fill={accentColor} opacity="0.55" />
        <rect x="1" y="30" width="3" height="4" rx="0.5" fill={accentColor} opacity="0.35" />
        {/* Inner accent dot */}
        <circle cx="13" cy="13" r="2.5" fill={accentColor} opacity="0.6" />
      </svg>
    </div>
  )
}
