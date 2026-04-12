"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useAuthStore } from "@/store/authStore";

export default function UserNavbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = () => {
    const confirmed = window.confirm("Bạn có chắc muốn đăng xuất không?");
    if (!confirmed) {
      return;
    }

    logout();
    localStorage.removeItem("quiz_user");
    document.cookie = "quiz_logged_in=; path=/; max-age=0; samesite=lax";
    document.cookie = "quiz_role=; path=/; max-age=0; samesite=lax";
    router.push("/");
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex shrink-0 items-center gap-2">
            <Image src="/favicon.ico" width={40} height={40} alt="logo" />
            <Link
              href="/"
              className="inline-flex items-center text-2xl font-bold leading-none bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition duration-200"
            >
              Winter Quiz
            </Link>
          </div>

          <div className="flex gap-4 items-center">
            {user ? (
              <>
                <span className="p-1 font-bold text-sky-800">{user.name}</span>
                <Button onClick={handleLogout}>Đăng xuất</Button>
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
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
