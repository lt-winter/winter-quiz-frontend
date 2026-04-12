"use client";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, PlayCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function QuizList() {
  const [availableQuizzes, setAvailableQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchQuizzesWithQuestions = async () => {
      try {
        const res = await api.get("/api/quiz");
        const quizzes = Array.isArray(res.data) ? res.data : [];

        const hasQuestionMeta = (quiz: any) =>
          (Array.isArray(quiz?.questions) && quiz.questions.length > 0) ||
          Number(quiz?.questionCount) > 0 ||
          Number(quiz?.numberOfQuestions) > 0;

        const quizzesWithMeta = quizzes.filter(hasQuestionMeta);

        if (quizzesWithMeta.length === 0 && quizzes.length > 0) {
          const detailResults = await Promise.all(
            quizzes.map(async (quiz: any) => {
              try {
                const detailRes = await api.get(`/api/quiz/${quiz.id}`);
                const questions = detailRes.data?.questions;
                return Array.isArray(questions) && questions.length > 0 ? quiz : null;
              } catch {
                return null;
              }
            })
          );

          setAvailableQuizzes(detailResults.filter(Boolean));
          return;
        }

        setAvailableQuizzes(quizzesWithMeta);
      } catch (err) {
        console.error("Lỗi lấy danh sách quiz:", err);
        setErrorMessage("Không thể tải danh sách quiz. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    void fetchQuizzesWithQuestions();
  }, []);

  const getFormattedTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds <= 0) {
      return "Không giới hạn";
    }

    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    }

    return `${minutes} phút ${remainingSeconds} giây`;
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm px-10 py-8 text-center space-y-3">
          <Loader2 className="mx-auto h-8 w-8 text-indigo-600 animate-spin" />
          <p className="text-gray-700 font-semibold">Đang tải danh sách quiz...</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center space-y-4 max-w-md w-full">
          <p className="text-red-600 font-semibold">{errorMessage}</p>
          <Button onClick={() => window.location.reload()}>Tải lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-indigo-900">Quiz khả dụng</h1>
          <p className="text-gray-500 mt-2">Chọn một bài thi để bắt đầu kiểm tra kiến thức của bạn.</p>
        </header>

        {/* Danh sách bài thi */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {availableQuizzes.map((quiz: any) => (
            <Card key={quiz.id} className="hover:shadow-2xl transition-all transform hover:-translate-y-1 bg-white">
              <CardHeader className="border-b bg-indigo-50/50 rounded-t-xl">
                <CardTitle className="text-xl text-indigo-800">{quiz.title}</CardTitle>
              </CardHeader>

              <CardContent className="py-6 space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Clock className="text-indigo-500" size={18} />
                  <span className="font-medium">Thời gian:</span> {getFormattedTime(quiz.time)}
                </div>
                <div className="flex items-start gap-3 text-gray-600">
                  <BookOpen className="text-indigo-500 mt-1" size={18} />
                  <p className="text-sm italic line-clamp-2">{quiz.description || "Không có mô tả cho bài thi này."}</p>
                </div>
              </CardContent>

              {/* Nút Start Test quan trọng nhất */}
              <CardFooter className="pt-0">
                <Link href={`/quiz/${quiz.id}`} className="w-full">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg font-bold">
                    <PlayCircle className="mr-2" /> Bắt đầu
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Trường hợp chưa có bài thi nào */}
        {availableQuizzes.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl shadow-inner border-2 border-dashed">
            <p className="text-gray-400 text-lg">Hiện tại không có Quiz nào đang mở.</p>
          </div>
        )}
      </div>
    </div>
  );
}