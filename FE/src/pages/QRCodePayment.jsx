import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

// --- Component hiển thị modal trạng thái ---
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- Import ảnh ---
import qrImage from "../images/qr.png";

export const QRCodePayment = () => {
  const navigate = useNavigate();
  const { invoiceId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State chứa thông tin thanh toán
  const [paymentDetails, setPaymentDetails] = useState({
    id: invoiceId,
    transactionRef: null,
    amount: "Đang tải...",
    feetype: "Đang tải...",
    accountName: "CÔNG TY QUẢN LÝ BLUE MOON", // Dữ liệu mock
    accountNumber: "999988887777", // Dữ liệu mock
  });

  // --- HÀM XÁC ĐỊNH URL CHUYỂN HƯỚNG ---
  const getSuccessRedirectUrl = () => {
    // window.location.pathname chứa đường dẫn hiện tại (ví dụ: /dashboard/payment/123/qr)
    // Nếu nó chứa '/resident_dashboard', thì chuyển hướng về trang của dân cư.
    if (window.location.pathname.includes("/resident_dashboard")) {
      return "/resident_dashboard/payment";
    }
    // Ngược lại, chuyển hướng về trang của BQT (mặc định)
    return "/dashboard/payment";
  };
  // ------------------------------------

  // --- Fetch payment details và transactionRef ---
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/payments/${invoiceId}`); // API GET one payment by id
        if (!response.ok) {
          throw new Error("Không tìm thấy hóa đơn.");
        }
        const data = await response.json();

        // Cập nhật state với dữ liệu thực tế
        setPaymentDetails({
          id: data.id,
          transactionRef: data.transaction_ref, // <<< Lấy transaction_ref
          amount: `${data.amount.toLocaleString("vi-VN")} VND`, // Định dạng số tiền
          feetype: data.feetype || "Phí không xác định",
          accountName: "CÔNG TY QUẢN LÝ BLUE MOON",
          accountNumber: "999988887777",
        });
        setError(null);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err.message);
        setPaymentDetails((prev) => ({
          ...prev,
          amount: "Lỗi tải dữ liệu",
          feetype: "Lỗi tải dữ liệu",
        }));
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      fetchPaymentDetails();
    }
  }, [invoiceId]);

  const handleGoBack = () => navigate(-1);

  if (loading) {
    return (
      <div className="text-white text-lg p-4">
        Đang tải thông tin thanh toán...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-400 text-lg p-4">Lỗi: {error}</div>;
  }

  return (
    <div className="flex flex-col items-center text-gray-800">
      {/* Tiêu đề */}
      <div className="bg-white rounded-lg shadow-md px-8 py-3 mb-8">
        <h1 className="text-2xl font-bold text-center">MÃ QR thanh toán</h1>
      </div>

      {/* Khối QR Code */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex flex-col items-center max-w-sm w-full">
        <p className="text-sm text-gray-600 mb-4 text-center">
          Mở Ứng Dụng Ngân Hàng Quét QRCode
        </p>
        <img
          src={qrImage}
          alt="QR Code Thanh toán"
          className="w-64 h-64 object-contain cursor-pointer"
        />
      </div>

      {/* Khối Thông tin thanh toán */}
      <div className="bg-white rounded-lg shadow-md p-6 max-w-lg w-full">
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-sm text-gray-500">Tên giao dịch:</span>
            <span className="font-medium">{paymentDetails.feetype}</span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-sm text-gray-500">Số tiền:</span>
            <span className="font-semibold text-blue-600">
              {paymentDetails.amount}
            </span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-sm text-gray-500">Tên chủ TK:</span>
            <span className="font-medium">{paymentDetails.accountName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Số tài khoản:</span>
            <span className="font-medium">{paymentDetails.accountNumber}</span>
          </div>
        </div>
        {/* Nút Quay lại và Kiểm tra */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handleGoBack}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-md transition-colors duration-200"
            disabled={showModal}
          >
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
};
