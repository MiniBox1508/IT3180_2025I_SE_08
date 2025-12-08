import React, { useState, useEffect } from "react";
import axios from "axios";

// --- API CONFIG ---
// Bạn có thể thay đổi đường dẫn này tùy theo môi trường
const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

// --- ICONS (SVG) ---
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 hover:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Icon Tam giác cảnh báo (Cho Modal Xóa)
const WarningIcon = () => (
  <div className="w-20 h-20 mx-auto mb-4 border-4 border-red-500 rounded-full flex items-center justify-center">
      <span className="text-5xl text-red-500 font-bold">!</span>
  </div>
);

// Icon Dấu tích xanh (Thành công)
const SuccessIcon = () => (
  <div className="w-20 h-20 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
    </svg>
  </div>
);

// Icon Dấu X đỏ (Thất bại)
const ErrorIcon = () => (
  <div className="w-20 h-20 mx-auto mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-red-600">
        <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
      </svg>
  </div>
);

// --- COMPONENT: MODAL TÙY CHỈNH ---
// Dùng chung cho cả 3 loại: Confirm, Success, Error
const CustomModal = ({ isOpen, onClose, type, title, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md text-center shadow-2xl relative">
        {/* Nút X đóng góc phải */}
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors">
          <CloseIcon />
        </button>

        {/* Nội dung Modal */}
        <div className="mt-2">
          {type === "warning" && <WarningIcon />}
          {type === "success" && <SuccessIcon />}
          {type === "error" && <ErrorIcon />}
          
          <h3 className="text-xl font-bold text-gray-800 mb-8">{title}</h3>

          {/* Footer Buttons */}
          {type === "warning" ? (
            <div className="flex justify-between space-x-4">
              <button
                onClick={onClose}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all"
              >
                Hoàn tác
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all"
              >
                Xác nhận
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export const ResidentService = () => {
  // --- STATE ---
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // States cho chế độ Xóa
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  
  // States cho Modals
  const [modalState, setModalState] = useState({
    type: null, // 'warning' | 'success' | 'error' | null
    isOpen: false,
    title: "",
  });

  // --- DỮ LIỆU MOCK (Dùng khi chưa có API) ---
  const MOCK_DATA = [
    { id: 1, content: "Làm thẻ xe", apartment_id: "A", status: "Đã xử lý", processed_date: "22/12/2005" },
    { id: 2, content: "Sửa chữa căn hộ", apartment_id: "A", status: "Đã xử lý", processed_date: "22/12/2005" },
    { id: 3, content: "Vận chuyển đồ", apartment_id: "A", status: "Đã ghi nhận", processed_date: "----------" },
    { id: 4, content: "Dọn dẹp căn hộ", apartment_id: "A", status: "Đã ghi nhận", processed_date: "----------" },
  ];

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Cố gắng gọi API
        const user = JSON.parse(localStorage.getItem("user"));
        // Giả sử API là /service-requests/by-resident/:id
        // Nếu BE chưa có, nó sẽ catch lỗi và dùng Mock Data
        const response = await axios.get(`${API_BASE_URL}/service-requests/by-resident/${user?.id || 1}`);
        setServices(response.data);
      } catch (error) {
        console.warn("API Error or Endpoint not found. Using Mock Data.", error);
        setServices(MOCK_DATA);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- HANDLERS ---

  // Toggle chế độ xóa
  const toggleDeleteMode = () => {
    if (isDeleteMode) {
      // Hủy xóa -> Reset
      setIsDeleteMode(false);
      setSelectedIds([]);
    } else {
      setIsDeleteMode(true);
    }
  };

  // Chọn/Bỏ chọn item
  const handleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Bấm nút "Xóa các mục đã chọn" -> Hiện Modal Cảnh báo
  const handleDeleteConfirmClick = () => {
    if (selectedIds.length === 0) return;
    setModalState({
      type: "warning",
      isOpen: true,
      title: "Xóa các mục đã chọn",
    });
  };

  // Thực hiện xóa khi bấm "Xác nhận" trong Modal
  const executeDelete = async () => {
    // Đóng modal cảnh báo trước
    setModalState({ ...modalState, isOpen: false });

    try {
      // Gọi API xóa (Giả lập)
      // await Promise.all(selectedIds.map(id => axios.delete(`${API_BASE_URL}/service-requests/${id}`)));
      
      // Xóa ở Client (Mock)
      const updatedServices = services.filter(item => !selectedIds.includes(item.id));
      setServices(updatedServices);
      
      // Hiện Modal Thành công
      setTimeout(() => {
        setModalState({
          type: "success",
          isOpen: true,
          title: "Xóa đăng ký thành công!",
        });
      }, 300);

      setIsDeleteMode(false);
      setSelectedIds([]);

    } catch (error) {
      // Hiện Modal Thất bại
      setTimeout(() => {
        setModalState({
          type: "error",
          isOpen: true,
          title: "Xóa đăng ký không thành công!",
        });
      }, 300);
    }
  };

  // Đóng Modal
  const handleCloseModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  // Filter
  const filteredList = services.filter((item) =>
    item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(item.id).includes(searchTerm)
  );

  return (
    <div className="w-full min-h-screen text-gray-800">
      {/* 1. THANH TÌM KIẾM */}
      <div className="flex justify-start items-center mb-8">
        <div className="relative w-full max-w-2xl bg-white rounded-lg overflow-hidden shadow-sm">
          <span className="absolute left-4 top-1/2 -translate-y-1/2">
            <SearchIcon />
          </span>
          <input
            type="search"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-gray-700 focus:outline-none h-12"
          />
        </div>
      </div>

      {/* 2. HEADER & BUTTONS */}
      <div className="flex justify-between items-end mb-6">
        <h1 className="text-3xl font-bold text-white">Dịch vụ</h1>
        
        <div className="flex space-x-3">
          {!isDeleteMode ? (
            // Chế độ thường
            <>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg font-bold flex items-center shadow-lg transition-colors text-sm">
                <PlusIcon /> Đăng ký dịch vụ
              </button>
              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-lg font-bold shadow-lg transition-colors text-sm">
                Phản ánh dịch vụ
              </button>
              <button
                onClick={toggleDeleteMode}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg font-bold shadow-lg transition-colors text-sm"
              >
                Xóa dịch vụ
              </button>
            </>
          ) : (
            // Chế độ xóa
            <>
              <button
                onClick={handleDeleteConfirmClick}
                className={`px-4 py-2.5 rounded-lg font-bold shadow-lg transition-colors text-sm ${
                  selectedIds.length > 0 ? "bg-red-500 hover:bg-red-600 text-white" : "bg-red-300 text-white cursor-not-allowed"
                }`}
              >
                Xóa các mục đã chọn
              </button>
              <button
                onClick={toggleDeleteMode}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2.5 rounded-lg font-bold shadow-lg transition-colors text-sm"
              >
                Hủy xóa
              </button>
            </>
          )}
        </div>
      </div>

      {/* 3. DANH SÁCH DỊCH VỤ */}
      <div className="space-y-4 pb-10">
        {isLoading ? (
          <p className="text-white text-center">Đang tải dữ liệu...</p>
        ) : filteredList.map((item) => (
          <div key={item.id} className="bg-white rounded-[20px] p-5 flex items-center shadow-md relative min-h-[90px]">
            {/* Thanh xanh bên trái */}
            <div className="absolute left-6 top-4 bottom-4 w-1 bg-blue-500 rounded-full"></div>

            {/* Grid Content */}
            <div className="flex-1 grid grid-cols-12 gap-4 items-center pl-10">
              
              {/* ID */}
              <div className="col-span-1">
                <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Dịch vụ ID</p>
                <p className="text-2xl font-bold text-gray-900 leading-none">{item.id}</p>
              </div>

              {/* Nội dung */}
              <div className="col-span-3">
                <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Nội dung</p>
                <p className="text-sm font-bold text-gray-900">{item.content}</p>
              </div>

              {/* Số căn hộ */}
              <div className="col-span-2">
                <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Số căn hộ</p>
                <p className="text-sm font-semibold text-gray-900">{item.apartment_id}</p>
              </div>

              {/* Trạng thái */}
              <div className="col-span-2">
                <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Trạng thái</p>
                <p className={`text-sm font-bold ${
                  item.status === "Đã xử lý" ? "text-green-500" : "text-gray-800"
                }`}>
                  {item.status}
                </p>
              </div>

              {/* Ngày xử lý */}
              <div className="col-span-2">
                <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Ngày xử lý</p>
                <p className="text-sm font-semibold text-gray-900">{item.processed_date}</p>
              </div>

              {/* Action (Link Detail hoặc Checkbox) */}
              <div className="col-span-2 flex justify-end items-center">
                {!isDeleteMode ? (
                  <button className="text-blue-500 font-bold text-xs hover:underline">
                    Xem thêm chi tiết
                  </button>
                ) : (
                  // Checkbox xóa
                  <div
                    onClick={() => handleSelect(item.id)}
                    className={`w-10 h-10 rounded-xl cursor-pointer flex items-center justify-center transition-all duration-200 ${
                      selectedIds.includes(item.id)
                        ? "bg-blue-500 shadow-blue-500/50"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  >
                    {selectedIds.includes(item.id) && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL --- */}
      <CustomModal 
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        type={modalState.type}
        title={modalState.title}
        onConfirm={executeDelete}
      />
    </div>
  );
};