const nodemailer = require("nodemailer");

const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) {
  console.warn("WARNING: RESEND_API_KEY is not set. Resend email delivery is disabled.");
}

let resend = null;
let resendInitAttempted = false;
let resendInitError = null;
let smtpTransport = null;
let smtpInitAttempted = false;

const getResendClient = () => {
  if (resendInitAttempted) return resend;
  resendInitAttempted = true;

  if (!RESEND_API_KEY) {
    return null;
  }

  try {
    const { Resend } = require("resend");
    resend = new Resend(RESEND_API_KEY);
    return resend;
  } catch (error) {
    resendInitError = error;
    console.error("Failed to initialize Resend client:", error?.message || String(error));
    resend = null;
    return null;
  }
};

const getSmtpTransport = () => {
  if (smtpInitAttempted) return smtpTransport;
  smtpInitAttempted = true;

  const host = process.env.SMTP_HOST || process.env.MAIL_HOST;
  const port = Number(process.env.SMTP_PORT || process.env.MAIL_PORT || 587);
  const user = process.env.SMTP_USER || process.env.MAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.MAIL_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  smtpTransport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return smtpTransport;
};

/**
 * Premium Email Template Wrapper
 */
const emailTemplate = (subject, content, ctaText = null, ctaUrl = null) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <!-- Brand Header -->
    <div style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); padding: 40px 20px; text-align: center;">
      <img src="https://www.amitsolutionhub.com/logo.png" alt="Amit Solution Hub" style="height: 60px; margin-bottom: 20px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));" />
      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">${subject}</h1>
    </div>

    <!-- Content Body -->
    <div style="padding: 40px; color: #1e293b; line-height: 1.6;">
      ${content}
      
      ${
        ctaText && ctaUrl
          ? `
        <div style="text-align: center; margin: 40px 0;">
          <a href="${ctaUrl}" style="background-color: #2563eb; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);">
            ${ctaText}
          </a>
        </div>
      `
          : ""
      }

      <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #f1f5f9; font-size: 14px; color: #64748b;">
        <p>Best Regards,</p>
        <p style="color: #1e293b; font-weight: bold; margin-bottom: 0;">Amit Patel</p>
        <p style="margin-top: 0;">Founder, Amit Solution Hub</p>
      </div>
    </div>

    <!-- Professional Footer -->
    <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #f1f5f9;">
      <p style="margin: 0; font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
        © 2026 Amit Solution Hub | Registered MSME
      </p>
      <p style="margin: 8px 0 0; font-size: 11px; color: #cbd5e1;">
        Support: support@amitsolutionhub.com | Gujarat, India
      </p>
    </div>
  </div>
`;

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
  return emailPattern.test(String(email).trim());
};

/**
 * Send a transactional email via Resend
 * @param {Object} opts - { to, subject, html, text?, attachments? }
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
const sendEmail = async ({ to, subject, html, text, attachments }) => {
  try {
    // Validate recipient email
    if (!to || !isValidEmail(to)) {
      return { success: false, error: `Invalid recipient email: ${to}` };
    }

    // Validate subject and content
    if (!subject || !subject.trim()) {
      return { success: false, error: "Email subject is required" };
    }

    if (!html && !text) {
      return { success: false, error: "Email content (html or text) is required" };
    }

    const from = process.env.FROM_EMAIL || "Amit Solution Hub <support@amitsolutionhub.com>";
    const resendClient = getResendClient();

    if (resendClient) {
      const result = await resendClient.emails.send({
        from,
        to,
        subject,
        html: html || undefined,
        text: text || undefined,
        attachments: attachments || undefined,
      });

      if (!result.error) {
        return { success: true, id: result.id };
      }

      console.error("Resend API returned an error:", result.error.message || String(result.error));
    }

    const transport = getSmtpTransport();
    if (transport) {
      const result = await transport.sendMail({
        from,
        to,
        subject,
        html: html || undefined,
        text: text || undefined,
        attachments: attachments || undefined,
      });

      return {
        success: true,
        id: result.messageId || result.response || "smtp-sent",
      };
    }

    if (resendInitError) {
      return {
        success: false,
        error: `Email service unavailable: ${resendInitError.message || String(resendInitError)}`,
      };
    }

    return {
      success: false,
      error: "Email service unavailable: configure RESEND_API_KEY or SMTP credentials.",
    };
  } catch (error) {
    const errorMessage = error?.message || String(error);
    console.error("Email send error:", errorMessage);
    return { success: false, error: errorMessage };
  }
};

module.exports = { resend, emailTemplate, sendEmail };
