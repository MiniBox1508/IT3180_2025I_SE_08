import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom"; // Đã bỏ Link vì không dùng đúng cách
import activesection from "../images/activesection.png";
import activesection1 from "../images/activesection.svg";
import companySLogo from "../images/company-s-logo.png";
import logout from "../images/logout.svg";
import main from "../images/main.png";
import support from "../images/support.png";
import LogoutModal from "../layouts/LogoutModal";
import service from "../images/dash_user_icon.svg";
import main_icon from "../images/main_dashboard_icon.svg";
import resident from "../images/dash_resident_icon.svg";
import message from "../images/dash_message_icon.svg";
import payment from "../images/dash_payment_icon.svg";

// Adding the missing imports
import shape from "../images/shape.svg";
import inactive from "../images/inactive.png";

export const DashboardLayout = () => {
  const navigate = useNavigate();
  // Modal state
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Hàm xác nhận đăng xuất
  const handleLogoutConfirm = () => {
    console.log("Đang thực hiện đăng xuất...");
    // Xóa session/token (nếu có)
    setShowLogoutModal(false);
    navigate("/newwelcome");
  };

  // Hàm mở modal (Thêm log để debug)
  const handleOpenLogout = () => {
    console.log("Nút đăng xuất đã được bấm!");
    setShowLogoutModal(true);
  };

  return (
    <>
      <div className="bg-[#2148c0] overflow-auto w-full min-w-[1780px] min-h-[1130px] flex gap-5">
        <aside
          className="w-[200px] h-[1130px] relative -ml-3.5"
          role="navigation"
          aria-label="Main navigation"
        >
          {/* Background Images */}
          <img
            className="w-full h-full left-[7.00%] absolute top-0"
            alt=""
            src={main}
            role="presentation"
          />
          <img
            className="absolute w-[84.00%] h-[12.92%] top-[76.64%] left-[8.00%]"
            alt=""
            src={support}
            role="presentation"
          />

          {/* Navigation Menu */}
          <nav className="absolute w-[92.00%] h-[30.80%] top-[12.57%] left-[8.00%]">
            <img
              className="absolute w-[93.48%] h-[12.64%] top-[27.87%] left-0"
              alt=""
              src={activesection}
              role="presentation"
            />

            {/* --- ĐÃ XÓA CÁC THẺ <Link> GÂY LỖI VÀ TRÙNG LẶP --- */}

            <NavLink
              to="/dashboard"
              end // Thêm end để tránh active nhầm
              className={({ isActive }) =>
                `absolute w-[39.13%] top-[calc(50.00%_-_119px)] left-[26.09%] font-semibold text-base tracking-[0] leading-[normal] no-underline ${
                  isActive ? "text-[#7d8592]" : "text-[#7d8592]"
                }`
              }
            >
              Trang chủ
            </NavLink>

            <NavLink
              to="/dashboard/residents"
              className="absolute w-[28.26%] top-[calc(50.00%_-_65px)] left-[26.09%] font-bold text-[#3f8cff] text-base tracking-[0] leading-[normal] no-underline"
            >
              Dân cư
            </NavLink>

            <NavLink
              to="/dashboard/services"
              className="absolute w-[29.89%] top-[calc(50.00%_-_11px)] left-[26.09%] font-semibold text-[#7d8592] text-base tracking-[0] leading-[normal] no-underline"
            >
              Dịch vụ
            </NavLink>

            <NavLink
              to="/dashboard/notifications"
              className="absolute w-[42.93%] top-[calc(50.00%_+_97px)] left-[26.09%] font-semibold text-[#7d8592] text-base tracking-[0] leading-[normal] no-underline"
            >
              Thông báo
            </NavLink>

            <NavLink
              to="/dashboard/payment"
              className="absolute w-[45.11%] top-[calc(50.00%_+_43px)] left-[26.09%] font-semibold text-[#7d8592] text-base tracking-[0] leading-[normal] no-underline"
            >
              Thanh toán
            </NavLink>

            {/* Decorators */}
            <img
              className="absolute w-[2.17%] h-[12.64%] top-[27.87%] left-[96.20%]"
              alt=""
              src={activesection1}
              role="presentation"
            />
            <div
              className="absolute w-[13.04%] h-[6.90%] top-[62.07%] left-[4.35%] flex"
              aria-hidden="true"
            >
              <img
                className="flex-1 w-[23px]"
                alt=""
                src={inactive}
                role="presentation"
              />
            </div>
            {/* ... các div trang trí khác ... */}
          </nav>

          <img
            className="absolute w-[25.00%] h-[4.42%] top-[3.54%] left-[12.00%]"
            alt="Company Logo"
            src={companySLogo}
          />

          {/* === NÚT ĐĂNG XUẤT (Đã sửa) === */}
          <button
            type="button" // Quan trọng: Ngăn chặn hành vi submit mặc định
            onClick={handleOpenLogout}
            className="absolute z-50 flex items-center gap-3 top-[93%] left-[12%] group cursor-pointer border-none bg-transparent hover:opacity-80 transition-opacity"
          >
            <div className="w-6 h-6 relative">
              <img
                className="w-full h-full object-contain"
                alt="Logout"
                src={logout}
              />
            </div>
            <span className="font-semibold text-[#7d8592] text-base group-hover:text-red-500 transition-colors">
              Đăng xuất
            </span>
          </button>

          <div
            className="absolute w-[12.00%] h-[2.12%] top-[26.90%] left-[12.00%] bg-[url(/inactive-2.png)] bg-[100%_100%]"
            aria-hidden="true"
          />
        </aside>

        {/* Main Content Area */}
        <main className="mt-[22px] w-[467px] h-[54px] relative">
          <div className="w-[170.57%] h-[103.70%] left-0 bg-white rounded-[14px] shadow-[0px_6px_58px_#c3cbd61b] absolute top-0" />
          <div
            className="absolute w-[5.83%] h-[50.00%] top-[25.00%] left-[4.61%] bg-[url(/search.png)] bg-[100%_100%]"
            aria-hidden="true"
          />
          <label htmlFor="search-input" className="sr-only">
            Search
          </label>
          <input
            id="search-input"
            className="absolute w-[11.89%] top-[calc(50.00%_-_11px)] left-[13.11%] font-normal text-[#7d8592] text-base tracking-[0] leading-[normal] bg-transparent border-none p-0 focus:outline-none"
            placeholder="Search"
            type="search"
            aria-label="Search"
          />
        </main>
      </div>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
};
