const nodemailer = require("nodemailer");
const { logger } = require("../logger");

const SMTP_URL = process.env.SMTP_URL || process.env.MAIL_URL || "";
const SMTP_HOST = process.env.SMTP_HOST || process.env.MAIL_HOST || process.env.SMTP_HOSTNAME || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || process.env.MAIL_PORT || process.env.SMTP_PORT_NUMBER || "465", 10);
const SMTP_SECURE = process.env.SMTP_SECURE !== undefined ? process.env.SMTP_SECURE === "true" : (SMTP_PORT === 465);
const SMTP_USER = process.env.SMTP_USER || process.env.MAIL_USER || process.env.EMAIL_USER || process.env.GMAIL_USER || process.env.SMTP_USERNAME || "";
const SMTP_PASS = process.env.SMTP_PASS || process.env.MAIL_PASS || process.env.EMAIL_PASS || process.env.GMAIL_PASS || process.env.SMTP_PASSWORD || "";
const RESEND_API_KEY = process.env.RESEND_API_KEY || process.env.RESEND_KEY || "";
const RESEND_FROM = process.env.RESEND_FROM || process.env.FROM_EMAIL || process.env.SMTP_FROM || "";

const createTransporterConfig = ({ host, port, secure, user, pass }) => ({
  host,
  port,
  secure,
  family: 4,
  connectionTimeout: 12000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  auth: (user && pass) ? {
    user,
    pass,
  } : undefined,
  tls: {
    rejectUnauthorized: false
  }
});

const resolveSmtpConfig = () => {
  if (SMTP_URL) {
    try {
      const parsedUrl = new URL(SMTP_URL);
      const protocol = parsedUrl.protocol || "smtp:";
      const secure = protocol === "smtps:" || protocol === "smtp:" && (parsedUrl.port === "465" || parsedUrl.port === "" && parsedUrl.hostname.includes("gmail"));
      return {
        host: parsedUrl.hostname,
        port: Number.parseInt(parsedUrl.port || (secure ? "465" : "587"), 10),
        secure,
        user: decodeURIComponent(parsedUrl.username || ""),
        pass: decodeURIComponent(parsedUrl.password || "")
      };
    } catch (error) {
      logger.warn(`[Email] Invalid SMTP_URL provided: ${error.message}`);
    }
  }

  return {
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    user: SMTP_USER,
    pass: SMTP_PASS
  };
};

const smtpConfig = resolveSmtpConfig();
const transporter = nodemailer.createTransport(createTransporterConfig({
  host: smtpConfig.host,
  port: smtpConfig.port,
  secure: smtpConfig.secure,
  user: smtpConfig.user,
  pass: smtpConfig.pass,
}));
const fallbackTransporter = smtpConfig.port === 465 ? nodemailer.createTransport(createTransporterConfig({
  host: smtpConfig.host,
  port: 587,
  secure: false,
  user: smtpConfig.user,
  pass: smtpConfig.pass,
})) : null;

if (smtpConfig.user && smtpConfig.pass) {
  logger.info(`[Email] Nodemailer configured using SMTP host: ${smtpConfig.host}:${smtpConfig.port} (${smtpConfig.user}) [IPv4 Forced]`);
} else {
  logger.warn("⚠️ [Email] SMTP credentials are not configured. Configure SMTP_* or RESEND_API_KEY for production mail dispatch.");
}

/**
 * Samsung / Apple Grade Premium Animated Email Template Wrapper
 */
const emailTemplate = (subject, content, ctaText = null, ctaUrl = null, headerColor = '#2563eb', categoryBadge = null, unsubscribeUrl = null) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    @keyframes neonPulse {
      0% { opacity: 0.8; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.02); }
      100% { opacity: 0.8; transform: scale(1); }
    }
    @keyframes shimmerBar {
      0% { background-position: -200px 0; }
      100% { background-position: 200px 0; }
    }
    .hover-glow:hover {
      transform: translateY(-3px) scale(1.01) !important;
      box-shadow: 0 16px 32px -4px rgba(37, 99, 235, 0.45) !important;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 12px;">
    <tr>
      <td align="center">
        <div style="max-width: 600px; width: 100%; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 28px; overflow: hidden; background-color: #0f172a; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);">
          
          <!-- Animated Metallic Header (Samsung/Apple Style) -->
          <div style="background: radial-gradient(circle at 50% 0%, ${headerColor} 0%, #090d16 85%); padding: 42px 28px; text-align: center; position: relative; border-b: 1px solid rgba(255, 255, 255, 0.1);">
            
            ${categoryBadge ? `
              <div style="display: inline-block; margin-bottom: 16px; padding: 5px 16px; background: rgba(255, 255, 255, 0.12); backdrop-filter: blur(12px); border-radius: 50px; border: 1px solid rgba(255, 255, 255, 0.25); color: #ffffff; font-size: 11px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                ✨ ${categoryBadge}
              </div>
            ` : ''}
            
            <div style="margin-bottom: 16px;">
              <img src="https://www.amitsolutionhub.com/logo.png" alt="Amit Solution Hub" style="height: 56px; filter: drop-shadow(0 6px 12px rgba(0,0,0,0.4)); max-width: 100%;" />
            </div>

            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; line-height: 1.35; text-shadow: 0 4px 10px rgba(0,0,0,0.5);">
              ${subject}
            </h1>
          </div>

          <!-- Animated Top Shimmer Bar -->
          <div style="height: 3px; width: 100%; background: linear-gradient(90deg, ${headerColor}, #a855f7, #3b82f6, ${headerColor}); background-size: 400% 100%;"></div>

          <!-- Main Glassmorphism Card Body -->
          <div style="padding: 38px 32px; background-color: #ffffff; color: #0f172a; line-height: 1.65; font-size: 15px;">
            ${content}
            
            ${ctaText && ctaUrl ? `
              <div style="text-align: center; margin: 38px 0 26px;">
                <a href="${ctaUrl}" class="hover-glow" style="background: linear-gradient(135deg, ${headerColor} 0%, #1e1b4b 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 50px; font-weight: 900; font-size: 15px; display: inline-block; box-shadow: 0 10px 25px -5px ${headerColor}70; transition: all 0.3s ease; letter-spacing: 0.3px;">
                  ${ctaText} →
                </a>
              </div>
            ` : ''}

            <!-- Author & MSME Seal -->
            <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between;">
              <div>
                <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Official Direct Contact</p>
                <p style="margin: 2px 0 0; color: #0f172a; font-weight: 900; font-size: 16px;">Amit Patel</p>
                <p style="margin: 0; font-size: 12px; color: #2563eb; font-weight: 700;">Founder, Amit Solution Hub</p>
              </div>
              <div style="text-align: right;">
                <span style="display: inline-block; padding: 6px 14px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #86efac; border-radius: 30px; font-size: 11px; font-weight: 900; color: #15803d; box-shadow: 0 2px 6px rgba(22,163,74,0.15);">
                  🛡️ Govt. Registered MSME Hub
                </span>
              </div>
            </div>
          </div>

          <!-- Samsung-Grade Dark Footer -->
          <div style="background-color: #090d16; padding: 28px 32px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08);">
            <p style="margin: 0; font-size: 12px; color: #94a3b8; font-weight: 800; letter-spacing: 0.5px;">
              © 2026 Amit Solution Hub | Ultra-Premium Tech Platform
            </p>
            <p style="margin: 8px 0 0; font-size: 11px; color: #64748b;">
              Need instant support? Reply to this email or visit <a href="https://www.amitsolutionhub.com" style="color: #3b82f6; text-decoration: none; font-weight: 700;">amitsolutionhub.com</a>
            </p>
            ${unsubscribeUrl ? `
            <p style="margin: 14px 0 0; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.07); font-size: 11px; color: #475569;">
              Don't want promotional emails? 
              <a href="${unsubscribeUrl}" style="color: #ef4444; text-decoration: underline; font-weight: 700;">Unsubscribe from newsletters</a>
              &nbsp;—&nbsp; Only marketing emails will stop. Password resets &amp; order emails are unaffected.
            </p>
            ` : ''}
          </div>

        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
  return emailPattern.test(String(email).trim());
};

/**
 * Send a transactional email via Nodemailer ONLY
 * @param {Object} opts - { to, subject, html, text?, attachments? }
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
const normalizeRecipients = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(item => String(item || '').trim()).filter(Boolean);
  }

  return String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
};

const sendWithResend = async ({ to, subject, html, text }) => {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: RESEND_FROM || 'onboarding@resend.dev',
      to: normalizeRecipients(to),
      subject,
      html: html || `<p>${text || ''}</p>`,
      text: text || undefined,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || `Resend request failed (${response.status})`);
  }

  return { success: true, id: data.id || data.messageId, messageId: data.id || data.messageId };
};

const sendEmail = async ({ to, subject, html, text, attachments }) => {
  try {
    const recipients = normalizeRecipients(to);
    const invalidRecipients = recipients.filter(recipient => !isValidEmail(recipient));

    if (recipients.length === 0 || invalidRecipients.length > 0) {
      return { success: false, error: `Invalid recipient email: ${recipients.join(', ') || to}` };
    }

    if (!subject || !subject.trim()) {
      return { success: false, error: 'Email subject is required' };
    }

    if (!html && !text) {
      return { success: false, error: 'Email content (html or text) is required' };
    }

    const defaultFrom = RESEND_FROM || process.env.FROM_EMAIL || process.env.SMTP_FROM || `Amit Solution Hub <${smtpConfig.user || 'support@amitsolutionhub.com'}>`;

    const mailOptions = {
      from: defaultFrom,
      to: recipients,
      subject,
      html: html || undefined,
      text: text || undefined,
      attachments: attachments ? attachments.map(att => ({
        filename: att.filename || att.name,
        path: att.path,
        content: att.content,
        contentType: att.contentType
      })) : undefined,
    };

    if (!smtpConfig.user || !smtpConfig.pass) {
      if (RESEND_API_KEY) {
        logger.info(`[Email] SMTP credentials missing, sending via Resend fallback for ${recipients.join(', ')}`);
        const resendResult = await sendWithResend({ to: recipients, subject, html, text });
        logger.info(`[Email] Sent email via Resend to ${recipients.join(', ')}. MessageId: ${resendResult.messageId || resendResult.id}`);
        return resendResult;
      }

      logger.warn(`[Email] No SMTP credentials or Resend key configured for ${recipients.join(', ')}`);
      return { success: false, error: 'Email provider not configured for this environment' };
    }

    try {
      const info = await transporter.sendMail(mailOptions);
      logger.info(`[Email] Sent email via Nodemailer to ${recipients.join(', ')}. MessageId: ${info.messageId || info.response}`);
      return { success: true, id: info.messageId || info.response, messageId: info.messageId };
    } catch (primaryError) {
      if (fallbackTransporter) {
        logger.warn(`[Email] Primary transport error for ${recipients.join(', ')} (${primaryError.message}). Retrying via fallback (port 587)...`);
        try {
          const info = await fallbackTransporter.sendMail(mailOptions);
          logger.info(`[Email] Sent email via fallback Nodemailer to ${recipients.join(', ')}. MessageId: ${info.messageId || info.response}`);
          return { success: true, id: info.messageId || info.response, messageId: info.messageId };
        } catch (fallbackError) {
          const errorMessage = fallbackError?.message || String(fallbackError);
          logger.error(`[Email] Nodemailer fallback error for ${recipients.join(', ')}: ${errorMessage}`);
          if (RESEND_API_KEY) {
            logger.info(`[Email] Attempting Resend fallback after SMTP failure for ${recipients.join(', ')}`);
            const resendResult = await sendWithResend({ to: recipients, subject, html, text });
            logger.info(`[Email] Sent email via Resend fallback to ${recipients.join(', ')}. MessageId: ${resendResult.messageId || resendResult.id}`);
            return resendResult;
          }
          return { success: false, error: errorMessage };
        }
      }

      const errorMessage = primaryError?.message || String(primaryError);
      logger.error(`[Email] Nodemailer send error for ${recipients.join(', ')}: ${errorMessage}`);
      if (RESEND_API_KEY) {
        logger.info(`[Email] Attempting Resend fallback after SMTP failure for ${recipients.join(', ')}`);
        const resendResult = await sendWithResend({ to: recipients, subject, html, text });
        logger.info(`[Email] Sent email via Resend fallback to ${recipients.join(', ')}. MessageId: ${resendResult.messageId || resendResult.id}`);
        return resendResult;
      }
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    const errorMessage = error?.message || String(error);
    logger.error(`[Email] Nodemailer send error for ${to}: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
};

module.exports = { transporter, nodemailer, emailTemplate, sendEmail };
