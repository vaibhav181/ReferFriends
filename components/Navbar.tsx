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

  // ✅ Smart display name
  const displayName =
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'User';

  // ✅ Company fallback
  const company =
    user?.user_metadata?.company ||
    'Recruit';

  // ✅ Avatar initial
  const initial = displayName.charAt(0).toUpperCase();

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
                      {displayName}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {company}
                    </p>
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2563EB] to-[#4F46E5] flex items-center justify-center text-white font-bold text-sm">
                    {initial}
                  </div>
                </div>

                {/* Logout */}
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