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
      // Lưu user và token vào localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
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
      className="w-screen h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="bg-white p-8 rounded-xl shadow-lg w-11/12 max-w-lg relative z-10">
        <h1 className="text-xl font-bold text-center text-gray-800 whitespace-nowrap uppercase">
          PHẦN MỀM QUẢN LÝ CHUNG CƯ BLUE MOON
        </h1>
        <p className="text-center text-blue-500 font-semibold mt-2 mb-6 uppercase text-sm">
          ĐĂNG NHẬP DƯỚI VAI TRÒ
        </p>

        <div className="flex justify-around mb-6">
          {roles.map((role) => (
            <div
              key={role.name}
              onClick={() => handleRoleClick(role.name)}
              className={`flex flex-col items-center cursor-pointer p-2 transition-all duration-200 ${
                selectedRole === role.name
                  ? "text-blue-600 scale-110"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {role.icon}
              <span
                className={`px-3 py-1 rounded-full text-xs mt-2 font-medium ${
                  selectedRole === role.name
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500"
                }`}
              >
                {role.name}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-500 bg-red-50 p-2 rounded text-sm text-center border border-red-200">{error}</div>
          )}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-bold text-gray-700 mb-1"
            >
              Tên tài khoản
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Nhập email hoặc số điện thoại"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-bold text-gray-700 mb-1"
            >
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Nhập mật khẩu"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-4 transition-colors"
          >
            Đăng nhập
          </button>
        </form>
        
        {/* --- Nút Quên mật khẩu (MỚI THÊM) --- */}
        <div className="text-center mt-4">
          <button
            onClick={openForgotPasswordModal}
            className="text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors duration-200 focus:outline-none hover:underline"
            type="button"
          >
            Quên mật khẩu ?
          </button>
        </div>
      </div>

      {/* --- MODAL QUÊN MẬT KHẨU (NỘI DUNG GIỐNG HỆT ẢNH) --- */}
      {isForgotPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white rounded-2xl w-full max-w-lg p-8 relative shadow-2xl transform transition-all scale-100">
            
            {/* Header 1 */}
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center uppercase">
              LƯU Ý: NGƯỜI DÙNG KHI QUÊN MẬT KHẨU TÀI KHOẢN
            </h3>
            
            {/* List 1 */}
            <div className="text-gray-700 text-sm space-y-2 mb-6 leading-relaxed">
              <p>- Hãy đến gặp <span className="text-blue-500 font-semibold">Ban quản trị chung cư Bluemoon</span> vào hành chính</p>
              <p>- Mang theo <span className="font-bold">minh chứng là cư dân hoặc bên liên quan</span> của chung cư ( thẻ cư dân, thẻ nhân viên,...)</p>
              <p>- Làm thủ tục cấp lại mật khẩu</p>
            </div>

            {/* Header 2 */}
            <h4 className="text-lg font-bold text-gray-900 mb-4 text-center uppercase">
              THÔNG TIN LIÊN HỆ :
            </h4>

            {/* List 2 */}
            <div className="text-gray-700 text-sm space-y-1 mb-8 leading-relaxed">
              <p>- Văn phòng: Tầng 1- Phòng 106- Chung cư Bluemoon</p>
              <p>- SĐT: 0913006205</p>
              <p>- Email: bqtBluemoon@gmail.com</p>
              <p>- Giờ hành chính:</p>
              <p className="pl-1">7h30-11h30 sáng: Thứ 2 đến Thứ 6</p>
              <p className="pl-1">13h00-17h00 chiều: Thứ 2 đến Thứ 6</p>
            </div>

            {/* Footer Button */}
            <div className="flex justify-end">
                <button 
                onClick={closeForgotPasswordModal}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-8 rounded-lg shadow transition-colors"
                >
                Đóng
                </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};