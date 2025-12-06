import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";

// --- API CONFIG ---
const API_BASE_URL = "https://off-be-deploy.vercel.app";

// --- ICONS ---
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// --- HELPER FORMAT CURRENCY ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const AccountCheckDebt = () => {
  // State
  const [debts, setDebts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchDebts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/payments`);
        // Xử lý dữ liệu raw từ API để phù hợp với giao diện Công nợ
        const processedData = response.data.map(item => {
          // Logic xác định trạng thái quá hạn (giả sử > 30 ngày chưa đóng là quá hạn)
          const createdDate = dayjs(item.created_at);
          const now = dayjs();
          const isOverdue = item.state === 0 && now.diff(createdDate, 'day') > 30;

          let statusText = "Chưa thanh toán";
          let statusColor = "text-orange-500"; // Màu cam

          if (item.state === 1) {
            statusText = "Đã thanh toán";
            statusColor = "text-green-500"; // Màu xanh
          } else if (isOverdue) {
            statusText = "Quá hạn";
            statusColor = "text-red-500"; // Màu đỏ
          }

          return {
            ...item,
            period: `T${createdDate.format("MM/YYYY")}`, // Kỳ thanh toán dựa trên ngày tạo
            paid_amount: item.state === 1 ? item.amount : 0, // Đã thu
            status_text: statusText,
            status_color: statusColor,
            payment_date_display: item.payment_date ? dayjs(item.payment_date).format("DD/MM/YYYY") : "---"
          };
        });

        // Sort: Chưa thanh toán lên đầu, sau đó đến ngày tạo mới nhất
        processedData.sort((a, b) => a.state - b.state || new Date(b.created_at) - new Date(a.created_at));
        
        setDebts(processedData);
      } catch (error) {
        console.error("Lỗi tải công nợ:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDebts();
  }, []);

  // --- FILTER ---
  const filteredList = debts.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      String(item.id).includes(term) ||
      (item.apartment_id && item.apartment_id.toLowerCase().includes(term)) ||
      (item.feetype && item.feetype.toLowerCase().includes(term))
    );
  });

  return (
    <div className="w-full min-h-screen">
      {/* 1. THANH TÌM KIẾM */}
      <div className="flex justify-start items-center mb-8">
        <div className="relative w-full max-w-2xl bg-white rounded-lg overflow-hidden shadow-sm">
          <span className="absolute left-4 top-1/2 -translate-y-1/2">
            <SearchIcon />
          </span>
          <input
            type="search"
            placeholder="Tìm kiếm theo ID, Căn hộ, Loại phí..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-gray-700 focus:outline-none h-12"
          />
        </div>
      </div>

      {/* 2. TITLE */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Quản lý công nợ</h1>
      </div>

      {/* 3. DANH SÁCH CÔNG NỢ (CARD) */}
      <div className="space-y-4 pb-10">
        {isLoading ? (
          <p className="text-white text-center">Đang tải dữ liệu...</p>
        ) : filteredList.length === 0 ? (
          <p className="text-white text-center">Không tìm thấy dữ liệu công nợ.</p>
        ) : (
          filteredList.map((item) => (
            <div key={item.id} className="bg-white rounded-[20px] p-5 flex items-center shadow-md relative min-h-[90px]">
              {/* Thanh xanh bên trái */}
              <div className="absolute left-6 top-4 bottom-4 w-1 bg-blue-500 rounded-full"></div>

              {/* Grid Content - Layout giống ảnh */}
              <div className="flex-1 grid grid-cols-12 gap-4 items-center pl-10">
                
                {/* Cột 1: ID */}
                <div className="col-span-1">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Công nợ ID</p>
                  <p className="text-lg font-bold text-gray-900">{item.id}</p>
                </div>

                {/* Cột 2: Số căn hộ */}
                <div className="col-span-1">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Số căn hộ</p>
                  <p className="text-sm font-semibold text-gray-900">{item.apartment_id}</p>
                </div>

                {/* Cột 3: Loại phí */}
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Loại phí</p>
                  <p className="text-sm font-semibold text-gray-900 truncate" title={item.feetype}>
                    {item.feetype}
                  </p>
                </div>

                {/* Cột 4: Kỳ TT */}
                <div className="col-span-1">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Kỳ TT</p>
                  <p className="text-sm font-semibold text-gray-900">{item.period}</p>
                </div>

                {/* Cột 5: Ngày thanh toán */}
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Ngày thanh toán</p>
                  <p className="text-sm font-semibold text-gray-900">{item.payment_date_display}</p>
                </div>

                {/* Cột 6: Tổng thu */}
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Tổng thu</p>
                  <p className="text-sm font-bold text-gray-900">
                    {formatCurrency(item.amount)}
                  </p>
                </div>

                {/* Cột 7: Đã thu */}
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Đã thu</p>
                  <p className="text-sm font-bold text-gray-900">
                    {formatCurrency(item.paid_amount)}
                  </p>
                </div>

                {/* Cột 8: Trạng thái */}
                <div className="col-span-1 text-right">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Trạng thái</p>
                  <p className={`text-xs font-bold ${item.status_color}`}>
                    {item.status_text}
                  </p>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};