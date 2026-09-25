import React from 'react'
import { hexToRgba } from '../../utils/certificateTemplate'
import { renderSpacedWords } from './DetailChip'
import { textSafeStyle } from './certificateStyles'
import { SIGNATURE_SIZES } from './certificateConstants'

export default function CertificateFooter({
  type = 'standard', // 'standard' | 'aicte' | 'mentor'
  mentorName,
  mentorRole,
  mentorSignatureUrl,
  ceoName,
  ceoRole,
  ceoSignatureUrl,
  stampImageUrl,
  issueDate,
  issuerName,
  issuerRole,
  organizationName = 'Ashnexa Systems',
  supportEmail = 'support@Ashnexa Systems.com',
  navyColor = '#1e3a8a',
}) {
  const isMentorMode = type === 'mentor' || Boolean(mentorSignatureUrl) || Boolean(mentorName)

  /* ── Shared visual tokens (purely presentational, derived from navyColor prop) ── */
  const dividerStrong = hexToRgba(navyColor, 0.22)
  const dividerSoft = hexToRgba(navyColor, 0.14)
  const labelColor = hexToRgba(navyColor, 0.5)
  const nameStyle = { color: '#1F2937', ...textSafeStyle }
  const roleStyle = { color: labelColor, letterSpacing: '0.12em', ...textSafeStyle }
  const dateStyle = { color: '#1F2937', ...textSafeStyle }

  if (isMentorMode) {
    return (
      <footer className="mt-[3.5cqw] grid grid-cols-3 items-end shrink-0 w-full">
        {/* Left: Mentor Signature */}
        <div className="flex flex-col items-start text-left">
          {issueDate && (
            <div className="flex h-[3cqw] items-end mb-[1cqw]">
              <p
                className="font-bold"
                style={{ fontSize: 'clamp(11px, 1.5cqw, 20px)', ...dateStyle }}
              >
                {issueDate}
              </p>
            </div>
          )}
          <div className="flex items-end" style={{ height: SIGNATURE_SIZES.mentor.height }}>
            {mentorSignatureUrl && (
              <img
                src={mentorSignatureUrl}
                alt={mentorName || 'Mentor Signature'}
                crossOrigin="anonymous"
                className="mix-blend-multiply"
                style={{ height: '100%', width: SIGNATURE_SIZES.mentor.width, objectFit: 'contain' }}
              />
            )}
          </div>
          <div className="mt-[0.6cqw] h-px w-full" style={{ background: dividerSoft }} />
          <p
            className="mt-[0.8cqw] font-semibold"
            style={{ fontSize: 'clamp(10px, 1cqw, 14px)', ...nameStyle }}
          >
            {mentorName}
          </p>
          <p
            className="mt-0.5 font-bold uppercase"
            style={{ fontSize: 'clamp(7px, 0.65cqw, 9px)', ...roleStyle }}
          >
            {mentorRole || 'Technical Mentor'}
          </p>
        </div>

        {/* Center: Official Company Stamp */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-end justify-center" style={{ height: SIGNATURE_SIZES.ceo.height }}>
            {stampImageUrl && (
              <img
                src={stampImageUrl}
                alt="Official stamp"
                crossOrigin="anonymous"
                className="mix-blend-multiply brightness-[0.98] contrast-[1.05]"
                style={{ width: SIGNATURE_SIZES.stamp.width, height: SIGNATURE_SIZES.stamp.height, objectFit: 'contain', opacity: 0.92 }}
              />
            )}
          </div>
          <div className="mt-[0.6cqw] h-px w-full opacity-0" />
          <p
            className="mt-[0.8cqw] font-semibold"
            style={{ fontSize: 'clamp(10px, 1cqw, 14px)', ...nameStyle }}
          >
            &nbsp;
          </p>
          <p
            className="mt-0.5 font-bold uppercase"
            style={{ fontSize: 'clamp(7px, 0.65cqw, 9px)', ...roleStyle }}
          >
            &nbsp;
          </p>
        </div>

        {/* Right: CEO Signature */}
        <div className="flex flex-col items-end text-right">
          <div className="flex items-end justify-end" style={{ height: SIGNATURE_SIZES.ceo.height }}>
            {ceoSignatureUrl && (
              <img
                src={ceoSignatureUrl}
                alt={ceoName || 'CEO Signature'}
                crossOrigin="anonymous"
                className="mix-blend-multiply"
                style={{ height: '100%', width: SIGNATURE_SIZES.ceo.width, objectFit: 'contain' }}
              />
            )}
          </div>
          <div className="mt-[0.6cqw] h-px w-full" style={{ background: dividerSoft }} />
          <p
            className="mt-[0.8cqw] font-semibold"
            style={{ fontSize: 'clamp(10px, 1cqw, 14px)', ...nameStyle }}
          >
            {ceoName}
          </p>
          <p
            className="mt-0.5 font-bold uppercase"
            style={{ fontSize: 'clamp(7px, 0.65cqw, 9px)', ...roleStyle }}
          >
            {ceoRole || 'Founder & CEO'}
          </p>
        </div>
      </footer>
    )
  }

  if (type === 'aicte') {
    return (
      <footer className="mt-[2cqw] grid shrink-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] items-start gap-[2.2cqw]">
        <div className="flex flex-col text-left">
          <div className="flex h-[5.8cqw] items-end">
            <p
              className="font-bold"
              style={{ fontSize: 'clamp(12px, 1.5cqw, 20px)', ...dateStyle }}
            >
              {issueDate}
            </p>
          </div>
          <div className="mt-[0.55cqw] h-px w-full" style={{ backgroundColor: dividerStrong }} />
          <p
            className="mt-[0.65cqw] font-black uppercase"
            style={{ fontSize: 'clamp(7px, 0.75cqw, 10px)', ...roleStyle }}
          >
            {renderSpacedWords('Date of Issue')}
          </p>
        </div>

        <div className="flex flex-col text-center">
          <div className="flex h-[5.8cqw] flex-col items-center justify-end">
            <p
              className="font-semibold"
              style={{ color: navyColor, fontSize: 'clamp(10px, 1.2cqw, 16px)', letterSpacing: '0.02em', ...textSafeStyle }}
            >
              {renderSpacedWords(organizationName)}
            </p>
            <p
              className="mt-[0.35cqw] font-bold uppercase"
              style={{ fontSize: 'clamp(7px, 0.7cqw, 10px)', ...roleStyle }}
            >
              {renderSpacedWords('Authorized Training Partner')}
            </p>
          </div>
          <div className="mt-[0.55cqw] h-px w-full" style={{ backgroundColor: dividerSoft }} />
          <div className="mt-[0.65cqw] space-y-[0.2cqw]">
            <p className="font-semibold" style={{ fontSize: 'clamp(7.5px, 0.82cqw, 11px)', letterSpacing: 0, overflowWrap: 'anywhere', color: hexToRgba(navyColor, 0.65) }}>
              www.ashnexasystems.com
            </p>
            <p className="font-semibold" style={{ fontSize: 'clamp(7.5px, 0.82cqw, 11px)', letterSpacing: 0, overflowWrap: 'anywhere', color: hexToRgba(navyColor, 0.65) }}>
              {supportEmail}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end text-right">
          <div className="relative flex h-[5.8cqw] w-full items-end justify-end overflow-visible">
            {stampImageUrl && (
              <img
                src={stampImageUrl}
                alt="Official stamp"
                crossOrigin="anonymous"
                className="absolute bottom-[-0.1cqw] right-[43%] h-[clamp(46px,5.8cqw,82px)] w-auto object-contain opacity-85 mix-blend-multiply"
                style={{ transform: 'rotate(-12deg)', transformOrigin: 'center' }}
              />
            )}
            {ceoSignatureUrl ? (
              <img
                src={ceoSignatureUrl}
                alt={ceoName}
                crossOrigin="anonymous"
                className="relative z-10 max-h-[66%] w-auto object-contain mix-blend-multiply drop-shadow-[0_4px_8px_rgba(15,23,42,0.08)]"
              />
            ) : null}
          </div>
          <div className="mt-[0.55cqw] h-px w-full" style={{ backgroundColor: dividerStrong }} />
          <p
            className="mt-[0.65cqw] font-semibold"
            style={{ fontSize: 'clamp(10px, 1cqw, 14px)', ...nameStyle }}
          >
            {renderSpacedWords(ceoName)}
          </p>
          <p
            className="mt-0.5 font-bold uppercase"
            style={{ fontSize: 'clamp(7px, 0.65cqw, 9px)', ...roleStyle }}
          >
            {renderSpacedWords(ceoRole)}
          </p>
        </div>
      </footer>
    )
  }

  // Standard Footer
  return (
    <footer className="mt-[3.5cqw] grid grid-cols-3 items-end shrink-0 w-full">
      <div className="flex flex-col items-start text-left">
        <div className="flex h-[6cqw] items-end">
          <p
            className="font-bold"
            style={{ fontSize: 'clamp(14px, 2cqw, 24px)', ...dateStyle }}
          >
            {issueDate}
          </p>
        </div>
        <div className="mt-[0.6cqw] h-px w-full" style={{ background: dividerSoft }} />
        <p
          className="mt-[0.8cqw] font-black uppercase"
          style={{ fontSize: 'clamp(7px, 0.75cqw, 10px)', ...roleStyle }}
        >
          Date of Issue
        </p>
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="flex h-[6cqw] items-end justify-center">
          {stampImageUrl && (
            <img
              src={stampImageUrl}
              alt="Official stamp"
              crossOrigin="anonymous"
              className="max-h-full w-auto object-contain mix-blend-multiply brightness-[0.98] contrast-[1.05]"
              style={{ opacity: 0.92 }}
            />
          )}
        </div>
        <div className="mt-[0.6cqw] h-px w-full opacity-0" />
        <p
          className="mt-[0.8cqw] font-semibold"
          style={{ fontSize: 'clamp(10px, 1cqw, 14px)', ...nameStyle }}
        >
          {issuerName || ceoName}
        </p>
        <p
          className="mt-0.5 font-bold uppercase"
          style={{ fontSize: 'clamp(7px, 0.65cqw, 9px)', ...roleStyle }}
        >
          {issuerRole || 'Founder & Director'}
        </p>
      </div>

      <div className="flex flex-col items-end text-right">
        <div className="flex h-[6cqw] items-end justify-end">
          {ceoSignatureUrl && (
            <img
              src={ceoSignatureUrl}
              alt={ceoName}
              crossOrigin="anonymous"
              className="max-h-full w-auto object-contain mix-blend-multiply"
            />
          )}
        </div>
        <div className="mt-[0.6cqw] h-px w-full" style={{ background: dividerSoft }} />
        <p
          className="mt-[0.8cqw] font-semibold"
          style={{ fontSize: 'clamp(10px, 1cqw, 14px)', ...nameStyle }}
        >
          {ceoName}
        </p>
        <p
          className="mt-0.5 font-bold uppercase"
          style={{ fontSize: 'clamp(7px, 0.65cqw, 9px)', ...roleStyle }}
        >
          {ceoRole}
        </p>
      </div>
    </footer>
  )
}