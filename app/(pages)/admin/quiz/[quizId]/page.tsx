"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { ArrowLeft, Plus, Trash2, Clock, BookOpen, Loader2, RefreshCcw } from "lucide-react";
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

interface TestResult {
  id?: string;
  userId?: string;
  userName?: string;
  username?: string;
  email?: string;
  score?: number;
  marksGot?: number;
  correctAnswers?: number;
  attempted?: number;
  totalQuestions?: number;
  submittedAt?: string;
  createdAt?: string;
}

export default function QuizDetailPage() {
  const { quizId } = useParams();
  const router = useRouter();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [resultsError, setResultsError] = useState("");
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

  const fetchTestResults = useCallback(async (silentRefresh = false) => {
    if (silentRefresh) {
      setIsRefreshing(true);
    } else {
      setResultsLoading(true);
    }

    setResultsError("");

    const normalizedQuizId = Array.isArray(quizId) ? quizId[0] : quizId;
    if (!normalizedQuizId) {
      setResultsError("Không tìm thấy mã quiz để tải kết quả.");
      if (silentRefresh) {
        setIsRefreshing(false);
      } else {
        setResultsLoading(false);
      }
      return;
    }

    try {
      const response = await api.get(`/api/quiz/results/${normalizedQuizId}`);
      const data = response.data;
      const resultList: TestResult[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data?.results)
            ? data.results
            : [];

      setTestResults(resultList);
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message;
      setResultsError(
        typeof backendMessage === "string"
          ? backendMessage
          : "Không thể tải kết quả bài làm."
      );
    } finally {
      if (silentRefresh) {
        setIsRefreshing(false);
      } else {
        setResultsLoading(false);
      }
    }
  }, [quizId]);

  useEffect(() => {
    if (quizId) {
      fetchQuizData();
      fetchTestResults();
    }
  }, [quizId, fetchQuizData, fetchTestResults]);

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

  const getResultScore = (result: TestResult) => {
    if (typeof result.score === "number") {
      return result.score;
    }
    if (typeof result.marksGot === "number") {
      return result.marksGot;
    }
    return 0;
  };

  const getResultName = (result: TestResult) => {
    return result.userName || result.username || result.email || result.userId || "N/A";
  };

  const getSubmittedAt = (result: TestResult) => {
    const raw = result.submittedAt || result.createdAt;
    if (!raw) {
      return "N/A";
    }

    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleString("vi-VN");
  };

  const getResultCorrect = (result: TestResult) => {
    return typeof result.correctAnswers === "number" ? result.correctAnswers : 0;
  };

  const getResultWrong = (result: TestResult) => {
    const total =
      typeof result.totalQuestions === "number" ? result.totalQuestions : questions.length;
    const correct = getResultCorrect(result);
    return Math.max(0, total - correct);
  };

  const averageScore =
    testResults.length > 0
      ? (testResults.reduce((sum, result) => sum + getResultScore(result), 0) / testResults.length).toFixed(1)
      : "0.0";

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

          {/* Unified Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t">
            <div className="p-3 bg-linear-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-indigo-600 shrink-0" />
                <p className="text-xs text-gray-600">Thời gian</p>
              </div>
              <p className="text-sm font-semibold text-indigo-700 mt-1 truncate">{getFormattedTime(quiz.time)}</p>
            </div>
            <div className="p-3 bg-linear-to-br from-cyan-50 to-sky-50 rounded-lg border border-cyan-100">
              <p className="text-xs text-gray-600">Số câu</p>
              <p className="text-2xl leading-none font-bold text-cyan-700 mt-2">{questions.length}</p>
            </div>
            <div className="p-3 bg-linear-to-br from-emerald-50 to-green-50 rounded-lg border border-emerald-100">
              <p className="text-xs text-gray-600">Số điểm</p>
              <p className="text-2xl leading-none font-bold text-emerald-700 mt-2">{questions.length}</p>
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

        {/* Test Results Section */}
        <div className="mt-10 bg-white/95 rounded-2xl border border-indigo-100 shadow-sm p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Kết quả bài làm</h2>
              <p className="text-sm text-gray-500">Tổng lượt làm: {testResults.length} • Điểm trung bình: {averageScore}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => fetchTestResults(true)}
              disabled={resultsLoading || isRefreshing}
              className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors"
            >
              <RefreshCcw size={16} className={isRefreshing ? "animate-spin" : ""} />
              {isRefreshing ? "Đang làm mới..." : "Tải lại"}
            </Button>
          </div>

          {resultsLoading ? (
            <div className="space-y-2 py-2">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-11 rounded-md bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : resultsError ? (
            <div className="py-6 text-center rounded-lg border border-red-100 bg-red-50">
              <p className="text-red-600 font-medium">{resultsError}</p>
            </div>
          ) : testResults.length === 0 ? (
            <div className="py-6 text-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500">
              Chưa có người dùng nào làm bài quiz này.
            </div>
          ) : (
            <div className="relative overflow-x-auto border rounded-lg">
              {isRefreshing && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10 transition-opacity">
                  <div className="flex items-center gap-2 text-sm text-indigo-700">
                    <Loader2 size={16} className="animate-spin" />
                    Đang cập nhật dữ liệu...
                  </div>
                </div>
              )}

              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-3 py-2.5 font-semibold text-gray-700 w-12">#</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-gray-700">Người làm</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-gray-700 w-24">Điểm</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-gray-700">Nộp lúc</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.map((result, index) => (
                    <tr key={result.id || `${result.userId || "user"}-${index}`} className="border-b last:border-b-0 odd:bg-white even:bg-gray-50/50">
                      <td className="px-3 py-2.5 text-gray-500">{index + 1}</td>
                      <td className="px-3 py-2.5 text-gray-800">
                        <p className="font-medium leading-tight">{getResultName(result)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-semibold px-2 py-0.5">
                            Đúng: {getResultCorrect(result)}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-rose-100 text-rose-700 text-[11px] font-semibold px-2 py-0.5">
                            Sai: {getResultWrong(result)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center rounded-full bg-linear-to-r from-indigo-500 to-blue-500 text-white text-xs font-semibold px-2.5 py-1 shadow-sm">
                          {getResultScore(result)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-700">{getSubmittedAt(result)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}