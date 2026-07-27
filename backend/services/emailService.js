const { Resend } = require("resend");

const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) {
  console.warn("⚠️  WARNING: RESEND_API_KEY is not set. Emailing will fail.");
}

const resend = new Resend(RESEND_API_KEY || "re_dummy_key_to_prevent_crash");

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

    const result = await resend.emails.send({
      from: process.env.FROM_EMAIL || "Amit Solution Hub <support@amitsolutionhub.com>",
      to,
      subject,
      html: html || undefined,
      text: text || undefined,
      attachments: attachments || undefined,
    });



    // Check if Resend returned an error
    if (result.error) {
      return { success: false, error: result.error.message || String(result.error) };
    }

    // Return success with email ID
    return { success: true, id: result.id };
  } catch (error) {
    const errorMessage = error?.message || String(error);
    console.error("Email send error:", errorMessage);
    return { success: false, error: errorMessage };
  }
};

module.exports = { resend, emailTemplate, sendEmail };
