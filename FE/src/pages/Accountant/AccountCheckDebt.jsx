import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom"; 

// --- API CONFIG ---
const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

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
  const navigate = useNavigate(); 
  
  // State Data
  const [debts, setDebts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // State cho chức năng chọn/xuất hóa đơn
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]); // SỬA: Dùng mảng để lưu nhiều ID

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchDebts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/payments`);
        const processedData = response.data.map(item => {
          const createdDate = dayjs(item.created_at);
          const now = dayjs();
          const isOverdue = item.state === 0 && now.diff(createdDate, 'day') > 30;

          let statusText = "Chưa thanh toán";
          let statusColor = "text-orange-500";

          if (item.state === 1) {
            statusText = "Đã thanh toán";
            statusColor = "text-green-500";
          } else if (isOverdue) {
            statusText = "Quá hạn";
            statusColor = "text-red-500";
          }

          return {
            ...item,
            period: `T${createdDate.format("MM/YYYY")}`,
            paid_amount: item.state === 1 ? item.amount : 0,
            status_text: statusText,
            status_color: statusColor,
            payment_date_display: item.payment_date ? dayjs(item.payment_date).format("DD/MM/YYYY") : "---",
            can_print: item.state === 1 
          };
        });

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

  // --- HANDLERS ---
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedIds([]); // Reset khi tắt/bật
  };

  const handleSelect = (item) => {
    if (!item.can_print) return;

    // Logic chọn nhiều: Nếu có rồi thì bỏ, chưa có thì thêm
    if (selectedIds.includes(item.id)) {
      setSelectedIds(prev => prev.filter(id => id !== item.id));
    } else {
      setSelectedIds(prev => [...prev, item.id]);
    }
  };

  const handleExportClick = () => {
    if (selectedIds.length === 0) return;
    
    // Lọc ra danh sách các object hóa đơn dựa trên ID đã chọn
    const selectedInvoices = debts.filter(d => selectedIds.includes(d.id));
    
    // Truyền mảng dữ liệu sang trang in
    navigate('/accountant_dashboard/print_invoice', { state: { data: selectedInvoices } });
  };

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

      {/* 2. TITLE & BUTTONS */}
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h1 className="text-3xl font-bold text-white">Quản lý công nợ</h1>
        
        {!isSelectionMode ? (
           <button
             onClick={toggleSelectionMode}
             className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg transition-colors"
           >
             Xuất hóa đơn
           </button>
        ) : (
           <div className="flex space-x-3">
             <button
               onClick={handleExportClick}
               disabled={selectedIds.length === 0}
               className={`px-6 py-2.5 rounded-lg font-bold shadow-lg transition-colors text-white ${
                 selectedIds.length > 0 ? "bg-green-500 hover:bg-green-600" : "bg-gray-400 cursor-not-allowed"
               }`}
             >
               In hóa đơn ({selectedIds.length})
             </button>
             <button
               onClick={toggleSelectionMode}
               className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg transition-colors"
             >
               Hủy
             </button>
           </div>
        )}
      </div>

      {/* 3. DANH SÁCH CÔNG NỢ */}
      <div className="space-y-4 pb-10">
        {isLoading ? (
          <p className="text-white text-center">Đang tải dữ liệu...</p>
        ) : filteredList.length === 0 ? (
          <p className="text-white text-center">Không tìm thấy dữ liệu công nợ.</p>
        ) : (
          filteredList.map((item) => (
            <div 
                key={item.id} 
                className={`bg-white rounded-[20px] p-5 flex items-center shadow-md relative min-h-[90px] transition-all ${
                    // Highlight nếu được chọn
                    selectedIds.includes(item.id) ? "ring-2 ring-blue-400 bg-blue-50" : ""
                }`}
            >
              <div className={`absolute left-6 top-4 bottom-4 w-1 rounded-full ${
                  item.state === 1 ? 'bg-green-500' : 'bg-orange-500'
              }`}></div>

              <div className="flex-1 grid grid-cols-12 gap-4 items-center pl-10">
                <div className="col-span-1">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Công nợ ID</p>
                  <p className="text-lg font-bold text-gray-900">{item.id}</p>
                </div>
                <div className="col-span-1">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Số căn hộ</p>
                  <p className="text-sm font-semibold text-gray-900">{item.apartment_id}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Loại phí</p>
                  <p className="text-sm font-semibold text-gray-900 truncate" title={item.feetype}>{item.feetype}</p>
                </div>
                <div className="col-span-1">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Kỳ TT</p>
                  <p className="text-sm font-semibold text-gray-900">{item.period}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Ngày thanh toán</p>
                  <p className="text-sm font-semibold text-gray-900">{item.payment_date_display}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Tổng thu</p>
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(item.amount)}</p>
                </div>
                <div className="col-span-1">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Đã thu</p>
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(item.paid_amount)}</p>
                </div>

                <div className="col-span-2 flex flex-col items-end justify-center">
                   {isSelectionMode ? (
                        item.can_print ? (
                            <div 
                                onClick={() => handleSelect(item)}
                                className={`w-8 h-8 rounded-lg cursor-pointer flex items-center justify-center border transition-all ${
                                    selectedIds.includes(item.id) 
                                    ? "bg-blue-500 border-blue-500" 
                                    : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                                }`}
                            >
                                {selectedIds.includes(item.id) && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                        ) : (
                            <span className="text-xs text-red-400 italic">Chưa TT</span>
                        )
                   ) : (
                        <>
                            <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Trạng thái</p>
                            <p className={`text-xs font-bold ${item.status_color}`}>{item.status_text}</p>
                        </>
                   )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};