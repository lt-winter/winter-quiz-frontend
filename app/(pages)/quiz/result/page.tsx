"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";

interface QuizResultPayload {
  score?: number;
  marksGot?: number;
  correctAnswers?: number;
  attempted?: number;
  totalQuestions?: number;
  correctAnswer?: number;
  correct?: number;
  correctCount?: number;
  attemptedQuestions?: number;
  attemptedQuestion?: number;
  totalQuestion?: number;
  total?: number;
  quizId: string;
  quizTitle: string;
  completedAt: string;
  completedInSeconds: number;
}

export default function QuizResultPage() {
  const router = useRouter();
  const [result] = useState<QuizResultPayload | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const raw = sessionStorage.getItem("quiz_result_data");
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });

  const formatDuration = (totalSeconds: number) => {
    const safe = Math.max(0, totalSeconds || 0);
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const seconds = safe % 60;

    if (hours > 0) {
      return `${hours} giờ ${minutes} phút ${seconds} giây`;
    }

    return `${minutes} phút ${seconds} giây`;
  };

  if (!result) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl bg-white p-8 shadow-sm text-center space-y-4">
          <p className="text-gray-700 font-semibold">Không tìm thấy dữ liệu kết quả bài làm.</p>
          <Button onClick={() => router.push("/quiz")}>Về danh sách quiz</Button>
        </div>
      </div>
    );
  }

  const correctAnswers =
    result.correctAnswers ??
    result.correctAnswer ??
    result.correct ??
    result.correctCount ??
    0;

  const attempted =
    result.attempted ??
    result.attemptedQuestions ??
    result.attemptedQuestion ??
    0;

  const totalQuestions =
    result.totalQuestions ??
    result.totalQuestion ??
    result.total ??
    attempted;

  // Temporary business rule: score equals number of correct answers.
  const score = correctAnswers;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-100 p-6">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold text-emerald-700">Kết quả</h1>
          <p className="text-sm text-gray-500 mt-1">{result.quizTitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg bg-emerald-50 p-4">
            <p className="text-sm text-gray-600">Điểm</p>
            <p className="text-2xl font-bold text-emerald-700">{score}</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-gray-600">Câu đúng</p>
            <p className="text-2xl font-bold text-blue-700">{correctAnswers}</p>
          </div>
          <div className="rounded-lg bg-indigo-50 p-4">
            <p className="text-sm text-gray-600">Đã làm</p>
            <p className="text-2xl font-bold text-indigo-700">{attempted}/{totalQuestions}</p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-1">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Thời gian hoàn thành:</span> {formatDuration(result.completedInSeconds)}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Nộp lúc:</span> {new Date(result.completedAt).toLocaleString("vi-VN")}
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.push(`/quiz/${result.quizId}`)}>
            Xem lại bài quiz
          </Button>
          <Button onClick={() => router.push("/quiz")}>Về danh sách quiz</Button>
        </div>
      </div>
    </div>
  );
}
