import React from 'react'
import msmeBadge from '../../assets/msme.png'
import brandLogo from '../../assets/brand-logo.png'
import founderSign from '../../assets/founder-sign.png'
import mentorSign from '../../assets/mentor-sign.png'
import stempImage from './Stemp.png'
import {
  formatCertificateDate,
  getCertificateHolderName,
  normalizeCertificateAssetUrl } from '../../utils/certificateHelpers'

const NAVY  = '#1a3564'
const GOLD  = '#b8912a'
const LIGHT = '#FFFEF8'

export default function OfferLetterDocument({ certificate, template, className = '' }) {
  /* ── Data (unchanged) ── */
  const holderName   = getCertificateHolderName(certificate)
  const certId       = certificate?.certificate_id || 'PENDING-ID'
  const issueDate    = formatCertificateDate(certificate?.approval_date || certificate?.createdAt || certificate?.date)
  const sigName      = certificate?.signatoryName  || template?.signatureName  || certificate?.issuedByName  || 'Amit Patel'
  const sigRole      = certificate?.signatoryRole  || template?.signatureRole  || certificate?.issuedByRole  || 'Program Coordinator'
  const sigImg       = normalizeCertificateAssetUrl(certificate?.signatureImageUrl) || founderSign
  const stampImg     = normalizeCertificateAssetUrl(certificate?.stampImageUrl)     || stempImage
  const domain       = certificate?.customTitle    || certificate?.courseName   || 'Web Development'
  const duration     = certificate?.duration       || '1 month'

  /* Body paragraphs (unchanged) */
  const bodyParas = certificate?.certificateText
    ? certificate.certificateText.split('\n').map(p => p.trim()).filter(Boolean)
    : [
        `We are delighted to welcome you for the internship in <strong>${domain}</strong> at our organization. This internship is observed by <strong>Amit Solution Hub</strong> as a learning opportunity for you, spanning a duration of <strong>${duration}</strong>.`,
        `Your internship will embrace orientation and give emphasis on learning new skills with a deeper understanding of concepts through hands-on application. Our team is confident that you will perform all work allocated to you to the best of your ability.`,
        `We look forward to a worthwhile and fruitful association which will make you equipped for future projects. Wishing you the most enjoyable and truly meaningful internship experience.`,
      ]

  /* ── Shared visual tokens (purely presentational) ── */
  const microLabel = { fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: `${NAVY}99` }
  const hairline = (opacity = 0.14) => ({ height: '1px', backgroundColor: `${NAVY}${Math.round(opacity * 255).toString(16).padStart(2, '0')}` })

  return (
    <div
      className={`relative isolate aspect-[1/1.414] w-full overflow-hidden ${className}`}
      style={{ containerType: 'inline-size', background: LIGHT }}
    >
      {/* ── Outer navy border ── */}
      <div className="absolute inset-0 pointer-events-none" style={{ border: `clamp(3px,0.55cqw,5px) solid ${NAVY}` }} />
      {/* ── Inner gold border ── */}
      <div className="absolute pointer-events-none" style={{ inset: 'clamp(5px,0.85cqw,9px)', border: `1px solid ${GOLD}55` }} />

      {/* ── Top accent bar (NPTEL-style navy header band) ── */}
      <div
        className="absolute left-0 right-0 top-0 pointer-events-none"
        style={{
          height: 'clamp(36px,7.5cqw,90px)',
          background: `linear-gradient(180deg, ${NAVY}, #142a52)`,
          boxShadow: `0 4px 14px ${NAVY}22` }}
      />

      {/* ── Watermark ── */}
      <img
        src={brandLogo}
        alt=""
        crossOrigin="anonymous"
        className="pointer-events-none absolute left-1/2 -translate-x-1/2"
        style={{ top: '42%', width: '38%', opacity: 0.04, filter: 'grayscale(1)' }}
      />

      {/* ── Content ── */}
      <div
        className="relative flex h-full flex-col"
        style={{ padding: 'clamp(10px,2cqw,26px) clamp(14px,3cqw,40px) clamp(10px,1.8cqw,24px)' }}
      >
        {/* ══ LETTERHEAD ══ */}
        <header
          className="grid grid-cols-[auto_1fr_auto] items-center shrink-0"
          style={{
            height: 'clamp(36px,7cqw,86px)',
            marginLeft: 'clamp(-14px,-3cqw,-40px)',
            marginRight: 'clamp(-14px,-3cqw,-40px)',
            padding: '0 clamp(14px,3cqw,40px)',
            marginTop: 'clamp(-10px,-2cqw,-26px)' }}
        >
          {/* Logo */}
          <img src={brandLogo} alt="Amit Solution Hub" crossOrigin="anonymous"
            style={{ height: 'clamp(24px,5cqw,60px)', width: 'auto', objectFit: 'contain', filter: 'brightness(10)' }} />

          {/* Org name */}
          <div className="px-[1.5cqw]">
            <p className="font-black uppercase text-white" style={{ fontSize: 'clamp(9px,1.6cqw,20px)', letterSpacing: '0.12em', fontFamily: 'Georgia, serif' }}>
              Amit Solution Hub
            </p>
            <p className="text-white/70 uppercase" style={{ fontSize: 'clamp(5.5px,0.88cqw,11px)', letterSpacing: '0.18em' }}>
              Technology · Innovation · Excellence
            </p>
          </div>

          {/* MSME badge */}
          <img src={msmeBadge} alt="MSME" crossOrigin="anonymous"
            style={{ height: 'clamp(22px,4.5cqw,54px)', width: 'auto', objectFit: 'contain', filter: 'brightness(10) saturate(0)' }} />
        </header>

        {/* ── Gold rule under header ── */}
        <div
          className="shrink-0"
          style={{
            height: 'clamp(2px,0.38cqw,5px)',
            background: `linear-gradient(90deg, ${GOLD}, ${GOLD}bb, ${GOLD})`,
            marginLeft: 'clamp(-14px,-3cqw,-40px)',
            marginRight: 'clamp(-14px,-3cqw,-40px)' }}
        />

        {/* ── Thin rule ── */}
        <div
          className="shrink-0"
          style={{
            ...hairline(0.13),
            marginLeft: 'clamp(-14px,-3cqw,-40px)',
            marginRight: 'clamp(-14px,-3cqw,-40px)',
            marginTop: 'clamp(1px,0.18cqw,2.5px)' }}
        />

        {/* ══ LETTER TITLE ══ */}
        <div className="mt-[2.5cqw] text-center shrink-0">
          <p style={{ ...microLabel, letterSpacing: '0.4em', fontSize: 'clamp(6px,0.8cqw,10px)' }}>
            Official Document
          </p>
          <h1
            className="font-bold uppercase mt-[0.4cqw]"
            style={{ color: NAVY, fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(14px,2.2cqw,28px)', letterSpacing: '0.1em' }}
          >
            Internship Offer Letter
          </h1>
          <div style={{ height: 'clamp(1.5px,0.2cqw,2.5px)', width: 'clamp(40px,8cqw,100px)', background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, margin: 'clamp(3px,0.5cqw,7px) auto 0' }} />
        </div>

        {/* ══ REF + DATE ══ */}
        <div className="mt-[2cqw] flex items-start justify-between shrink-0" style={{ fontSize: 'clamp(8px,1.2cqw,16px)' }}>
          <div>
            <p style={{ ...microLabel, fontSize: 'clamp(5.5px,0.72cqw,9px)' }}>Reference No.</p>
            <p className="font-mono font-semibold text-slate-700 mt-0.5">{certId}</p>
          </div>
          <div className="text-right">
            <p style={{ ...microLabel, fontSize: 'clamp(5.5px,0.72cqw,9px)' }}>Date</p>
            <p className="font-semibold text-slate-700 mt-0.5">{issueDate}</p>
          </div>
        </div>

        {/* ── Thin divider ── */}
        <div className="shrink-0 mt-[1.5cqw]" style={hairline(0.1)} />

        {/* ══ SALUTATION ══ */}
        <p className="mt-[2cqw] font-semibold text-slate-800 shrink-0" style={{ fontSize: 'clamp(9px,1.3cqw,17px)' }}>
          Dear <span style={{ color: NAVY, fontWeight: 700 }}>{holderName}</span>,
        </p>

        {/* ══ BODY ══ */}
        <div
          className="mt-[1.5cqw] flex-1 space-y-[1.5cqw] text-slate-800 font-medium leading-relaxed overflow-hidden"
          style={{ fontSize: 'clamp(9px,1.2cqw,15.5px)', textAlign: 'justify' }}
        >
          {bodyParas.map((para, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: para }} />
          ))}
        </div>

        {/* ── Gold rule before footer ── */}
        <div className="shrink-0 mt-[2cqw]" style={{ height: 'clamp(1.5px,0.22cqw,3px)', background: `linear-gradient(90deg, ${GOLD}88, ${GOLD}, ${GOLD}88)` }} />

        {/* ══ SIGNATURES ══ */}
        <footer className="mt-[1.5cqw] grid grid-cols-[1fr_auto] items-end gap-[2cqw] shrink-0">
          {/* Left: signatures (Mentor + CEO side-by-side) */}
          <div>
            <p className="text-slate-700 font-medium" style={{ fontSize: 'clamp(8.5px,1.2cqw,15.5px)' }}>Sincerely,</p>

            <div className="flex items-end gap-[4cqw] mt-[0.8cqw]">
              {/* Mentor Signature */}
              <div className="flex flex-col">
                <p className="font-bold text-slate-800" style={{ fontSize: 'clamp(8px,1.1cqw,14px)' }}>Program Mentor</p>
                <div className="mt-[1cqw] relative flex items-end" style={{ height: 'clamp(32px,5.5cqw,72px)' }}>
                  <img src={mentorSign} alt="Mentor" crossOrigin="anonymous"
                    className="mix-blend-multiply"
                    style={{ height: '100%', width: 'auto', objectFit: 'contain', maxWidth: 'clamp(50px,9cqw,130px)' }} />
                </div>
                <div style={{ ...hairline(0.16), marginTop: 'clamp(3px,0.5cqw,7px)' }} />
                <p className="mt-[0.4cqw] font-bold text-slate-900" style={{ fontSize: 'clamp(8px,1.1cqw,15px)' }}>Technical Lead</p>
              </div>

              {/* CEO Signature */}
              <div className="flex flex-col">
                <p className="font-bold text-slate-800" style={{ fontSize: 'clamp(8px,1.1cqw,14px)' }}>For Amit Solution Hub</p>
                <div className="mt-[1cqw] relative flex items-end" style={{ height: 'clamp(32px,5.5cqw,72px)' }}>
                  <img src={sigImg} alt={sigName} crossOrigin="anonymous"
                    className="mix-blend-multiply"
                    style={{ height: '100%', width: 'auto', objectFit: 'contain', maxWidth: 'clamp(60px,12cqw,160px)' }} />
                </div>
                <div style={{ ...hairline(0.16), marginTop: 'clamp(3px,0.5cqw,7px)' }} />
                <p className="mt-[0.4cqw] font-bold text-slate-900" style={{ fontSize: 'clamp(8px,1.1cqw,15px)' }}>{sigName}</p>
                <p style={{ ...microLabel, color: `${NAVY}cc`, fontSize: 'clamp(6px,0.78cqw,10px)' }}>{sigRole}</p>
                <p className="text-slate-500 mt-0.5" style={{ fontSize: 'clamp(6px,0.72cqw,9.5px)' }}>Mobile: +91-7874248481</p>
              </div>
            </div>
          </div>

          {/* Right: stamps */}
          <div className="flex flex-col items-end justify-end" style={{ gap: 'clamp(6px,1.2cqw,16px)' }}>
            <img src={stampImg} alt="Official seal" crossOrigin="anonymous"
              className="mix-blend-multiply"
              style={{ width: 'clamp(52px,11cqw,140px)', height: 'auto', objectFit: 'contain', opacity: 0.88 }} />
            <img src={msmeBadge} alt="MSME" crossOrigin="anonymous"
              style={{ width: 'clamp(40px,8cqw,100px)', height: 'auto', objectFit: 'contain' }} />
          </div>
        </footer>

        {/* ══ FOOTER BAR ══ */}
        <div
          className="shrink-0 mt-[1.5cqw]"
          style={{
            borderTop: `clamp(1.5px,0.2cqw,3px) solid ${NAVY}`,
            paddingTop: 'clamp(4px,0.65cqw,9px)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center' }}
        >
          <p className="font-semibold" style={{ fontSize: 'clamp(5.5px,0.72cqw,9.5px)', color: `${NAVY}88` }}>
            www.amitsolutionhub.com
          </p>
          <div style={{ width: 'clamp(14px,2cqw,26px)', height: 'clamp(1.5px,0.2cqw,2.5px)', backgroundColor: GOLD }} />
          <p className="font-semibold" style={{ fontSize: 'clamp(5.5px,0.72cqw,9.5px)', color: `${NAVY}88` }}>
            +91 7874248481
          </p>
          <div style={{ width: 'clamp(14px,2cqw,26px)', height: 'clamp(1.5px,0.2cqw,2.5px)', backgroundColor: GOLD }} />
          <p className="font-semibold" style={{ fontSize: 'clamp(5.5px,0.72cqw,9.5px)', color: `${NAVY}88` }}>
            support@amitsolutionhub.com
          </p>
        </div>
      </div>
    </div>
  )
}