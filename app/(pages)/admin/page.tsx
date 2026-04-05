"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";


export default function Home() {
  const user = useAuthStore((state) => state.user);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-linear-to-b from-slate-50 via-sky-50/70 to-blue-100/60 px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-6xl rounded-3xl border border-sky-100 bg-white/95 p-6 shadow-xl shadow-slate-200/60 backdrop-blur-sm md:p-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="space-y-4">
              <p className="inline-block rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
                Winter Quiz
              </p>

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
                      render={<Link href="/admin/quiz/add" />}
                      nativeButton={false}
                      className="h-10 rounded-lg bg-sky-600 px-5 font-semibold text-white hover:bg-sky-700"
                    >
                      Thêm quiz
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

          </div>
        </div>
      </section>
    </main>
  );
}
