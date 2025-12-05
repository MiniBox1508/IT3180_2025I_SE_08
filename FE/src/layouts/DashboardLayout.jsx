import React from "react";
import { Link } from "react-router-dom";
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
  // Hàm xử lý Logout
  // Modal state
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Hàm xác nhận đăng xuất
  const handleLogoutConfirm = () => {
    // Xóa session/token (nếu có)
    // ...
    setShowLogoutModal(false);
    navigate("/newwelcome"); // CHUYỂN HƯỚNG VỀ TRANG WELCOME
  };

  const navigationItems = [
    { id: 1, label: "Trang chủ", isActive: false, icon: main_icon },
    { id: 2, label: "Dân cư", isActive: true, icon: resident },
    { id: 3, label: "Dịch vụ", isActive: false, icon: service },
    { id: 4, label: "Thanh toán", isActive: false, icon: payment },
    { id: 5, label: "Thông báo", isActive: false, icon: message },
  ];

  return (
    <div className="bg-[#2148c0] overflow-hidden w-full min-w-[1780px] min-h-[1130px] flex gap-5">
      <aside
        className="w-[200px] h-[1130px] relative -ml-3.5"
        role="navigation"
        aria-label="Main navigation"
      >
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

        <nav className="absolute w-[92.00%] h-[30.80%] top-[12.57%] left-[8.00%]">
          <img
            className="absolute w-[93.48%] h-[12.64%] top-[27.87%] left-0"
            alt=""
            src={activesection}
            role="presentation"
          />

          <Link
            href="#home"
            className="absolute w-[39.13%] top-[calc(50.00%_-_119px)] left-[26.09%] [font-family:'Nunito_Sans-SemiBold',Helvetica] font-semibold text-[#7d8592] text-base tracking-[0] leading-[normal] no-underline"
          >
            Trang chủ
          </Link>

          <Link
            href="#residents"
            className="absolute w-[28.26%] top-[calc(50.00%_-_65px)] left-[26.09%] [font-family:'Nunito_Sans-Bold',Helvetica] font-bold text-[#3f8cff] text-base tracking-[0] leading-[normal] no-underline"
            aria-current="page"
          >
            Dân cư
          </Link>

          <Link
            href="#services"
            className="absolute w-[29.89%] top-[calc(50.00%_-_11px)] left-[26.09%] [font-family:'Nunito_Sans-SemiBold',Helvetica] font-semibold text-[#7d8592] text-base tracking-[0] leading-[normal] no-underline"
          >
            Dịch vụ
          </Link>

          <Link
            href="#notifications"
            className="absolute w-[42.93%] top-[calc(50.00%_+_97px)] left-[26.09%] [font-family:'Nunito_Sans-SemiBold',Helvetica] font-semibold text-[#7d8592] text-base tracking-[0] leading-[normal] no-underline"
          >
            Thông báo
          </Link>

          <div
            className="absolute w-[13.04%] h-[6.90%] top-[77.59%] left-[4.35%] flex"
            aria-hidden="true"
          >
            <div className="flex-1 w-6 relative">
              <img
                className="absolute w-[87.50%] h-[79.17%] top-[8.33%] left-[8.33%]"
                alt=""
                src={shape}
                role="presentation"
              />
            </div>
          </div>

          <Link
            href="#payment"
            className="absolute w-[45.11%] top-[calc(50.00%_+_43px)] left-[26.09%] [font-family:'Nunito_Sans-SemiBold',Helvetica] font-semibold text-[#7d8592] text-base tracking-[0] leading-[normal] no-underline"
          >
            Thanh toán
          </Link>

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

          <div
            className="absolute w-[13.04%] h-[6.90%] top-[31.03%] left-[4.89%] bg-[url(/active.svg)] bg-[100%_100%]"
            aria-hidden="true"
          />

          <div
            className="absolute w-[13.04%] h-[6.90%] top-[15.52%] left-[4.35%] bg-[url(/image.png)] bg-[100%_100%]"
            aria-hidden="true"
          />
        </nav>

        <img
          className="absolute w-[25.00%] h-[4.42%] top-[3.54%] left-[12.00%]"
          alt="Company Logo"
          src={companySLogo}
        />

        <button
          onClick={() => setShowLogoutModal(true)}
          className="absolute w-[26.00%] top-[calc(50.00%_+_498px)] left-[32.00%] [font-family:'Nunito_Sans-SemiBold',Helvetica] font-semibold text-[#7d8592] text-base tracking-[0] leading-[normal] cursor-pointer text-left"
          type="button"
          aria-label="Logout"
        >
          Đăng xuất
        </button>

        {/* Logout Modal */}
        <LogoutModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={handleLogoutConfirm}
        />

        <div
          className="absolute w-[12.00%] h-[2.12%] top-[93.98%] left-[12.00%] flex"
          aria-hidden="true"
        >
          <div className="flex-1 w-6 relative">
            <img
              className="absolute w-[83.33%] h-[83.33%] top-[8.33%] left-[8.33%]"
              alt=""
              src={logout}
              role="presentation"
            />
          </div>
        </div>

        <div
          className="absolute w-[12.00%] h-[2.12%] top-[26.90%] left-[12.00%] bg-[url(/inactive-2.png)] bg-[100%_100%]"
          aria-hidden="true"
        />
      </aside>

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
          className="absolute w-[11.89%] top-[calc(50.00%_-_11px)] left-[13.11%] [font-family:'Nunito_Sans-Regular',Helvetica] font-normal text-[#7d8592] text-base tracking-[0] leading-[normal] [background:transparent] border-[none] p-0"
          placeholder="Search"
          type="search"
          aria-label="Search"
        />
      </main>
    </div>
  );
};
