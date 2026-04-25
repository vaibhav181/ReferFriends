'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';

export default function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, loading, user } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      router.push('/jobs');
    }
  }, [user, router]);

  useEffect(() => {
    const msg = searchParams.get('message');
    if (msg) setMessage(msg);
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await signIn(formData.email, formData.password);
      router.push('/jobs');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <span className="text-5xl">🤝</span>
          </div>
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">ReferFriends</h1>
          <p className="text-[#64748B]">Post jobs and refer great candidates</p>
        </div>

        {/* Card */}
        <Card padding="lg">
          {/* Message Alert */}
          {message && (
            <div className="mb-6 p-4 bg-[#DBEAFE] border-2 border-[#93C5FD] text-[#0C4A6E] rounded-xl text-sm font-medium">
              ✓ {message}
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-[#FEE2E2] border-2 border-[#FECACA] text-[#991B1B] rounded-xl text-sm font-medium">
              ✕ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              icon="📧"
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              icon="🔒"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 border-t-2 border-[#E2E8F0]" />

          {/* Sign Up Link */}
          <p className="text-center text-[#64748B]">
            Don't have an account?{' '}
            <Link
              href="/auth/signup"
              className="text-[#2563EB] font-semibold hover:underline transition"
            >
              Sign up here
            </Link>
          </p>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-[#94A3B8] mt-6">
          By signing in, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}