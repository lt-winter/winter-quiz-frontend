"use client";

import { useState } from "react";
import axios from "axios";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | null;
    text: string;
  }>({ type: null, text: "" });
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {
      fullName: "",
      email: "",
      password: "",
    };

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ tên";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ type: null, text: "" });

    try {
      await axios.post("http://localhost:8080/api/auth/sign-up", {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      setMessage({
        type: "success",
        text: "Đăng ký thành công! Vui lòng đăng nhập.",
      });
      setFormData({ fullName: "", email: "", password: "" });

      // Redirect to sign-in page after 2 seconds
      setTimeout(() => {
        window.location.href = "/sign-in";
      }, 2000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorCode = error.response?.status;
        let errorMessage;
        switch (errorCode) {
          case 409:
            errorMessage = "Email đã được sử dụng";
            break;
          case 400:
            errorMessage = "Dữ liệu không hợp lệ";
            break;
          default:
            errorMessage = "Lỗi không xác định";
        }
        setMessage({
          type: "error",
          text: errorMessage,
        });
      } else {
        setMessage({
          type: "error",
          text: "Đã xảy ra lỗi. Vui lòng thử lại.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Đăng ký</h1>
          <p className="text-gray-600">
            Tạo tài khoản để bắt đầu sử dụng dịch vụ của chúng tôi
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Notification Messages */}
          {message.type && (
            <div
              className={`p-4 rounded-lg border-l-4 ${
                message.type === "success"
                  ? "bg-green-50 border-green-500 text-green-800"
                  : "bg-red-50 border-red-500 text-red-800"
              }`}
              role="alert"
            >
              <p className="font-medium text-sm">{message.text}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Field */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Họ tên
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Nhập họ tên của bạn"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition duration-200 bg-gray-50 text-gray-700 ${
                  errors.fullName
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              <p
                className={`text-sm font-medium mt-1 h-5 ${
                  errors.fullName ? "text-red-600" : "text-transparent"
                }`}
              >
                {errors.fullName || "placeholder"}
              </p>
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Nhập địa chỉ email của bạn"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition duration-200 bg-gray-50 text-gray-700 ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              <p
                className={`text-sm font-medium mt-1 h-5 ${
                  errors.email ? "text-red-600" : "text-transparent"
                }`}
              >
                {errors.email || "placeholder"}
              </p>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition duration-200 bg-gray-50 text-gray-700 ${
                  errors.password
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              <p
                className={`text-sm font-medium mt-1 h-5 ${
                  errors.password ? "text-red-600" : "text-transparent"
                }`}
              >
                {errors.password || "placeholder"}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                "Đăng ký"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center pt-2">
            <p className="text-gray-600">
              Đã có tài khoản?{" "}
              <a
                href="/sign-in"
                className="text-blue-600 hover:text-blue-700 font-semibold transition duration-200"
              >
                Đăng nhập
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          © 2026 Winter Quiz. Tất cả quyền được bảo vệ.
        </p>
      </div>
    </div>
  );
}
