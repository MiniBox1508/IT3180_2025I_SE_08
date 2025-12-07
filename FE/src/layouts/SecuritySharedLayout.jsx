import React, { useState } from "react";
import LogoutModal from "../layouts/LogoutModal";
import { Outlet, NavLink, useNavigate } from "react-router-dom";

// --- Imports Images (Giả định tái sử dụng các icon có sẵn hoặc bạn cần thay thế đúng icon) ---
import logo from "../images/company-s-logo.png";
import iconTrangChu from "../images/inactive.svg";
import iconSuCo from "../images/dash_user_icon.svg"; // Placeholder: Thay bằng icon sự cố
import iconQuanLy from "../images/dash_payment_icon.svg"; // Placeholder: Thay bằng icon quản lý
import iconThongBao from "../images/dash_message_icon.svg";
import support from "../images/support.png";
import iconLogout from "../images/logout.svg";

// --- Nav Items cho trang Công An ---
const navItems = [
  { name: "Trang chủ", to: "/security_dashboard", icon: iconTrangChu },
  {
    name: "Sự cố",
    to: "/security_dashboard/incidents",
    icon: iconSuCo,
  },
  { name: "Quản lý", to: "/security_dashboard/management", icon: iconQuanLy },
  {
    name: "Thông báo",
    to: "/security_dashboard/notifications",
    icon: iconThongBao,
  },
];

export const SecuritySharedLayout = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Hàm xác nhận đăng xuất
  const handleLogoutConfirm = () => {
    // Xóa session/token
    setShowLogoutModal(false);
    navigate("/welcome");
  };

  // Style cho NavLink
  const getNavLinkClass = ({ isActive }) => {
    const baseClasses =
      "flex items-center space-x-4 pl-3 pr-4 py-3 rounded-lg transition-colors duration-200 border-l-4";

    if (isActive) {
      return `${baseClasses} bg-blue-50 text-blue-600 font-bold border-blue-600`;
    } else {
      return `${baseClasses} border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium`;
    }
  };

  return (
    <div className="flex h-screen bg-blue-700">
      {/* === SIDEBAR === */}
      <aside className="w-72 flex flex-col bg-white rounded-tr-2xl rounded-br-2xl flex-shrink-0 relative z-10 shadow-lg">
        {/* Logo */}
        <div className="h-20 flex items-center justify-center px-6">
          <img src={logo} alt="Logo" className="h-10 w-auto" />
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.to === "/security_dashboard"}
              className={getNavLinkClass}
            >
              <img src={item.icon} alt="" className="w-6 h-6" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="p-4 mt-auto border-t border-gray-100">
          <div className="w-full h-36 rounded-lg mb-4 flex items-center justify-center overflow-hidden bg-blue-50">
            <img
              src={support}
              alt="illustration"
              className="h-full w-auto object-contain p-2"
            />
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 font-medium"
          >
            <img src={iconLogout} alt="" className="w-6 h-6" />
            <span>Đăng xuất</span>
          </button>

          {/* Logout Modal */}
          <LogoutModal
            isOpen={showLogoutModal}
            onClose={() => setShowLogoutModal(false)}
            onConfirm={handleLogoutConfirm}
          />
        </div>
      </aside>

      {/* === MAIN CONTENT === */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        <div className="p-8 pt-4 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
