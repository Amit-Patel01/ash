/**
 * Premium Responsive HTML Email Template Builder for Amit Solution Hub
 */
export function createEmailTemplate({
  title = 'Amit Solution Hub',
  subtitle = 'Tech & Learning Portal',
  badgeText = 'OFFICIAL ANNOUNCEMENT',
  bodyContent = '',
  ctaText = 'Visit Website',
  ctaUrl = 'https://amitsolutionhub.com'
}) {
  const currentYear = new Date().getFullYear();

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
      background-color: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #0f172a;
      padding: 30px 15px;
    }
    .main-card {
      max-width: 600px;
      margin: 0 auto;
      background-color: #1e293b;
      border-radius: 24px;
      border: 1px solid #334155;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
    }
    .header-banner {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #c026d3 100%);
      padding: 36px 30px;
      text-align: center;
      color: #ffffff;
    }
    .brand-pill {
      display: inline-block;
      padding: 5px 14px;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 50px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 12px;
      color: #ffffff;
    }
    .header-title {
      font-size: 24px;
      font-weight: 900;
      margin: 0;
      letter-spacing: -0.5px;
      color: #ffffff;
    }
    .header-subtitle {
      font-size: 13px;
      font-weight: 600;
      margin-top: 6px;
      opacity: 0.9;
      color: #e2e8f0;
    }
    .content-body {
      padding: 32px 30px;
      color: #cbd5e1;
      font-size: 14px;
      line-height: 1.7;
    }
    .content-body h1, .content-body h2, .content-body h3 {
      color: #ffffff;
      margin-top: 0;
      font-weight: 800;
    }
    .content-body a {
      color: #818cf8;
      text-decoration: none;
    }
    .cta-container {
      text-align: center;
      margin: 32px 0 16px;
    }
    .cta-btn {
      display: inline-block;
      padding: 16px 36px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #ffffff !important;
      font-weight: 800;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-radius: 14px;
      text-decoration: none;
      box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4);
    }
    .footer {
      background-color: #0f172a;
      padding: 24px 30px;
      text-align: center;
      border-top: 1px solid #334155;
      color: #64748b;
      font-size: 12px;
    }
    .footer a {
      color: #94a3b8;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main-card">
      
      <!-- Header Banner -->
      <div class="header-banner">
        ${badgeText ? `<div class="brand-pill">${badgeText}</div>` : ''}
        <h1 class="header-title">${title}</h1>
        <div class="header-subtitle">${subtitle}</div>
      </div>

      <!-- Main Body -->
      <div class="content-body">
        ${bodyContent}

        ${ctaUrl && ctaText ? `
          <div class="cta-container">
            <a href="${ctaUrl}" target="_blank" class="cta-btn">${ctaText} &rarr;</a>
          </div>
        ` : ''}
      </div>

      <!-- Footer -->
      <div class="footer">
        <p style="margin: 0 0 8px 0;"><strong>Amit Solution Hub Technology Pvt Ltd</strong></p>
        <p style="margin: 0 0 12px 0;">Empowering Digital Innovation | MSME Registered</p>
        <p style="margin: 0;">&copy; ${currentYear} Amit Solution Hub. All rights reserved. | <a href="https://amitsolutionhub.com/contact">Contact Support</a></p>
      </div>

    </div>
  </div>
</body>
</html>
  `;
}
