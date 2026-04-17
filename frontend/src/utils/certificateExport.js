import html2canvas from 'html2canvas'
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

/**
 * Fetch an image URL and return a data-URL string.
 * Adds a cache-busting param so the browser makes a fresh CORS request
 * even if the image was previously cached without CORS headers.
 */
const toDataUrl = async (src) => {
  if (!src || src.startsWith('data:') || src.startsWith('blob:')) return src
  try {
    const sep = src.includes('?') ? '&' : '?'
    const url = `${src}${sep}_cb=${Date.now()}`
    const response = await fetch(url, { mode: 'cors', cache: 'no-cache' })
    if (!response.ok) return src
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = () => resolve(src) // fallback on error
      reader.readAsDataURL(blob)
    })
  } catch {
    return src // fallback: use original (may taint canvas, but at least renders)
  }
}

/**
 * Replace all <img> src attributes inside element with data-URLs,
 * returning a cleanup function that restores the originals.
 */
const inlineImages = async (element) => {
  const images = Array.from(element.querySelectorAll('img'))
  if (images.length === 0) return () => {}

  const originals = images.map((img) => img.src)

  await Promise.all(
    images.map(async (img, i) => {
      const dataUrl = await toDataUrl(img.src)
      if (dataUrl !== img.src) {
        img.src = dataUrl
      }
      // Ensure crossOrigin attr is present for already-inlined images
      if (!img.getAttribute('crossOrigin')) {
        img.setAttribute('crossOrigin', 'anonymous')
      }
    })
  )

  // Wait for the replaced srcs to fully load
  await Promise.all(
    images.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete && img.naturalWidth > 0) return resolve()
          img.onload = resolve
          img.onerror = resolve
        })
    )
  )

  // Return cleanup function
  return () => {
    images.forEach((img, i) => {
      img.src = originals[i]
    })
  }
}

const getExportDimensions = (element) => ({
  width: Math.ceil(element.scrollWidth || element.offsetWidth || element.clientWidth || 1123),
  height: Math.ceil(element.scrollHeight || element.offsetHeight || element.clientHeight || 794),
})

// ── Core renderer ──────────────────────────────────────────────────────────────

const renderCertificateCanvas = async (element) => {
  if (!element) {
    throw new Error('Certificate preview is not ready yet.')
  }

  // Wait for fonts
  if (document.fonts?.ready) {
    await document.fonts.ready
  }

  // Inline all images as data-URLs to prevent canvas taint from cross-origin images
  const restoreImages = await inlineImages(element)

  await waitForNextPaint()

  const { width, height } = getExportDimensions(element)

  if (!width || !height) {
    restoreImages()
    throw new Error('Certificate element has no dimensions. Please wait for it to fully render.')
  }

  // Patch getContext so html2canvas getImageData calls use willReadFrequently (suppress perf warning)
  const _origGetContext = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function patchedGetContext(type, attrs) {
    if (type === '2d') {
      attrs = { willReadFrequently: true, ...attrs }
    }
    return _origGetContext.call(this, type, attrs)
  }

  let canvasResult
  try {
    canvasResult = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: Math.max(2, Math.min(window.devicePixelRatio || 2, 3)),
      useCORS: true,
      allowTaint: false,
      logging: false,
      width,
      height,
      windowWidth: width,
      windowHeight: height,
    })
  } finally {
    HTMLCanvasElement.prototype.getContext = _origGetContext
    restoreImages()
  }

  return canvasResult
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

// ── Public exports ─────────────────────────────────────────────────────────────

export const downloadCertificatePng = async (element, certificate) => {
  const canvas = await renderCertificateCanvas(element)
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))

  if (!blob) {
    throw new Error(
      'PNG generation failed — the canvas may be security-restricted. ' +
      'Ensure all uploaded images are served with CORS headers.'
    )
  }

  downloadBlob(blob, getCertificateFilename(certificate, 'png'))
}

export const downloadCertificatePdf = async (element, certificate) => {
  const canvas = await renderCertificateCanvas(element)
  const { width, height } = getExportDimensions(element)

  let dataUrl
  try {
    dataUrl = canvas.toDataURL('image/png')
  } catch (securityError) {
    throw new Error(
      'PDF generation failed — the canvas is security-restricted due to cross-origin images. ' +
      'Ensure all uploaded images are served with CORS headers.'
    )
  }

  if (!dataUrl || dataUrl === 'data:,') {
    throw new Error('Failed to convert the certificate canvas to an image.')
  }

  const pdf = new jsPDF({
    orientation: width >= height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [width, height],
    compress: true,
  })

  pdf.addImage(dataUrl, 'PNG', 0, 0, width, height, undefined, 'FAST')
  pdf.save(getCertificateFilename(certificate, 'pdf'))
}
