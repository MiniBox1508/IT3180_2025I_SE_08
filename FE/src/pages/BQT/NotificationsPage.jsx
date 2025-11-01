import React, { useState, useEffect } from "react";
// Bỏ import Link nếu không dùng
// import { Link } from "react-router-dom";
import { StatusModal } from "../../layouts/StatusModal";
import { ConfirmationModal } from "../../layouts/ConfirmationModal";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

import acceptIcon from "../../images/accept_icon.png";
import notAcceptIcon from "../../images/not_accept_icon.png";

// --- Xóa initialNotificationData ---
// const initialNotificationData = [...]; 

// --- Component hiển thị một mục thông báo (ĐÃ SỬA) ---
const NotificationItem = ({ item, isDeleteMode, onDeleteClick, onEditClick }) => { // Thêm onEditClick

  const handleActionClick = () => {
    if (isDeleteMode) {
      onDeleteClick(item.id); // Gọi hàm xóa nếu đang ở chế độ xóa
    } else {
      onEditClick(item); // Gọi hàm sửa nếu không ở chế độ xóa, truyền cả item
    }
  };

  // --- LOGIC CẮT NGẮN NỘI DUNG (Cắt sau 12 ký tự) ---
  const truncateContent = (content, limit = 12) => {
    if (!content) return "---";
    const trimmedContent = content.trim();
    if (trimmedContent.length > limit) {
      // Cắt chuỗi và đảm bảo không cắt đứt từ nếu có thể (lấy 12 ký tự đầu)
      return trimmedContent.substring(0, limit) + '...';
    }
    return trimmedContent;
  };
  // --------------------------------

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 flex items-center relative overflow-hidden mb-4">
      <div className="absolute left-4 top-3 bottom-3 w-1.5 bg-blue-500 rounded-full"></div>

      {/* Nội dung thông báo: Tăng lên 4 cột (ID, Người nhận, Nội dung, Ngày gửi) */}
      <div className="flex-1 grid grid-cols-4 gap-4 items-center pl-8 pr-4 text-gray-800">
        
        {/* Cột 1: ID */}
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Thông báo ID</p>
          <p className="font-semibold">{item.id}</p>
        </div>
        
        {/* Cột 2: Người nhận (apartment_id) */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Người nhận</p>
          {/* BE trả về apartment_id, dùng nó làm recipient */}
          <p className="font-medium">{item.apartment_id || item.recipient}</p>
        </div>
        
        {/* Cột MỚI: Nội dung */}
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
             {/* Định dạng ngày tháng từ BE */}
            {item.notification_date ? new Date(item.notification_date).toLocaleDateString('vi-VN') : '---'}
          </p>
        </div>
      </div>

       {/* --- Nút hành động --- */}
       {/* Tách nút ra ngoài grid */}
      <div className="ml-auto flex-shrink-0 pr-2">
         <button
            onClick={handleActionClick} // Gọi hàm xử lý chung
            className={`${
              isDeleteMode
                ? "text-red-600 hover:text-red-800"
                : "text-blue-600 hover:text-blue-800"
            } hover:underline text-sm font-medium`} // Đảm bảo text-sm
          >
            {isDeleteMode ? "Xóa thông báo" : "Chỉnh sửa"}
          </button>
      </div>
    </div>
  );
};


export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]); // Khởi tạo rỗng
  const [isLoading, setIsLoading] = useState(false); // Thêm state loading
  const [error, setError] = useState(null); // Thêm state error
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // State cho form Add
  const [addNotificationId, setAddNotificationId] = useState("");
  const [addRecipient, setAddRecipient] = useState(""); // recipient tương ứng với apartment_id
  const [addContent, setAddContent] = useState("");

  // State cho EDIT MODAL
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [editFormData, setEditFormData] = useState({ recipient: '', content: '' }); 

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
  
  // ====================================================================
  // --- 1. HÀM FETCH DỮ LIỆU TỪ API (GET /notifications) ---
  // ====================================================================
  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
        const response = await fetch(`${API_BASE_URL}/notifications`); 
        if (!response.ok) {
            throw new Error('Không thể tải dữ liệu thông báo.');
        }
        const data = await response.json();
        // BE trả về apartment_id, date dưới dạng ISO. FE hiển thị recipient, date định dạng VN.
        // BE fields: id, content, apartment_id, notification_date
        setNotifications(data);
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
  
  // <<< NEW: Logic Lọc dữ liệu (Chỉ theo ID) >>>
  const filteredNotifications = notifications.filter(item => {
      if (!searchTerm.trim()) {
          return true;
      }
      const searchLower = searchTerm.trim().toLowerCase();
      
      // Chỉ lọc theo ID (id)
      return String(item.id).toLowerCase().includes(searchLower);
  });
  // ---------------------------------------------


  // ====================================================================
  // --- 2. HÀM THÊM MỚI (POST /notifications) ---
  // ====================================================================
  const handleAddNotificationClick = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setAddNotificationId("");
    setAddRecipient("");
    setAddContent("");
  };
  const handleAddFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // apartment_id (người nhận) và content là bắt buộc
    if (!addRecipient || !addContent) {
      setError("Vui lòng điền đủ Người nhận và Nội dung.");
      return;
    }
    
    handleCloseAddModal(); // Đóng modal thêm

    try {
        const response = await fetch(`${API_BASE_URL}/notifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                apartment_id: addRecipient, // recipient là apartment_id trong BE
                content: addContent 
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Lỗi! Thêm thông báo mới không thành công");
        }

        // Thành công: fetch lại danh sách
        fetchNotifications();
        setModalStatus("addSuccess");
        setStatusMessage("Đã thêm thông báo mới!");

    } catch (err) {
        console.error('API Error:', err);
        setModalStatus("addFailure");
        setStatusMessage(err.message);
    }
    setIsStatusModalOpen(true); // Mở modal trạng thái
  };

  // ====================================================================
  // --- 3. HÀM CHỈNH SỬA (PUT /notifications/:id) ---
  // ====================================================================
  const handleOpenEditModal = (notification) => {
    setEditingNotification(notification);
    // recipient là apartment_id trong BE
    setEditFormData({
        recipient: notification.apartment_id || notification.recipient || '', 
        content: notification.content || ''
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingNotification(null);
    setEditFormData({ recipient: '', content: '' });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  // Trích đoạn trong handleEditSubmit của NotificationsPage.jsx
  const handleEditSubmit = async (e) => {
      e.preventDefault();
      if (!editingNotification) return;

      handleCloseEditModal(); // Đóng modal sửa
      setError(null);

      try {
          const response = await fetch(`${API_BASE_URL}/notifications/${editingNotification.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  apartment_id: editFormData.recipient,
                  content: editFormData.content
              }),
          });

          // <--- BƯỚC QUAN TRỌNG: XỬ LÝ LỖI TRƯỚC KHI response.json() --->
          if (!response.ok && response.status !== 404) {
              // Nếu là lỗi 404, có thể không có body hoặc body là HTML
              // Nếu là lỗi 500, body có thể là JSON (lỗi BE) hoặc HTML (lỗi server)
              
              // Hãy cố gắng đọc body: nếu nó không phải JSON, response.json() sẽ thất bại và bị bắt bởi catch(err) bên dưới
              const text = await response.text();
              
              if (response.headers.get('content-type')?.includes('application/json')) {
                  const result = JSON.parse(text);
                  throw new Error(result.error || `Lỗi ${response.status}: Vấn đề Server`);
              } else {
                  // Nếu nhận HTML/text, báo lỗi chung chung (tránh lỗi JSON parse)
                  console.error('API returned non-JSON content:', text.substring(0, 50) + '...');
                  throw new Error(`Lỗi ${response.status}: Server trả về nội dung không phải JSON.`);
              }
          }
          
          // Nếu response.ok, hãy đọc JSON (hoặc nếu là 200/204 thành công và không có body thì vẫn tiếp tục)
          let result = {};
          try {
              // Cố gắng đọc JSON (vì Backend của bạn có trả về {message: ...})
              result = await response.json(); 
          } catch (e) {
              // Bỏ qua lỗi JSON parse nếu response là 204 No Content (hợp lệ cho PUT)
              if (response.status !== 204 && response.status !== 200) {
                  throw new Error("Lỗi đọc phản hồi JSON.");
              }
          }
          
          if (result.error) {
              throw new Error(result.error);
          }

          // Thành công: fetch lại danh sách
          fetchNotifications();
          setModalStatus("editSuccess");
          setStatusMessage("Chỉnh sửa thông báo thành công!");

      } catch (err) {
          console.error('API Error:', err);
          setModalStatus("editFailure");
          setStatusMessage(err.message || "Lỗi mạng hoặc server không phản hồi.");
      }
      setIsStatusModalOpen(true); // Mở modal trạng thái
  };


  // ====================================================================
  // --- 4. HÀM XỬ LÝ XÓA (DELETE /notifications/:id) ---
  // ====================================================================
  const toggleDeleteMode = () => setIsDeleteMode(!isDeleteMode);
  const handleDeleteItemClick = (id) => {
    setItemToDeleteId(id);
    setShowConfirmModal(true);
  };
  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setItemToDeleteId(null);
  };
  const handleConfirmDelete = async () => {
    setShowConfirmModal(false);
    setError(null);
    
    try {
        const response = await fetch(`${API_BASE_URL}/notifications/${itemToDeleteId}`, {
            method: 'DELETE',
        });
        
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Xóa thông báo không thành công!");
        }

        // Thành công: fetch lại danh sách
        fetchNotifications();
        setModalStatus("deleteSuccess");
        setStatusMessage("Đã xóa thông báo thành công!");

    } catch (err) {
        console.error('API Error:', err);
        setModalStatus("deleteFailure");
        setStatusMessage(err.message);
    } finally {
        setItemToDeleteId(null);
        setIsStatusModalOpen(true);
    }
  };

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
  // -----------------------------

  return (
    <div>
      {/* <<< NEW: Thanh Tìm kiếm Full Width >>> */}
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
        <div className="flex space-x-4">
          {/* Chỉ hiển thị nút Thêm khi không ở chế độ xóa */}
          {!isDeleteMode && (
            <button
              onClick={handleAddNotificationClick}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 flex items-center space-x-2"
            >
              <span>+ Thêm thông báo</span>
            </button>
          )}
          {/* Nút Xóa / Hoàn tất */}
          <button
            onClick={toggleDeleteMode} // Bật/tắt chế độ xóa
            className={`${
              isDeleteMode
                ? "bg-gray-500 hover:bg-gray-600" // Style khi đang ở chế độ xóa (ví dụ: nút Hoàn tất)
                : "bg-red-500 hover:bg-red-600" // Style mặc định (nút Xóa)
            } text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200`}
          >
            {isDeleteMode ? "Hoàn tất" : "Xóa thông báo"}
          </button>
        </div>
      </div>

      {/* Danh sách thông báo */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? ( // <<< UPDATED: Dùng filteredNotifications
           <div className="bg-white p-6 rounded-lg text-center text-gray-500">
              Không có thông báo nào phù hợp với tìm kiếm.
           </div>
        ) : (
             filteredNotifications.map((item) => ( // <<< UPDATED: Dùng filteredNotifications
                <NotificationItem
                  key={item.id}
                  item={item}
                  isDeleteMode={isDeleteMode}
                  onDeleteClick={handleDeleteItemClick}
                  onEditClick={handleOpenEditModal} // <<< Truyền hàm mở modal sửa
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
         {/* Hiển thị lỗi nếu có */}
         {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        {/* ... (Form thêm giữ nguyên) ... */}
         <form onSubmit={handleAddFormSubmit} className="space-y-4">
           {/* Thông báo ID (Tự động tăng, không cần input này cho POST) */}
          {/* Người nhận */}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              required
            />
          </div>
          {/* Nội dung */}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              required
            ></textarea>
          </div>
           {/* Nút Add */}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-200"
            >
              Add
            </button>
          </div>
        </form>
      </StatusModal>

      {/* --- MODAL CHỈNH SỬA --- */}
      <StatusModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        title="Chỉnh sửa thông báo"
      >
        {editingNotification && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {/* Thông báo ID (Chỉ hiển thị) */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Thông báo ID
              </label>
              <div className="w-full bg-gray-100 rounded-lg border border-gray-200 px-4 py-3 text-gray-700 min-h-[46px]">
                {editingNotification.id}
              </div>
            </div>
             {/* Người nhận */}
            <div>
              <label htmlFor="edit-recipient" className="block text-sm font-medium text-gray-700 mb-1">
                Người nhận (apartment_id)
              </label>
              <input
                type="text"
                id="edit-recipient"
                name="recipient" 
                value={editFormData.recipient}
                onChange={handleEditFormChange}
                placeholder="Ví dụ: P.713 hoặc All"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                required
              />
            </div>
            {/* Nội dung chỉnh sửa */}
            <div>
              <label htmlFor="edit-content" className="block text-sm font-medium text-gray-700 mb-1">
                Nội dung chỉnh sửa
              </label>
              <textarea
                id="edit-content"
                name="content" 
                rows="4"
                value={editFormData.content}
                onChange={handleEditFormChange}
                placeholder="Enter here"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                required
              ></textarea>
            </div>
             {/* Nút Confirm */}
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-200"
              >
                Confirm
              </button>
            </div>
          </form>
        )}
      </StatusModal>


      {/* Confirmation Modal (Xóa) - giữ nguyên */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Chú ý: Xóa thông báo!!!"
        message="Bạn có chắc chắn muốn xóa thông báo này không?"
      />

      {/* Status Modal (Thông báo kết quả Add/Edit/Delete) - giữ nguyên */}
      <StatusModal
        isOpen={isStatusModalOpen}
        onClose={handleCloseStatusModal}
      >
        {renderStatusModalContent()}
      </StatusModal>
    </div>
  );
};