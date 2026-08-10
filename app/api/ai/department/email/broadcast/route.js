export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { createEmailTemplate } from '@/lib/emailTemplate';
import { getDb } from '@/lib/db/mongo';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@amitsolutionhub.com';

async function getBroadcastRecipients(customRecipients) {
  if (Array.isArray(customRecipients) && customRecipients.length > 0) {
    return customRecipients;
  }

  try {
    const db = await getDb();
    if (db) {
      const [userDocs, blacklist] = await Promise.all([
        db.collection('users').find(
          { email: { $exists: true }, emailUnsubscribed: { $ne: true } },
          { projection: { email: 1 } }
        ).toArray().catch(() => []),
        db.collection('email_unsubscribes').distinct('email').catch(() => [])
      ]);

      const blackSet = new Set((blacklist || []).map(e => String(e).toLowerCase()));
      const validEmails = userDocs
        .map(u => u.email)
        .filter(e => e && typeof e === 'string' && e.includes('@') && !blackSet.has(e.toLowerCase().trim()));

      if (validEmails.length > 0) {
        return Array.from(new Set(validEmails));
      }
    }
  } catch (dbErr) {
    console.warn('⚠️ [BROADCAST] DB subscriber fetch warning:', dbErr.message);
  }

  return [ADMIN_EMAIL];
}

export async function POST(request) {
  try {
    const { subject = 'Announcement from Amit Solution Hub', body = '', recipientEmails } = await request.json();

    const recipients = await getBroadcastRecipients(recipientEmails);

    const formattedHtml = createEmailTemplate({
      title: subject,
      subtitle: 'Official AI Broadcast Email',
      badgeText: 'ANNOUNCEMENT',
      bodyContent: body,
      ctaText: 'Visit Amit Solution Hub',
      ctaUrl: 'https://www.amitsolutionhub.com'
    });

    const mailResult = await sendEmail({
      to: recipients.join(', '),
      subject,
      html: formattedHtml,
    });

    return NextResponse.json({
      success: true,
      emailSent: mailResult.success,
      recipientsCount: recipients.length,
      message: mailResult.success ? `Broadcast email sent successfully to ${recipients.length} recipient(s) via SMTP!` : `SMTP Error: ${mailResult.error}`
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

