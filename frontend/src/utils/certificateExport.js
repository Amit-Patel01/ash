import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'
import { getCertificateFilename } from './certificateHelpers'

export const CERTIFICATE_EXPORT_WIDTH = 1400

// ── Helpers ────────────────────────────────────────────────────────────────────

const waitForNextPaint = () =>
  new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(resolve)
      })
    })
  })

const getExportDimensions = (element) => ({
  width: Math.ceil(element.scrollWidth || element.offsetWidth || element.clientWidth || 1123),
  height: Math.ceil(element.scrollHeight || element.offsetHeight || element.clientHeight || 794),
})

/**
 * html-to-image options shared for PNG and PDF renders.
 * cacheBust forces fresh fetches so CORS headers are always received,
 * preventing canvas taint that broke the old html2canvas approach.
 */
const getHtmlToImageOptions = (width, height, pixelRatio) => ({
  width,
  height,
  pixelRatio,
  backgroundColor: '#ffffff',
  cacheBust: true,       // bypass cache → always gets fresh CORS headers
  skipAutoScale: false,
  includeQueryParams: false,
  fetchRequestInit: { mode: 'cors', cache: 'no-cache' },
  // Fonts are handled natively by html-to-image via SVG foreignObject
})

// ── Core PNG renderer ──────────────────────────────────────────────────────────

const renderCertificatePng = async (element) => {
  if (!element) {
    throw new Error('Certificate element is not ready yet.')
  }

  if (document.fonts?.ready) {
    await document.fonts.ready
  }

  await waitForNextPaint()

  const { width, height } = getExportDimensions(element)

  if (!width || !height) {
    throw new Error('Certificate has no dimensions. Please wait for it to render fully.')
  }

  const pixelRatio = Math.max(2, Math.min(window.devicePixelRatio || 2, 3))
  const opts = getHtmlToImageOptions(width, height, pixelRatio)

  // html-to-image quirk: call twice — first warms up embedded font/image cache,
  // second produces a fully-resolved output. Only the second result is used.
  await toPng(element, opts).catch(() => {})
  const dataUrl = await toPng(element, opts)

  return { dataUrl, width, height }
}

// ── Blob download helper ───────────────────────────────────────────────────────

const downloadBlob = (blob, filename) => {
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}

const dataUrlToBlob = (dataUrl) => {
  const [header, base64] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)[1]
  const binary = atob(base64)
  const buffer = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i)
  return new Blob([buffer], { type: mime })
}

// ── Public exports ─────────────────────────────────────────────────────────────

export const downloadCertificatePng = async (element, certificate) => {
  const { dataUrl } = await renderCertificatePng(element)
  const blob = dataUrlToBlob(dataUrl)
  downloadBlob(blob, getCertificateFilename(certificate, 'png'))
}

export const downloadCertificatePdf = async (element, certificate) => {
  const { dataUrl, width, height } = await renderCertificatePng(element)

  const pdf = new jsPDF({
    orientation: width >= height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [width, height],
    compress: true,
  })

  pdf.addImage(dataUrl, 'PNG', 0, 0, width, height, undefined, 'FAST')
  pdf.save(getCertificateFilename(certificate, 'pdf'))
}
