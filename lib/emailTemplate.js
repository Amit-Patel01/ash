/**
 * Format markdown or raw text into clean, styled HTML paragraphs, bold tags, headers, and lists
 */
export function formatBodyToHtml(text) {
  if (!text) return '';
  let str = String(text).trim();

  // 1. Strip leading Subject lines (e.g. "**Subject: ...**" or "Subject: ...")
  str = str.replace(/^(?:\*\*)?Subject:\s*[^\n]+\r?\n(?:\*\*)?\s*/i, '');
  str = str.replace(/^\*\*\s*Subject:\s*.*?\*\*\s*/i, '');

  // 2. Strip AI Agent sign-offs at bottom (e.g. "**AI Department Agent, EMAIL**")
  str = str.replace(/\*\*AI Department Agent[^*]*\*\*/gi, '');

  // If already contains structured HTML paragraphs or container tags, return as-is
  if (/<(p|div|table|section|article)\b/i.test(str)) {
    return str;
  }

  // 3. Convert markdown headers (### Header -> <h3>Header</h3>)
  str = str.replace(/^### (.*$)/gim, '<h3 style="color:#0f172a; font-weight:800; margin-top:24px; margin-bottom:12px; font-size:18px;">$1</h3>');
  str = str.replace(/^## (.*$)/gim, '<h2 style="color:#0f172a; font-weight:800; margin-top:24px; margin-bottom:12px; font-size:20px;">$1</h2>');
  str = str.replace(/^# (.*$)/gim, '<h1 style="color:#0f172a; font-weight:900; margin-top:24px; margin-bottom:12px; font-size:22px;">$1</h1>');

  // 4. Convert markdown bold (**text** or __text__)
  str = str.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  str = str.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // 5. Convert markdown italic (*text* or _text_)
  str = str.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // 6. Convert bullet lists (- item or * item or • item)
  const lines = str.split('\n');
  let inList = false;
  let htmlLines = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (/^[-*•]\s+/.test(trimmed)) {
      if (!inList) {
        inList = true;
        htmlLines.push('<ul style="margin: 16px 0; padding-left: 24px; color: #334155;">');
      }
      const itemText = trimmed.replace(/^[-*•]\s+/, '');
      htmlLines.push(`<li style="margin-bottom: 8px;">${itemText}</li>`);
    } else {
      if (inList) {
        inList = false;
        htmlLines.push('</ul>');
      }
      htmlLines.push(line);
    }
  }
  if (inList) htmlLines.push('</ul>');
  str = htmlLines.join('\n');

  // 7. Split into paragraphs
  const paragraphs = str.split(/\n\s*\n/).filter(p => p.trim());
  return paragraphs.map(p => {
    const trimmed = p.trim();
    if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol') || trimmed.startsWith('<blockquote')) {
      return trimmed;
    }
    return `<p style="margin-top:0; margin-bottom:16px; line-height:1.7; color:#334155;">${trimmed.replace(/\n/g, '<br/>')}</p>`;
  }).join('\n');
}

/**
 * Premium Vibrant Colorful Light HTML Email Template Builder for Amit Solution Hub
 */
export function createEmailTemplate({
  title = 'Amit Solution Hub',
  subtitle = 'Tech & Learning Portal',
  badgeText = 'OFFICIAL ANNOUNCEMENT',
  bodyContent = '',
  ctaText = 'Explore Programs & Projects',
  ctaUrl = 'https://www.amitsolutionhub.com'
}) {
  const currentYear = new Date().getFullYear();
  const formattedBody = formatBodyToHtml(bodyContent);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f1f5f9;
      padding: 40px 12px;
    }
    .main-card {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 28px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      box-shadow: 0 20px 30px -10px rgba(79, 70, 229, 0.12), 0 10px 15px -5px rgba(0, 0, 0, 0.04);
    }
    .header-banner {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #d946ef 100%);
      padding: 42px 30px;
      text-align: center;
      color: #ffffff;
      position: relative;
    }
    .brand-pill {
      display: inline-block;
      padding: 6px 16px;
      background: rgba(255, 255, 255, 0.22);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.4);
      border-radius: 50px;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 14px;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .header-title {
      font-size: 25px;
      font-weight: 900;
      margin: 0;
      letter-spacing: -0.5px;
      color: #ffffff;
      line-height: 1.3;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    }
    .header-subtitle {
      font-size: 13px;
      font-weight: 700;
      margin-top: 8px;
      color: #f1f5f9;
      opacity: 0.95;
    }
    .accent-bar {
      height: 4px;
      width: 100%;
      background: linear-gradient(90deg, #3b82f6, #a855f7, #ec4899, #10b981);
    }
    .content-body {
      padding: 38px 32px;
      color: #334155;
      font-size: 15px;
      line-height: 1.7;
    }
    .content-body h1, .content-body h2, .content-body h3, .content-body h4 {
      color: #0f172a;
      margin-top: 0;
      font-weight: 900;
      letter-spacing: -0.3px;
    }
    .content-body p {
      margin-top: 0;
      margin-bottom: 16px;
      color: #334155;
    }
    .content-body ul, .content-body ol {
      padding-left: 20px;
      margin-bottom: 20px;
      color: #334155;
    }
    .content-body li {
      margin-bottom: 8px;
    }
    .content-body a {
      color: #4f46e5;
      font-weight: 700;
      text-decoration: underline;
    }
    .content-body blockquote {
      margin: 20px 0;
      padding: 16px 20px;
      background-color: #f8fafc;
      border-left: 4px solid #6366f1;
      border-radius: 0 12px 12px 0;
      color: #1e293b;
      font-style: normal;
    }
    .cta-container {
      text-align: center;
      margin: 36px 0 16px;
    }
    .cta-btn {
      display: inline-block;
      padding: 16px 40px;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: #ffffff !important;
      font-weight: 900;
      font-size: 15px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      border-radius: 50px;
      text-decoration: none !important;
      box-shadow: 0 12px 24px -6px rgba(79, 70, 229, 0.45);
      transition: all 0.3s ease;
    }
    .footer {
      background-color: #f8fafc;
      padding: 28px 32px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      color: #64748b;
      font-size: 12px;
    }
    .footer strong {
      color: #0f172a;
    }
    .footer a {
      color: #4f46e5;
      text-decoration: none;
      font-weight: 700;
    }
    .msme-badge {
      display: inline-block;
      margin-top: 12px;
      padding: 5px 14px;
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: 30px;
      font-size: 11px;
      font-weight: 800;
      color: #15803d;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main-card">
      
      <!-- Colorful Header Banner -->
      <div class="header-banner">
        ${badgeText ? `<div class="brand-pill">✨ ${badgeText}</div>` : ''}
        <h1 class="header-title">${title}</h1>
        ${subtitle ? `<div class="header-subtitle">${subtitle}</div>` : ''}
      </div>

      <!-- Accent Gradient Line -->
      <div class="accent-bar"></div>

      <!-- Main Body Content -->
      <div class="content-body">
        ${formattedBody}

        ${ctaUrl && ctaText ? `
          <div class="cta-container">
            <a href="${ctaUrl}" target="_blank" class="cta-btn">${ctaText} &rarr;</a>
          </div>
        ` : ''}
      </div>

      <!-- Clean Light Footer -->
      <div class="footer">
        <p style="margin: 0 0 6px 0; font-size: 13px;"><strong>Amit Solution Hub Technology Pvt Ltd</strong></p>
        <p style="margin: 0 0 10px 0;">India's Premium Tech Learning &amp; Internship Platform</p>
        <div style="margin-bottom: 12px;">
          <span class="msme-badge">🛡️ Govt. Registered MSME Hub</span>
        </div>
        <p style="margin: 0;">&copy; ${currentYear} Amit Solution Hub. All rights reserved. | <a href="https://www.amitsolutionhub.com">amitsolutionhub.com</a></p>
      </div>

    </div>
  </div>
</body>
</html>
  `;
}
