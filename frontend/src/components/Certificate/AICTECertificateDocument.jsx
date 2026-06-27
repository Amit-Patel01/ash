import React from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { FileText, Calendar, CalendarDays, CalendarCheck, User, Calendar as CalendarIcon } from 'lucide-react'
import msmeBadge from '../../assets/msme.png'
import brandLogo from '../../assets/brand-logo.png'
import founderSign from '../../assets/founder-sign.png'
import mentorSign from '../../assets/mentor-sign.png'
import stempImage from './Stemp.png'
import { hexToRgba, mergeCertificateTemplate } from '../../utils/certificateTemplate'
import {
  normalizeCertificateAssetUrl,
  getCertificateHolderName,
  getCertificateVerifyUrl,
} from '../../utils/certificateHelpers'
import { AICTE_LOGO_SRC } from './certificateConstants'
import { formatAicteCertificateDate, resolveAicteCertificateId, normalizeDisplayText } from './CertificateNarrative'
import CornerAccent from './CornerAccent'

export default function AICTECertificateDocument({ certificate, template, className = '' }) {
  const activeTemplate = mergeCertificateTemplate(
    certificate?.templateSnapshot || template,
    certificate?.documentType || 'internship_certificate',
  )

  /* ── Data ── */
  const accentColor  = '#cba450' // Muted gold matching the image
  const navyColor    = '#16315c' // Deep navy matching the image
  const holderName   = getCertificateHolderName(certificate)
  const certId       = resolveAicteCertificateId(certificate?.certificate_id)
  const verifyUrl    = getCertificateVerifyUrl(certId)
  const issueDate    = formatAicteCertificateDate(certificate?.approval_date || certificate?.createdAt || certificate?.rawDate || certificate?.date)
  const sigName      = certificate?.signatoryName || activeTemplate.signatureName || 'Amit Patel'
  const sigImg       = normalizeCertificateAssetUrl(certificate?.signatureImageUrl) || founderSign
  const stampImg     = normalizeCertificateAssetUrl(certificate?.stampImageUrl)     || stempImage
  const orgName      = activeTemplate.organizationName || 'Amit Solution Hub'

  const nameFontSize =
    holderName.length > 28
      ? 'clamp(24px,3.5cqw,48px)'
      : holderName.length > 18
      ? 'clamp(32px,4.5cqw,64px)'
      : 'clamp(40px,5.5cqw,75px)'

  return (
    <div
      className={`relative isolate aspect-[1.414/1] w-full overflow-hidden ${className}`}
      style={{ containerType: 'inline-size', background: '#FFFEF8', fontFamily: '"Inter", sans-serif' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@1,600;1,700&display=swap');
      `}</style>
      
      {/* ── Outer Borders ── */}
      <div className="absolute inset-0 pointer-events-none z-50" style={{ border: `clamp(4px,0.5cqw,8px) solid ${navyColor}` }} />
      <div className="absolute inset-0 pointer-events-none z-50" style={{ margin: 'clamp(6px,0.8cqw,12px)', border: `clamp(1px,0.15cqw,2.5px) solid ${accentColor}` }} />

      {/* ── Corners (Gold decorations) ── */}
      <CornerAccent position="top-left" accentColor={accentColor} navyColor={navyColor} />
      <CornerAccent position="top-right" accentColor={accentColor} navyColor={navyColor} />
      <CornerAccent position="bottom-left" accentColor={accentColor} navyColor={navyColor} />
      <CornerAccent position="bottom-right" accentColor={accentColor} navyColor={navyColor} />

      {/* ── Watermark ── */}
      <img src={AICTE_LOGO_SRC} alt="" crossOrigin="anonymous"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: '45%', opacity: 0.04, filter: 'grayscale(1)', zIndex: 0 }} />

      {/* ── Left Ribbon with AICTE Medal ── */}
      <div className="absolute left-[7%] top-0 h-[45%] w-[clamp(30px,4cqw,60px)] z-20 flex flex-col items-center">
        {/* Ribbon Tail */}
        <div className="absolute top-0 w-full h-[85%]" style={{ backgroundColor: navyColor }}>
          {/* Gold side borders of the ribbon */}
          <div className="absolute left-[10%] top-0 w-[2px] h-full" style={{ backgroundColor: accentColor }}></div>
          <div className="absolute right-[10%] top-0 w-[2px] h-full" style={{ backgroundColor: accentColor }}></div>
        </div>
        {/* Medal */}
        <div className="absolute bottom-0 w-[clamp(50px,7.5cqw,110px)] aspect-square rounded-full flex flex-col items-center justify-center text-center shadow-lg"
             style={{
               backgroundColor: navyColor,
               border: `clamp(2px,0.3cqw,4px) dashed ${accentColor}`,
               outline: `clamp(2px,0.3cqw,4px) solid ${accentColor}`,
               outlineOffset: 'clamp(1px,0.1cqw,2px)'
             }}>
           <p className="text-white font-bold uppercase leading-tight" style={{ fontSize: 'clamp(5px,0.7cqw,11px)' }}>
             AICTE<br/>Approved
           </p>
           <p className="text-white mt-[0.2cqw] font-medium leading-tight" style={{ fontSize: 'clamp(3px,0.45cqw,7px)' }}>
             INTERNSHIP<br/>PROGRAM
           </p>
           <div className="text-white mt-[0.2cqw]" style={{ fontSize: 'clamp(6px,0.8cqw,12px)' }}>★</div>
        </div>
      </div>

      {/* ── Main Content Container ── */}
      <div
        className="relative flex h-full flex-col z-10"
        style={{ padding: 'clamp(20px,3cqw,40px) clamp(25px,4cqw,60px) 0' }}
      >
        {/* ══ HEADER ══ */}
        <header className="flex justify-between items-start w-full relative z-30" style={{ paddingLeft: '9cqw' }}>
          
          {/* Left AICTE Box */}
          <div className="flex items-center" style={{
            backgroundColor: '#ffffff',
            border: `1px solid ${hexToRgba(navyColor, 0.2)}`,
            borderRadius: 'clamp(6px,0.8cqw,12px)',
            padding: 'clamp(4px,0.6cqw,8px) clamp(8px,1cqw,14px)',
            gap: 'clamp(5px,0.8cqw,12px)'
          }}>
            <img src={AICTE_LOGO_SRC} alt="AICTE" crossOrigin="anonymous" style={{ height: 'clamp(30px,4.5cqw,65px)', width: 'auto', objectFit: 'contain' }} />
            <div className="flex flex-col justify-center">
              <p className="font-bold uppercase text-[#173F8A] leading-none" style={{ fontSize: 'clamp(7px,0.9cqw,13px)' }}>
                AICTE APPROVED
              </p>
              <p className="font-semibold uppercase text-slate-600 mt-[0.2cqw] leading-none" style={{ fontSize: 'clamp(5px,0.6cqw,8px)' }}>
                INTERNSHIP PROGRAM
              </p>
              <p className="text-slate-500 mt-[0.3cqw] leading-tight" style={{ fontSize: 'clamp(4px,0.5cqw,7px)' }}>
                All India Council for Technical Education<br/>
                (Ministry of Education, Govt. of India)
              </p>
            </div>
          </div>

          {/* Center ASH Logo */}
          <div className="flex flex-col justify-center items-center text-center">
            <img src={brandLogo} alt={orgName} crossOrigin="anonymous" style={{ height: 'clamp(30px,4.5cqw,65px)', width: 'auto', objectFit: 'contain' }} />
            <p className="font-bold uppercase leading-tight mt-[0.4cqw]" style={{ color: navyColor, fontSize: 'clamp(7px,1cqw,14px)', letterSpacing: '0.05em' }}>
              {orgName}
            </p>
            <p className="text-slate-500 uppercase font-medium mt-[0.1cqw]" style={{ fontSize: 'clamp(4.5px,0.55cqw,8px)', letterSpacing: '0.15em' }}>
              Technology · Innovation · Excellence
            </p>
          </div>

          {/* Right Section (MSME + ID) */}
          <div className="flex flex-col items-end gap-[0.5cqw]">
            {/* MSME Box */}
            <div className="flex items-center" style={{
              backgroundColor: '#ffffff',
              border: `1px solid ${hexToRgba(navyColor, 0.2)}`,
              borderRadius: 'clamp(6px,0.8cqw,12px)',
              padding: 'clamp(4px,0.6cqw,8px) clamp(8px,1cqw,14px)',
              gap: 'clamp(5px,0.8cqw,12px)'
            }}>
              <div className="flex flex-col justify-center text-right">
                <p className="font-bold uppercase text-[#167044] leading-none" style={{ fontSize: 'clamp(7px,0.9cqw,13px)' }}>
                  MSME REGISTERED
                </p>
                <p className="font-semibold uppercase text-slate-600 mt-[0.3cqw] leading-none" style={{ fontSize: 'clamp(5px,0.6cqw,8px)' }}>
                  GOVT. OF INDIA
                </p>
              </div>
              <img src={msmeBadge} alt="MSME" crossOrigin="anonymous" style={{ height: 'clamp(30px,4.5cqw,65px)', width: 'auto', objectFit: 'contain' }} />
            </div>
            
            {/* ID Chip */}
            <div className="text-right mt-[0.2cqw]">
              <p className="font-bold uppercase text-[#173F8A] mb-[0.2cqw]" style={{ fontSize: 'clamp(5px,0.6cqw,9px)' }}>
                AICTE CERTIFICATE NO.
              </p>
              <div style={{
                border: `1px solid ${hexToRgba(navyColor, 0.3)}`,
                borderRadius: 'clamp(4px,0.6cqw,8px)',
                padding: 'clamp(2px,0.3cqw,5px) clamp(6px,1cqw,12px)',
                background: 'white'
              }}>
                <p className="font-bold text-[#173F8A]" style={{ fontSize: 'clamp(6px,0.85cqw,12px)' }}>
                  {certId}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ══ TITLE ══ */}
        <div className="mt-[2cqw] text-center shrink-0 flex flex-col items-center">
          <p className="font-bold uppercase tracking-[0.2em]" style={{ color: navyColor, fontSize: 'clamp(7px,0.9cqw,14px)' }}>
            AICTE RECOGNISED INTERNSHIP
          </p>
          <h1
            className="font-black uppercase mt-[0.5cqw] w-full"
            style={{
              color: navyColor,
              fontFamily: '"Cinzel", serif',
              fontSize: 'clamp(20px, 3.2cqw, 48px)',
              letterSpacing: '0.04em',
            }}
          >
            INTERNSHIP COMPLETION CERTIFICATE
          </h1>
          <p className="italic text-slate-500 mt-[0.8cqw]" style={{ fontSize: 'clamp(10px, 1.4cqw, 20px)' }}>
            This is to certify that
          </p>
        </div>

        {/* ══ HOLDER NAME ══ */}
        <div className="mt-[0.5cqw] flex flex-col items-center text-center shrink-0">
          <h2
            className="font-bold leading-tight"
            style={{
              color: navyColor,
              fontFamily: '"Playfair Display", serif',
              fontStyle: 'italic',
              fontSize: nameFontSize,
            }}
          >
            {normalizeDisplayText(holderName)}
          </h2>
          
          {/* Gold Name Divider with Diamond */}
          <div className="flex items-center justify-center mt-[0.5cqw] w-[clamp(150px,25cqw,350px)]">
            <div className="flex-1 h-[1.5px]" style={{ background: `linear-gradient(90deg, transparent, ${accentColor})` }} />
            <div className="mx-[0.5cqw] rotate-45" style={{ width: 'clamp(4px,0.6cqw,8px)', height: 'clamp(4px,0.6cqw,8px)', backgroundColor: accentColor }} />
            <div className="flex-1 h-[1.5px]" style={{ background: `linear-gradient(270deg, transparent, ${accentColor})` }} />
          </div>
        </div>

        {/* ══ PARAGRAPH ══ */}
        <div className="mt-[1.5cqw] flex justify-center shrink-0">
          <div className="text-center" style={{ 
            color: '#1F2937', 
            fontWeight: 500, 
            fontSize: 'clamp(10px, 1.6cqw, 18px)', 
            lineHeight: '1.8', 
            maxWidth: '75%' 
          }}>
            {certificate?.certificateText ? (
              certificate.certificateText.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))
            ) : (
              <>
                <p>has successfully completed the <span className="font-bold text-[#173F8A]">AICTE-Approved Internship Program</span></p>
                <p>organized by Amit Solution Hub in association with All India Council for Technical Education (AICTE).</p>
                <p>During the internship period, the student was found sincere, hardworking and</p>
                <p>actively participated in all assigned tasks.</p>
                <p>We wish him/her all the best for future endeavors.</p>
              </>
            )}
          </div>
        </div>

        {/* ══ 5 DETAIL CARDS ══ */}
        <div className="flex justify-center items-center gap-[1cqw] mt-[2cqw] w-full shrink-0">
          {[
            { icon: FileText, label: 'INTERNSHIP DOMAIN', value: certificate?.domain || 'Web Development' },
            { icon: Calendar, label: 'DURATION', value: certificate?.duration || '8 Weeks' },
            { icon: CalendarDays, label: 'START DATE', value: certificate?.startDate || '01 May 2026' },
            { icon: CalendarCheck, label: 'END DATE', value: certificate?.endDate || '27 June 2026' },
            { icon: User, label: 'MODE', value: certificate?.mode || 'Online' }
          ].map((item, index) => (
            <div key={index} className="flex items-center" style={{
              backgroundColor: '#ffffff',
              border: '1px solid #E2E8F0',
              borderRadius: 'clamp(4px,0.6cqw,8px)',
              padding: 'clamp(6px,0.8cqw,12px) clamp(8px,1.2cqw,18px)',
              gap: 'clamp(6px,0.8cqw,12px)',
              minWidth: 'clamp(100px,15cqw,200px)',
              boxShadow: 'none'
            }}>
              <item.icon size={28} className="text-[#173F8A]" style={{ width: 'clamp(18px, 2.5cqw, 32px)', height: 'clamp(18px, 2.5cqw, 32px)' }} />
              <div className="flex flex-col text-left">
                <p className="font-bold uppercase text-[#173F8A]" style={{ fontSize: 'clamp(6px, 0.9cqw, 11px)', letterSpacing: '0.05em' }}>
                  {item.label}
                </p>
                <p className="font-bold text-[#1F2937] leading-tight mt-[0.1cqw]" style={{ fontSize: 'clamp(8px, 1.2cqw, 15px)' }}>
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ══ FOOTER ══ */}
        <footer className="mt-auto flex flex-col w-full shrink-0 relative z-30 pb-[clamp(15px,2.5cqw,30px)]">
          
          {/* Footer Gold Line */}
          <div className="w-full flex items-center justify-center mb-[1cqw]">
             <div className="w-[4px] h-[4px] rounded-full" style={{ backgroundColor: accentColor }} />
             <div className="flex-1 h-[1px] mx-[2px]" style={{ backgroundColor: accentColor, opacity: 0.5 }} />
             <div className="w-[4px] h-[4px] rounded-full" style={{ backgroundColor: accentColor }} />
          </div>

          <div className="grid items-end w-full" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '1cqw' }}>
            {/* Col 1: Date */}
            <div className="flex flex-col items-center justify-end text-center w-full">
              <div className="flex items-center gap-[0.4cqw] mb-[0.2cqw]">
                <CalendarIcon size={16} className="text-slate-400" style={{ width: 'clamp(10px,1.4cqw,18px)', height: 'clamp(10px,1.4cqw,18px)' }} />
                <p className="font-bold text-[#1F2937]" style={{ fontSize: 'clamp(7px,1cqw,14px)' }}>{issueDate}</p>
              </div>
              <div className="h-[1px] w-[clamp(50px,8cqw,120px)] bg-slate-300 my-[0.3cqw]" />
              <p className="font-bold text-[#173F8A] uppercase" style={{ fontSize: 'clamp(5px,0.7cqw,10px)', letterSpacing: '0.05em' }}>DATE OF ISSUE</p>
            </div>

            {/* Col 2: Mentor */}
            <div className="flex flex-col items-center justify-end text-center w-full">
              <div className="flex items-end justify-center" style={{ height: 'clamp(25px, 3.5cqw, 50px)' }}>
                <img src={mentorSign} alt="" crossOrigin="anonymous" className="mix-blend-multiply" style={{ height: '100%', width: 'auto', maxWidth: 'clamp(40px,6.5cqw,90px)', objectFit: 'contain' }} />
              </div>
              <div className="h-[1px] w-[clamp(70px,10cqw,150px)] bg-slate-300 my-[0.3cqw]" />
              <p className="font-bold text-[#173F8A] uppercase" style={{ fontSize: 'clamp(5.5px,0.75cqw,11px)' }}>PROGRAM MENTOR</p>
              <p className="font-medium text-slate-500 uppercase mt-[0.1cqw]" style={{ fontSize: 'clamp(4.5px,0.6cqw,9px)' }}>TECHNICAL LEAD</p>
            </div>

            {/* Col 3: Stamp */}
            <div className="flex flex-col items-center justify-end text-center w-full relative z-10">
              <img src={stampImg} alt="" crossOrigin="anonymous" className="mix-blend-multiply" style={{ height: 'clamp(40px, 6cqw, 80px)', width: 'auto', objectFit: 'contain', opacity: 0.9 }} />
              <p className="font-bold text-[#173F8A] uppercase mt-[0.3cqw]" style={{ fontSize: 'clamp(5.5px,0.75cqw,11px)' }}>OFFICIAL SEAL</p>
            </div>

            {/* Col 4: CEO */}
            <div className="flex flex-col items-center justify-end text-center w-full">
              <div className="flex items-end justify-center" style={{ height: 'clamp(25px, 3.5cqw, 50px)' }}>
                <img src={sigImg} alt="" crossOrigin="anonymous" className="mix-blend-multiply" style={{ height: '100%', width: 'auto', maxWidth: 'clamp(45px,7cqw,100px)', objectFit: 'contain' }} />
              </div>
              <div className="h-[1px] w-[clamp(70px,10cqw,150px)] bg-slate-300 my-[0.3cqw]" />
              <p className="font-bold text-[#173F8A] uppercase" style={{ fontSize: 'clamp(5.5px,0.75cqw,11px)' }}>{sigName.toUpperCase()}</p>
              <p className="font-medium text-slate-500 uppercase mt-[0.1cqw]" style={{ fontSize: 'clamp(4.5px,0.6cqw,9px)' }}>FOUNDER & CEO</p>
            </div>

            {/* Col 5: QR Code */}
            <div className="flex flex-col items-center justify-end text-center w-full">
              <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #173F8A', padding: 'clamp(3px, 0.4cqw, 6px)', borderRadius: '2px' }}>
                <QRCodeCanvas value={verifyUrl || certId} size={256} fgColor={navyColor} style={{ width: 'clamp(38px, 5.5cqw, 75px)', height: 'auto', display: 'block' }} level="M" includeMargin={false} />
              </div>
              <p className="font-bold text-[#173F8A] uppercase mt-[0.4cqw]" style={{ fontSize: 'clamp(5px,0.7cqw,10px)', letterSpacing: '0.05em' }}>SCAN TO VERIFY</p>
            </div>
          </div>
        </footer>
      </div>

      {/* ── Very Bottom Navy Bar ── */}
      <div className="absolute bottom-[clamp(4px,0.5cqw,8px)] left-0 w-full z-[60] flex items-center justify-center"
           style={{ backgroundColor: navyColor, height: 'clamp(14px, 2cqw, 28px)' }}>
        <p className="text-white flex items-center gap-[0.5cqw] font-medium" style={{ fontSize: 'clamp(5px, 0.7cqw, 11px)' }}>
          This certificate is verifiable at: https://amitsolutionhub.in/verify 
          <span style={{ color: accentColor }}>|</span>
          Email: support@amitsolutionhub.in
          <span style={{ color: accentColor }}>|</span>
          Website: www.amitsolutionhub.in
        </p>
      </div>

    </div>
  )
}
