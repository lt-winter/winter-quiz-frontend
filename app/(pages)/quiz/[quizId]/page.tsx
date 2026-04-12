"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, LogOut, Loader2, Clock3 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

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
  time?: number;
}

interface QuestionResponse {
  questionId: string;
  selectedOption: string;
}

interface SubmitResult {
  score?: number;
  marksGot?: number;
  correctAnswers?: number;
  attempted?: number;
  totalQuestions?: number;
  [key: string]: unknown;
}

interface QuizResultPayload extends SubmitResult {
  quizId: string;
  quizTitle: string;
  completedAt: string;
  completedInSeconds: number;
}

export default function TakeQuizPage() {
  const { quizId } = useParams(); // Lấy quizId từ URL
  const normalizedQuizId = Array.isArray(quizId) ? quizId[0] : quizId;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [initialQuizTime, setInitialQuizTime] = useState<number | null>(null);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  // Gọi API lấy danh sách câu hỏi của quiz
  useEffect(() => {
    if (!normalizedQuizId) {
      setErrorMessage("Không tìm thấy mã quiz hợp lệ.");
      setLoading(false);
      return;
    }

    api.get(`/api/quiz/${normalizedQuizId}`)
      .then((res) => {
        setErrorMessage("");
        // Support response shape: { quizDTO, questions }
        if (Array.isArray(res.data)) {
          setQuiz(null);
          setQuestions(res.data);
          return;
        }

        const quizData = res.data?.quizDTO ?? null;
        setQuiz(quizData);
        setQuestions(Array.isArray(res.data?.questions) ? res.data.questions : []);

        // time = -1 means unlimited time
        if (typeof quizData?.time === "number" && quizData.time > 0) {
          setRemainingTime(quizData.time);
          setInitialQuizTime(quizData.time);
        } else {
          setRemainingTime(null);
          setInitialQuizTime(null);
        }

        setStartedAt(Date.now());
      })
      .catch((err) => {
        console.error("Lỗi tải câu hỏi:", err);
        setErrorMessage("Không thể tải dữ liệu quiz. Vui lòng thử lại.");
      })
      .finally(() => setLoading(false));
  }, [normalizedQuizId]);

  // Hàm lưu đáp án khi người dùng chọn
  const handleOptionChange = (questionId: string, selectedValue: string) => {
    if (isSubmitted) {
      return;
    }

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: selectedValue,
    }));
  };

  const handleClearOption = (questionId: string) => {
    if (isSubmitted || remainingTime === 0) {
      return;
    }

    setSelectedAnswers((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  const handleSubmit = useCallback(async (forceSubmit = false) => {
    if (questions.length === 0) {
      toast.error("Quiz chưa có câu hỏi để nộp bài.");
      return;
    }

    if (!normalizedQuizId) {
      toast.error("Thiếu mã quiz để nộp bài.");
      return;
    }

    if (!user?.id) {
      toast.error("Bạn cần đăng nhập trước khi nộp bài.");
      router.push("/login");
      return;
    }

    if (isSubmitted) {
      toast.info("Bài làm đã được nộp trước đó.");
      return;
    }

    const unansweredQuestions = questions.filter((question) => !selectedAnswers[question.id]);

    if (!forceSubmit && unansweredQuestions.length > 0) {
      toast.error(`Bạn chưa chọn đáp án cho ${unansweredQuestions.length} câu.`);
      return;
    }

    const processedResponses: QuestionResponse[] = questions.map((question) => ({
      questionId: question.id,
      selectedOption: selectedAnswers[question.id],
    }));

    const payload = {
      quizId: normalizedQuizId,
      userId: user.id,
      responses: processedResponses,
    };

    try {
      setSubmitting(true);
      const response = await api.post("/api/quiz/submit", payload);
      const resultData = response.data;
      const normalizedResult: SubmitResult =
        typeof resultData === "number"
          ? { score: resultData, totalQuestions: questions.length }
          : resultData;

      const rawCorrect =
        (normalizedResult.correctAnswers as number | undefined) ??
        (normalizedResult.correctAnswer as number | undefined) ??
        (normalizedResult.correct as number | undefined) ??
        (normalizedResult.correctCount as number | undefined);

      const rawAttempted =
        (normalizedResult.attempted as number | undefined) ??
        (normalizedResult.attemptedQuestions as number | undefined) ??
        (normalizedResult.attemptedQuestion as number | undefined);

      const rawTotal =
        (normalizedResult.totalQuestions as number | undefined) ??
        (normalizedResult.totalQuestion as number | undefined) ??
        (normalizedResult.total as number | undefined);

      const normalizedCorrect =
        typeof rawCorrect === "number" ? rawCorrect : 0;
      const normalizedAttempted =
        typeof rawAttempted === "number" ? rawAttempted : Object.keys(selectedAnswers).length;
      const normalizedTotal =
        typeof rawTotal === "number" ? rawTotal : questions.length;

      const completedInSeconds =
        initialQuizTime !== null && remainingTime !== null
          ? Math.max(0, initialQuizTime - remainingTime)
          : startedAt
            ? Math.max(0, Math.floor((Date.now() - startedAt) / 1000))
            : 0;

      const resultPayload: QuizResultPayload = {
        ...normalizedResult,
        correctAnswers: normalizedCorrect,
        attempted: normalizedAttempted,
        totalQuestions: normalizedTotal,
        quizId: normalizedQuizId,
        quizTitle: quiz?.title || "Quiz",
        completedAt: new Date().toISOString(),
        completedInSeconds,
      };

      sessionStorage.setItem("quiz_result_data", JSON.stringify(resultPayload));
      setIsSubmitted(true);
      setShowSubmitConfirm(false);
      setRemainingTime(0);

      const score =
        typeof resultData === "number"
          ? resultData
          : resultData?.score ?? resultData?.marksGot;

      if (typeof score === "number") {
        toast.success(`Nộp bài thành công. Điểm của bạn: ${score}`);
      } else {
        toast.success("Nộp bài thành công!");
      }

      router.push("/quiz/result");

      console.log("Payload đã xử lý:", payload);
      console.log("Kết quả trả về:", response.data);
    } catch (error: any) {
      const serverError = error.response?.data;
      const message =
        typeof serverError === "string"
          ? serverError
          : serverError?.message || "Nộp bài thất bại. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }, [
    initialQuizTime,
    isSubmitted,
    normalizedQuizId,
    quiz?.title,
    questions,
    remainingTime,
    router,
    selectedAnswers,
    startedAt,
    user?.id,
  ]);

  const handleOpenSubmitConfirm = () => {
    if (questions.length === 0) {
      toast.error("Quiz chưa có câu hỏi để nộp bài.");
      return;
    }

    if (!normalizedQuizId) {
      toast.error("Thiếu mã quiz để nộp bài.");
      return;
    }

    if (!user?.id) {
      toast.error("Bạn cần đăng nhập trước khi nộp bài.");
      router.push("/login");
      return;
    }

    if (isSubmitted) {
      toast.info("Bài làm đã được nộp trước đó.");
      return;
    }

    if (remainingTime === 0) {
      toast.error("Đã hết thời gian làm bài.");
      return;
    }

    setShowSubmitConfirm(true);
  };

  useEffect(() => {
    if (remainingTime === null || remainingTime <= 0 || isSubmitted) {
      return;
    }

    const timerId = window.setInterval(() => {
      setRemainingTime((prev) => {
        if (prev === null) return null;
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [remainingTime, isSubmitted]);

  useEffect(() => {
    if (remainingTime !== 0 || isSubmitted || submitting) {
      return;
    }

    toast.warning("Hết thời gian làm bài. Hệ thống đang tự động nộp...");
    handleSubmit(true);
  }, [handleSubmit, isSubmitted, remainingTime, submitting]);

  const formatRemainingTime = (seconds: number) => {
    const safeSeconds = Math.max(0, seconds);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const secs = safeSeconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }

    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(selectedAnswers).length;

  const scrollToQuestion = (questionId: string) => {
    const el = document.getElementById(`question-${questionId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm px-10 py-8 text-center space-y-3">
          <Loader2 className="mx-auto h-8 w-8 text-indigo-600 animate-spin" />
          <p className="text-gray-700 font-semibold">Đang tải quiz...</p>
          <p className="text-sm text-gray-500">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center space-y-4 max-w-md w-full">
          <p className="text-red-600 font-semibold">{errorMessage}</p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              Quay lại
            </Button>
            <Button onClick={() => window.location.reload()}>Tải lại</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz && questions.length === 0) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center space-y-4 max-w-md w-full">
          <p className="text-gray-700 font-semibold">Không tìm thấy quiz hoặc quiz chưa có dữ liệu.</p>
          <Button variant="outline" onClick={() => router.back()}>
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10 bg-white p-6 rounded-xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-indigo-900">Đang làm quiz: {quiz?.title || "..."}</h1>
            <p className="text-gray-500">Vui lòng chọn đáp án đúng nhất cho mỗi câu hỏi.</p>
          </div>
          <Button variant="outline" onClick={() => router.back()} className="text-red-600 border-red-200">
            <LogOut size={18} className="mr-2" /> Thoát
          </Button>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Danh sách câu hỏi */}
          <div className="space-y-8">
            {questions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <p className="text-gray-600">Quiz này hiện chưa có câu hỏi.</p>
              </div>
            ) : (
              questions.map((q, index: number) => (
                <Card id={`question-${q.id}`} key={q.id} className="shadow-md border-none overflow-hidden scroll-mt-24">
                  <CardHeader className="bg-indigo-50/50 border-b flex flex-row items-start justify-between gap-3">
                    <CardTitle className="text-lg font-semibold text-gray-800 leading-snug">
                      Câu {index + 1}: {q.questionText}
                    </CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 h-8 px-3 text-xs text-rose-500 hover:text-rose-700"
                      onClick={() => handleClearOption(q.id)}
                      disabled={!selectedAnswers[q.id] || isSubmitted || remainingTime === 0}
                    >
                      Bỏ chọn
                    </Button>
                  </CardHeader>

                  <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(["A", "B", "C", "D"] as const).map((label) => {
                      const optionKey = `option${label}` as keyof Question;
                      const optionValue = q[optionKey] as string;
                      const isSelected = selectedAnswers[q.id] === optionValue;

                      return (
                        <div
                          key={label}
                          className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${isSelected
                            ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200"
                            : "border-gray-100 hover:border-indigo-100 hover:bg-gray-50"
                            }`}
                          onClick={() => handleOptionChange(q.id, optionValue)}
                        >
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            className="w-5 h-5 text-indigo-600"
                            onChange={() => handleOptionChange(q.id, optionValue)}
                            checked={isSelected}
                            disabled={isSubmitted || remainingTime === 0}
                          />
                          <div className="flex flex-col">
                            <span className="text-gray-700">{optionValue}</span>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))
            )}

            {/* Nút nộp bài */}
            <div className="mt-12 flex justify-center pb-10">
              <Button
                onClick={handleOpenSubmitConfirm}
                disabled={questions.length === 0 || submitting || isSubmitted || remainingTime === 0}
                className="bg-green-600 hover:bg-green-700 h-14 px-12 text-lg font-bold shadow-lg rounded-2xl transition-transform active:scale-95"
              >
                <Send className="mr-2" size={20} /> {submitting ? "Đang nộp..." : isSubmitted ? "Đã nộp" : "Nộp"}
              </Button>
            </div>
          </div>

          {/* Sticky right panel */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-4">
              <div className="rounded-xl bg-white p-4 shadow-sm border">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Thời gian</h3>
                {remainingTime === null ? (
                  <p className="text-sm font-semibold text-emerald-700">Không giới hạn</p>
                ) : (
                  <div className={`flex items-center gap-2 text-sm font-semibold ${remainingTime <= 60 ? "text-red-700" : "text-indigo-700"}`}>
                    <Clock3 size={16} />
                    <span>{formatRemainingTime(remainingTime)}</span>
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-white p-4 shadow-sm border">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-gray-800">Điều hướng câu hỏi</h3>
                  <span className="text-xs font-semibold text-indigo-700">
                    {answeredCount}/{questions.length}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, idx) => {
                    const done = Boolean(selectedAnswers[q.id]);
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => scrollToQuestion(q.id)}
                        className={`h-8 rounded-md text-xs font-semibold transition ${done ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900">Xác nhận nộp bài</h3>
            <p className="mt-2 text-gray-600">
              Bạn đã chọn {Object.keys(selectedAnswers).length}/{questions.length} câu.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Sau khi nộp, bạn sẽ không thể chỉnh sửa đáp án.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSubmitConfirm(false)}
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button
                onClick={() => {
                  void handleSubmit();
                }}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitting ? "Đang nộp..." : "Xác nhận nộp"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}