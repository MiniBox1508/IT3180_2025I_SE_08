import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import bgImage from "../images/new_welcome_background.jpg"; // Dùng chung ảnh nền
import { FaEye, FaEyeSlash } from "react-icons/fa";

export const ResetPasswordScreen = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token"); // Lấy token từ URL

  const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate cơ bản
    if (!newPassword || !confirmPassword) {
      setMessage({ type: "error", content: "Vui lòng nhập đầy đủ thông tin." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", content: "Mật khẩu xác nhận không khớp." });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        content: "Mật khẩu phải có ít nhất 6 ký tự.",
      });
      return;
    }

    setIsLoading(true);
    setMessage({ type: "", content: "" });

    try {
      const res = await fetch(`${API_BASE_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: "success",
          content: "Đổi mật khẩu thành công! Đang chuyển về trang đăng nhập...",
        });
        setTimeout(() => {
          navigate("/"); // Chuyển về trang login
        }, 3000);
      } else {
        throw new Error(data.error || "Liên kết không hợp lệ hoặc đã hết hạn.");
      }
    } catch (err) {
      setMessage({ type: "error", content: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Nếu không có token trên URL, báo lỗi ngay
  if (!token) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-xl text-red-600 font-bold mb-4">
            Đường dẫn không hợp lệ
          </h2>
          <p className="mb-4">
            Vui lòng kiểm tra lại đường link trong email của bạn.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-screen h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="bg-white p-8 rounded-xl shadow-lg w-11/12 max-w-md relative z-10">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6 uppercase">
          Đặt lại mật khẩu mới
        </h2>

        {message.content && (
          <div
            className={`p-3 rounded mb-4 text-sm text-center ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.content}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mật khẩu mới */}
          <div className="relative">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Mật khẩu mới
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập mật khẩu mới"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Xác nhận mật khẩu */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Xác nhận mật khẩu
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2.5 px-4 text-white font-bold rounded-lg shadow-md transition-colors mt-4 ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Đang xử lý..." : "Xác nhận đổi mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
};
