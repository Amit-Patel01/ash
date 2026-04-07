const { Resend } = require("resend");

const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) {
  console.warn("⚠️  WARNING: RESEND_API_KEY is not set. Emailing will fail.");
}

const resend = new Resend(RESEND_API_KEY || "re_dummy_key_to_prevent_crash");

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
 * Send a transactional email via Resend
 * @param {Object} opts - { to, subject, html, text? }
 */
const sendEmail = async ({ to, subject, html, text }) => {
  return resend.emails.send({
    from: "Amit Solution Hub <support@amitsolutionhub.com>",
    to,
    subject,
    html: html || undefined,
    text: text || undefined,
  });
};

module.exports = { resend, emailTemplate, sendEmail };
