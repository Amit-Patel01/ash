import React from 'react'
import msmeBadge from '../../assets/msme.png'
import brandLogo from '../../assets/brand-logo.png'
import founderSign from '../../assets/founder-sign.png'
import stempImage from './Stemp.png'
import {
  formatCertificateDate,
  getCertificateHolderName,
  normalizeCertificateAssetUrl,
} from '../../utils/certificateHelpers'

export default function OfferLetterDocument({ certificate, template, className = '' }) {
  const holderName = getCertificateHolderName(certificate)
  const certificateId = certificate?.certificate_id || 'PENDING-ID'
  const issueDate = formatCertificateDate(certificate?.approval_date || certificate?.createdAt || certificate?.date)
  const signatureName = certificate?.signatoryName || template?.signatureName || certificate?.issuedByName || 'Amit Patel'
  const signatureRole = certificate?.signatoryRole || template?.signatureRole || certificate?.issuedByRole || 'Program Coordinator'
  const signatureImage = normalizeCertificateAssetUrl(certificate?.signatureImageUrl) || founderSign
  const stampImage = normalizeCertificateAssetUrl(certificate?.stampImageUrl) || stempImage

  // The customTitle or courseName will be the domain if specified, otherwise "Web Development"
  const domain = certificate?.customTitle || certificate?.courseName || 'Web Development'
  
  // The duration can be derived from certificate.duration or default to "1 month"
  const duration = certificate?.duration || '1 month'

  return (
    <div
      className={`relative isolate aspect-[1/1.414] w-full overflow-hidden bg-white text-slate-800 shadow-[0_20px_48px_rgba(15,23,42,0.14)] ${className}`}
      style={{ containerType: 'inline-size' }}
    >
      {/* Top Margin/Padding */}
      <div className="relative flex h-full flex-col p-[6cqw] pt-[8cqw]">
        
        {/* Header Section */}
        <header className="flex flex-col items-center justify-center relative shrink-0">
          <div className="absolute top-0 right-0">
            <img src={brandLogo} alt="Amit Solution Hub" crossOrigin="anonymous" className="h-[clamp(40px,7cqw,80px)] w-auto object-contain" />
          </div>
          
          <h1 
            className="font-bold text-[#1e3a8a] uppercase tracking-wide text-center" 
            style={{ fontSize: 'clamp(20px, 4cqw, 36px)', fontFamily: 'Georgia, serif' }}
          >
            AMIT SOLUTION HUB
          </h1>
          
          <p 
            className="mt-[1.5cqw] text-center font-medium max-w-[80%]"
            style={{ fontSize: 'clamp(10px, 1.8cqw, 18px)' }}
          >
            Amit Solution Hub is a technology-based company specializing in web development, digital marketing, and cyber security solutions.
          </p>

          <hr className="w-full mt-[3cqw] border-t-[1.5px] border-[#4c7ac2]" />
        </header>

        {/* Title Section */}
        <div className="mt-[3cqw] text-center shrink-0">
          <h2 
            className="font-bold text-[#1e3a8a] uppercase tracking-wider"
            style={{ fontSize: 'clamp(16px, 2.5cqw, 24px)', fontFamily: 'Georgia, serif' }}
          >
            INTERNSHIP OFFER LETTER
          </h2>
        </div>

        {/* Ref and Date Section */}
        <div className="mt-[3cqw] flex flex-col items-end shrink-0" style={{ fontSize: 'clamp(12px, 1.8cqw, 18px)' }}>
          <p className="font-bold">{certificateId}</p>
          <p className="mt-[1cqw]">Date : {issueDate}</p>
        </div>

        {/* Salutation */}
        <div className="mt-[4cqw] shrink-0" style={{ fontSize: 'clamp(12px, 2cqw, 18px)' }}>
          <p className="font-bold">Dear {holderName},</p>
        </div>

        {/* Body Text */}
        <div className="mt-[4cqw] space-y-[2.5cqw] text-justify leading-relaxed shrink-0 flex-1" style={{ fontSize: 'clamp(11px, 1.8cqw, 16px)' }}>
          {certificate?.certificateText ? (
            certificate.certificateText.split('\n').map((para, index) => {
              const trimmed = para.trim();
              if (!trimmed) return null;
              return <p key={index}>{trimmed}</p>;
            })
          ) : (
            <>
              <p>
                We are delighted to welcome you for the internship in <span className="font-bold">{domain}</span> at our organization. This internship is observed by <span className="font-bold">Amit Solution Hub</span> as being a learning opportunity for you, spanning a duration of <span className="font-bold">{duration}</span>.
              </p>

              <p>
                In essence, your internship will embrace orientation and give emphasis on learning new skills with a deeper understanding of concepts through hands-on application of the knowledge you gain as an intern. Our team is confident that you will acknowledge your obligation to perform all work allocated to you to the best of your ability within lawful and reasonable direction given to you.
              </p>

              <p>
                We look forward to a worthwhile and fruitful association which will make you equipped for future projects. Wishing you the most enjoyable and truly meaningful internship program experience.
              </p>
            </>
          )}
        </div>

        {/* Signatures & Stamp Section */}
        <div className="mt-auto pt-[4cqw] grid grid-cols-[1fr_auto] gap-[4cqw] items-end shrink-0">
          {/* Left: Signature */}
          <div className="flex flex-col items-start text-left" style={{ fontSize: 'clamp(10px, 1.6cqw, 16px)' }}>
            <p>Sincerely,</p>
            <p className="font-bold mt-[0.5cqw]">For Amit Solution Hub</p>
            
            <div className="mt-[2cqw] h-[8cqw] flex items-end">
              <img
                src={signatureImage}
                alt={signatureName}
                crossOrigin="anonymous"
                className="max-h-full w-auto object-contain mix-blend-multiply"
              />
            </div>
            
            <p className="mt-[1cqw] font-bold">{signatureName}</p>
            <p className="text-slate-600">{signatureRole}</p>
            <p className="text-slate-600">Mobile: +91-7874248481</p>
          </div>

          {/* Right: Stamps */}
          <div className="flex flex-col items-end justify-end space-y-[2cqw]">
            <img
              src={stampImage}
              alt="Official stamp"
              crossOrigin="anonymous"
              className="w-[clamp(80px,18cqw,160px)] h-auto object-contain mix-blend-multiply"
            />
            <img 
              src={msmeBadge} 
              alt="MSME" 
              crossOrigin="anonymous" 
              className="w-[clamp(60px,12cqw,120px)] h-auto object-contain" 
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-[4cqw] shrink-0" style={{ fontSize: 'clamp(9px, 1.4cqw, 14px)' }}>
          <hr className="w-full mb-[2cqw] border-t-[6px] border-[#93aed4]" />
          <div className="flex flex-col space-y-[0.5cqw] font-bold text-slate-500">
            <p>www.amitsolutionhub.com</p>
            <p>PH - +91 7874248481</p>
            <p>Email - support@amitsolutionhub.com</p>
          </div>
        </div>

      </div>
    </div>
  )
}
