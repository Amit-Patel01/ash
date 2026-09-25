import { Suspense } from 'react';
import ForgotPassword from '@/src/views/ForgotPassword';

export const metadata = {
  title: 'Reset Password | Ashnexa Systems',
  description: 'Set your new Ashnexa Systems account password.',
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-['Outfit',sans-serif]">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    }>
      <ForgotPassword />
    </Suspense>
  );
}
