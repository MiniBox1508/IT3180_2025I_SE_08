import React, { useState, useEffect } from "react";
import { ConfirmationModal } from "../../layouts/ConfirmationModal";
import { StatusModal } from "../../layouts/StatusModal";
import acceptIcon from "../../images/accept_icon.png";
import notAcceptIcon from "../../images/not_accept_icon.png";

const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

// --- VALIDATION & TOKEN HELPERS ---
const getToken = () => localStorage.getItem('token');

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // States cho Modal và chế độ xóa
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]); // State lưu các ID được chọn để xóa
  
  // Status Modal
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState(null); // 'success' hoặc 'failure'
  const [statusMessage, setStatusMessage] = useState("");

  // --- FETCH DATA ---
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { "Authorization": `Bearer ${getToken()}` } // Gửi kèm Token
      });
      
      if (!response.ok) throw new Error("Failed to fetch notifications");
      
      const data = await response.json();
      // Sắp xếp theo thời gian mới nhất
      const sortedData = Array.isArray(data) 
        ? data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) 
        : [];
      setNotifications(sortedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // --- FILTER ---
  const filteredNotifications = notifications.filter((note) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      note.title?.toLowerCase().includes(term) ||
      note.message?.toLowerCase().includes(term) ||
      (note.apartment_id && String(note.apartment_id).toLowerCase().includes(term))
    );
  });

  // --- HANDLERS ---

  // Chuyển đổi chế độ xóa
  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    setNotificationToDelete(null);
    setSelectedIds([]); // Reset danh sách chọn khi thoát chế độ xóa
  };

  // Xử lý khi tick vào checkbox
  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  // Click nút thùng rác (xóa lẻ)
  const handleDeleteClick = (notification) => {
    setNotificationToDelete(notification);
    setIsConfirmModalOpen(true);
  };

  // Click nút "Xóa các mục đã chọn" (xóa nhiều)
  const handleDeleteSelectedClick = () => {
      if (selectedIds.length > 0) {
          setIsConfirmModalOpen(true);
      }
  }

  const handleCloseStatusModal = () => {
    setIsStatusModalOpen(false);
    setModalStatus(null);
    setStatusMessage("");
  };

  // --- HÀM CONFIRM DELETE (ĐÃ CÓ LOGIC XÓA NHIỀU + TOKEN) ---
  const confirmDelete = async () => {
    // Xác định danh sách cần xóa: là danh sách chọn (nếu có) HOẶC là mục đơn lẻ
    const idsToDelete = selectedIds.length > 0
        ? selectedIds
        : (notificationToDelete ? [notificationToDelete.id] : []);

    if (idsToDelete.length === 0) {
        setIsConfirmModalOpen(false);
        return;
    }

    setIsConfirmModalOpen(false); // Đóng modal xác nhận

    try {
      const token = getToken();
      
      // Sử dụng Promise.all để gửi nhiều request xóa cùng lúc
      await Promise.all(
          idsToDelete.map(id =>
              fetch(`${API_BASE_URL}/notifications/${id}`, { 
                  method: "DELETE",
                  headers: { 
                      "Authorization": `Bearer ${token}` 
                  }
              })
              .then(res => {
                  if (!res.ok) throw new Error(`Failed to delete notification ${id}`);
                  return res;
              })
          )
      );

      // Thành công
      fetchNotifications(); // Tải lại dữ liệu
      setModalStatus("success");
      setStatusMessage(idsToDelete.length > 1 ? `Đã xóa ${idsToDelete.length} thông báo.` : "Xóa thông báo thành công.");

    } catch (err) {
      console.error("Delete Error:", err);
      setModalStatus("failure");
      setStatusMessage("Có lỗi xảy ra khi xóa. Vui lòng thử lại.");
    } finally {
      // Reset các state liên quan
      setNotificationToDelete(null);
      setSelectedIds([]);
      setIsStatusModalOpen(true); // Mở popup trạng thái
    }
  };

  const renderStatusModalContent = () => {
    if (!modalStatus) return null;
    const isSuccess = modalStatus === "success";
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

  if (isLoading) return <div className="p-8 text-white text-lg bg-blue-700 min-h-screen">Đang tải thông báo...</div>;
  if (error) return <div className="p-8 text-red-100 text-lg bg-blue-700 min-h-screen">Lỗi: {error}</div>;

  return (
    <div className="flex-1 p-8 bg-blue-700 min-h-screen text-white">
      {/* Search Bar */}
      <div className="flex justify-start items-center mb-6">
        <div className="relative w-full max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Tìm kiếm thông báo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none"
          />
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-6">Thông báo</h1>

      {/* Actions Buttons */}
      <div className="flex justify-end gap-4 mb-6">
        {!isDeleteMode ? (
            // Nút mặc định
            <button
                onClick={toggleDeleteMode}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
                Xóa thông báo
            </button>
        ) : (
            // Nút khi ở chế độ xóa hàng loạt
            <>
                <button
                    onClick={handleDeleteSelectedClick}
                    disabled={selectedIds.length === 0}
                    className={`font-bold py-2 px-6 rounded-lg transition-colors ${
                        selectedIds.length === 0
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
                >
                    Xóa các mục đã chọn ({selectedIds.length})
                </button>
                <button
                    onClick={toggleDeleteMode}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                    Hủy
                </button>
            </>
        )}
      </div>

      {/* Notification List */}
      <div className="space-y-4">
        {filteredNotifications.map((note) => (
          <div key={note.id} className="bg-white p-4 rounded-lg shadow flex items-start gap-4 text-gray-900 relative">
            {/* --- CHECKBOX CHO CHẾ ĐỘ XÓA --- */}
            {isDeleteMode && (
                <div className="flex items-center h-full pt-1">
                    <input
                        type="checkbox"
                        checked={selectedIds.includes(note.id)}
                        onChange={() => handleSelect(note.id)}
                        className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />
                </div>
            )}

            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{note.title || "Thông báo"}</h3>
                <span className="text-sm text-gray-500">
                  {note.created_at ? new Date(note.created_at).toLocaleDateString("vi-VN") : "--/--/----"}
                </span>
              </div>
              <p className="text-gray-700">{note.content || note.message}</p>
              {note.apartment_id && (
                <p className="text-sm text-blue-600 mt-2 font-medium">
                  Gửi tới căn hộ: {note.apartment_id}
                </p>
              )}
            </div>

            {/* Nút xóa lẻ (chỉ hiện ở delete mode để tiện tay xóa 1 cái) */}
            {isDeleteMode && (
              <button
                onClick={() => handleDeleteClick(note)}
                className="text-gray-400 hover:text-red-500 transition-colors p-2"
                title="Xóa thông báo này"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        ))}
        {filteredNotifications.length === 0 && (
          <div className="bg-white p-6 rounded-lg text-center text-gray-500">
            Không tìm thấy thông báo nào.
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDelete}
        title="Xác nhận Xóa"
        message={
            selectedIds.length > 0
                ? `Bạn có chắc chắn muốn xóa ${selectedIds.length} thông báo đã chọn không?`
                : (notificationToDelete ? "Bạn có chắc chắn muốn xóa thông báo này không?" : "")
        }
      />

      <StatusModal isOpen={isStatusModalOpen} onClose={handleCloseStatusModal}>
        {renderStatusModalContent()}
      </StatusModal>
    </div>
  );
};