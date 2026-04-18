import { getCertificateFilename } from './certificateHelpers'

export const CERTIFICATE_EXPORT_WIDTH = 1400

// A/W = 1.414/1  →  H = W / 1.414
const CERTIFICATE_ASPECT = 1.414

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const EXPORT_ROOT_ATTR = 'data-certificate-export-root'

const EXPORT_STYLE_PROPS = [
  'color',
  'background-color',
  'background-image',
  'border-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'box-shadow',
  'text-shadow',
  'outline-color',
  'text-decoration-color',
  'text-emphasis-color',
  'caret-color',
  'fill',
  'stroke',
  '-webkit-text-fill-color',
  '-webkit-text-stroke-color',
]

let html2canvasPromise
let jsPdfPromise
let colorNormalizationContext

const loadHtml2Canvas = async () => {
  if (!html2canvasPromise) {
    html2canvasPromise = import('html2canvas').then((module) => module.default || module)
  }
  return html2canvasPromise
}

const loadJsPdf = async () => {
  if (!jsPdfPromise) {
    jsPdfPromise = import('jspdf').then((module) => module.jsPDF || module.default?.jsPDF || module.default)
  }
  return jsPdfPromise
}

const getColorNormalizationContext = () => {
  if (!colorNormalizationContext) {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    colorNormalizationContext = canvas.getContext('2d', { willReadFrequently: true })
  }
  return colorNormalizationContext
}

const normalizeColorFunction = (value) => {
  const context = getColorNormalizationContext()
  if (!context) return value

  const previousFillStyle = context.fillStyle
  try {
    context.clearRect(0, 0, 1, 1)
    context.fillStyle = '#000000'
    context.fillStyle = value
    
    context.fillRect(0, 0, 1, 1)
    const imgData = context.getImageData(0, 0, 1, 1).data
    return `rgba(${imgData[0]}, ${imgData[1]}, ${imgData[2]}, ${imgData[3] / 255})`
  } catch {
    return value
  } finally {
    context.fillStyle = previousFillStyle
  }
}

const sanitizeCssValue = (value) => {
  const stringValue = String(value || '').trim()
  if (!stringValue || !/(oklch|oklab)\(/i.test(stringValue)) {
    return stringValue
  }

  let result = ''
  let i = 0
  while (i < stringValue.length) {
    const match = stringValue.substring(i).match(/^(oklch|oklab)\(/i)
    if (match) {
      const start = i
      let depth = 0
      let j = i + match[0].length - 1
      for (; j < stringValue.length; j++) {
        if (stringValue[j] === '(') depth++
        if (stringValue[j] === ')') {
          depth--
          if (depth === 0) break
        }
      }
      
      const fullColorFn = stringValue.substring(start, j + 1)
      result += normalizeColorFunction(fullColorFn)
      i = j + 1
    } else {
      result += stringValue[i]
      i++
    }
  }
  return result
}

const waitForNextPaint = async () => {
  await new Promise((resolve) => requestAnimationFrame(() => resolve()))
  await new Promise((resolve) => requestAnimationFrame(() => resolve()))
}

const waitForImages = async (element) => {
  const images = Array.from(element.querySelectorAll('img'))
  await Promise.all(
    images.map((image) => {
      if (image.complete && image.naturalWidth > 0) {
        return typeof image.decode === 'function' ? image.decode().catch(() => {}) : Promise.resolve()
      }

      return new Promise((resolve) => {
        const done = () => {
          image.removeEventListener('load', done)
          image.removeEventListener('error', done)
          resolve()
        }

        image.addEventListener('load', done, { once: true })
        image.addEventListener('error', done, { once: true })
      })
    })
  )
}

const getExportDimensions = (element) => {
  const rect = element.getBoundingClientRect()
  const width = Math.ceil(rect.width || element.offsetWidth || CERTIFICATE_EXPORT_WIDTH)
  const height = Math.ceil(
    rect.height || element.offsetHeight || Math.round(width / CERTIFICATE_ASPECT)
  )
  return { width, height }
}

const copyCanvasContents = (sourceCanvas, cloneCanvas) => {
  if (!(sourceCanvas instanceof HTMLCanvasElement) || !(cloneCanvas instanceof HTMLCanvasElement)) return
  const context = cloneCanvas.getContext('2d')
  if (!context) return

  cloneCanvas.width = sourceCanvas.width
  cloneCanvas.height = sourceCanvas.height
  context.clearRect(0, 0, cloneCanvas.width, cloneCanvas.height)
  context.drawImage(sourceCanvas, 0, 0)
}

const syncSanitizedStyles = (sourceElement, cloneElement) => {
  if (!(sourceElement instanceof Element) || !(cloneElement instanceof Element)) return

  const computedStyle = window.getComputedStyle(sourceElement)
  EXPORT_STYLE_PROPS.forEach((property) => {
    const propertyValue = computedStyle.getPropertyValue(property)
    if (!propertyValue) return
    
    const sanitizedValue = sanitizeCssValue(propertyValue)
    if (sanitizedValue) {
      cloneElement.style.setProperty(property, sanitizedValue)
    }
  })

  cloneElement.style.setProperty('animation', 'none')
  cloneElement.style.setProperty('transition', 'none')

  copyCanvasContents(sourceElement, cloneElement)
}

const sanitizeClonedTree = (sourceRoot, clonedDocument) => {
  const clonedRoot = clonedDocument.querySelector(`[${EXPORT_ROOT_ATTR}="true"]`)
  if (!clonedRoot) return

  const sourceNodes = [sourceRoot, ...sourceRoot.querySelectorAll('*')]
  const cloneNodes = [clonedRoot, ...clonedRoot.querySelectorAll('*')]
  const total = Math.min(sourceNodes.length, cloneNodes.length)

  for (let index = 0; index < total; index += 1) {
    syncSanitizedStyles(sourceNodes[index], cloneNodes[index])
  }

  const styleTags = clonedDocument.querySelectorAll('style')
  for (let i = 0; i < styleTags.length; i++) {
    const styleTag = styleTags[i]
    if (styleTag.textContent && /(oklch|oklab)\(/i.test(styleTag.textContent)) {
      styleTag.textContent = sanitizeCssValue(styleTag.textContent)
    }
  }
}

const renderCertificateCanvas = async (element) => {
  if (!element) throw new Error('Certificate element is not ready.')
  const html2canvas = await loadHtml2Canvas()

  if (document.fonts?.ready) await document.fonts.ready
  await waitForImages(element)
  await sleep(200)
  await waitForNextPaint()

  const captureTarget = element.firstElementChild instanceof HTMLElement ? element.firstElementChild : element
  const { width, height } = getExportDimensions(captureTarget)

  if (!width || !height || height < 10) {
    throw new Error(`Certificate dimensions invalid (${width}\u00d7${height}). Please try again.`)
  }

  const parent = element.parentElement
  const originalParentStyles = parent
    ? {
        top: parent.style.top,
        left: parent.style.left,
        opacity: parent.style.opacity,
      }
    : null

  if (parent && originalParentStyles) {
    parent.style.top = '0px'
    parent.style.left = '0px'
    parent.style.opacity = '0'
  }

  try {
    captureTarget.setAttribute(EXPORT_ROOT_ATTR, 'true')
    return await html2canvas(captureTarget, {
      backgroundColor: '#ffffff',
      width,
      height,
      scale: 2,
      useCORS: true,
      allowTaint: false,
      imageTimeout: 15000,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: Math.max(document.documentElement.clientWidth, width),
      windowHeight: Math.max(document.documentElement.clientHeight, height),
      onclone: (clonedDocument) => {
        sanitizeClonedTree(captureTarget, clonedDocument)
      },
    })
  } finally {
    captureTarget.removeAttribute(EXPORT_ROOT_ATTR)
    if (parent && originalParentStyles) {
      parent.style.top = originalParentStyles.top
      parent.style.left = originalParentStyles.left
      parent.style.opacity = originalParentStyles.opacity
    }
  }
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
    throw new Error('Failed to create the PNG file.')
  }

  downloadBlob(blob, getCertificateFilename(certificate, 'png'))
}

export const downloadCertificatePdf = async (element, certificate) => {
  const jsPDF = await loadJsPdf()
  const canvas = await renderCertificateCanvas(element)
  const width = canvas.width
  const height = canvas.height

  const pdf = new jsPDF({
    orientation: width >= height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [width, height],
    compress: true,
  })

  pdf.addImage(canvas, 'PNG', 0, 0, width, height, undefined, 'FAST')
  pdf.save(getCertificateFilename(certificate, 'pdf'))
}
