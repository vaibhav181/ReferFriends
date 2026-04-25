'use client';

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { Button } from "./Button";

export function Navbar() {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/auth/signin";
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b-2 border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/jobs"
            className="flex items-center gap-2 text-2xl font-bold text-[#2563EB] hover:opacity-80 transition-opacity"
          >
            <span className="text-3xl">🤝</span>
            <span>ReferFriends</span>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-6">
            {user ? (
              <>
                {/* User Info */}
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-[#0F172A]">
                      {user.user_metadata?.username || 'User'}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {user.user_metadata?.company_name || 'Recruit'}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2563EB] to-[#4F46E5] flex items-center justify-center text-white font-bold text-sm">
                    {user.user_metadata?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '👤'}
                  </div>
                </div>

                {/* Logout Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </Button>
              </>
            ) : (
              <Link href="/auth/signin">
                <Button variant="primary" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
