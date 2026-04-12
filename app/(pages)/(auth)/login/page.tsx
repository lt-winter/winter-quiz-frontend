"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [message, setMessage] = useState<{
    type: "success" | "error" | null;
    text: string;
  }>({ type: null, text: "" });

  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const validateField = (name: "email" | "password", value: string) => {
    if (name === "email") {
      if (!value.trim()) {
        return "Vui lòng nhập email";
      }
      if (!/\S+@\S+\.\S+/.test(value)) {
        return "Email không đúng định dạng";
      }
      return "";
    }

    if (!value.trim()) {
      return "Vui lòng nhập mật khẩu";
    }
    if (value.length < 6) {
      return "Mật khẩu phải ít nhất 6 ký tự";
    }
    return "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name as "email" | "password";

    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [fieldName]: validateField(fieldName, value),
    }));
  };

  const validate = () => {
    const newErrors = {
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
    };

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      setMessage({ type: null, text: "" });

      try {
        const response = await api.post("/api/auth/login", formData);
        const user = response.data;

        setUser(user);
        localStorage.setItem("quiz_user", JSON.stringify(user));
        document.cookie = `quiz_logged_in=true; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
        document.cookie = `quiz_role=${encodeURIComponent(user.role || "USER")}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
        setMessage({
          type: "success",
          text: "Đăng nhập thành công! Đang chuyển hướng...",
        });

        setTimeout(() => {
          if (user.role === "ADMIN") {
            router.push("/admin");
          } else {
            router.push("/");
          }
        }, 1200);
      } catch (error: any) {
        const errorMsg = error.response?.status === 406 ? "Email hoặc mật khẩu không chính xác!" : "undefined ";
        setMessage({
          type: "error",
          text: errorMsg,
        });
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đăng nhập
          </h2>
        </div>

        {/* Notification Messages */}
        {message.type && (
          <div
            className={`p-4 rounded-lg border-l-4 ${message.type === "success"
              ? "bg-green-50 border-green-500 text-green-800"
              : "bg-red-50 border-red-500 text-red-800"
              }`}
            role="alert"
          >
            <p className="font-medium text-sm">{message.text}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Input Email */}
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                placeholder="Địa chỉ Email"
                className={`relative block w-full px-3 py-2 border ${errors.email ? "border-red-500" : "border-gray-300"} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                onChange={handleInputChange}
              />
              <p className={`text-xs mt-2 h-4 ${errors.email ? "text-red-500" : "text-transparent"}`}>
                {errors.email || "placeholder"}
              </p>
            </div>

            {/* Input Password */}
            <div>
              <input
                type="password"
                name="password"
                value={formData.password}
                placeholder="Mật khẩu"
                className={`relative block w-full px-3 py-2 border ${errors.password ? "border-red-500" : "border-gray-300"} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                onChange={handleInputChange}
              />
              <p className={`text-xs mt-2 h-4 ${errors.password ? "text-red-500" : "text-transparent"}`}>
                {errors.password || "placeholder"}
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Đăng nhập
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}