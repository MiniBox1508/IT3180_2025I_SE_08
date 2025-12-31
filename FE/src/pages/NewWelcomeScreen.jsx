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

  // --- State quản lý Modal Đăng ký ---
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerData, setRegisterData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    apartment_id: "",
    email: "",
    cccd: "",
    birth_date: "",
    residency_status: "Chủ hộ",
    role: "Cư dân",
    password: "",
  });
  const [registerStatus, setRegisterStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'
  const [registerMessage, setRegisterMessage] = useState("");

  const openForgotPasswordModal = () => {
    setForgotEmail("");
    setForgotStatus("idle");
    setForgotMessage("");
    setIsForgotPasswordModalOpen(true);
  };

  const closeForgotPasswordModal = () => setIsForgotPasswordModalOpen(false);

  const openRegisterModal = () => {
    setRegisterData({
      first_name: "",
      last_name: "",
      phone: "",
      apartment_id: "",
      email: "",
      cccd: "",
      birth_date: "",
      residency_status: "Chủ hộ",
      role: "Cư dân",
      password: "",
    });
    setRegisterStatus("idle");
    setRegisterMessage("");
    setIsRegisterModalOpen(true);
  };

  const closeRegisterModal = () => setIsRegisterModalOpen(false);

  const handleRoleClick = (role) => {
    setSelectedRole(role);
  };

  // Ánh xạ role FE sang role DB (Login)
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

  // --- Logic xử lý Đăng ký ---
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterStatus("loading");
    setRegisterMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/residents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });

      const data = await res.json();

      if (res.ok) {
        setRegisterStatus("success");
        setRegisterMessage("Đăng ký tài khoản thành công!");
      } else {
        throw new Error(data.error || "Đăng ký thất bại");
      }
    } catch (err) {
      setRegisterStatus("error");
      setRegisterMessage(err.message || "Có lỗi xảy ra, vui lòng thử lại.");
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

        {/* --- Footer Links (Quên mật khẩu & Đăng ký) --- */}
        <div className="flex justify-between items-center mt-4 px-2">
          <button
            onClick={openForgotPasswordModal}
            className="text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors duration-200 focus:outline-none hover:underline"
            type="button"
          >
            Quên mật khẩu?
          </button>
          <button
            onClick={openRegisterModal}
            className="text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors duration-200 focus:outline-none hover:underline"
            type="button"
          >
            Đăng ký
          </button>
        </div>
      </div>

      {/* --- MODAL QUÊN MẬT KHẨU --- */}
      {isForgotPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-opacity-50 backdrop-blur-sm bg-black transition-opacity duration-300">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 relative shadow-2xl transform transition-all scale-100">
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

      {/* --- MODAL ĐĂNG KÝ TÀI KHOẢN --- */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-opacity-50 backdrop-blur-sm bg-black transition-opacity duration-300">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-8 relative shadow-2xl transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
            {registerStatus === "idle" || registerStatus === "loading" ? (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center uppercase">
                  Đăng ký tài khoản mới
                </h3>
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Họ
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={registerData.last_name}
                        onChange={handleRegisterChange}
                        required
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nguyễn Văn"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Tên
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={registerData.first_name}
                        onChange={handleRegisterChange}
                        required
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="A"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Số điện thoại
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={registerData.phone}
                        onChange={handleRegisterChange}
                        required
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0912345678"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Mã căn hộ
                      </label>
                      <input
                        type="text"
                        name="apartment_id"
                        value={registerData.apartment_id}
                        onChange={handleRegisterChange}
                        required
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="A101"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      required
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="vidu@gmail.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Số CCCD
                      </label>
                      <input
                        type="text"
                        name="cccd"
                        value={registerData.cccd}
                        onChange={handleRegisterChange}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="012345678901"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Ngày sinh
                      </label>
                      <input
                        type="date"
                        name="birth_date"
                        value={registerData.birth_date}
                        onChange={handleRegisterChange}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Trạng thái cư trú
                      </label>
                      <select
                        name="residency_status"
                        value={registerData.residency_status}
                        onChange={handleRegisterChange}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Chủ hộ">Chủ hộ</option>
                        <option value="Người thuê">Người thuê</option>
                        <option value="Khách tạm trú">Khách tạm trú</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Vai trò
                      </label>
                      <select
                        name="role"
                        value={registerData.role}
                        onChange={handleRegisterChange}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Quản lý">Quản lý</option>
                        <option value="Cư dân">Cư dân</option>
                        <option value="Kế toán">Kế toán</option>
                        <option value="Công an">Công an</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Mật khẩu
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      required
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập mật khẩu"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeRegisterModal}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-semibold"
                      disabled={registerStatus === "loading"}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors min-w-[150px]"
                      disabled={registerStatus === "loading"}
                    >
                      {registerStatus === "loading"
                        ? "Đang xử lý..."
                        : "Đăng ký ngay"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center text-center py-6">
                {registerStatus === "success" ? (
                  <FaCheckCircle className="text-green-500 w-16 h-16 mb-4" />
                ) : (
                  <FaTimesCircle className="text-red-500 w-16 h-16 mb-4" />
                )}

                <h3
                  className={`text-lg font-bold mb-2 ${
                    registerStatus === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {registerStatus === "success" ? "Thành công!" : "Thất bại!"}
                </h3>

                <p className="text-gray-700 mb-6 leading-relaxed">
                  {registerMessage}
                </p>

                <div className="flex gap-3">
                  {registerStatus === "error" && (
                    <button
                      onClick={() => setRegisterStatus("idle")}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors"
                    >
                      Thử lại
                    </button>
                  )}
                  <button
                    onClick={closeRegisterModal}
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
