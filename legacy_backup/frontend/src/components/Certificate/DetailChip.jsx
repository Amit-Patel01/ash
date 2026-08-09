import React from 'react'
import { normalizeDisplayText } from './CertificateNarrative'

export const renderSpacedWords = (text) => {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean)
  return words.map((word, index) => (
    <span
      key={`${word}-${index}`}
      style={{
        display: 'inline-block',
        paddingRight: index === words.length - 1 ? 0 : '0.24em',
        whiteSpace: 'nowrap',
      }}
    >
      {word}
    </span>
  ))
}

/** NPTEL-style detail chip with gold top border */
export default function DetailChip({ label, value, accentColor = '#b8912a' }) {
  if (!value) return null
  return (
    <div
      style={{
        borderTop: `2px solid ${accentColor}`,
        paddingTop: 'clamp(4px, 0.5cqw, 7px)',
      }}
    >
      <p
        className="font-bold uppercase text-slate-400"
        style={{ fontSize: 'clamp(6px, 0.64cqw, 8.5px)', letterSpacing: '0.14em' }}
      >
        {renderSpacedWords(normalizeDisplayText(label))}
      </p>
      <p
        className="mt-0.5 font-semibold leading-tight text-slate-700"
        style={{ fontSize: 'clamp(8px, 0.9cqw, 12px)', overflowWrap: 'anywhere' }}
      >
        {renderSpacedWords(normalizeDisplayText(value))}
      </p>
    </div>
  )
}
