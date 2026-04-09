"use client";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, PlusCircle, Eye, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    api.get("/api/quiz")
      .then((res) => setQuizzes(res.data))
      .catch((err) => {
        console.error("Lỗi lấy danh sách bài thi:", err);
        setErrorMessage("Không thể tải danh sách bài thi. Vui lòng thử lại.");
      })
      .finally(() => setLoading(false));
  }, []);

  const getFormattedTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
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
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz: any) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow border-t-4 border-indigo-600">
              <CardHeader>
                <CardTitle className="text-xl text-indigo-700">{quiz.title}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Clock size={16} />
                  <span className="font-semibold">Thời gian:</span>
                  {getFormattedTime(quiz.time)}
                </div>
                <div className="flex items-start gap-2 text-gray-600 text-sm">
                  <BookOpen size={16} className="mt-1" />
                  <p className="line-clamp-3">{quiz.description}</p>
                </div>
              </CardContent>

              <CardFooter className="flex gap-2 border-t pt-4">
                <Link href={`/admin/quiz/${quiz.id}`} className="flex-1">
                  <Button variant="outline" className="w-full flex gap-2">
                    <Eye size={16} /> Xem
                  </Button>
                </Link>
                <Link href={`/admin/add-question/${quiz.id}`} className="flex-1">
                  <Button className="w-full bg-indigo-600 flex gap-2">
                    <PlusCircle size={16} /> Thêm câu hỏi
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {quizzes.length === 0 && (
          <div className="text-center py-20 text-gray-400 italic">
            Chưa có bài thi nào được tạo. Nhấn để bắt đầu!
          </div>
        )}
      </div>
    </div>
  );
}