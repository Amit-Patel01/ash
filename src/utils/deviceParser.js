/**
 * Device User-Agent Parser Utility
 * Converts raw browser User-Agent strings into clean, human-readable device names.
 * Example:
 * Raw: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36"
 * Output: "💻 Chrome 150 · Windows 10/11"
 */

export function parseDeviceName(userAgent) {
  if (!userAgent || typeof userAgent !== 'string') {
    return 'Unknown Device'
  }

  const ua = userAgent.trim()
  if (!ua) return 'Unknown Device'

  // If already parsed / plain text (not starting with Mozilla)
  if (!ua.toLowerCase().startsWith('mozilla/')) {
    return ua
  }

  // OS Detection
  let os = 'Desktop'
  if (/windows nt 10/i.test(ua)) os = 'Windows 10/11'
  else if (/windows nt 6\.3/i.test(ua)) os = 'Windows 8.1'
  else if (/windows nt 6\.2/i.test(ua)) os = 'Windows 8'
  else if (/windows nt 6\.1/i.test(ua)) os = 'Windows 7'
  else if (/windows/i.test(ua)) os = 'Windows'
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS'
  else if (/android/i.test(ua)) os = 'Android'
  else if (/iphone/i.test(ua)) os = 'iPhone'
  else if (/ipad/i.test(ua)) os = 'iPad'
  else if (/cros/i.test(ua)) os = 'ChromeOS'
  else if (/linux/i.test(ua)) os = 'Linux'

  // Browser Detection & Major Version
  let browser = 'Browser'
  if (/edg/i.test(ua)) {
    const match = ua.match(/edg\/(\d+)/i)
    browser = match ? `Edge ${match[1]}` : 'Edge'
  } else if (/chrome/i.test(ua) && !/edg/i.test(ua)) {
    const match = ua.match(/chrome\/(\d+)/i)
    browser = match ? `Chrome ${match[1]}` : 'Chrome'
  } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
    const match = ua.match(/version\/(\d+)/i)
    browser = match ? `Safari ${match[1]}` : 'Safari'
  } else if (/firefox/i.test(ua)) {
    const match = ua.match(/firefox\/(\d+)/i)
    browser = match ? `Firefox ${match[1]}` : 'Firefox'
  } else if (/opera|opr/i.test(ua)) {
    const match = ua.match(/(?:opera|opr)\/(\d+)/i)
    browser = match ? `Opera ${match[1]}` : 'Opera'
  }

  // Icon
  const isMobile = /mobile|android|iphone|ipad|ipod/i.test(ua)
  const icon = isMobile ? '📱' : '💻'

  return `${icon} ${browser} · ${os}`
}

export function formatISTDateTime(value) {
  if (!value) return 'Not available'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true })
}
