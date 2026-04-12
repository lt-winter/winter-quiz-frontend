"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useAuthStore } from "@/store/authStore";

export default function AdminNavbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = () => {
    const confirmed = window.confirm("Bạn có chắc muốn đăng xuất khỏi trang quản trị không?");
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
    <nav className="bg-white border-b border-amber-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex shrink-0 items-center gap-2">
            <Image src="/favicon.ico" width={40} height={40} alt="logo" />
            <Link
              href="/admin"
              className="inline-flex items-center text-2xl font-bold leading-none bg-linear-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent hover:from-amber-700 hover:to-orange-700 transition duration-200"
            >
              Winter Quiz Admin
            </Link>
          </div>

          <div className="flex gap-3 items-center">
            <Link
              href="/admin"
              className="px-3 py-2 rounded-md text-sm font-medium text-amber-800 hover:bg-amber-50 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/quiz/add"
              className="px-3 py-2 rounded-md text-sm font-medium text-amber-800 hover:bg-amber-50 transition-colors"
            >
              Tạo Quiz
            </Link>
            <span className="px-2 py-1 rounded-md bg-amber-50 text-amber-800 text-sm font-semibold">
              {user?.name || "Admin"}
            </span>
            <Button
              onClick={handleLogout}
              className="bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
            >
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
