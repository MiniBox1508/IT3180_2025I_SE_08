import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Dân cư chỉ cần StatusModal để xem kết quả thanh toán từ trang QR (nếu cần)
// và ConfirmationModal không dùng ở đây.
// import { StatusModal } from "../layouts/StatusModal"; 
// import acceptIcon from "../images/accept_icon.png";
// import notAcceptIcon from "../images/not_accept_icon.png";

// --- Component hiển thị một mục thanh toán (Giữ nguyên) ---
const PaymentItem = ({ item }) => {
    const navigate = useNavigate();
    // BE trả về status_text là "Đã thanh toán" hoặc "Chưa thanh toán"
    const isPaid = item.status_text === "Đã thanh toán";
    
    // Format ngày: BE trả về payment_date (null nếu chưa thanh toán)
    const formattedPaymentDate = item.payment_date 
      ? new Date(item.payment_date).toLocaleDateString('vi-VN') 
      : "---";
  
    const handlePayInvoice = (invoiceId) => {
      // Dân cư có thể thanh toán hóa đơn của mình
      navigate(`/resident_dashboard/payment/${invoiceId}/qr`); 
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
// ĐỔI TÊN THÀNH ResidentPaymentPage để phân biệt với PaymentPage của BQT
export const ResidentPaymentPage = () => { 
    const [payments, setPayments] = useState([]);
    // KHÔNG CẦN RESIDENTS
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [searchTerm, setSearchTerm] = useState(""); 
    
    // KHÔNG CẦN CÁC STATE VÀ LOGIC CHO ADD MODAL VÀ STATUS MODAL
    
    // Hàm Fetch dữ liệu Thanh toán (Vẫn dùng endpoint chung, nhưng có thể đổi sang endpoint chỉ lấy của resident sau)
    const fetchPayments = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // LƯU Ý: Nếu muốn chỉ hiển thị hóa đơn của cư dân đang đăng nhập, cần dùng API
            // /api/payment-status?resident_id=ID hoặc /api/payments/by-resident/ID
            // Ở đây, ta dùng tạm endpoint chung (giả định FE sẽ lọc sau hoặc BE đã filter)
            const response = await fetch(`${API_BASE_URL}/payments`); 
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Lỗi không xác định khi tải dữ liệu.' }));
                throw new Error(errorData.error || 'Không thể tải dữ liệu thanh toán.');
            }
            const data = await response.json();
            setPayments(data);
        } catch (err) {
            console.error('Fetch Error:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchPayments();
    }, []);
    
    // Logic Lọc và Sắp xếp dữ liệu (Giữ nguyên logic sắp xếp: Chưa TT lên trên)
    const filteredPayments = payments
        .filter(payment => {
            if (!searchTerm.trim()) {
                return true;
            }
            const searchLower = searchTerm.trim().toLowerCase();
            const idMatch = String(payment.id).toLowerCase().includes(searchLower);
            return idMatch;
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
    // ----------------------------
    
    // Xử lý Loading State
    if (isLoading) {
        return <div className="text-white text-lg p-4">Đang tải danh sách thanh toán...</div>;
    }

    // Xử lý Error State
    if (error) {
        return <div className="text-red-400 text-lg p-4">Lỗi tải dữ liệu: {error}</div>;
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
                {filteredPayments.map((item) => ( 
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
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input
                        type="search"
                        placeholder="Tìm theo ID thanh toán..." 
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

            {/* KHÔNG CÓ MODAL TẠO THANH TOÁN */}
            {/* KHÔNG CÓ STATUS MODAL */}

        </div>
    );
};