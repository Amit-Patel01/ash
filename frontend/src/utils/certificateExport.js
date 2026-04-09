import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'
import { getCertificateFilename } from './certificateHelpers'

export const CERTIFICATE_EXPORT_WIDTH = 1400

const createImageDataUrl = async (element) => {
  if (!element) {
    throw new Error('Certificate preview is not ready yet.')
  }

  return toPng(element, {
    cacheBust: true,
    backgroundColor: '#ffffff',
    pixelRatio: Math.max(2, Math.min(window.devicePixelRatio || 2, 3)),
  })
}

const downloadDataUrl = (dataUrl, filename) => {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  link.click()
}

export const downloadCertificatePng = async (element, certificate) => {
  const dataUrl = await createImageDataUrl(element)
  downloadDataUrl(dataUrl, getCertificateFilename(certificate, 'png'))
}

export const downloadCertificatePdf = async (element, certificate) => {
  const dataUrl = await createImageDataUrl(element)
  const width = element.offsetWidth || 1123
  const height = element.offsetHeight || 794

  const pdf = new jsPDF({
    orientation: width >= height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [width, height],
    compress: true,
  })

  pdf.addImage(dataUrl, 'PNG', 0, 0, width, height, undefined, 'FAST')
  pdf.save(getCertificateFilename(certificate, 'pdf'))
}
