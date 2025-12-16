import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import LogoutModal from "../layouts/LogoutModal";
// --- Imports ---
import logo from "../images/company-s-logo.png";
import iconTrangChu from "../images/inactive.svg";
import iconDanCu from "../images/dash_resident_icon.svg";
import iconDichVu from "../images/dash_user_icon.svg";
import iconThanhToan from "../images/dash_payment_icon.svg";
import iconThongBao from "../images/dash_message_icon.svg";
import support from "../images/support.png";
import iconLogout from "../images/logout.svg";

// --- Nav Items ---
const navItems = [
  { name: "Trang chủ", to: "/management", icon: iconTrangChu },
  { name: "Người dùng", to: "/management/residents", icon: iconDanCu },
  { name: "Căn hộ", to: "/management/apartments", icon: iconDanCu }, // Đã thêm icon căn hộ
  { name: "Dịch vụ", to: "/management/services", icon: iconDichVu },
  { name: "Báo cáo", to: "/management/reports", icon: iconThanhToan },
  { name: "Thanh toán", to: "/management/payments", icon: iconThanhToan },
  { name: "Thông báo", to: "/management/notifications", icon: iconThongBao },
];

export const SharedLayout = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Hàm xác nhận đăng xuất
  const handleLogoutConfirm = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setShowLogoutModal(false);
    navigate("/welcome"); 
  };

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
    // 1. Thêm 'overflow-hidden' vào container cha để chặn scroll của toàn trang
    <div className="flex h-screen w-screen bg-blue-700 overflow-hidden">
      
      {/* === SIDEBAR === */}
      <aside className="w-72 h-full flex flex-col bg-white rounded-tr-2xl rounded-br-2xl flex-shrink-0 relative z-10 shadow-lg">
        
        {/* Logo - Giữ cố định */}
        <div className="h-20 flex items-center justify-center px-6 flex-shrink-0">
          <img src={logo} alt="Logo" className="h-10 w-auto" />
        </div>

        {/* Nav Links - Cho phép cuộn nếu danh sách dài (overflow-y-auto) */}
        <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.to === "/management"}
              className={getNavLinkClass}
            >
              <img src={item.icon} alt="" className="w-6 h-6" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout Section - Giữ cố định ở đáy */}
        <div className="p-4 mt-auto border-t border-gray-100 flex-shrink-0">
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
        </div>
      </aside>

      {/* === KHUNG NỘI DUNG CHÍNH === */}
      <main className="flex-1 h-full overflow-y-auto flex flex-col relative">
        <div className="p-8 pt-4 flex-1">
          <Outlet />
        </div>
      </main>

      {/* Logout Modal - Đặt ở ngoài cùng để đè lên tất cả */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
};