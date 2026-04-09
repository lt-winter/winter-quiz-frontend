"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, LogOut, Loader2 } from "lucide-react";
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
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showResultPopup, setShowResultPopup] = useState(false);
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

        setQuiz(res.data?.quizDTO ?? null);
        setQuestions(Array.isArray(res.data?.questions) ? res.data.questions : []);
      })
      .catch((err) => {
        console.error("Lỗi tải câu hỏi:", err);
        setErrorMessage("Không thể tải dữ liệu quiz. Vui lòng thử lại.");
      })
      .finally(() => setLoading(false));
  }, [normalizedQuizId]);

  // Hàm lưu đáp án khi người dùng chọn
  const handleOptionChange = (questionId: string, optionLabel: string) => {
    if (isSubmitted) {
      return;
    }

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionLabel,
    }));
  };

  const handleSubmit = async () => {
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

    if (unansweredQuestions.length > 0) {
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
      setSubmitResult(
        typeof resultData === "number"
          ? { score: resultData, totalQuestions: questions.length }
          : resultData
      );
      setIsSubmitted(true);
      setShowSubmitConfirm(false);
      setShowResultPopup(true);

      const score =
        typeof resultData === "number"
          ? resultData
          : resultData?.score ?? resultData?.marksGot;

      if (typeof score === "number") {
        toast.success(`Nộp bài thành công. Điểm của bạn: ${score}`);
      } else {
        toast.success("Nộp bài thành công!");
      }

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
  };

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

    setShowSubmitConfirm(true);
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
          {questions.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm px-5 py-3 text-sm text-gray-700">
              Đã chọn {Object.keys(selectedAnswers).length}/{questions.length} câu
            </div>
          )}

          {questions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <p className="text-gray-600">Quiz này hiện chưa có câu hỏi.</p>
            </div>
          ) : (
            questions.map((q, index: number) => (
              <Card key={q.id} className="shadow-md border-none overflow-hidden">
                <CardHeader className="bg-indigo-50/50 border-b">
                  <CardTitle className="text-lg font-semibold text-gray-800">
                    Câu {index + 1}: {q.questionText}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(["A", "B", "C", "D"] as const).map((label) => {
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
                          disabled={isSubmitted}
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
        </div>

        {/* Nút nộp bài */}
        <div className="mt-12 flex justify-center pb-10">
          <Button
            onClick={handleOpenSubmitConfirm}
            disabled={questions.length === 0 || submitting || isSubmitted}
            className="bg-green-600 hover:bg-green-700 h-14 px-12 text-lg font-bold shadow-lg rounded-2xl transition-transform active:scale-95"
          >
            <Send className="mr-2" size={20} /> {submitting ? "Đang nộp..." : isSubmitted ? "Đã nộp" : "Nộp"}
          </Button>
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
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitting ? "Đang nộp..." : "Xác nhận nộp"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showResultPopup && submitResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-2xl font-bold text-emerald-700">Kết quả bài làm</h3>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="bg-emerald-50 rounded-lg p-3">
                <p className="text-gray-600">Điểm</p>
                <p className="text-xl font-bold text-emerald-700">
                  {submitResult.score ?? submitResult.marksGot ?? "-"}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-gray-600">Câu đúng</p>
                <p className="text-xl font-bold text-blue-700">
                  {submitResult.correctAnswers ?? "-"}
                </p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-3">
                <p className="text-gray-600">Đã làm</p>
                <p className="text-xl font-bold text-indigo-700">
                  {submitResult.attempted ?? Object.keys(selectedAnswers).length}/{submitResult.totalQuestions ?? questions.length}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowResultPopup(false)}>
                Đóng
              </Button>
              <Button onClick={() => router.push("/quiz")}>Về danh sách quiz</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}