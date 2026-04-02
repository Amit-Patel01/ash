import React from 'react'

const Sparkline = ({ points = [], color = '#22c55e', height = 30, width = 100 }) => {
  if (points.length === 0) {
    // Generate some random points if none provided
    points = Array.from({ length: 15 }, (_, i) => ({
      x: (width / 14) * i,
      y: height * (0.2 + Math.random() * 0.6)
    }))
  }

  const d = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`
  }, '')

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]"
      />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="2.5" fill={color} />
    </svg>
  )
}

export default Sparkline
