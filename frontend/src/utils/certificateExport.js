import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'
import { getCertificateFilename } from './certificateHelpers'

export const CERTIFICATE_EXPORT_WIDTH = 1400

// A/W = 1.414/1  →  H = W / 1.414
const CERTIFICATE_ASPECT = 1.414

// ── Small helpers ──────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * Get element dimensions.
 * getBoundingClientRect().width/height is reliable for position:fixed elements
 * even when they are off-screen. We fall back to offsetWidth/offsetHeight and
 * finally compute height from the known certificate aspect ratio.
 */
const getDimensions = (element) => {
  const rect = element.getBoundingClientRect()
  const width = Math.ceil(rect.width || element.offsetWidth || CERTIFICATE_EXPORT_WIDTH)
  const height = Math.ceil(
    rect.height || element.offsetHeight || Math.round(width / CERTIFICATE_ASPECT)
  )
  return { width, height }
}

// ── Core capture ───────────────────────────────────────────────────────────────

const capturePng = async (element) => {
  if (!element) throw new Error('Certificate element is not ready.')

  // Wait for all fonts to load
  if (document.fonts?.ready) await document.fonts.ready

  // Give browser 200 ms to resolve aspect-ratio & container-query layout
  await sleep(200)

  const { width, height } = getDimensions(element)

  if (!width || !height || height < 10) {
    throw new Error(`Certificate dimensions invalid (${width}×${height}). Please try again.`)
  }

  const opts = {
    width,
    height,
    pixelRatio: 2,              // 2× resolution for crisp output
    backgroundColor: '#ffffff',
    cacheBust: true,            // fresh CORS-enabled fetch for all images
  }

  // html-to-image quirk: first call loads fonts/images into SVG embed cache;
  // only the second call returns a fully-resolved result.
  await toPng(element, opts).catch(() => {})
  const dataUrl = await toPng(element, opts)

  if (!dataUrl || dataUrl === 'data:,') {
    throw new Error('Failed to capture certificate image.')
  }

  return { dataUrl, width, height }
}

// ── Download helpers ───────────────────────────────────────────────────────────

/**
 * Trigger a browser download for a data-URL without any Blob conversion.
 * Works in all modern browsers.
 */
const triggerDownload = (dataUrl, filename) => {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

// ── Public API ─────────────────────────────────────────────────────────────────

export const downloadCertificatePng = async (element, certificate) => {
  const { dataUrl } = await capturePng(element)
  triggerDownload(dataUrl, getCertificateFilename(certificate, 'png'))
}

export const downloadCertificatePdf = async (element, certificate) => {
  const { dataUrl, width, height } = await capturePng(element)

  const pdf = new jsPDF({
    orientation: width >= height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [width, height],
    compress: true,
  })

  pdf.addImage(dataUrl, 'PNG', 0, 0, width, height, undefined, 'FAST')
  pdf.save(getCertificateFilename(certificate, 'pdf'))
}
