"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { usePathname } from "next/navigation";
import UserNavbar from "./UserNavbar";
import AdminNavbar from "./AdminNavbar";

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const setUser = useAuthStore((state) => state.setUser);
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
        document.cookie = `quiz_logged_in=true; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
        document.cookie = `quiz_role=${encodeURIComponent(parsedUser.role || "USER")}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
      }
    } catch {
      localStorage.removeItem("quiz_user");
    }
  }, [hasHydrated, setUser, user]);

  useEffect(() => {
    if (!hasHydrated || !user) return;

    document.cookie = `quiz_logged_in=true; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
    document.cookie = `quiz_role=${encodeURIComponent(user.role || "USER")}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
  }, [hasHydrated, user]);

  if (hideNavbar) {
    return null;
  }

  if (!hasHydrated) {
    return null;
  }

  if (user?.role === "ADMIN") {
    return <AdminNavbar />;
  }

  return <UserNavbar />;
}
