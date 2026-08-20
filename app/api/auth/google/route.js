export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

export async function GET(request) {
  try {
    if (!GOOGLE_CLIENT_ID) {
      console.warn('⚠️ GOOGLE_CLIENT_ID is not configured in environment variables.');
      const host = request.headers.get('host') || 'www.amitsolutionhub.com';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      return NextResponse.redirect(`${protocol}://${host}/login?error=google_not_configured`);
    }

    const host = request.headers.get('host') || 'www.amitsolutionhub.com';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const callbackUrl = process.env.GOOGLE_CALLBACK_URL || `${protocol}://${host}/api/auth/google/callback`;

    const state = Math.random().toString(36).substring(7);

    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    googleAuthUrl.searchParams.set('redirect_uri', callbackUrl);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'openid email profile');
    googleAuthUrl.searchParams.set('prompt', 'select_account');
    googleAuthUrl.searchParams.set('state', state);

    return NextResponse.redirect(googleAuthUrl.toString());
  } catch (error) {
    console.error('Google OAuth init error:', error);
    const host = request.headers.get('host') || 'www.amitsolutionhub.com';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    return NextResponse.redirect(`${protocol}://${host}/login?error=google_server_error`);
  }
}
