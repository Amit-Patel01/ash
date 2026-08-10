import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || 'support@amitsolutionhub.com';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'Amit Solution Hub <support@amitsolutionhub.com>';

export function getTransporter(port = SMTP_PORT, secure = SMTP_PORT === 465) {
  if (!SMTP_PASS) {
    console.warn('⚠️ SMTP_PASS is missing in environment variables.');
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3',
    },
    connectionTimeout: 6000,
    greetingTimeout: 5000,
    socketTimeout: 8000,
    dnsTimeout: 5000,
  });
}

const isValidEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
  return emailPattern.test(String(email).trim());
};

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

export async function sendEmail({ to, subject, html, text, from = FROM_EMAIL, attachments }) {
  if (!SMTP_PASS) {
    const msg = 'SMTP_PASS environment variable is missing on server.';
    console.error(`❌ [EMAIL FAILED] ${msg}`);
    return { success: false, error: msg };
  }

  const recipients = normalizeRecipients(to);
  const validRecipients = recipients.filter(isValidEmail);

  if (validRecipients.length === 0) {
    const msg = `No valid recipient emails provided: ${to}`;
    console.error(`❌ [EMAIL FAILED] ${msg}`);
    return { success: false, error: msg };
  }

  const mailOptions = {
    from,
    to: validRecipients,
    subject,
    html: html || undefined,
    text: text || undefined,
    attachments,
  };

  // Primary attempt
  const primaryTransporter = getTransporter(SMTP_PORT, SMTP_PORT === 465);
  if (!primaryTransporter) {
    return { success: false, error: 'Failed to create primary SMTP transporter.' };
  }

  try {
    const info = await primaryTransporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL SENT] Port ${SMTP_PORT} | MsgId: ${info.messageId || info.response} to ${validRecipients.join(', ')}`);
    return { success: true, messageId: info.messageId || info.response };
  } catch (primaryError) {
    console.warn(`⚠️ [EMAIL PORT ${SMTP_PORT} FAILED] ${primaryError.message}. Attempting fallback port...`);
    const fallbackPort = SMTP_PORT === 465 ? 587 : 465;
    const fallbackTransporter = getTransporter(fallbackPort, fallbackPort === 465);

    if (fallbackTransporter) {
      try {
        const info = await fallbackTransporter.sendMail(mailOptions);
        console.log(`✅ [EMAIL SENT FALLBACK] Port ${fallbackPort} | MsgId: ${info.messageId || info.response} to ${validRecipients.join(', ')}`);
        return { success: true, messageId: info.messageId || info.response };
      } catch (fallbackError) {
        console.error(`❌ [EMAIL ALL PORTS FAILED] Error sending to ${validRecipients.join(', ')}:`, fallbackError);
        return { success: false, error: fallbackError.message };
      }
    }

    console.error(`❌ [EMAIL ERROR] Error sending to ${validRecipients.join(', ')}:`, primaryError);
    return { success: false, error: primaryError.message };
  }
}

