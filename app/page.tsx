"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

// Fake data
const guestHighlights = [
  { label: "Bộ đề", value: "120+" },
  { label: "Chủ đề", value: "18" },
  { label: "Người học", value: "5.2k" },
];

const userStats = [
  { label: "Bài đã làm", value: "24" },
  { label: "Điểm trung bình", value: "8.1/10" },
  { label: "Chuỗi ngày học", value: "6 ngày" },
];

const recentActivities = [
  "Hoàn thành đề Toán cơ bản - 8.5 điểm",
  "Làm mới đề Tiếng Anh giao tiếp",
  "Đặt mục tiêu 3 bài mới trong tuần này",
];

const featureList = [
  "Luyện đề theo chủ đề và cấp độ.",
  "Thống kê kết quả theo từng lần làm bài.",
  "Tối ưu giao diện trên desktop và mobile.",
];

export default function Home() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (user?.role === "ADMIN") {
      router.replace("/admin");
    }
  }, [router, user]);

  if (user?.role === "ADMIN") {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-linear-to-b from-slate-50 via-sky-50/70 to-blue-100/60 px-4 py-8 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="rounded-2xl border border-sky-100 bg-white/95 px-8 py-6 text-center shadow-xl shadow-slate-200/60">
          <p className="text-slate-700 font-semibold">Đang chuyển đến trang quản trị...</p>
        </div>
      </main>
    );
  }

  const stats = user ? userStats : guestHighlights;

  return (
    <main className="min-h-[calc(100vh-64px)] bg-linear-to-b from-slate-50 via-sky-50/70 to-blue-100/60 px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-6xl rounded-3xl border border-sky-100 bg-white/95 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-sm md:p-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="space-y-4">

              {user ? (
                <>
                  <h1 className="text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
                    Xin chào, {user.name}! Đây là trang chủ của bạn.
                  </h1>
                  <p className="text-slate-600">
                    Theo dõi tiến độ học, xem hoạt động gần đây và tiếp tục bài đang làm ngay
                    tại đây.
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                      Quyền: {user.role}
                    </span>
                    <span className="rounded-md bg-slate-100 px-3 py-1 text-sm text-slate-600">
                      {user.email}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      render={<Link href="/quiz" />}
                      nativeButton={false}
                      className="h-10 rounded-lg bg-sky-600 px-5 font-semibold text-white hover:bg-sky-700"
                    >
                      Xem quiz
                    </Button>
                    <Button
                      variant="outline"
                      render={<Link href="/" />}
                      nativeButton={false}
                      className="h-10 rounded-lg border-slate-300 bg-white px-5 font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Làm mới trang
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
                    Nền tảng ôn luyện và kiểm tra kiến thức trực tuyến
                  </h1>
                  <p className="text-slate-600">
                    Winter Quiz giúp bạn luyện đề theo chủ đề, theo dõi tiến độ và nâng cao
                    kết quả qua từng bài làm.
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      render={<Link href="/login" />}
                      nativeButton={false}
                      className="h-10 rounded-lg bg-sky-600 px-5 font-semibold text-white hover:bg-sky-700"
                    >
                      Đăng nhập
                    </Button>
                    <Button
                      variant="outline"
                      render={<Link href="/register" />}
                      nativeButton={false}
                      className="h-10 rounded-lg border-slate-300 bg-white px-5 font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Đăng ký
                    </Button>
                  </div>
                </>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>

            {user && (
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <h2 className="text-base font-semibold text-slate-900">Hoạt động gần đây</h2>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {recentActivities.map((activity) => (
                    <li key={activity} className="rounded-md bg-slate-50 px-3 py-2">
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="rounded-2xl border border-sky-100 bg-linear-to-b from-sky-600 to-blue-700 p-5 text-white">
            <h2 className="text-lg font-bold">Thông tin nhanh</h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-sky-50">
              {featureList.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            {!user && (
              <div className="mt-5 rounded-lg bg-white/15 p-4">
                <p className="text-sm font-medium text-white">Mẹo học tập</p>
                <p className="mt-2 text-sm text-sky-50">
                  Mỗi ngày 20 phút làm đề ngắn sẽ giúp bạn tăng điểm ổn định sau 2-3 tuần.
                </p>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
