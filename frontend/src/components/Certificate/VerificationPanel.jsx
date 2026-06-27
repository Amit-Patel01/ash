import React from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { hexToRgba } from '../../utils/certificateTemplate'
import DetailChip, { renderSpacedWords } from './DetailChip'

export default function VerificationPanel({
  type = 'standard',
  certificateId,
  verifyUrl,
  statusLabel,
  accentColor,
  navyColor,
  greenColor,
  organizationName,
  supportEmail,
}) {
  if (type === 'aicte') {
    return (
      <aside
        className="flex min-h-0 flex-col border bg-white/[0.92] shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
        style={{
          borderColor: hexToRgba(greenColor || '#167044', 0.14),
          borderRadius: 'clamp(10px, 1.4cqw, 18px)',
          padding: 'clamp(14px, 1.7cqw, 24px)',
        }}
      >
        <div className="text-center">
          <p
            className="font-black uppercase text-slate-400"
            style={{ fontSize: 'clamp(8px, 0.9cqw, 12px)', letterSpacing: 0 }}
          >
            QR Verified
          </p>
          <div
            className="mx-auto mt-[1.05cqw] flex w-fit justify-center border bg-white p-[0.85cqw] shadow-[0_8px_18px_rgba(15,23,42,0.08)]"
            style={{ borderColor: hexToRgba(navyColor || '#102f64', 0.16), borderRadius: 'clamp(8px, 1cqw, 14px)' }}
          >
            <div style={{ width: 'clamp(70px, 9.2cqw, 122px)' }}>
              <QRCodeCanvas
                value={verifyUrl || certificateId}
                size={256}
                style={{ width: '100%', height: 'auto' }}
                level="M"
                includeMargin={false}
              />
            </div>
          </div>
        </div>

        <div className="mt-[1.4cqw] space-y-[0.8cqw]">
          <DetailChip label="Certificate ID" value={certificateId} accentColor={accentColor} />
          <DetailChip label="Status" value={statusLabel} accentColor={accentColor} />
        </div>

        <p
          className="mt-auto text-center text-slate-500"
          style={{ fontSize: 'clamp(7px, 0.78cqw, 10px)', lineHeight: 1.35 }}
        >
          {renderSpacedWords('Scan to validate online')}
        </p>
      </aside>
    )
  }

  // Standard Verification Panel
  return (
    <div
      className="flex min-h-0 flex-col justify-start border border-slate-100"
      style={{
        background: 'linear-gradient(180deg, rgba(248,250,252,0.98), rgba(255,255,255,0.98))',
        borderRadius: 'clamp(14px, 1.8cqw, 24px)',
        padding: 'clamp(14px, 1.8cqw, 26px)',
      }}
    >
      <div className="flex flex-col items-center justify-start">
        <p
          className="mb-[1.2cqw] font-black uppercase tracking-[0.2cqw] text-slate-400"
          style={{ fontSize: 'clamp(8px, 0.9cqw, 13px)' }}
        >
          Verification
        </p>
        <div
          className="flex justify-center border border-slate-200 bg-white p-[0.8cqw] shadow-sm"
          style={{ borderRadius: 'clamp(10px, 1.3cqw, 20px)' }}
        >
          <div style={{ width: 'clamp(64px, 9.5cqw, 128px)' }}>
            <QRCodeCanvas
              value={verifyUrl || certificateId}
              size={256}
              style={{ width: '100%', height: 'auto' }}
              level="M"
              includeMargin={false}
            />
          </div>
        </div>
        <p
          className="mt-[1.1cqw] text-center font-black uppercase tracking-[0.25cqw]"
          style={{ color: accentColor, fontSize: 'clamp(8px, 0.9cqw, 13px)' }}
        >
          Scan To Verify Online
        </p>
      </div>

      <div
        className="mt-auto border border-slate-200 bg-white shadow-sm"
        style={{
          padding: 'clamp(10px, 1.2cqw, 20px)',
          borderRadius: 'clamp(10px, 1.3cqw, 18px)',
        }}
      >
        <p
          className="font-black text-slate-400 uppercase tracking-widest"
          style={{ fontSize: 'clamp(6px, 0.65cqw, 9px)' }}
        >
          Issued Through
        </p>
        <p
          className="mt-1.5 font-semibold text-slate-800"
          style={{ fontSize: 'clamp(10px, 1.1cqw, 14px)' }}
        >
          {organizationName}
        </p>
        <p
          className="mt-0.5 text-slate-400"
          style={{ fontSize: 'clamp(8px, 0.85cqw, 11px)' }}
        >
          {supportEmail}
        </p>
      </div>
    </div>
  )
}
