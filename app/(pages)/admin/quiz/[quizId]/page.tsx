"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Trash2, Clock, BookOpen, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

interface Question {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  time: number;
  active: boolean;
}

export default function QuizDetailPage() {
  const { quizId } = useParams();
  const router = useRouter();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuizData = useCallback(async () => {
    try {
      const response = await api.get(`/api/quiz/${quizId}`);
      setQuiz(response.data.quizDTO);
      setQuestions(response.data.questions || []);
    } catch {
      toast.error("Lỗi tải dữ liệu quiz");
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    if (quizId) {
      fetchQuizData();
    }
  }, [quizId, fetchQuizData]);

  const getFormattedTime = (seconds: number) => {
    if (seconds === -1) return "Không giới hạn";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) return `${hours} giờ ${minutes} phút`;
    if (minutes > 0) return `${minutes} phút ${secs} giây`;
    return `${secs} giây`;
  };

  const normalizeValue = (value: string | undefined) =>
    (value || "").trim().toLowerCase();

  const isCorrectOption = (question: Question, option: "A" | "B" | "C" | "D") => {
    const optionText = String(question[`option${option}` as keyof Question] || "");
    const correct = normalizeValue(question.correctOption);

    return (
      correct === normalizeValue(option) ||
      correct === normalizeValue(`option${option}`) ||
      correct === normalizeValue(optionText)
    );
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Bạn chắc chắn muốn xóa câu hỏi này?")) return;

    try {
      await api.delete(`/api/question/${questionId}`);
      setQuestions(questions.filter(q => q.id !== questionId));
      toast.success("Câu hỏi đã được xóa");
    } catch {
      toast.error("Lỗi xóa câu hỏi");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm px-10 py-8 text-center space-y-3">
          <Loader2 className="mx-auto h-8 w-8 text-indigo-600 animate-spin" />
          <p className="text-gray-700 font-semibold">Đang tải dữ liệu quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Không tìm thấy quiz</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-linear-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="rounded-full p-2 hover:bg-white/50"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
        </div>

        {/* Quiz Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          {/* Description */}
          <div className="mb-4">
            <p className="text-gray-600 text-sm leading-relaxed">{quiz.description}</p>
          </div>

          {/* Time & Status Row */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 flex items-center gap-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <Clock size={18} className="text-indigo-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-600">Thời gian</p>
                <p className="text-sm font-semibold text-indigo-700 truncate">{getFormattedTime(quiz.time)}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t">
            <div className="text-center p-3 bg-linear-to-br from-indigo-50 to-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-indigo-600">{questions.length}</p>
              <p className="text-xs text-gray-600">Câu hỏi</p>
            </div>
            <div className="text-center p-3 bg-linear-to-br from-blue-50 to-cyan-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{questions.length}</p>
              <p className="text-xs text-gray-600">Điểm</p>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Danh sách câu hỏi</h2>
            <Button
              onClick={() => router.push(`/admin/add-question/${quizId}`)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            >
              <Plus size={18} /> Thêm câu hỏi
            </Button>
          </div>

          {/* Questions List */}
          {questions.length > 0 ? (
            <div className="space-y-3">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="bg-white rounded-xl shadow p-6 border-l-4 border-indigo-600 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Question Number and Text */}
                      <div>
                        <span className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold mr-3">
                          Câu {index + 1}
                        </span>
                        <p className="font-semibold text-gray-900 mt-2">{question.questionText}</p>
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {['A', 'B', 'C', 'D'].map((option) => {
                          const text = question[`option${option}` as keyof Question];
                          const isCorrect = isCorrectOption(
                            question,
                            option as "A" | "B" | "C" | "D"
                          );
                          return (
                            <div
                              key={option}
                              className={`p-3 rounded-lg border-2 text-sm ${isCorrect
                                ? "border-green-500 bg-green-50 text-green-800 font-semibold"
                                : "border-gray-300 bg-gray-50 text-gray-700"
                                }`}
                            >
                              <span className="font-bold mr-2">{option}.</span>
                              {text}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Xóa câu hỏi"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl">
              <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-4">Chưa có câu hỏi nào</p>
              <Button
                onClick={() => router.push(`/admin/add-question/${quizId}`)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              >
                <Plus size={18} /> Thêm câu hỏi đầu tiên
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}