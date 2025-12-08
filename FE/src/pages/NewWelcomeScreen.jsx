import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundImage from "../images/background_welcome.jpg";

// --- API CONFIG ---
const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

// --- ICONS ---
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const LockClosedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
  </svg>
);

// --- COMPONENT CHÍNH ---
export const NewWelcomeScreen = () => {
  const [apartmentId, setApartmentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- State quản lý hiển thị Modal Quên mật khẩu ---
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);

  const navigate = useNavigate();

  // --- Hàm xử lý Đăng nhập (Giữ nguyên) ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apartment_id: apartmentId, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Đăng nhập thất bại. Vui lòng kiểm tra lại.");
      }

      // Lưu thông tin user vào localStorage
      localStorage.setItem("user", JSON.stringify(data.user));

      // Điều hướng dựa trên role
      const role = data.user.role;
      if (role === "BQT") {
        navigate("/dashboard");
      } else if (role === "Cư dân") {
        navigate("/resident_dashboard");
      } else if (role === "Kế toán") {
        navigate("/accountant_dashboard");
      } else if (role === "Bảo vệ") {
        navigate("/security_dashboard");
      } else {
        setError("Vai trò người dùng không hợp lệ.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Các hàm điều khiển Modal ---
  const openForgotPasswordModal = () => setIsForgotPasswordModalOpen(true);
  const closeForgotPasswordModal = () => setIsForgotPasswordModalOpen(false);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative px-4"
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      {/* Overlay tạo lớp nền tối mờ */}
      <div className="absolute inset-0 bg-blue-900 bg-opacity-40 backdrop-blur-sm"></div>

      <div className="bg-white bg-opacity-10 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-md border border-white border-opacity-20 w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">
            Blue Moon
          </h1>
          <p className="text-blue-100 text-lg md:text-xl font-light">
            Hệ thống quản lý chung cư
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500 bg-opacity-80 text-white p-3 rounded-lg mb-6 text-sm text-center font-medium animate-pulse">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Apartment ID Input */}
          <div className="relative">
            <UserIcon />
            <input
              type="text"
              placeholder="Tên đăng nhập (Mã căn hộ)"
              value={apartmentId}
              onChange={(e) => setApartmentId(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white bg-opacity-20 border border-blue-300 border-opacity-30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <LockClosedIcon />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white bg-opacity-20 border border-blue-300 border-opacity-30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
              required
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              isLoading ? "opacity-70 cursor-not-allowed" : "hover:from-blue-600 hover:to-blue-800"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </span>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>

        {/* --- Nút Quên mật khẩu (MỚI THÊM) --- */}
        <div className="text-center mt-6">
          <button
            onClick={openForgotPasswordModal}
            className="text-blue-200 hover:text-white text-sm font-medium transition-colors duration-200 focus:outline-none hover:underline"
            type="button"
          >
            Quên mật khẩu?
          </button>
        </div>
      </div>

      {/* --- MODAL QUÊN MẬT KHẨU (MỚI THÊM) --- */}
      {isForgotPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300">
          {/* Modal Container */}
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl transform transition-all scale-100 relative">
            
            {/* Icon chìa khóa */}
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-blue-100 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>

            {/* Tiêu đề */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Quên mật khẩu?
            </h3>
            
            {/* Nội dung hướng dẫn */}
            <p className="text-gray-600 mb-6">
              Vui lòng liên hệ với <span className="font-semibold text-blue-600">quầy lễ tân chung cư</span> để được hỗ trợ cấp lại mật khẩu mới.
            </p>

            {/* Nút Đóng */}
            <button
              onClick={closeForgotPasswordModal}
              className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-3 bg-blue-600 text-base font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              Đã hiểu
            </button>

            {/* Nút X đóng nhỏ ở góc (Tùy chọn) */}
            <button 
              onClick={closeForgotPasswordModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-1 transition-colors"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};