// Cần sử dụng content_fetch_id chính xác cho App.jsx
// file_content_fetcher.fetch(source_references=['uploaded:dang9805/wasd/wasd-BE3/src/App.jsx'])

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Layouts
import { AuthLayout } from "./layouts/AuthLayout.jsx";
import { SharedLayout } from "./layouts/SharedLayout.jsx";
import { ResidentSharedLayout as RsLayout } from "./layouts/ResidentSharedLayout.jsx";
// Pages
import { WelcomeScreen } from "./pages/WelcomeScreen.jsx";
import { Box as LoginScreen } from "./pages/LoginScreen.jsx";
import { PaymentPage } from "./pages/BQT/PaymentPage.jsx";
import { QRCodePayment } from "./pages/QRCodePayment.jsx";
import { NotificationsPage } from "./pages/BQT/NotificationsPage.jsx";
import { ProfilePage } from "./pages/BQT/ProfilePage.jsx";
import { ResidentsPage } from "./pages/BQT/ResidentsPage.jsx";
import { ResidentProfilePage } from "./pages/citizen/ResidentProfilePage.jsx";
import { ResidentNotificationsPage as RnPage } from "./pages/citizen/ResidentNotificationsPage.jsx";
import { ResidentViewPage } from "./pages/citizen/ResidentViewPage.jsx";
// <<< NEW: Import ResidentPaymentPage >>>
import { ResidentPaymentPage } from "./pages/citizen/ResidentPaymentPage.jsx";
import NewWelcomeScreen from "./pages/citizen/NewWelcomeScreen.jsx";

// --- TẠO CÁC TRANG PLACEHOLDER CHO DASHBOARD ---
const ServicesPage = () => (
  <h1 className="text-3xl font-bold text-white">Quản lý Dịch vụ</h1>
);

// -----------------------------------------------

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Route mặc định, chuyển hướng đến /welcome */}
        <Route path="/" element={<Navigate to="/welcome" />} />

        {/* === Các trang không cần Sidebar (Login, Welcome) === */}
        <Route
          path="/welcome"
          element={
            <div className="min-h-screen relative">
              <AuthLayout />
              <WelcomeScreen />
            </div>
          }
        />
        <Route
          path="/login"
          element={
            <div className="min-h-screen relative">
              <AuthLayout />
              <LoginScreen />
            </div>
          }
        />
        <Route path="/newwelcome" element={<NewWelcomeScreen />} />

        {/* === CÁC TRANG CẦN SIDEBAR (DASHBOARD) - BAN QUẢN TRỊ === */}
        <Route path="/dashboard" element={<SharedLayout />}>
          <Route index element={<ProfilePage />} />
          <Route path="residents" element={<ResidentsPage />} />
          <Route path="services" element={<ServicesPage />} />

          <Route path="payment">
            {/* BQT dùng PaymentPage có nút Thêm */}
            <Route index element={<PaymentPage />} />
            <Route path=":invoiceId/qr" element={<QRCodePayment />} />
          </Route>

          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        {/* === Resident-specific dashboard (layout riêng cho cư dân) === */}
        <Route path="/resident_dashboard" element={<RsLayout />}>
          {/* Trang chủ cư dân */}
          <Route index element={<ResidentProfilePage />} />
          <Route path="residents" element={<ResidentViewPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="payment">
            {/* <<< Cư dân dùng ResidentPaymentPage KHÔNG có nút Thêm >>> */}
            <Route index element={<ResidentPaymentPage />} />
            <Route path=":invoiceId/qr" element={<QRCodePayment />} />
          </Route>
          <Route path="notifications" element={<RnPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
