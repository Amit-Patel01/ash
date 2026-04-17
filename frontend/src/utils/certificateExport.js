import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { getCertificateFilename } from './certificateHelpers'

export const CERTIFICATE_EXPORT_WIDTH = 1400

const waitForNextPaint = () =>
  new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(resolve)
    })
  })

const waitForImages = async (element) => {
  const images = Array.from(element.querySelectorAll('img'))
  if (images.length === 0) return

  await Promise.all(
    images.map((image) => {
      if (image.complete) return Promise.resolve()

      return new Promise((resolve) => {
        const done = () => resolve()
        image.addEventListener('load', done, { once: true })
        image.addEventListener('error', done, { once: true })
      })
    })
  )
}

const getExportDimensions = (element) => ({
  width: Math.ceil(element.scrollWidth || element.offsetWidth || element.clientWidth || 1123),
  height: Math.ceil(element.scrollHeight || element.offsetHeight || element.clientHeight || 794),
})

const renderCertificateCanvas = async (element) => {
  if (!element) {
    throw new Error('Certificate preview is not ready yet.')
  }

  if (document.fonts?.ready) {
    await document.fonts.ready
  }

  await waitForImages(element)
  await waitForNextPaint()

  const { width, height } = getExportDimensions(element)

  // Patch getContext so html2canvas internal getImageData calls use willReadFrequently
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
    // Always restore the original method
    HTMLCanvasElement.prototype.getContext = _origGetContext
  }

  return canvasResult
}

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

export const downloadCertificatePng = async (element, certificate) => {
  const canvas = await renderCertificateCanvas(element)
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))

  if (!blob) {
    throw new Error('Unable to generate the PNG file.')
  }

  downloadBlob(blob, getCertificateFilename(certificate, 'png'))
}

export const downloadCertificatePdf = async (element, certificate) => {
  const canvas = await renderCertificateCanvas(element)
  const { width, height } = getExportDimensions(element)
  const dataUrl = canvas.toDataURL('image/png')

  const pdf = new jsPDF({
    orientation: width >= height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [width, height],
    compress: true,
  })

  pdf.addImage(dataUrl, 'PNG', 0, 0, width, height, undefined, 'FAST')
  pdf.save(getCertificateFilename(certificate, 'pdf'))
}
