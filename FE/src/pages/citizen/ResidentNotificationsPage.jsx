import React, { useState, useEffect } from "react";
import { StatusModal } from "../../layouts/StatusModal";
import { ConfirmationModal } from "../../layouts/ConfirmationModal";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

import acceptIcon from "../../images/accept_icon.png";
import notAcceptIcon from "../../images/not_accept_icon.png";

// --- Component hiển thị một mục thông báo (ĐÃ SỬA để dùng dữ liệu API) ---
function ResidentNotificationItem({
  item,
  isDeleteMode,
  onDeleteClick,
}) {
    // Định dạng ngày tháng
    const formattedDate = item.notification_date
    ? new Date(item.notification_date).toLocaleDateString("vi-VN")
    : "---";

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 flex items-center relative overflow-hidden mb-4">
      <div className="absolute left-4 top-3 bottom-3 w-1.5 bg-blue-500 rounded-full"></div>
      <div className="flex-1 grid grid-cols-3 gap-4 items-center pl-8 pr-4 text-gray-800">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Thông báo ID</p>
          <p className="font-semibold">{item.id}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Người nhận (Căn hộ)</p>
          {/* SỬ DỤNG apartment_id TỪ API */}
          <p className="font-medium">{item.apartment_id}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Ngày gửi</p>
          {/* SỬ DỤNG notification_date TỪ API */}
          <p className="text-gray-600">{formattedDate}</p>
        </div>
      </div>
      {/* Cột hành động (chỉ giữ lại nút Xóa nếu ở chế độ xóa) */}
      <div className="ml-auto flex-shrink-0 pr-2">
        {/* Giả lập hành động 'Xem chi tiết' để hiển thị nội dung */}
        <p className="text-xs text-gray-500 mb-1">Nội dung</p>
        <p title={item.content} className="text-blue-600 hover:underline text-sm font-medium truncate max-w-[150px]">
            {item.content}
        </p>
      </div>
    </div>
  );
}

export const ResidentNotificationsPage = () => {
  // --- STATES KẾT NỐI DB ---
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho modal thông báo kết quả (Giữ lại cho thông báo xóa mock)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState(null); 
  const [statusMessage, setStatusMessage] = useState("");

  // State cho chế độ xóa & modal xác nhận (Giữ nguyên logic mock)
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState(null);

  // <<< NEW: State cho Thanh Tìm kiếm >>>
  const [searchTerm, setSearchTerm] = useState("");

  // --- HÀM FETCH DỮ LIỆU TỪ API ---
  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
        // Gọi API GET /notifications
        const response = await fetch(`${API_BASE_URL}/notifications`); 
        if (!response.ok) {
            throw new Error('Không thể tải dữ liệu thông báo.');
        }
        const data = await response.json();
        
        // --- Mock Filter: Giả sử Resident chỉ thấy thông báo của căn hộ mình (Tầng 7 - Phòng 713) hoặc 'All' ---
        // Trong ứng dụng thực tế, ID căn hộ sẽ được lấy từ session của người dùng
        const residentApartmentId = 'Tầng 7 - Phòng 713'; 
        const filteredByResident = data.filter(item => 
            String(item.apartment_id).toLowerCase() === 'all' || 
            String(item.apartment_id) === residentApartmentId
        );
        setNotifications(filteredByResident);
    } catch (err) {
        console.error('Fetch Error:', err);
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);
  
  // --- HÀM LỌC DỮ LIỆU (THEO SEARCH TERM ID) ---
  const filteredNotifications = notifications.filter(item => {
      if (!searchTerm.trim()) {
          return true;
      }
      const searchLower = searchTerm.trim().toLowerCase();
      // Chỉ lọc theo ID (id)
      return String(item.id).toLowerCase().includes(searchLower);
  });
  // -------------------------

  // --- HÀM XỬ LÝ XÓA (Giữ nguyên logic mock) ---
  const toggleDeleteMode = () => setIsDeleteMode(!isDeleteMode);
  const handleDeleteItemClick = (id) => {
    setItemToDeleteId(id);
    setShowConfirmModal(true);
  };
  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setItemToDeleteId(null);
  };
  const handleConfirmDelete = () => {
    setShowConfirmModal(false);
    // Đây là logic mock xóa thành công trên client-side
    setNotifications(
        notifications.filter((item) => item.id !== itemToDeleteId)
    );
    setModalStatus("deleteSuccess");
    setStatusMessage("Đã xóa thông báo thành công! (Mocked)");
    setIsStatusModalOpen(true);
    setItemToDeleteId(null);
  };
  // ----------------------------------------------------------------

  // --- HÀM ĐÓNG/RENDER MODAL STATUS (giữ nguyên) ---
  const handleCloseStatusModal = () => {
    setIsStatusModalOpen(false);
    setModalStatus(null);
    setStatusMessage("");
  };
  const renderStatusModalContent = () => {
    if (!modalStatus) return null;
    const isSuccess = modalStatus.includes("Success");
    const icon = isSuccess ? acceptIcon : notAcceptIcon;
    return (
      <div className="flex flex-col items-center">
        <img src={icon} alt={modalStatus} className="w-20 h-20 mb-6" />
        <p className="text-xl font-semibold text-center text-gray-800">
          {statusMessage}
        </p>
      </div>
    );
  };
  
    // --- RENDER LOADING VÀ ERROR ---
    if (isLoading) {
        return <div className="text-white text-lg p-4">Đang tải thông báo...</div>;
    }
    
    if (error) {
        return <div className="text-red-400 text-lg p-4">Lỗi tải dữ liệu: {error}</div>;
    }


  return (
    <div>
      {/* <<< Thanh Tìm kiếm Full Width >>> */}
      <div className="flex justify-start items-center mb-6">
          <div className="relative w-full max-w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
              </span>
              <input
                  type="search"
                  placeholder="Tìm theo ID thông báo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none focus:border-blue-500" 
              />
          </div>
      </div>
      {/* ------------------------------------- */}

      {/* Header và Nút */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Thông Báo</h1>
        {/* <div className="flex space-x-4">
          <button
            onClick={toggleDeleteMode} // Bật/tắt chế độ xóa
            className={`${
              isDeleteMode
                ? "bg-gray-500 hover:bg-gray-600" 
                : "bg-red-500 hover:bg-red-600" 
            } text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200`}
          >
            {isDeleteMode ? "Hoàn tất" : "Xóa thông báo"}
          </button>
        </div> */}
      </div>

      {/* Danh sách thông báo */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
           <div className="bg-white p-6 rounded-lg text-center text-gray-500">
              Không có thông báo nào phù hợp với tìm kiếm.
           </div>
        ) : (
             filteredNotifications.map((item) => (
              <ResidentNotificationItem
                key={item.id}
                item={item}
                isDeleteMode={isDeleteMode}
                onDeleteClick={handleDeleteItemClick}
              />
          ))
        )}
      </div>

      {/* Confirmation Modal (Xóa) - giữ nguyên */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Chú ý: Xóa thông báo!!!"
        message="Bạn có chắc chắn muốn xóa thông báo này không?"
      />

      {/* Status Modal (Thông báo kết quả) - giữ nguyên */}
      <StatusModal isOpen={isStatusModalOpen} onClose={handleCloseStatusModal}>
        {renderStatusModalContent()}
      </StatusModal>
    </div>
  );
};