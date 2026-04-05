"use client";
import { useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AddQuizPage() {
  const router = useRouter();

  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    time: -1,
    active: true,
  });

  const [hasTimeLimit, setHasTimeLimit] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [errors, setErrors] = useState({
    title: "",
    description: "",
  });

  const validateField = (name: "title" | "description", value: string) => {
    if (name === "title") {
      if (!value.trim()) {
        return "Vui lòng nhập tiêu đề quiz";
      }
      return "";
    }

    if (name === "description") {
      if (!value.trim()) {
        return "Vui lòng nhập mô tả quiz";
      }
      return "";
    }

    return "";
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const fieldName = name as "title" | "description";

    setQuizData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [fieldName]: validateField(fieldName, value),
    }));
  };

  const validateForm = () => {
    const newErrors = {
      title: validateField("title", quizData.title),
      description: validateField("description", quizData.description),
    };

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Convert giờ:phút thành giây
    const finalTime = hasTimeLimit ? hours * 3600 + minutes * 60 : -1;
    const dataToSubmit = { ...quizData, time: finalTime };

    try {
      await api.post("/api/quiz", dataToSubmit);
      toast.success("Quiz đã được tạo thành công!");

      setQuizData({
        title: "",
        description: "",
        time: -1,
        active: true,
      });
      setHasTimeLimit(false);
      setHours(0);
      setMinutes(0);
      setErrors({ title: "", description: "" });

      setTimeout(() => {
        router.push("/admin/quiz");
      }, 1500);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi tạo Quiz!";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-linear-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Tạo Quiz mới</h1>
          <p className="text-gray-600">
            Nhập thông tin chi tiết cho bài quiz của bạn
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-5">

            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                Tiêu đề
              </label>
              <input
                id="title"
                type="text"
                name="title"
                placeholder="Nhập tiêu đề quiz"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition duration-200 bg-gray-50 text-gray-700 ${
                  errors.title
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                value={quizData.title}
                onChange={handleInputChange}
              />
              <p
                className={`text-sm font-medium mt-1 h-5 ${
                  errors.title ? "text-red-600" : "text-transparent"
                }`}
              >
                {errors.title || "placeholder"}
              </p>
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Nhập mô tả chi tiết về nội dung quiz"
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition duration-200 bg-gray-50 text-gray-700 ${
                  errors.description
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                value={quizData.description}
                onChange={handleInputChange}
              />
              <p
                className={`text-sm font-medium mt-1 h-5 ${
                  errors.description ? "text-red-600" : "text-transparent"
                }`}
              >
                {errors.description || "placeholder"}
              </p>
            </div>

            {/* Time Field with Checkbox */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="timeLimit"
                  className="w-5 h-5 accent-indigo-600 cursor-pointer rounded"
                  checked={hasTimeLimit}
                  onChange={(e) => {
                    setHasTimeLimit(e.target.checked);
                    if (!e.target.checked) {
                      setQuizData({ ...quizData, time: -1 });
                    }
                  }}
                />
                <label htmlFor="timeLimit" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  Giới hạn thời gian làm bài
                </label>
              </div>

              {hasTimeLimit && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="hours" className="block text-xs font-medium text-gray-600 mb-2">
                      Giờ
                    </label>
                    <input
                      id="hours"
                      type="number"
                      min="0"
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 text-gray-700"
                      value={hours}
                      onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                    />
                  </div>
                  <div>
                    <label htmlFor="minutes" className="block text-xs font-medium text-gray-600 mb-2">
                      Phút
                    </label>
                    <input
                      id="minutes"
                      type="number"
                      min="0"
                      max="59"
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 text-gray-700"
                      value={minutes}
                      onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    />
                  </div>
                </div>
              )}
              {!hasTimeLimit && (
                <p className="text-sm text-gray-500">Không có giới hạn thời gian</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3">
                Lưu Quiz
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setQuizData({ title: "", description: "", time: -1, active: true });
                  setHasTimeLimit(false);
                  setHours(0);
                  setMinutes(0);
                  setErrors({ title: "", description: "" });
                }}
                className="flex-1 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold py-3"
              >
                Làm lại
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}