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
  organizationName = 'Amit Solution Hub',
  supportEmail = 'support@amitsolutionhub.com',
  navyColor = '#1e3a8a',
}) {
  const isMentorMode = type === 'mentor' || mentorSignatureUrl || mentorName

  if (isMentorMode) {
    return (
      <footer className="mt-[3.5cqw] grid grid-cols-3 items-end shrink-0 w-full">
        {/* Left: Mentor Signature */}
        <div className="flex flex-col items-start text-left">
          {issueDate && (
            <div className="flex h-[3cqw] items-end mb-[1cqw]">
              <p
                className="font-bold text-slate-800"
                style={{ fontSize: 'clamp(11px, 1.5cqw, 20px)', ...textSafeStyle }}
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
                style={{ height: '100%', width: SIGNATURE_SIZES.mentor.width, objectFit: 'contain' }}
              />
            )}
          </div>
          <div className="mt-[0.6cqw] h-px w-full bg-slate-200" />
          <p
            className="mt-[0.8cqw] font-semibold text-slate-800"
            style={{ fontSize: 'clamp(10px, 1cqw, 14px)', ...textSafeStyle }}
          >
            {mentorName}
          </p>
          <p
            className="mt-0.5 font-bold uppercase tracking-[0.1cqw] text-slate-400"
            style={{ fontSize: 'clamp(7px, 0.65cqw, 9px)', ...textSafeStyle }}
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
                className="brightness-[0.98] contrast-[1.05]"
                style={{ width: SIGNATURE_SIZES.stamp.width, height: SIGNATURE_SIZES.stamp.height, objectFit: 'contain' }}
              />
            )}
          </div>
          <div className="mt-[0.6cqw] h-px w-full opacity-0" />
          <p
            className="mt-[0.8cqw] font-semibold text-slate-800"
            style={{ fontSize: 'clamp(10px, 1cqw, 14px)', ...textSafeStyle }}
          >
            &nbsp;
          </p>
          <p
            className="mt-0.5 font-bold uppercase tracking-[0.1cqw] text-slate-400"
            style={{ fontSize: 'clamp(7px, 0.65cqw, 9px)', ...textSafeStyle }}
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
                style={{ height: '100%', width: SIGNATURE_SIZES.ceo.width, objectFit: 'contain' }}
              />
            )}
          </div>
          <div className="mt-[0.6cqw] h-px w-full bg-slate-200" />
          <p
            className="mt-[0.8cqw] font-semibold text-slate-800"
            style={{ fontSize: 'clamp(10px, 1cqw, 14px)', ...textSafeStyle }}
          >
            {ceoName}
          </p>
          <p
            className="mt-0.5 font-bold uppercase tracking-[0.1cqw] text-slate-400"
            style={{ fontSize: 'clamp(7px, 0.65cqw, 9px)', ...textSafeStyle }}
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
              className="font-bold text-slate-800"
              style={{ fontSize: 'clamp(12px, 1.5cqw, 20px)', ...textSafeStyle }}
            >
              {issueDate}
            </p>
          </div>
          <div className="mt-[0.55cqw] h-px w-full" style={{ backgroundColor: hexToRgba(navyColor, 0.18) }} />
          <p
            className="mt-[0.65cqw] font-black uppercase text-slate-400"
            style={{ fontSize: 'clamp(7px, 0.75cqw, 10px)', ...textSafeStyle }}
          >
            {renderSpacedWords('Date of Issue')}
          </p>
        </div>

        <div className="flex flex-col text-center">
          <div className="flex h-[5.8cqw] flex-col items-center justify-end">
            <p
              className="font-semibold"
              style={{ color: navyColor, fontSize: 'clamp(10px, 1.2cqw, 16px)', ...textSafeStyle }}
            >
              {renderSpacedWords(organizationName)}
            </p>
            <p
              className="mt-[0.35cqw] font-bold uppercase text-slate-400"
              style={{ fontSize: 'clamp(7px, 0.7cqw, 10px)', ...textSafeStyle }}
            >
              {renderSpacedWords('Authorized Training Partner')}
            </p>
          </div>
          <div className="mt-[0.55cqw] h-px w-full" style={{ backgroundColor: hexToRgba(navyColor, 0.12) }} />
          <div className="mt-[0.65cqw] space-y-[0.2cqw] text-slate-500">
            <p className="font-semibold" style={{ fontSize: 'clamp(7.5px, 0.82cqw, 11px)', letterSpacing: 0, overflowWrap: 'anywhere' }}>
              www.amitsolutionhub.com
            </p>
            <p className="font-semibold" style={{ fontSize: 'clamp(7.5px, 0.82cqw, 11px)', letterSpacing: 0, overflowWrap: 'anywhere' }}>
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
          <div className="mt-[0.55cqw] h-px w-full" style={{ backgroundColor: hexToRgba(navyColor, 0.18) }} />
          <p
            className="mt-[0.65cqw] font-semibold text-slate-800"
            style={{ fontSize: 'clamp(10px, 1cqw, 14px)', ...textSafeStyle }}
          >
            {renderSpacedWords(ceoName)}
          </p>
          <p
            className="mt-0.5 font-bold uppercase text-slate-400"
            style={{ fontSize: 'clamp(7px, 0.65cqw, 9px)', ...textSafeStyle }}
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
            className="font-bold text-slate-800"
            style={{ fontSize: 'clamp(14px, 2cqw, 24px)', ...textSafeStyle }}
          >
            {issueDate}
          </p>
        </div>
        <div className="mt-[0.6cqw] h-px w-full bg-slate-200" />
        <p
          className="mt-[0.8cqw] font-black uppercase tracking-[0.2cqw] text-slate-400"
          style={{ fontSize: 'clamp(7px, 0.75cqw, 10px)', ...textSafeStyle }}
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
              className="max-h-full w-auto object-contain brightness-[0.98] contrast-[1.05]"
            />
          )}
        </div>
        <div className="mt-[0.6cqw] h-px w-full opacity-0" />
        <p
          className="mt-[0.8cqw] font-semibold text-slate-800"
          style={{ fontSize: 'clamp(10px, 1cqw, 14px)', ...textSafeStyle }}
        >
          {issuerName || ceoName}
        </p>
        <p
          className="mt-0.5 font-bold uppercase tracking-[0.1cqw] text-slate-400"
          style={{ fontSize: 'clamp(7px, 0.65cqw, 9px)', ...textSafeStyle }}
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
              className="max-h-full w-auto object-contain"
            />
          )}
        </div>
        <div className="mt-[0.6cqw] h-px w-full bg-slate-200" />
        <p
          className="mt-[0.8cqw] font-semibold text-slate-800"
          style={{ fontSize: 'clamp(10px, 1cqw, 14px)', ...textSafeStyle }}
        >
          {ceoName}
        </p>
        <p
          className="mt-0.5 font-bold uppercase tracking-[0.1cqw] text-slate-400"
          style={{ fontSize: 'clamp(7px, 0.65cqw, 9px)', ...textSafeStyle }}
        >
          {ceoRole}
        </p>
      </div>
    </footer>
  )
}
