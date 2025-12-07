import React from "react";
import {
  BrowserRouter as Router, // Component cha, bao bọc toàn bộ ứng dụng để dùng routing, tên được viết gọn thành 'Router'
  Routes, //Component bao nhóm các Route, giúp chọn ra Route phù hợp với URL hiện tại
  Route, //Component định nghĩa 1 routing: một URL tương ứng với một component cụ thể
  Navigate, //Component dùng để chuyển hướng người dùng từ URL này sang URL khác
} from "react-router-dom";

// -----------------------------------------------

// import Layouts
import { NewWelcomeScreen } from "./pages/NewWelcomeScreen.jsx"; // import Welcome Screen
import { SharedLayout } from "./layouts/SharedLayout.jsx";
import { ResidentSharedLayout as RsLayout } from "./layouts/ResidentSharedLayout.jsx";
import { AccountantSharedLayout as AsLayout } from "./layouts/AccountantSharedLayout.jsx";
import { QRCodePayment } from "./pages/QRCodePayment.jsx"; //QR Layout
import { SecuritySharedLayout as SLayout } from "./layouts/SecuritySharedLayout.jsx";

// import BQT pages
import PaymentPage from "./pages/BQT/PaymentPage.jsx";
import { ProfilePage } from "./pages/BQT/ProfilePage.jsx";
import { ResidentsPage } from "./pages/BQT/ResidentsPage.jsx";
import { NotificationsPage } from "./pages/BQT/NotificationsPage.jsx";

// import Resident pages
import { ResidentProfilePage } from "./pages/citizen/ResidentProfilePage.jsx";
import { ResidentNotificationsPage as RnPage } from "./pages/citizen/ResidentNotificationsPage.jsx";
import { ResidentViewPage } from "./pages/citizen/ResidentViewPage.jsx";
import { ResidentPaymentPage } from "./pages/citizen/ResidentPaymentPage.jsx";

// import Accountant pages
import { AccountantProfilePage } from "./pages/Accountant/AccountProfile.jsx";
import { AccountPayment } from "./pages/Accountant/AccountPayment.jsx";
import { AccountCheckDebt } from "./pages/Accountant/AccountCheckDebt.jsx";
import { AccountantNotification } from "./pages/Accountant/AccountNotification.jsx";
import { PrintPayments } from "./pages/Accountant/printPayment.jsx";

// import Security pages
import { SecurityProfilePage as SProPage } from "./pages/Security/SecurityProfilePage.jsx";
import { SecurityNotification as SNotification } from "./pages/Security/SecurityNotification.jsx";
import { SecurityProblem as SCheck } from "./pages/Security/SecurityCheckingProblem.jsx";

// -----------------------------------------------

// TẠO CÁC TRANG PLACEHOLDER CHO DASHBOARD (BẢN XEM TRƯỚC CHO DỊCH VỤ CỦA CÁC ROLE)
const ServicesPage = () => (
  <h1 className="text-3xl font-bold text-white">Quản lý Dịch vụ</h1>
);

// -----------------------------------------------

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Route mặc định, chuyển hướng đến /welcome */}
        <Route path="/" element={<Navigate to="/newwelcome" />} />

        {/*---------------------------------------------*/}

        {/* ĐĂNG NHẬP/QUÊN MẬT KHẨU */}
        <Route
          path="/newwelcome"
          element={
            <div className="min-h-screen relative">
              <NewWelcomeScreen />
            </div>
          }
        />

        {/* ------------------------------------------ */}

        {/* BAN QUẢN TRỊ */}
        <Route path="/dashboard" element={<SharedLayout />}>
          <Route index element={<ProfilePage />} />
          <Route path="residents" element={<ResidentsPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="payment">
            <Route index element={<PaymentPage />} />
            <Route path=":invoiceId/qr" element={<QRCodePayment />} />
          </Route>
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        {/* ------------------------------------------ */}

        {/* CƯ DÂN */}
        <Route path="/resident_dashboard" element={<RsLayout />}>
          <Route index element={<ResidentProfilePage />} />
          <Route path="residents" element={<ResidentViewPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="payment">
            <Route index element={<ResidentPaymentPage />} />
            <Route path=":invoiceId/qr" element={<QRCodePayment />} />
          </Route>
          <Route path="notifications" element={<RnPage />} />
        </Route>

        {/* ------------------------------------------ */}

        {/* KẾ TOÁN */}
        <Route path="/accountant_dashboard" element={<AsLayout />}>
          <Route index element={<AccountantProfilePage />} />
          <Route path="accountant_payment">
            <Route index element={<AccountPayment />} />
          </Route>
          <Route path="check_debt" element={<AccountCheckDebt />} />
          <Route path="print_invoice" element={<PrintPayments />} />
          <Route path="notifications" element={<AccountantNotification />} />
        </Route>

        {/* ------------------------------------------ */}

        {/* BẢO VỆ */}
        <Route path="/security_dashboard" element={<SLayout />}>
          <Route index element={<SProPage />} />
          <Route path="incidents" element={<SCheck />} />
          <Route path="notifications" element={<SNotification />} />
        </Route>
      </Routes>
    </Router>
  );
}
