import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// --- IMPORT ẢNH MŨI TÊN CHO PHÂN TRANG ---
import arrowLeft from "../../images/Arrow_Left_Mini_Circle.png"; 
import arrowRight from "../../images/Arrow_Right_Mini_Circle.png";

const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

// --- Component hiển thị một mục thanh toán (Giữ nguyên) ---
const PaymentItem = ({ item }) => {
  const navigate = useNavigate();
  // BE trả về status_text là "Đã thanh toán" hoặc "Chưa thanh toán"
  const isPaid = item.status_text === "Đã thanh toán";

  // Format ngày: BE trả về payment_date (null nếu chưa thanh toán)
  const formattedPaymentDate = item.payment_date
    ? new Date(item.payment_date).toLocaleDateString("vi-VN")
    : "---";

  const handlePayInvoice = (invoiceId) => {
    // Dân cư có thể thanh toán hóa đơn của mình
    navigate(`/resident/payment/${invoiceId}/qr`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex items-center space-x-6 relative overflow-hidden mb-4">
      {/* Thanh xanh dọc bên trái */}
      <div className="absolute left-4 top-3 bottom-3 w-1.5 bg-blue-500 rounded-full"></div>
      {/* Thông tin thanh toán */}
      <div className="flex-1 grid grid-cols-5 gap-4 items-center pl-8">
        {/* Cột 1: ID */}
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Thanh toán ID</p>
          <p className="font-semibold text-gray-800">{item.id}</p>
        </div>
        {/* Cột 2: Loại phí */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Loại phí</p>
          <p className="font-medium text-gray-700">{item.feetype}</p>
        </div>
        {/* Cột 3: Ngày thanh toán */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Ngày thanh toán</p>
          <p className="text-gray-600">{formattedPaymentDate}</p>
        </div>
        {/* Cột 4: Hình thức */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Hình thức thanh toán</p>
          <p className="text-gray-600">{item.payment_form || "---"}</p>
        </div>
        {/* Cột 5: Trạng thái & Nút */}
        <div className="text-right">
          <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
          <p
            className={`font-semibold mb-2 ${
              isPaid ? "text-green-600" : "text-red-600"
            }`}
          >
            {item.status_text}
          </p>
          {/* Dân cư chỉ thanh toán nếu CHƯA thanh toán */}
          {!isPaid && (
            <button
              onClick={() => handlePayInvoice(item.id)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
            >
              Thanh toán hóa đơn
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// === COMPONENT CHÍNH: RESIDENT PAYMENT PAGE ===
// =========================================================================
export const ResidentPaymentPage = () => {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  // --- STATE PHÂN TRANG (MỚI) ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Số lượng ô dữ liệu / 1 trang

  // Hàm lấy JWT token từ localStorage
  const getToken = () => {
    return localStorage.getItem("token");
  };

  // Hàm Fetch dữ liệu Thanh toán: chỉ lấy của cư dân đang đăng nhập, gửi token trong header
  const fetchPayments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const apartment_id = user?.apartment_id;
      
      if (!apartment_id) throw new Error("Không tìm thấy thông tin căn hộ.");
      
      const token = getToken();
      const response = await fetch(
        `${API_BASE_URL}/payments/by-apartment/${apartment_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Lỗi không xác định khi tải dữ liệu." }));
        throw new Error(errorData.error || "Không thể tải dữ liệu thanh toán.");
      }
      const data = await response.json();
      setPayments(data);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // --- RESET TRANG KHI TÌM KIẾM ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Logic Lọc và Sắp xếp dữ liệu
  const filteredPayments = payments
    .filter((payment) => {
      if (!searchTerm.trim()) {
        return true;
      }
      const searchLower = searchTerm.trim().toLowerCase();
      
      // Tìm theo ID
      const idMatch = String(payment.id).toLowerCase().includes(searchLower);
      // Tìm theo Loại phí (feetype)
      const feeTypeMatch = payment.feetype && payment.feetype.toLowerCase().includes(searchLower);

      return idMatch || feeTypeMatch;
    })
    .sort((a, b) => {
      const isAPaid = a.status_text === "Đã thanh toán" ? 1 : 0;
      const isBPaid = b.status_text === "Đã thanh toán" ? 1 : 0;

      if (isAPaid !== isBPaid) {
        return isAPaid - isBPaid;
      }

      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

  // --- LOGIC CẮT DỮ LIỆU ĐỂ HIỂN THỊ (PAGINATION) ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  // --- HANDLER CHUYỂN TRANG ---
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Xử lý Loading State
  if (isLoading) {
    return (
      <div className="text-white text-lg p-4">
        Đang tải danh sách thanh toán...
      </div>
    );
  }

  // Xử lý Error State
  if (error) {
    return (
      <div className="text-red-400 text-lg p-4">Lỗi tải dữ liệu: {error}</div>
    );
  }

  // Hiển thị nội dung
  const renderContent = () => {
    if (filteredPayments.length === 0) {
      return (
        <div className="bg-white p-6 rounded-lg text-center text-gray-500 shadow-md">
          Không có hóa đơn thanh toán nào phù hợp với tìm kiếm.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Render danh sách đã được cắt (Pagination) */}
        {currentPayments.map((item) => (
          <PaymentItem key={item.id} item={item} />
        ))}
      </div>
    );
  };

  return (
    <div className="text-white">
      {/* Thanh Tìm kiếm Full Width */}
      <div className="flex justify-start items-center mb-6">
        <div className="relative w-full max-w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Tìm theo ID thanh toán hoặc Loại phí..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Header: KHÔNG CÓ NÚT TẠO THANH TOÁN */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Lịch sử Thanh toán</h1>
      </div>

      {renderContent()}

      {/* --- PAGINATION CONTROLS --- */}
      {filteredPayments.length > 0 && (
        <div className="flex justify-center items-center mt-6 space-x-6 pb-8">
          {/* Nút Prev */}
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className={`w-12 h-12 rounded-full border-2 border-black flex items-center justify-center transition-transform hover:scale-105 ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed bg-gray-200" : "cursor-pointer bg-white"
            }`}
          >
            <img src={arrowLeft} alt="Previous" className="w-6 h-6 object-contain" />
          </button>

          {/* Thanh hiển thị số trang */}
          <div className="bg-gray-400/80 backdrop-blur-sm text-white font-bold py-3 px-8 rounded-full flex items-center space-x-4 shadow-lg">
            <span className="text-lg">Trang</span>
            <div className="bg-gray-500/60 rounded-lg px-4 py-1 text-xl shadow-inner text-white">
              {currentPage}
            </div>
            <span className="text-lg">/ {totalPages}</span>
          </div>

          {/* Nút Next */}
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={`w-12 h-12 rounded-full border-2 border-black flex items-center justify-center transition-transform hover:scale-105 ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed bg-gray-200" : "cursor-pointer bg-white"
            }`}
          >
            <img src={arrowRight} alt="Next" className="w-6 h-6 object-contain" />
          </button>
        </div>
      )}
    </div>
  );
};