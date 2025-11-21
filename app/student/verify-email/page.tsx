'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Mail, Loader } from 'lucide-react';
import axiosInstance from '@/utils/axiosInstance';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
    }
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await axiosInstance.get(`/api/student/verify-email?token=${token}`);
      if (response.status === 200) {
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
        
        // Dispatch event to update navbar
        window.dispatchEvent(new Event('studentAuthChange'));
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/student/login');
        }, 3000);
      }
    } catch (error: any) {
      setStatus('error');
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Failed to verify email. The link may be invalid or expired.');
      }
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    setResending(true);
    setMessage('');

    try {
      const response = await axiosInstance.post('/api/student/resend-verification', { email });
      if (response.status === 200) {
        setMessage('Verification email sent! Please check your inbox.');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Failed to resend verification email. Please try again.');
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 p-8">
          {status === 'loading' && (
            <div className="text-center">
              <Loader className="h-16 w-16 text-indigo-400 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-white mb-2">Verifying Email</h2>
              <p className="text-slate-400">Please wait while we verify your email address...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
              <p className="text-slate-400 mb-6">{message}</p>
              <p className="text-slate-500 text-sm mb-6">Redirecting to login page...</p>
              <Link
                href="/student/login"
                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
              >
                Go to Login
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
              <p className="text-slate-400 mb-6">{message}</p>

              <div className="bg-white/5 rounded-lg p-4 mb-6">
                <h3 className="text-white font-semibold mb-3 flex items-center justify-center gap-2">
                  <Mail className="h-5 w-5" />
                  Resend Verification Email
                </h3>
                <div className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleResendEmail}
                    disabled={resending}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resending ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                </div>
                {message && message.includes('sent') && (
                  <p className="text-green-400 text-sm mt-3">{message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Link
                  href="/student/login"
                  className="block w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold text-center"
                >
                  Go to Login
                </Link>
                <Link
                  href="/student/register"
                  className="block w-full text-indigo-400 hover:text-indigo-300 text-sm"
                >
                  Create New Account
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 p-8">
            <div className="text-center">
              <Loader className="h-16 w-16 text-indigo-400 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-white mb-2">Loading...</h2>
            </div>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

export default VerifyEmail;

