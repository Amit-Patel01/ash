import { getCertificateFilename } from './certificateHelpers'

export const CERTIFICATE_EXPORT_WIDTH = 1400

// A/W = 1.414/1  →  H = W / 1.414
const CERTIFICATE_ASPECT = 1.414

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const EXPORT_ROOT_ATTR = 'data-certificate-export-root'
const EXPORT_STAGE_ATTR = 'data-certificate-export-stage'

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
  'font-size',
  'line-height',
  'letter-spacing',
  'word-spacing',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'width',
  'height',
  'gap',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-left-radius',
  'border-bottom-right-radius',
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

const sanitizeCssValue = (value, width = 1400, height = 990) => {
  let stringValue = String(value || '').trim()
  if (!stringValue) return stringValue

  if (/(oklch|oklab)\(/i.test(stringValue)) {
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
    stringValue = result
  }

  // Resolve container queries (cqw, cqh)
  stringValue = stringValue.replace(/([\d.]+)(cqw|cqh)/g, (match, numStr, unit) => {
    const num = parseFloat(numStr)
    if (unit === 'cqw') {
      return `${(num * width) / 100}px`
    } else {
      return `${(num * height) / 100}px`
    }
  })

  // Resolve clamp(min, val, max)
  const clampRegex = /clamp\(([^,]+),([^,]+),([^)]+)\)/
  while (stringValue.includes('clamp(')) {
    const match = stringValue.match(clampRegex)
    if (!match) break
    const [fullMatch, minStr, valStr, maxStr] = match

    const toPx = (str) => {
      str = str.trim()
      if (str.endsWith('px')) return parseFloat(str)
      if (str.endsWith('rem')) return parseFloat(str) * 16
      if (str.endsWith('em')) return parseFloat(str) * 16
      return parseFloat(str) || 0
    }

    const min = toPx(minStr)
    const val = toPx(valStr)
    const max = toPx(maxStr)

    const result = Math.max(min, Math.min(val, max))
    stringValue = stringValue.replace(fullMatch, `${result}px`)
  }

  // Resolve simple calc(mult * px) math
  stringValue = stringValue.replace(/calc\(([\d.]+)\s*\*\s*([\d.]+)px\)/g, (match, multStr, pxStr) => {
    const mult = parseFloat(multStr)
    const px = parseFloat(pxStr)
    return `${mult * px}px`
  })

  return stringValue
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
  
  // Check if it is portrait (such as Offer Letter)
  const isPortrait = element.classList.contains('aspect-[1/1.414]')
  const aspect = isPortrait ? (1 / 1.414) : 1.414
  
  const height = Math.ceil(
    rect.height || element.offsetHeight || Math.round(width / aspect)
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

const copyCanvasTree = (sourceRoot, cloneRoot) => {
  if (!(sourceRoot instanceof Element) || !(cloneRoot instanceof Element)) return

  const sourceCanvases = sourceRoot.matches('canvas')
    ? [sourceRoot, ...sourceRoot.querySelectorAll('canvas')]
    : Array.from(sourceRoot.querySelectorAll('canvas'))
  const cloneCanvases = cloneRoot.matches('canvas')
    ? [cloneRoot, ...cloneRoot.querySelectorAll('canvas')]
    : Array.from(cloneRoot.querySelectorAll('canvas'))
  const total = Math.min(sourceCanvases.length, cloneCanvases.length)

  for (let index = 0; index < total; index += 1) {
    copyCanvasContents(sourceCanvases[index], cloneCanvases[index])
  }
}

const syncSanitizedStyles = (sourceElement, cloneElement, width = 1400, height = 990) => {
  if (!(sourceElement instanceof Element) || !(cloneElement instanceof Element)) return

  const computedStyle = window.getComputedStyle(sourceElement)
  EXPORT_STYLE_PROPS.forEach((property) => {
    const propertyValue = computedStyle.getPropertyValue(property)
    if (!propertyValue) return
    
    const sanitizedValue = sanitizeCssValue(propertyValue, width, height)
    if (sanitizedValue) {
      cloneElement.style.setProperty(property, sanitizedValue)
    }
  })

  cloneElement.style.setProperty('animation', 'none')
  cloneElement.style.setProperty('transition', 'none')

  copyCanvasContents(sourceElement, cloneElement)
}

const createCaptureStage = (sourceTarget, width, height) => {
  const stage = document.createElement('div')
  const targetClone = sourceTarget.cloneNode(true)

  stage.setAttribute('aria-hidden', 'true')
  stage.setAttribute(EXPORT_STAGE_ATTR, 'true')
  stage.style.position = 'fixed'
  stage.style.top = '0'
  stage.style.left = '0'
  stage.style.width = `${width}px`
  stage.style.height = `${height}px`
  stage.style.overflow = 'visible'
  stage.style.pointerEvents = 'none'
  stage.style.zIndex = '2147483647'
  stage.style.opacity = '0'
  stage.style.background = '#ffffff'
  stage.style.contain = 'layout style paint'

  targetClone.style.width = `${width}px`
  targetClone.style.height = `${height}px`
  targetClone.style.maxWidth = 'none'
  targetClone.style.maxHeight = 'none'
  targetClone.style.transform = 'none'
  targetClone.style.transformOrigin = 'top left'

  copyCanvasTree(sourceTarget, targetClone)
  stage.appendChild(targetClone)
  document.body.appendChild(stage)

  return { stage, targetClone }
}

const sanitizeClonedTree = (sourceRoot, clonedDocument, targetWidth, targetHeight) => {
  // Clear any default browser margins/paddings on iframe html/body
  if (clonedDocument.documentElement) {
    clonedDocument.documentElement.style.setProperty('margin', '0', 'important')
    clonedDocument.documentElement.style.setProperty('padding', '0', 'important')
  }
  if (clonedDocument.body) {
    clonedDocument.body.style.setProperty('margin', '0', 'important')
    clonedDocument.body.style.setProperty('padding', '0', 'important')
  }
  const clonedRoot = clonedDocument.querySelector(`[${EXPORT_ROOT_ATTR}="true"]`)
  if (!clonedRoot) return

  // Remove shadows and outer margins/paddings that add extra export space
  clonedRoot.style.setProperty('box-shadow', 'none', 'important')
  clonedRoot.style.setProperty('margin', '0', 'important')
  clonedRoot.style.setProperty('padding', '0', 'important')
  
  // Set explicit dimensions to prevent aspect-ratio collapsing in html2canvas
  clonedRoot.style.setProperty('width', `${targetWidth}px`, 'important')
  clonedRoot.style.setProperty('height', `${targetHeight}px`, 'important')
  
  // Position absolutely at 0,0
  clonedRoot.style.setProperty('position', 'absolute', 'important')
  clonedRoot.style.setProperty('top', '0', 'important')
  clonedRoot.style.setProperty('left', '0', 'important')

  const sourceNodes = [sourceRoot, ...sourceRoot.querySelectorAll('*')]
  const cloneNodes = [clonedRoot, ...clonedRoot.querySelectorAll('*')]
  const total = Math.min(sourceNodes.length, cloneNodes.length)

  for (let index = 0; index < total; index += 1) {
    syncSanitizedStyles(sourceNodes[index], cloneNodes[index], targetWidth, targetHeight)
  }

  const styleTags = clonedDocument.querySelectorAll('style')
  for (let i = 0; i < styleTags.length; i++) {
    const styleTag = styleTags[i]
    if (styleTag.textContent && /(oklch|oklab|cqw|cqh|clamp)\(/i.test(styleTag.textContent)) {
      styleTag.textContent = sanitizeCssValue(styleTag.textContent, targetWidth, targetHeight)
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

  const { stage, targetClone } = createCaptureStage(captureTarget, width, height)
  await waitForImages(targetClone)
  await waitForNextPaint()

  try {
    targetClone.setAttribute(EXPORT_ROOT_ATTR, 'true')
    return await html2canvas(targetClone, {
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
      windowWidth: width,
      windowHeight: height,
      onclone: (clonedDocument) => {
        const clonedStage = clonedDocument.querySelector(`[${EXPORT_STAGE_ATTR}="true"]`)
        if (clonedStage) {
          clonedStage.style.opacity = '1'
          clonedStage.style.zIndex = '2147483647'
          clonedStage.style.top = '0'
          clonedStage.style.left = '0'
        }
        sanitizeClonedTree(targetClone, clonedDocument, width, height)
      } })
  } finally {
    targetClone.removeAttribute(EXPORT_ROOT_ATTR)
    stage.remove()
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
    compress: true })

  pdf.addImage(canvas, 'PNG', 0, 0, width, height, undefined, 'FAST')
  pdf.save(getCertificateFilename(certificate, 'pdf'))
}
