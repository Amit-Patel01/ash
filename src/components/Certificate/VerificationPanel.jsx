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
  supportEmail }) {
  if (type === 'aicte') {
    const borderTint = hexToRgba(greenColor || '#167044', 0.16)
    const navyTint = navyColor || '#102f64'

    return (
      <aside
        className="flex min-h-0 flex-col border bg-white/[0.92] shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
        style={{
          borderColor: borderTint,
          borderTop: `2px solid ${hexToRgba(greenColor || '#167044', 0.55)}`,
          borderRadius: 'clamp(10px, 1.4cqw, 18px)',
          padding: 'clamp(14px, 1.7cqw, 24px)' }}
      >
        <div className="text-center">
          <p
            className="font-black uppercase text-slate-400"
            style={{ fontSize: 'clamp(8px, 0.9cqw, 12px)', letterSpacing: '0.14em' }}
          >
            QR Verified
          </p>
          <div
            className="mx-auto mt-[1.05cqw] flex w-fit justify-center border bg-white p-[0.85cqw] shadow-[0_8px_18px_rgba(15,23,42,0.08)]"
            style={{ borderColor: hexToRgba(navyTint, 0.16), borderRadius: 'clamp(8px, 1cqw, 14px)' }}
          >
            <div style={{ width: 'clamp(70px, 9.2cqw, 122px)' }}>
              <QRCodeCanvas
                value={verifyUrl || certificateId}
                size={256}
                fgColor={navyTint}
                style={{ width: '100%', height: 'auto' }}
                level="M"
                includeMargin={false}
              />
            </div>
          </div>
        </div>

        <div className="mt-[1.3cqw] h-px w-full" style={{ background: hexToRgba(navyTint, 0.1) }} />

        <div className="mt-[1.2cqw] space-y-[0.8cqw]">
          <DetailChip label="Certificate ID" value={certificateId} accentColor={accentColor} />
          <DetailChip label="Status" value={statusLabel} accentColor={accentColor} />
        </div>

        <p
          className="mt-auto pt-[1cqw] text-center text-slate-500"
          style={{ fontSize: 'clamp(7px, 0.78cqw, 10px)', lineHeight: 1.35, letterSpacing: '0.04em' }}
        >
          {renderSpacedWords('Scan to validate online')}
        </p>
      </aside>
    )
  }

  // Standard Verification Panel
  const navyTint = navyColor || '#1e3a8a'

  return (
    <div
      className="flex min-h-0 flex-col justify-start border"
      style={{
        background: 'linear-gradient(180deg, rgba(248,250,252,0.98), rgba(255,255,255,0.98))',
        borderColor: hexToRgba(navyTint, 0.1),
        borderTop: `2px solid ${hexToRgba(accentColor || navyTint, 0.55)}`,
        borderRadius: 'clamp(14px, 1.8cqw, 24px)',
        padding: 'clamp(14px, 1.8cqw, 26px)',
        boxShadow: `0 10px 22px ${hexToRgba(navyTint, 0.05)}` }}
    >
      <div className="flex flex-col items-center justify-start">
        <p
          className="mb-[1.2cqw] font-black uppercase text-slate-400"
          style={{ fontSize: 'clamp(8px, 0.9cqw, 13px)', letterSpacing: '0.18em' }}
        >
          Verification
        </p>
        <div
          className="flex justify-center border bg-white p-[0.8cqw] shadow-sm"
          style={{ borderColor: hexToRgba(navyTint, 0.14), borderRadius: 'clamp(10px, 1.3cqw, 20px)' }}
        >
          <div style={{ width: 'clamp(64px, 9.5cqw, 128px)' }}>
            <QRCodeCanvas
              value={verifyUrl || certificateId}
              size={256}
              fgColor={navyTint}
              style={{ width: '100%', height: 'auto' }}
              level="M"
              includeMargin={false}
            />
          </div>
        </div>
        <p
          className="mt-[1.1cqw] text-center font-black uppercase"
          style={{ color: accentColor, fontSize: 'clamp(8px, 0.9cqw, 13px)', letterSpacing: '0.2em' }}
        >
          Scan To Verify Online
        </p>
      </div>

      <div
        className="mt-auto border bg-white shadow-sm"
        style={{
          padding: 'clamp(10px, 1.2cqw, 20px)',
          borderColor: hexToRgba(navyTint, 0.1),
          borderRadius: 'clamp(10px, 1.3cqw, 18px)' }}
      >
        <p
          className="font-black text-slate-400 uppercase"
          style={{ fontSize: 'clamp(6px, 0.65cqw, 9px)', letterSpacing: '0.18em' }}
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