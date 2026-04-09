"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, LogOut } from "lucide-react";

interface Question {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

interface Quiz {
  id: string;
  title: string;
}

export default function TakeTestPage() {
  const { quizId } = useParams(); // Lấy quizId từ URL
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const router = useRouter();

  // Gọi API lấy danh sách câu hỏi của quiz
  useEffect(() => {
    api.get(`/api/quiz/${quizId}`)
      .then((res) => {
        // Support response shape: { quizDTO, questions }
        if (Array.isArray(res.data)) {
          setQuestions(res.data);
          return;
        }

        setQuiz(res.data?.quizDTO ?? null);
        setQuestions(Array.isArray(res.data?.questions) ? res.data.questions : []);
      })
      .catch((err) => console.error("Lỗi tải câu hỏi:", err));
  }, [quizId]);

  // Hàm lưu đáp án khi người dùng chọn
  const handleOptionChange = (questionId: string, optionLabel: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionLabel,
    }));
  };

  const handleSubmit = () => {
    console.log("Đáp án đã chọn:", selectedAnswers);
    alert("Chuẩn bị nộp bài!");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-10 bg-white p-6 rounded-xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-indigo-900">Đang làm quiz: {quiz?.title || "..."}</h1>
            <p className="text-gray-500">Vui lòng chọn đáp án đúng nhất cho mỗi câu hỏi.</p>
          </div>
          <Button variant="outline" onClick={() => router.back()} className="text-red-600 border-red-200">
            <LogOut size={18} className="mr-2" /> Thoát
          </Button>
        </header>

        {/* Danh sách câu hỏi */}
        <div className="space-y-8">
          {questions.map((q, index: number) => (
            <Card key={q.id} className="shadow-md border-none overflow-hidden">
              <CardHeader className="bg-indigo-50/50 border-b">
                <CardTitle className="text-lg font-semibold text-gray-800">
                  Câu {index + 1}: {q.questionText}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['A', 'B', 'C', 'D'] as const).map((label) => {
                  const optionKey = `option${label}` as keyof Question;
                  const optionValue = q[optionKey] as string;
                  const isSelected = selectedAnswers[q.id] === label;

                  return (
                    <div
                      key={label}
                      className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${isSelected
                        ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200"
                        : "border-gray-100 hover:border-indigo-100 hover:bg-gray-50"
                        }`}
                      onClick={() => handleOptionChange(q.id, label)}
                    >
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        className="w-5 h-5 text-indigo-600"
                        onChange={() => handleOptionChange(q.id, label)}
                        checked={isSelected}
                      />
                      <div className="flex flex-col">
                        <span className="text-gray-700">{optionValue}</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Nút nộp bài */}
        <div className="mt-12 flex justify-center pb-10">
          <Button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 h-14 px-12 text-lg font-bold shadow-lg rounded-2xl transition-transform active:scale-95"
          >
            <Send className="mr-2" size={20} /> Nộp
          </Button>
        </div>
      </div>
    </div>
  );
}