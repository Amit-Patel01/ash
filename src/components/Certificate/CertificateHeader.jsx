import React from 'react'
import msmeBadgeDefault from '../../assets/msme.png'
import brandLogoDefault from '../../assets/brand-logo.png'
import { AICTE_LOGO_SRC } from './certificateConstants'
import { hexToRgba } from '../../utils/certificateTemplate'
import { renderSpacedWords } from './DetailChip'

export default function CertificateHeader({
  type = 'standard',
  brandLogo = brandLogoDefault,
  msmeLogo = msmeBadgeDefault,
  aicteLogo = AICTE_LOGO_SRC,
  navyColor = '#1e3a8a',
  greenColor = '#167044',
  accentColor = '#f59e0b',
  organizationName = 'Amit Solution Hub',
  referenceLabel = 'Certificate ID',
  certificateId }) {
  if (type === 'aicte') {
    return (
      <header className="grid shrink-0 grid-cols-3 items-center gap-[2.1cqw]">
        <div
          className="flex h-[clamp(58px,6.8cqw,88px)] items-center gap-[1cqw] border bg-white/[0.88] shadow-[0_8px_20px_rgba(15,23,42,0.06)]"
          style={{
            borderColor: hexToRgba(navyColor, 0.16),
            borderRadius: 'clamp(8px, 1cqw, 14px)',
            padding: 'clamp(7px, 0.85cqw, 12px) clamp(9px, 1.1cqw, 16px)' }}
        >
          <img
            src={aicteLogo}
            alt="AICTE logo"
            crossOrigin="anonymous"
            className="h-[clamp(40px,5.1cqw,68px)] shrink-0 object-contain"
          />
          <div className="min-w-0">
            <p
              className="font-black uppercase leading-tight"
              style={{ color: navyColor, fontSize: 'clamp(8px, 1cqw, 13px)' }}
            >
              {renderSpacedWords('AICTE Approved')}
            </p>
            <p
              className="mt-0.5 font-bold uppercase text-slate-500"
              style={{ fontSize: 'clamp(6.5px, 0.72cqw, 10px)', letterSpacing: 0 }}
            >
              Internship Program
            </p>
          </div>
        </div>

        <div className="flex h-[clamp(58px,6.8cqw,88px)] flex-col items-center justify-center text-center">
          <img
            src={brandLogo}
            alt={organizationName}
            crossOrigin="anonymous"
            className="h-[clamp(38px,4.9cqw,68px)] w-auto object-contain"
          />
          <p
            className="mt-[0.4cqw] font-black uppercase"
            style={{ color: navyColor, fontSize: 'clamp(10px, 1.25cqw, 17px)', letterSpacing: 0 }}
          >
            {renderSpacedWords(organizationName)}
          </p>
        </div>

        <div
          className="flex h-[clamp(58px,6.8cqw,88px)] items-center justify-end gap-[1cqw] border bg-white/[0.88] text-right shadow-[0_8px_20px_rgba(15,23,42,0.06)]"
          style={{
            borderColor: hexToRgba(greenColor, 0.18),
            borderRadius: 'clamp(8px, 1cqw, 14px)',
            padding: 'clamp(7px, 0.85cqw, 12px) clamp(9px, 1.1cqw, 16px)' }}
        >
          <div>
            <p
              className="font-black uppercase leading-tight"
              style={{ color: greenColor, fontSize: 'clamp(8px, 1cqw, 13px)' }}
            >
              MSME
            </p>
            <p
              className="mt-0.5 font-bold uppercase text-slate-500"
              style={{ fontSize: 'clamp(6.5px, 0.72cqw, 10px)', letterSpacing: 0 }}
            >
              Registered
            </p>
          </div>
          <img
            src={msmeLogo}
            alt="MSME logo"
            crossOrigin="anonymous"
            className="h-[clamp(40px,5.1cqw,68px)] shrink-0 object-contain"
          />
        </div>
      </header>
    )
  }

  // Standard Header
  return (
    <header className="grid grid-cols-3 items-start shrink-0">
      <div className="flex justify-start">
        <img src={msmeLogo} alt="MSME" crossOrigin="anonymous" className="h-[clamp(44px,5.4cqw,72px)] w-auto object-contain" />
      </div>

      <div className="flex justify-center">
        <img src={brandLogo} alt={organizationName} crossOrigin="anonymous" className="h-[clamp(42px,5.2cqw,76px)] w-auto object-contain" />
      </div>

      <div className="flex justify-end">
        <div
          className="border text-right shadow-sm"
          style={{
            borderColor: hexToRgba(accentColor, 0.15),
            background: `linear-gradient(180deg, rgba(255,255,255,0.95), ${hexToRgba(accentColor, 0.04)})`,
            borderRadius: 'clamp(12px, 1.5cqw, 32px)',
            padding: 'clamp(6px, 0.8cqw, 12px) clamp(10px, 1.2cqw, 20px)' }}
        >
          <p
            className="font-black uppercase tracking-[0.22em] text-slate-400"
            style={{ fontSize: 'clamp(6.5px, 0.7cqw, 10px)' }}
          >
            {renderSpacedWords(referenceLabel)}
          </p>
          <p
            className="mt-0.5 font-black"
            style={{ color: navyColor, fontSize: 'clamp(9px, 0.95cqw, 14px)' }}
          >
            {certificateId}
          </p>
        </div>
      </div>
    </header>
  )
}
