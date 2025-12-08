import React, { useState } from "react";
import { FaHome, FaUserShield, FaCalculator, FaUserLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import bgImage from "../images/new_welcome_background.jpg";

export const NewWelcomeScreen = () => {
  const navigate = useNavigate();
  const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

  const [selectedRole, setSelectedRole] = useState("Cư dân");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // --- State quản lý hiển thị Modal Quên mật khẩu ---
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const openForgotPasswordModal = () => setIsForgotPasswordModalOpen(true);
  const closeForgotPasswordModal = () => setIsForgotPasswordModalOpen(false);

  const handleRoleClick = (role) => {
    setSelectedRole(role);
  };

  // Ánh xạ role FE sang role DB
  const roleMap = {
    "Cư dân": "Cư dân",
    "Ban quản trị": "Quản lý",
    "Kế toán": "Kế toán",
    "Công an": "Công an",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          role: roleMap[selectedRole],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Đăng nhập thất bại");
      // Lưu user vào localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      // Đăng nhập thành công, chuyển hướng theo role
      if (selectedRole === "Cư dân") navigate("/resident");
      else if (selectedRole === "Ban quản trị") navigate("/management");
      else if (selectedRole === "Kế toán") navigate("/accountant");
      else if (selectedRole === "Công an") navigate("/security");
    } catch (err) {
      setError(err.message);
    }
  };

  const roles = [
    { name: "Cư dân", icon: <FaHome size={24} /> },
    { name: "Ban quản trị", icon: <FaUserShield size={24} /> },
    { name: "Kế toán", icon: <FaCalculator size={24} /> },
    { name: "Công an", icon: <FaUserLock size={24} /> },
  ];

  return (
    <div
      className="w-screen h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="bg-white p-8 rounded-xl shadow-lg w-11/12 max-w-lg">
        <h1 className="text-xl font-bold text-center text-gray-800 whitespace-nowrap">
          PHẦN MỀM QUẢN LÝ CHUNG CƯ BLUE MOON
        </h1>
        <p className="text-center text-gray-600 mt-2 mb-6">
          ĐĂNG NHẬP DƯỚI VAI TRÒ
        </p>

        <div className="flex justify-around mb-6">
          {roles.map((role) => (
            <div
              key={role.name}
              onClick={() => handleRoleClick(role.name)}
              className={`flex flex-col items-center cursor-pointer p-2 ${
                selectedRole === role.name
                  ? "text-blue-600 font-semibold"
                  : "text-gray-500"
              }`}
            >
              {role.icon}
              <span
                className={`px-3 py-1 rounded-md text-sm mt-1 ${
                  selectedRole === role.name
                    ? "bg-blue-600 text-white"
                    : "text-gray-700"
                }`}
              >
                {role.name}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 mb-2 text-center">{error}</div>
          )}
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Tên tài khoản (Email hoặc Số điện thoại)
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-2"
          >
            Đăng nhập
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
