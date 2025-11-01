import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom"; 

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
  { name: "Trang chủ", to: "/resident_dashboard", icon: iconTrangChu },
  { name: "Dân cư", to: "/resident_dashboard/residents", icon: iconDanCu },
  { name: "Dịch vụ", to: "/resident_dashboard/services", icon: iconDichVu },
  {
    name: "Thanh toán",
    to: "/resident_dashboard/payment",
    icon: iconThanhToan,
  },
  {
    name: "Thông báo",
    to: "/resident_dashboard/notifications",
    icon: iconThongBao,
  },
];

// --- Search Icon ---
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5 text-gray-400"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
    />
  </svg>
);

export const ResidentSharedLayout = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate(); 

  // Hàm xử lý Logout
  const handleLogout = () => {
    // Xóa session/token (nếu có)
    // ...
    navigate("/welcome"); // CHUYỂN HƯỚNG VỀ TRANG WELCOME
  };

  // === SỬA TẠI ĐÂY: Thanh active bên TRÁI ===
  const getNavLinkClass = ({ isActive }) => {
    // Class cơ sở: luôn có viền trái 4px và padding trái 3 (pl-3)
    const baseClasses =
      "flex items-center space-x-4 pl-3 pr-4 py-3 rounded-lg transition-colors duration-200 border-l-4";

    if (isActive) {
      // Active: Nền xanh nhạt, chữ xanh đậm, viền trái xanh đậm
      return `${baseClasses} bg-blue-50 text-blue-600 font-bold border-blue-600`;
    } else {
      // Inactive: Viền trái trong suốt, chữ xám
      return `${baseClasses} border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium`;
    }
  };
  // === KẾT THÚC SỬA ===

  return (
    <div className="flex h-screen bg-blue-700">
      {" "}
      {/* Đổi nền chính thành màu xanh */}
      {/* === SIDEBAR === */}
      {/* Thêm rounded-tr-2xl và rounded-br-2xl */}
      <aside className="w-72 flex flex-col bg-white rounded-tr-2xl rounded-br-2xl flex-shrink-0 relative z-10 shadow-lg">
        {" "}
        {/* THÊM/SỬA Ở ĐÂY */}
        {/* Logo */}
        <div className="h-20 flex items-center justify-center px-6">
          {" "}
          {/* Căn giữa logo */}
          <img src={logo} alt="Logo" className="h-10 w-auto" />
        </div>
        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              // Chỉ NavLink 'Trang chủ' mới cần prop end để active đúng index
              end={item.to === "/resident_dashboard"}
              className={getNavLinkClass}
            >
              <img src={item.icon} alt="" className="w-6 h-6" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
        {/* Logout Section */}
        <div className="p-4 mt-auto border-t border-gray-100">
          {" "}
          {/* Màu border nhạt hơn */}
          <div className="w-full h-36 rounded-lg mb-4 flex items-center justify-center overflow-hidden bg-blue-50">
            {" "}
            {/* Thêm nền nhẹ */}
            <img
              src={support}
              alt="illustration"
              className="h-full w-auto object-contain p-2" /* Điều chỉnh object-fit và padding */
            />
          </div>
          <button 
            onClick={handleLogout} 
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 font-medium"
          >
            <img src={iconLogout} alt="" className="w-6 h-6" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      {/* === KHUNG NỘI DUNG CHÍNH (ĐÃ XÓA THANH SEARCH) === */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        
        {/* Thanh tìm kiếm đã bị xóa khỏi đây. Chỉ còn lại p-8 pt-4 flex-1 */}
        
        <div className="p-8 pt-4 flex-1"> 
          <Outlet />
        </div>
      </main>
    </div>
  );
};