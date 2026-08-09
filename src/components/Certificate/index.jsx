import React from 'react'
import { getCertificateDocumentType } from '../../utils/certificateHelpers'
import { isAicteInternshipCertificate } from './CertificateNarrative'
import CertificateDocument from './CertificateDocument'
import AICTECertificateDocument from './AICTECertificateDocument'
import OfferLetterDocument from './OfferLetterDocument'

export default function CertificateRouter({ certificate, template, className = '' }) {
  const documentType = getCertificateDocumentType(certificate)
  
  if (documentType === 'offer_letter' || certificate?.certificateType === 'Offer Letter') {
    return <OfferLetterDocument certificate={certificate} template={template} className={className} />
  }

  if (isAicteInternshipCertificate(certificate) || certificate?.certificateType === "AICTE Internship Completion") {
    return <AICTECertificateDocument certificate={certificate} template={template} className={className} />
  }

  return <CertificateDocument certificate={certificate} template={template} className={className} />
}

export { CertificateDocument, AICTECertificateDocument, OfferLetterDocument }
