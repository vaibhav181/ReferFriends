'use client';

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export function Navbar() {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/auth/signin";
  };

  return (
    <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      {/* Logo */}
      <Link href="/jobs" className="text-white font-bold text-2xl hover:opacity-90 transition">
        🤝 ReferFriends
      </Link>

      {/* Right Side */}
      <div className="flex items-center gap-6">
        {user ? (
          <>
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-white text-sm font-medium">
                  {user.user_metadata?.username || user.email?.split('@')[0]}
                </p>
                <p className="text-blue-100 text-xs">
                  {user.email}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white font-bold">
                {(user.user_metadata?.username || user.email)?.[0]?.toUpperCase() || '👤'}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105"
            >
              🚪 Logout
            </button>
          </>
        ) : (
          <Link
            href="/auth/signin"
            className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}
