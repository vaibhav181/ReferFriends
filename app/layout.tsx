'use client';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ReferFriends - Post Jobs for Free",
  description: "Post open jobs at your company for free. Help your team find great candidates.",
};

// 🔥 Navbar Component
function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <div className="w-full bg-white shadow-sm px-6 py-4 flex justify-between items-center">
      <Link href="/jobs" className="text-blue-600 font-bold text-xl">
        ReferFriends
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-gray-600">
              Signed in as {user.user_metadata?.username || user.email}
            </span>

            <button
              onClick={async () => {
                await signOut();
                window.location.href = "/auth/signin";
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            href="/auth/signin"
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}

// 🔥 Layout wrapper
function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}