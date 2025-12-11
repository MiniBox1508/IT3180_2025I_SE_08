import React, { useState, useEffect } from "react";
// Bỏ import Link nếu không dùng
// import { Link } from "react-router-dom";
import { StatusModal } from "../../layouts/StatusModal";
import { ConfirmationModal } from "../../layouts/ConfirmationModal";
const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

// --- HÀM LẤY TOKEN TỪ LOCALSTORAGE ---
const getToken = () => {
  return localStorage.getItem("token");
};

import acceptIcon from "../../images/accept_icon.png";
import notAcceptIcon from "../../images/not_accept_icon.png";

// --- Component hiển thị một mục thông báo (ĐÃ SỬA) ---
const NotificationItem = ({
  item,
  isDeleteMode,
  onDeleteClick,
  onEditClick,
  isSelected,        // prop mới
  onToggleSelect     // prop mới
}) => {

  const handleActionClick = () => {
    if (isDeleteMode) {
      onDeleteClick(item.id); // Xóa lẻ
    } else {
      onEditClick(item); // Sửa
    }
  };

  // --- LOGIC CẮT NGẮN NỘI DUNG ---
  const truncateContent = (content, limit = 12) => {
    if (!content) return "---";
    const trimmedContent = content.trim();
    if (trimmedContent.length > limit) {
      return trimmedContent.substring(0, limit) + "...";
    }
    return trimmedContent;
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 flex items-center relative overflow-hidden mb-4">
      {/* --- CHECKBOX (Chỉ hiện khi ở chế độ xóa) --- */}
      {isDeleteMode && (
        <div className="pl-2 pr-4 border-r border-gray-100 mr-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(item.id)}
            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
          />
        </div>
      )}

      {/* Thanh màu bên trái */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 ${isDeleteMode ? 'left-[50px]' : 'left-4 rounded-full top-3 bottom-3'}`}></div>

      {/* Nội dung thông báo */}
      <div className="flex-1 grid grid-cols-4 gap-4 items-center pl-8 pr-4 text-gray-800">
        {/* Cột 1: ID */}
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Thông báo ID</p>
          <p className="font-semibold">{item.id}</p>
        </div>

        {/* Cột 2: Người nhận */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Người nhận</p>
          <p className="font-medium">{item.apartment_id || item.recipient}</p>
        </div>

        {/* Cột 3: Nội dung */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Nội dung</p>
          <p className="font-medium text-gray-700" title={item.content}>
            {truncateContent(item.content)}
          </p>
        </div>

        {/* Cột 4: Ngày gửi */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Ngày gửi</p>
          <p className="text-gray-600">
            {item.notification_date
              ? new Date(item.notification_date).toLocaleDateString("vi-VN")
              : "---"}
          </p>
        </div>
      </div>

      {/* --- Nút hành động (Sửa/Xóa lẻ) --- */}
      <div className="ml-auto flex-shrink-0 pr-2">
        <button
          onClick={handleActionClick}
          className={`${
            isDeleteMode
              ? "text-red-600 hover:text-red-800"
              : "text-blue-600 hover:text-blue-800"
          } hover:underline text-sm font-medium`}
        >
          {isDeleteMode ? "Xóa" : "Chỉnh sửa"}
        </button>
      </div>
    </div>
  );
};

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // States Modal Add/Edit/Status
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addRecipient, setAddRecipient] = useState("");
  const [addContent, setAddContent] = useState("");
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [editFormData, setEditFormData] = useState({ recipient: "", content: "" });

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  // --- STATE MỚI CHO XÓA HÀNG LOẠT ---
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]); // Danh sách ID đã chọn
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState(null); // ID khi xóa lẻ

  // --- FETCH DATA ---
  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Không thể tải dữ liệu thông báo.");
      const data = await response.json();
      // Sắp xếp mới nhất
      const sortedData = Array.isArray(data) 
        ? data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) 
        : [];
      setNotifications(sortedData);
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

  // --- FILTER ---
  const filteredNotifications = notifications.filter((item) => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.trim().toLowerCase();
    return String(item.id).toLowerCase().includes(searchLower);
  });

  // --- HANDLERS: ADD ---
  const handleAddNotificationClick = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setAddRecipient("");
    setAddContent("");
  };
  const handleAddFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!addRecipient || !addContent) {
      setError("Vui lòng điền đủ Người nhận và Nội dung.");
      return;
    }
    handleCloseAddModal();
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          apartment_id: addRecipient,
          content: addContent,
        }),
      });
      if (!response.ok) throw new Error("Lỗi! Thêm thông báo mới không thành công");
      fetchNotifications();
      setModalStatus("addSuccess");
      setStatusMessage("Đã thêm thông báo mới!");
    } catch (err) {
      setModalStatus("addFailure");
      setStatusMessage(err.message);
    }
    setIsStatusModalOpen(true);
  };

  // --- HANDLERS: EDIT ---
  const handleOpenEditModal = (notification) => {
    setEditingNotification(notification);
    setEditFormData({
      recipient: notification.apartment_id || notification.recipient || "",
      content: notification.content || "",
    });
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingNotification(null);
    setEditFormData({ recipient: "", content: "" });
  };
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingNotification) return;
    handleCloseEditModal();
    try {
      const token = getToken();
      const response = await fetch(
        `${API_BASE_URL}/notifications/${editingNotification.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            apartment_id: editFormData.recipient,
            content: editFormData.content,
          }),
        }
      );
      if (!response.ok) throw new Error("Lỗi cập nhật.");
      fetchNotifications();
      setModalStatus("editSuccess");
      setStatusMessage("Chỉnh sửa thông báo thành công!");
    } catch (err) {
      setModalStatus("editFailure");
      setStatusMessage(err.message);
    }
    setIsStatusModalOpen(true);
  };

  // --- HANDLERS: DELETE (SINGLE & BULK) ---
  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    setItemToDeleteId(null);
    setSelectedIds([]); // Reset chọn
  };

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  // Xóa lẻ (nút thùng rác/xóa trên dòng)
  const handleDeleteItemClick = (id) => {
    setItemToDeleteId(id);
    setShowConfirmModal(true);
  };

  // Xóa nhiều (nút trên header)
  const handleDeleteSelectedClick = () => {
    if (selectedIds.length > 0) {
      setShowConfirmModal(true);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setItemToDeleteId(null);
  };

  // Hàm xác nhận xóa chung cho cả 2 trường hợp
  const handleConfirmDelete = async () => {
    // Xác định danh sách cần xóa: là danh sách chọn (nếu có) HOẶC là mục đơn lẻ
    const idsToDelete = selectedIds.length > 0
        ? selectedIds
        : (itemToDeleteId ? [itemToDeleteId] : []);

    if (idsToDelete.length === 0) {
        setShowConfirmModal(false);
        return;
    }

    setShowConfirmModal(false);
    setError(null);

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

      fetchNotifications();
      setModalStatus("deleteSuccess");
      setStatusMessage(idsToDelete.length > 1 ? `Đã xóa ${idsToDelete.length} thông báo thành công!` : "Đã xóa thông báo thành công!");
    } catch (err) {
      console.error("API Error:", err);
      setModalStatus("deleteFailure");
      setStatusMessage("Có lỗi xảy ra khi xóa. Vui lòng thử lại.");
    } finally {
      setItemToDeleteId(null);
      setSelectedIds([]);
      setIsStatusModalOpen(true);
    }
  };

  // --- RENDER HELPERS ---
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
        <p className="text-xl font-semibold text-center text-gray-800">{statusMessage}</p>
      </div>
    );
  };

  if (isLoading) return <div className="text-white text-lg p-4">Đang tải thông báo...</div>;
  if (error) return <div className="text-red-400 text-lg p-4">Lỗi tải dữ liệu: {error}</div>;

  return (
    <div>
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
            placeholder="Tìm theo ID thông báo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none"
          />
        </div>
      </div>

      {/* Header và Nút */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Thông Báo</h1>
        <div className="flex space-x-4">
          
          {/* Nút Chế độ thường: Thêm, Xóa (vào chế độ xóa) */}
          {!isDeleteMode ? (
            <>
              <button
                onClick={handleAddNotificationClick}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 flex items-center space-x-2"
              >
                <span>+ Thêm thông báo</span>
              </button>
              <button
                onClick={toggleDeleteMode}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
              >
                Xóa thông báo
              </button>
            </>
          ) : (
            /* Nút Chế độ xóa: Xóa đã chọn, Hủy */
            <>
              <button
                onClick={handleDeleteSelectedClick}
                disabled={selectedIds.length === 0}
                className={`font-semibold py-2 px-4 rounded-md transition-colors duration-200 ${
                    selectedIds.length === 0 
                    ? "bg-gray-400 cursor-not-allowed text-white" 
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                Xóa các mục đã chọn ({selectedIds.length})
              </button>
              <button
                onClick={toggleDeleteMode}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
              >
                Hủy
              </button>
            </>
          )}

        </div>
      </div>

      {/* Danh sách thông báo */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white p-6 rounded-lg text-center text-gray-500">
            Không có thông báo nào phù hợp với tìm kiếm.
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <NotificationItem
              key={item.id}
              item={item}
              isDeleteMode={isDeleteMode}
              onDeleteClick={handleDeleteItemClick}
              onEditClick={handleOpenEditModal}
              isSelected={selectedIds.includes(item.id)} // Truyền trạng thái chọn
              onToggleSelect={handleSelect} // Truyền hàm xử lý chọn
            />
          ))
        )}
      </div>

      {/* Add Notification Form Modal */}
      <StatusModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        title="Thêm thông báo mới"
      >
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        <form onSubmit={handleAddFormSubmit} className="space-y-4">
          <div>
            <label htmlFor="add-recipient" className="block text-sm font-medium text-gray-700 mb-1">
              Người nhận (apartment_id)
            </label>
            <input
              type="text"
              id="add-recipient"
              value={addRecipient}
              onChange={(e) => setAddRecipient(e.target.value)}
              placeholder="Ví dụ: P.713 hoặc All"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              required
            />
          </div>
          <div>
            <label htmlFor="add-content" className="block text-sm font-medium text-gray-700 mb-1">
              Nội dung
            </label>
            <textarea
              id="add-content"
              rows="4"
              value={addContent}
              onChange={(e) => setAddContent(e.target.value)}
              placeholder="Enter here"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              required
            ></textarea>
          </div>
          <div className="mt-6 flex justify-end">
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-md">
              Thêm
            </button>
          </div>
        </form>
      </StatusModal>

      {/* Edit Notification Modal */}
      <StatusModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        title="Chỉnh sửa thông báo"
      >
        {editingNotification && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Thông báo ID</label>
              <div className="w-full bg-gray-100 rounded-lg border border-gray-200 px-4 py-3 text-gray-700">{editingNotification.id}</div>
            </div>
            <div>
              <label htmlFor="edit-recipient" className="block text-sm font-medium text-gray-700 mb-1">Người nhận</label>
              <input
                type="text"
                id="edit-recipient"
                name="recipient"
                value={editFormData.recipient}
                onChange={handleEditFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              />
            </div>
            <div>
              <label htmlFor="edit-content" className="block text-sm font-medium text-gray-700 mb-1">Nội dung chỉnh sửa</label>
              <textarea
                id="edit-content"
                name="content"
                rows="4"
                value={editFormData.content}
                onChange={handleEditFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                required
              ></textarea>
            </div>
            <div className="mt-6 flex justify-end">
              <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-md">Xác nhận</button>
            </div>
          </form>
        )}
      </StatusModal>

      {/* Confirmation Modal (Xóa) */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Chú ý: Xóa thông báo!!!"
        message={
            selectedIds.length > 0 
            ? `Bạn có chắc chắn muốn xóa ${selectedIds.length} thông báo đã chọn không?` 
            : "Bạn có chắc chắn muốn xóa thông báo này không?"
        }
      />

      {/* Status Modal (Thông báo kết quả) */}
      <StatusModal isOpen={isStatusModalOpen} onClose={handleCloseStatusModal}>
        {renderStatusModalContent()}
      </StatusModal>
    </div>
  );
};