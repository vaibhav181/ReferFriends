'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-blue-600">ReferFriends</h1>
              <div className="space-x-4">
                <Link
                  href="/jobs"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Browse Jobs
                </Link>
                <Link
                  href="/jobs/create"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Post a Job
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Post Jobs. For Free.
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Help your team find great candidates by posting open positions on ReferFriends.
            </p>
            <div className="space-x-4">
              <Link
                href="/jobs/create"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Post Your First Job
              </Link>
              <Link
                href="/jobs"
                className="inline-block bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Browse Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
