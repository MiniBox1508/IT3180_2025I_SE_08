import React, { useState } from "react";
import {
  FaHome,
  FaUserShield,
  FaCalculator,
  FaUserLock,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import bgImage from "../images/new_welcome_background.jpg";

export const NewWelcomeScreen = () => {
  const navigate = useNavigate();
  const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

  const [selectedRole, setSelectedRole] = useState("Cư dân");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // --- State quản lý Modal Quên mật khẩu ---
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
    useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'
  const [forgotMessage, setForgotMessage] = useState("");

  const openForgotPasswordModal = () => {
    setForgotEmail("");
    setForgotStatus("idle");
    setForgotMessage("");
    setIsForgotPasswordModalOpen(true);
  };

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
      // Kiểm tra trạng thái tài khoản
      if (data.user && data.user.state === "inactive") {
        setError("Tài khoản đã bị xoá");
        return;
      }
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

  // --- Logic xử lý Quên mật khẩu ---
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;

    setForgotStatus("loading");
    try {
      // Gọi API kiểm tra email và gửi link (API này sẽ viết ở bước Backend)
      const res = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setForgotStatus("success");
        setForgotMessage(
          "Đã gửi liên kết về email, vui lòng truy cập vào email để thực hiện cấp lại mật khẩu."
        );
      } else {
        throw new Error(data.error || "Email không tồn tại");
      }
    } catch (err) {
      setForgotStatus("error");
      setForgotMessage("Email không tồn tại, vui lòng kiểm tra lại.");
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
            <div className="text-red-500 bg-red-50 p-2 rounded text-sm text-center border border-red-200">
              {error}
            </div>
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

        {/* --- Nút Quên mật khẩu --- */}
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

      {/* --- MODAL QUÊN MẬT KHẨU (ĐÃ SỬA) --- */}
      {isForgotPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-opacity-50 backdrop-blur-sm bg-black transition-opacity duration-300">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 relative shadow-2xl transform transition-all scale-100">
            {/* Trường hợp 1: Form nhập Email (Chưa gửi hoặc đang gửi) */}
            {forgotStatus === "idle" || forgotStatus === "loading" ? (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center uppercase">
                  Lấy lại mật khẩu
                </h3>
                <form onSubmit={handleForgotPasswordSubmit}>
                  <div className="mb-6">
                    <label
                      htmlFor="forgot-email"
                      className="block text-sm font-bold text-gray-700 mb-2"
                    >
                      Nhập địa chỉ Email đã đăng ký
                    </label>
                    <input
                      type="email"
                      id="forgot-email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="vidu@gmail.com"
                      disabled={forgotStatus === "loading"}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={closeForgotPasswordModal}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-semibold"
                      disabled={forgotStatus === "loading"}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center min-w-[140px]"
                      disabled={forgotStatus === "loading"}
                    >
                      {forgotStatus === "loading"
                        ? "Đang xử lý..."
                        : "Lấy lại mật khẩu"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Trường hợp 2: Popup Thông báo Kết quả (Success hoặc Error) */
              <div className="flex flex-col items-center text-center">
                {forgotStatus === "success" ? (
                  <FaCheckCircle className="text-green-500 w-16 h-16 mb-4" />
                ) : (
                  <FaTimesCircle className="text-red-500 w-16 h-16 mb-4" />
                )}

                <h3
                  className={`text-lg font-bold mb-2 ${
                    forgotStatus === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {forgotStatus === "success" ? "Thành công!" : "Thất bại!"}
                </h3>

                <p className="text-gray-700 mb-6 leading-relaxed">
                  {forgotMessage}
                </p>

                <div className="flex gap-3">
                  {forgotStatus === "error" && (
                    <button
                      onClick={() => setForgotStatus("idle")}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors"
                    >
                      Thử lại
                    </button>
                  )}
                  <button
                    onClick={closeForgotPasswordModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
