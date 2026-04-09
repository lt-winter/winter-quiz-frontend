"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const pathname = usePathname();
  const hideNavbar = pathname === "/register" || pathname === "/login";

  useEffect(() => {
    if (!hasHydrated || user) return;

    // Backward compatibility for older localStorage key.
    const rawUser = localStorage.getItem("quiz_user");
    if (!rawUser) return;

    try {
      const parsedUser = JSON.parse(rawUser);
      if (parsedUser?.id && parsedUser?.email) {
        setUser(parsedUser);
      }
    } catch {
      localStorage.removeItem("quiz_user");
    }
  }, [hasHydrated, setUser, user]);

  if (hideNavbar) {
    return null;
  }

  if (!hasHydrated) {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/App Name */}
          <div className="flex shrink-0 items-center gap-2">
            <Image src="/favicon.ico" width={40} height={40} alt="logo"></Image>
            <Link
              href="/"
              className="inline-flex items-center text-2xl font-bold leading-none bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition duration-200"
            >
              Winter Quiz
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex gap-4">
            {user ? (
              <>
                <span className="p-1 font-bold text-sky-800">{user.name}</span>
                <Button
                  onClick={() => {
                    logout();
                    localStorage.removeItem("quiz_user");
                  }}
                >
                  Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="px-4 py-2 text-gray-700 font-medium hover:text-blue-600 transition duration-200"
                >
                  Đăng ký
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition duration-200"
                >
                  Đăng nhập
                </Link>


              </>
            )
            }
          </div>
        </div>
      </div>
    </nav>
  );
}
