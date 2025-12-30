import React, { useState, useEffect } from "react";
import { StatusModal } from "../../layouts/StatusModal";
import { ConfirmationModal } from "../../layouts/ConfirmationModal";
const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

import acceptIcon from "../../images/accept_icon.png";
import notAcceptIcon from "../../images/not_accept_icon.png";

// --- IMPORT ẢNH MŨI TÊN CHO PHÂN TRANG ---
import arrowLeft from "../../images/Arrow_Left_Mini_Circle.png";
import arrowRight from "../../images/Arrow_Right_Mini_Circle.png";

// --- Component hiển thị một mục thông báo ---
function ResidentNotificationItem({ item, isDeleteMode, onDeleteClick }) {
  // Định dạng ngày tháng
  const formattedDate = item.notification_date
    ? new Date(item.notification_date).toLocaleDateString("vi-VN")
    : "---";

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 flex items-center relative overflow-hidden mb-4 min-h-[80px]">
      <div className="absolute left-4 top-3 bottom-3 w-1.5 bg-blue-500 rounded-full"></div>

      {/* Sử dụng Grid 12 cột để phân chia không gian linh hoạt hơn */}
      <div className="flex-1 grid grid-cols-12 gap-4 items-center pl-8 pr-4 text-gray-800">
        {/* Cột 1: ID - Chiếm 2/12 */}
        <div className="col-span-2 text-center border-r border-gray-100 pr-2">
          <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">
            Thông báo ID
          </p>
          <p className="font-bold text-lg text-blue-600">{item.id}</p>
        </div>

        {/* Cột 2: Người gửi - Chiếm 2/12 */}
        <div className="col-span-2">
          <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">
            Người gửi
          </p>
          <p
            className="font-medium text-gray-900 truncate"
            title={item.sender_name}
          >
            {item.sender_name}
          </p>
        </div>

        {/* Cột 3: Ngày gửi - Chiếm 2/12 */}
        <div className="col-span-2">
          <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">
            Ngày gửi
          </p>
          <p className="font-medium text-gray-900">{formattedDate}</p>
        </div>

        {/* Cột 4: Nội dung - Chiếm 6/12 (Diện tích lớn nhất) */}
        <div className="col-span-6 pl-2 border-l border-gray-100">
          <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">
            Nội dung
          </p>
          <div className="flex flex-col">
            {item.title && (
              <p className="font-bold text-sm text-blue-800 mb-0.5 truncate">
                {item.title}
              </p>
            )}
            <p
              title={item.content}
              className="text-gray-700 text-sm font-medium line-clamp-2 leading-relaxed"
            >
              {item.content}
            </p>
          </div>
        </div>
      </div>

      {/* Cột hành động (nếu có chế độ xóa) */}
      {isDeleteMode && (
        <div className="ml-2 flex-shrink-0">
          <button
            onClick={() => onDeleteClick(item.id)}
            className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
          >
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export const ResidentNotificationsPage = () => {
  // --- STATES KẾT NỐI DB ---
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho modal thông báo kết quả
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  // State cho chế độ xóa & modal xác nhận
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState(null);

  // <<< NEW: State cho Thanh Tìm kiếm >>>
  const [searchTerm, setSearchTerm] = useState("");

  // --- STATE PHÂN TRANG (MỚI) ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Số lượng ô dữ liệu / 1 trang

  // --- HÀM FETCH DỮ LIỆU TỪ API ---
  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Gọi API GET /notifications
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu thông báo.");
      }
      const data = await response.json();

      // Lấy apartment_id từ user đang đăng nhập
      const user = JSON.parse(localStorage.getItem("user"));
      const residentApartmentId = user?.apartment_id;

      // Sắp xếp giảm dần theo ID hoặc ngày tạo để tin mới nhất lên đầu
      const sortedData = data.sort((a, b) => b.id - a.id);

      // --- LOGIC LỌC DỮ LIỆU ĐÃ SỬA ---
      // Nếu apartment_id = 'all' thì KHÔNG hiển thị (loại bỏ)
      // Chỉ hiển thị data khớp với residentApartmentId
      const filteredByResident = sortedData.filter((item) => {
        const itemApt = String(item.apartment_id).trim().toLowerCase();

        // Nếu là 'all' -> bỏ qua
        if (itemApt === "all") return false;

        // Chỉ lấy thông báo trùng với mã căn hộ của user
        return itemApt === String(residentApartmentId).trim().toLowerCase();
      });

      setNotifications(filteredByResident);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // --- RESET TRANG KHI TÌM KIẾM ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // --- HÀM LỌC DỮ LIỆU ---
  const filteredNotifications = notifications.filter((item) => {
    if (!searchTerm.trim()) {
      return true;
    }
    const searchLower = searchTerm.trim().toLowerCase();

    // Lọc theo ID
    const idMatch = String(item.id).toLowerCase().includes(searchLower);
    // Lọc theo Người gửi (sender_name)
    const senderMatch = String(item.sender_name)
      .toLowerCase()
      .includes(searchLower);

    return idMatch || senderMatch;
  });

  // --- LOGIC CẮT DỮ LIỆU ĐỂ HIỂN THỊ (PAGINATION) ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNotifications = filteredNotifications.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);

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
    return (
      <div className="text-red-400 text-lg p-4">Lỗi tải dữ liệu: {error}</div>
    );
  }

  return (
    <div>
      {/* <<< Thanh Tìm kiếm Full Width >>> */}
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
            placeholder="Tìm theo ID thông báo hoặc Người gửi..."
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
      </div>

      {/* Danh sách thông báo */}
      <div className="space-y-4">
        {currentNotifications.length === 0 ? (
          <div className="bg-white p-6 rounded-lg text-center text-gray-500">
            Không có thông báo nào phù hợp với tìm kiếm.
          </div>
        ) : (
          currentNotifications.map((item) => (
            <ResidentNotificationItem
              key={item.id}
              item={item}
              isDeleteMode={isDeleteMode}
              onDeleteClick={handleDeleteItemClick}
            />
          ))
        )}
      </div>

      {/* --- PAGINATION CONTROLS --- */}
      {filteredNotifications.length > 0 && (
        <div className="flex justify-center items-center mt-6 space-x-6 pb-8">
          {/* Nút Prev */}
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className={`w-12 h-12 rounded-full border-2 border-black flex items-center justify-center transition-transform hover:scale-105 ${
              currentPage === 1
                ? "opacity-50 cursor-not-allowed bg-gray-200"
                : "cursor-pointer bg-white"
            }`}
          >
            <img
              src={arrowLeft}
              alt="Previous"
              className="w-6 h-6 object-contain"
            />
          </button>

          {/* Thanh hiển thị số trang */}
          <div className="bg-gray-400/80 backdrop-blur-sm text-white font-bold py-3 px-8 rounded-full flex items-center space-x-4 shadow-lg">
            <span className="text-lg">Trang</span>
            <div className="bg-gray-500/60 rounded-lg px-4 py-1 text-xl shadow-inner">
              {currentPage}
            </div>
            <span className="text-lg">/ {totalPages}</span>
          </div>

          {/* Nút Next */}
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={`w-12 h-12 rounded-full border-2 border-black flex items-center justify-center transition-transform hover:scale-105 ${
              currentPage === totalPages
                ? "opacity-50 cursor-not-allowed bg-gray-200"
                : "cursor-pointer bg-white"
            }`}
          >
            <img
              src={arrowRight}
              alt="Next"
              className="w-6 h-6 object-contain"
            />
          </button>
        </div>
      )}

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
