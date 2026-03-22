import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quiz App",
  description: "A modern quiz application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white">
        {/* Navbar */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo/App Name */}
              <div className="shrink-0">
                <Link
                  href="/"
                  className="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition duration-200"
                >
                  Quiz App
                </Link>
              </div>

              {/* Navigation Links */}
              <div className="flex gap-4">
                <Link
                  href="/sign-in"
                  className="px-4 py-2 text-gray-700 font-medium hover:text-blue-600 transition duration-200"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition duration-200"
                >
                  Đăng ký
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        {children}
      </body>
    </html>
  );
}
