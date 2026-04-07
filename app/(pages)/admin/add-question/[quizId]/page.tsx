"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function AddQuestionPage() {
  const { quizId } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState("");

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.questionText) newErrors.questionText = "Nội dung câu hỏi không được để trống";
    if (!formData.optionA) newErrors.optionA = "Phương án A là bắt buộc";
    if (!formData.optionB) newErrors.optionB = "Phương án B là bắt buộc";
    if (!formData.optionC) newErrors.optionC = "Phương án C là bắt buộc";
    if (!formData.optionD) newErrors.optionD = "Phương án D là bắt buộc";
    if (!formData.correctOption) newErrors.correctOption = "Bạn phải chọn đáp án đúng";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validate()) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin câu hỏi và chọn đáp án đúng");
      return;
    }

    try {
      await api.post("/api/quiz/question", {
        ...formData,
        id: quizId,
      });

      toast.success("Câu hỏi đã được lưu thành công!");

      setFormData({
        questionText: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctOption: "",
      });
      setErrors({});

      setTimeout(() => {
        router.push(`/admin`);
      }, 1200);
    } catch (error: any) {
      const errorMsg = error.response;
      console.error(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex justify-center">
      <Card className="w-full max-w-4xl shadow-lg border-t-4 border-indigo-600">
        <CardHeader className="flex flex-col gap-3 border-b bg-white">
          <div className="flex flex-row items-center justify-between">
            <Button variant="ghost" onClick={() => router.back()} className="flex gap-2">
              <ArrowLeft size={18} />
            </Button>
            <CardTitle className="text-xl font-bold text-gray-700">
              Thêm câu hỏi cho quiz
            </CardTitle>

          </div>
          {errorMessage && (
            <div className="text-red-600 text-sm font-medium bg-red-50 p-2 rounded-md">
              {errorMessage}
            </div>
          )}
          {!errorMessage && <div className="h-10" />}
        </CardHeader>

        <CardContent className="px-8 py-4">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Question Text */}
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-600">Nội dung câu hỏi</label>
              <textarea
                placeholder="Nhập câu hỏi tại đây..."
                className={`p-3 border rounded-md outline-none focus:ring-2 ${errors.questionText ? 'border-red-500' : 'focus:ring-indigo-500'}`}
                rows={3}
                value={formData.questionText}
                onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
              />
              {errors.questionText && <span className="text-red-500 text-xs italic">{errors.questionText}</span>}
            </div>

            {/* Các Options A, B, C, D */}
            <div className="flex-1 space-y-4">
              {['optionA', 'optionB', 'optionC', 'optionD'].map((opt) => (
                <div key={opt} className="flex flex-col gap-2">
                  {/* <label className="font-semibold text-gray-600 uppercase">Phương án {opt.slice(-1)}</label> */}
                  <div className="flex gap-3 items-start">
                    <input
                      type="radio"
                      id={`correct-${opt.slice(-1)}`}
                      name="correctOption"
                      value={opt.slice(-1)}
                      checked={formData.correctOption === opt.slice(-1)}
                      onChange={(e) => setFormData({ ...formData, correctOption: e.target.value })}
                      className="w-5 h-5 accent-indigo-600 cursor-pointer mt-3"
                    />
                    <input
                      type="text"
                      placeholder={`Nhập lựa chọn ${opt.slice(-1)}`}
                      className={`flex-1 p-3 border rounded-md outline-none focus:ring-2 ${errors[opt] ? 'border-red-500' : 'focus:ring-indigo-500'}`}
                      value={(formData as any)[opt]}
                      onChange={(e) => setFormData({ ...formData, [opt]: e.target.value })}
                    />

                  </div>
                  {errors[opt] && <span className="text-red-500 text-xs italic">{errors[opt]}</span>}
                </div>
              ))}
            </div>

            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg font-bold shadow-md">
              <Save className="mr-2" /> Lưu câu hỏi
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}