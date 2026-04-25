'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, loading } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.company.trim()) {
      setError('Company name is required');
      return;
    }

    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return;
    }

    try {
      // 🔥 Pass structured data clearly
      await signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        company: formData.company,
      });

      router.push('/auth/signin?message=Check your email to confirm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <span className="text-5xl">🤝</span>
          </div>
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">ReferFriends</h1>
          <p className="text-[#64748B]">
            Post jobs for free and build your referral network
          </p>
        </div>

        <Card padding="lg">
          {error && (
            <div className="mb-6 p-4 bg-[#FEE2E2] border-2 border-[#FECACA] text-[#991B1B] rounded-xl text-sm font-medium">
              ✕ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <Input
              label="Full Name"
              type="text"
              name="fullName"
              value={formData.fullName}
              placeholder="John Doe"
              icon="👤"
              required
              onChange={handleChange}
            />

            <Input
              label="Company Name"
              type="text"
              name="company"
              value={formData.company}
              placeholder="Your company name"
              icon="🏢"
              required
              onChange={handleChange}
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              placeholder="your@email.com"
              icon="📧"
              required
              onChange={handleChange}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              placeholder="••••••••"
              icon="🔒"
              required
              onChange={handleChange}
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              placeholder="••••••••"
              icon="🔒"
              required
              onChange={handleChange}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
            >
              Create Account
            </Button>
          </form>

          <div className="my-6 border-t-2 border-[#E2E8F0]" />

          <p className="text-center text-[#64748B]">
            Already have an account?{' '}
            <Link
              href="/auth/signin"
              className="text-[#2563EB] font-semibold hover:underline transition"
            >
              Sign in here
            </Link>
          </p>
        </Card>

        <p className="text-center text-xs text-[#94A3B8] mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}