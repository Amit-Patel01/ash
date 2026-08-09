const express = require('express');
const router = express.Router();
const { getDb } = require('../utils/mongo');
const crypto = require('crypto');
const { logger } = require('../logger');

/**
 * Generate a unique, secure unsubscribe token for a user email
 */
const generateUnsubscribeToken = (email) => {
  const secret = process.env.JWT_SECRET || 'amitsolutionhub-secret';
  return crypto.createHmac('sha256', secret).update(email.toLowerCase().trim()).digest('hex').slice(0, 32);
};

/**
 * GET /api/unsubscribe?email=xxx&token=yyy
 * User clicks the unsubscribe link from email — marks them as unsubscribed
 */
router.get('/', async (req, res) => {
  const { email, token } = req.query;

  if (!email || !token) {
    return res.status(400).send(renderPage('❌ Invalid Link', 'This unsubscribe link is missing required parameters. Please contact support@amitsolutionhub.com', false));
  }

  const expectedToken = generateUnsubscribeToken(email);
  if (token !== expectedToken) {
    return res.status(400).send(renderPage('❌ Invalid Token', 'This link has expired or is invalid. Please contact support@amitsolutionhub.com', false));
  }

  try {
    const db = getDb();
    const result = await db.collection('users').updateOne(
      { email: email.toLowerCase().trim() },
      { $set: { emailUnsubscribed: true, unsubscribedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      // Email not found — still mark in a separate unsubscribe list
      await db.collection('email_unsubscribes').updateOne(
        { email: email.toLowerCase().trim() },
        { $set: { email: email.toLowerCase().trim(), unsubscribedAt: new Date() } },
        { upsert: true }
      );
    }

    logger.info(`[Unsubscribe] ${email} unsubscribed from newsletters.`);
    return res.send(renderPage(
      '✅ Newsletter Unsubscribed',
      `<strong>${email}</strong> will no longer receive <strong>newsletters and promotional emails</strong> from Amit Solution Hub.<br/><br/>⚠️ <strong>Note:</strong> You will still receive important transactional emails such as:<br/>• Password reset links<br/>• Order confirmations &amp; receipts<br/>• Certificate download links<br/>• Account verification emails<br/><br/>These cannot be turned off as they are essential for your account.<br/><br/>If you change your mind, contact <a href="mailto:support@amitsolutionhub.com" style="color:#2563eb;">support@amitsolutionhub.com</a>`,
      true
    ));

  } catch (err) {
    logger.error(`[Unsubscribe] Error for ${email}: ${err.message}`);
    return res.status(500).send(renderPage('⚠️ Server Error', 'Something went wrong. Please try again or contact support@amitsolutionhub.com', false));
  }
});

/**
 * POST /api/unsubscribe/resubscribe
 * Admin or user can re-enable emails
 */
router.post('/resubscribe', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'email is required' });

  try {
    const db = getDb();
    await db.collection('users').updateOne(
      { email: email.toLowerCase().trim() },
      { $set: { emailUnsubscribed: false }, $unset: { unsubscribedAt: '' } }
    );
    await db.collection('email_unsubscribes').deleteOne({ email: email.toLowerCase().trim() });
    res.json({ success: true, message: `${email} re-subscribed to emails.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Render a clean HTML unsubscribe confirmation page
 */
const renderPage = (title, message, success) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Amit Solution Hub</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .card { background: #0f172a; border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 48px 40px; max-width: 480px; width: 100%; text-align: center; box-shadow: 0 25px 50px rgba(0,0,0,0.5); }
    .icon { font-size: 48px; margin-bottom: 20px; }
    h1 { color: #f1f5f9; font-size: 24px; font-weight: 800; margin-bottom: 16px; }
    p { color: #94a3b8; font-size: 15px; line-height: 1.6; }
    a { color: #3b82f6; }
    .badge { display: inline-block; margin-top: 28px; padding: 8px 20px; background: ${success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'}; border: 1px solid ${success ? '#22c55e' : '#ef4444'}; border-radius: 50px; color: ${success ? '#22c55e' : '#ef4444'}; font-size: 13px; font-weight: 700; }
    .home-link { display: inline-block; margin-top: 24px; padding: 12px 32px; background: linear-gradient(135deg, #2563eb, #1e40af); color: white; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? '✅' : '❌'}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <div class="badge">${success ? 'Newsletter Unsubscribed' : 'Action Failed'}</div>
    <br/>
    <a href="https://www.amitsolutionhub.com" class="home-link">← Back to Amit Solution Hub</a>
  </div>
</body>
</html>
`;

module.exports = { router, generateUnsubscribeToken };
