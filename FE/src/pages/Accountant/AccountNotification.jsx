import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";

// --- Components Layout/Modal ---
import { StatusModal } from "../../layouts/StatusModal";

// --- API CONFIG ---
const API_BASE_URL = "https://off-be-deploy.vercel.app";

// --- ICONS (SVG) ---
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 hover:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24 text-red-500 mx-auto mb-4">
    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
  </svg>
);

// --- MODAL THÊM/SỬA (Form nhập liệu) ---
const NotificationFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({ apartment_id: "", content: "" });

  useEffect(() => {
    if (initialData) {
      setFormData({
        apartment_id: initialData.apartment_id || "",
        content: initialData.content || "",
      });
    } else {
      setFormData({ apartment_id: "", content: "" });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg p-8 relative shadow-2xl animate-fade-in-up">
        <button onClick={onClose} className="absolute top-6 right-6 hover:bg-gray-100 rounded-full p-1 transition-colors">
          <CloseIcon />
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {initialData ? "Chỉnh sửa thông báo" : "Thêm thông báo mới"}
        </h2>

        <div className="space-y-6">
          {/* ID (Readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Thông báo ID</label>
            <input
              type="text"
              placeholder={initialData ? initialData.id : "Tự động tạo"}
              disabled
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-500 focus:outline-none"
            />
          </div>

          {/* Người nhận */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Người nhận (Mã căn hộ)</label>
            <input
              type="text"
              value={formData.apartment_id}
              onChange={(e) => setFormData({ ...formData, apartment_id: e.target.value })}
              placeholder="Nhập mã căn hộ (VD: A101) hoặc 'all'"
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all"
            />
          </div>

          {/* Nội dung */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Nội dung / Loại thông báo</label>
            <input
              type="text"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Nhập nội dung (VD: Nợ phí điện)"
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => onSubmit(formData)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-10 rounded-xl transition-colors shadow-lg shadow-blue-500/30"
          >
            {initialData ? "Lưu thay đổi" : "Thêm mới"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MODAL XÁC NHẬN XÓA (Tam giác đỏ) ---
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md text-center shadow-2xl animate-fade-in-up">
        <WarningIcon />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Xóa các mục đã chọn</h3>
        <p className="text-gray-500 mb-8">Hành động này không thể hoàn tác.</p>
        <div className="flex justify-between space-x-4">
          <button
            onClick={onClose}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all"
          >
            Hoàn tác
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-green-500/30 transition-all"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH ---
export const AccountantNotification = () => {
  // State quản lý dữ liệu
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // State quản lý chế độ Xóa
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  
  // State quản lý Modal
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  // State Status Modal (Thông báo thành công/thất bại)
  const [statusModal, setStatusModal] = useState({ open: false, type: "success", message: "" });
  const [acceptIconSrc, setAcceptIconSrc] = useState(null);
  const [notAcceptIconSrc, setNotAcceptIconSrc] = useState(null);

  // Load icons động
  useEffect(() => {
    import("../../images/accept_icon.png").then(m => setAcceptIconSrc(m.default));
    import("../../images/not_accept_icon.png").then(m => setNotAcceptIconSrc(m.default));
  }, []);

  // --- 1. FETCH DỮ LIỆU TỪ DATABASE ---
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications`);
      // Sắp xếp: Mới nhất lên đầu
      const sortedData = response.data.sort((a, b) => 
        new Date(b.created_at || b.notification_date) - new Date(a.created_at || a.notification_date)
      );
      setNotifications(sortedData);
    } catch (error) {
      console.error("Lỗi khi tải thông báo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // --- 2. XỬ LÝ THÊM / SỬA ---
  const handleAddClick = () => {
    setEditingItem(null);
    setShowFormModal(true);
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setShowFormModal(true);
  };

  const handleSubmitForm = async (formData) => {
    setShowFormModal(false);
    try {
      if (editingItem) {
        // Gọi API PUT để cập nhật
        await axios.put(`${API_BASE_URL}/notifications/${editingItem.id}`, formData);
        setStatusModal({ open: true, type: "success", message: "Cập nhật thành công!" });
      } else {
        // Gọi API POST để thêm mới
        await axios.post(`${API_BASE_URL}/notifications`, formData);
        setStatusModal({ open: true, type: "success", message: "Thêm thông báo thành công!" });
      }
      fetchNotifications(); // Reload lại danh sách
    } catch (error) {
      console.error(error);
      setStatusModal({ open: true, type: "failure", message: "Thao tác thất bại!" });
    }
  };

  // --- 3. XỬ LÝ XÓA (HÀNG LOẠT) ---
  const toggleDeleteMode = () => {
    if (isDeleteMode) {
      setIsDeleteMode(false);
      setSelectedIds([]); // Reset lựa chọn khi tắt chế độ xóa
    } else {
      setIsDeleteMode(true);
    }
  };

  const handleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteConfirmClick = () => {
    if (selectedIds.length === 0) return;
    setShowConfirmDelete(true);
  };

  const executeDelete = async () => {
    setShowConfirmDelete(false);
    try {
      // Xóa từng item đã chọn
      await Promise.all(selectedIds.map(id => axios.delete(`${API_BASE_URL}/notifications/${id}`)));
      
      setStatusModal({ open: true, type: "success", message: "Xóa thông báo thành công!" });
      fetchNotifications();
      setIsDeleteMode(false);
      setSelectedIds([]);
    } catch (error) {
      console.error(error);
      setStatusModal({ open: true, type: "failure", message: "Xóa thông báo không thành công!" });
    }
  };

  // --- 4. LỌC DỮ LIỆU (SEARCH) ---
  const filteredList = notifications.filter(item => {
    const term = searchTerm.toLowerCase();
    const content = item.content ? item.content.toLowerCase() : "";
    const id = String(item.id);
    return id.includes(term) || content.includes(term);
  });

  return (
    <div className="w-full min-h-screen">
      {/* Search Bar */}
      <div className="flex justify-start items-center mb-8">
        <div className="relative w-full max-w-2xl bg-white rounded-lg overflow-hidden shadow-sm">
          <span className="absolute left-4 top-1/2 -translate-y-1/2">
            <SearchIcon />
          </span>
          <input
            type="search"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-gray-700 focus:outline-none h-12"
          />
        </div>
      </div>

      {/* Header & Buttons */}
      <div className="flex justify-between items-end mb-6">
        <h1 className="text-3xl font-bold text-white">Thông Báo</h1>
        
        <div className="flex space-x-4">
          {!isDeleteMode ? (
            // Mode xem/sửa
            <>
              <button
                onClick={handleAddClick}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold flex items-center shadow-lg transition-colors"
              >
                + Thêm thông báo
              </button>
              <button
                onClick={toggleDeleteMode}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg transition-colors"
              >
                Xóa thông báo
              </button>
            </>
          ) : (
            // Mode xóa
            <>
              <button
                onClick={handleDeleteConfirmClick}
                className={`px-6 py-2.5 rounded-lg font-bold shadow-lg transition-colors ${
                  selectedIds.length > 0 ? "bg-red-500 hover:bg-red-600 text-white" : "bg-red-300 text-white cursor-not-allowed"
                }`}
              >
                Xóa các mục đã chọn
              </button>
              <button
                onClick={toggleDeleteMode}
                className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg transition-colors"
              >
                Hủy xóa
              </button>
            </>
          )}
        </div>
      </div>

      {/* Danh sách Card Thông báo */}
      <div className="space-y-4 pb-10">
        {isLoading ? (
          <p className="text-white text-center">Đang tải dữ liệu...</p>
        ) : filteredList.length === 0 ? (
          <p className="text-white text-center">Không tìm thấy thông báo nào.</p>
        ) : (
          filteredList.map((item) => (
            <div key={item.id} className="bg-white rounded-[20px] p-5 flex items-center shadow-md relative min-h-[90px]">
              {/* Thanh xanh bên trái */}
              <div className="absolute left-6 top-4 bottom-4 w-1 bg-blue-500 rounded-full"></div>

              {/* Grid Content */}
              <div className="flex-1 grid grid-cols-12 gap-4 items-center pl-10">
                
                {/* Cột 1: ID */}
                <div className="col-span-3 sm:col-span-2">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Thông báo ID</p>
                  <p className="text-2xl font-bold text-gray-900 leading-none">{item.id}</p>
                </div>

                {/* Cột 2: Nội dung / Loại thông báo */}
                <div className="col-span-5 sm:col-span-6">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Loại thông báo</p>
                  <p className="text-sm font-semibold text-gray-900 truncate pr-4" title={item.content}>
                    {item.content || "Nội dung thông báo"}
                  </p>
                </div>

                {/* Cột 3: Ngày gửi */}
                <div className="col-span-3 sm:col-span-2">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Ngày gửi</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {/* Ưu tiên sent_date, nếu không có thì lấy notification_date */}
                    {item.sent_date 
                      ? dayjs(item.sent_date).format("DD/MM/YYYY") 
                      : (item.notification_date ? dayjs(item.notification_date).format("DD/MM/YYYY") : "---")}
                  </p>
                </div>

                {/* Cột 4: Action (Edit Text hoặc Checkbox) */}
                <div className="col-span-1 sm:col-span-2 flex justify-end items-center">
                  {!isDeleteMode ? (
                    <button 
                      onClick={() => handleEditClick(item)}
                      className="text-blue-500 font-bold text-sm hover:underline"
                    >
                      Chỉnh sửa
                    </button>
                  ) : (
                    // Custom Checkbox
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
          ))
        )}
      </div>

      {/* --- MODALS --- */}
      
      {/* 1. Modal Thêm/Sửa */}
      <NotificationFormModal 
        isOpen={showFormModal} 
        onClose={() => setShowFormModal(false)}
        onSubmit={handleSubmitForm}
        initialData={editingItem}
      />

      {/* 2. Modal Xác nhận Xóa */}
      <DeleteConfirmModal 
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={executeDelete}
      />

      {/* 3. Modal Trạng thái */}
      <StatusModal isOpen={statusModal.open} onClose={() => setStatusModal({ ...statusModal, open: false })}>
        <div className="flex flex-col items-center justify-center p-4">
          {statusModal.type === "success" ? (
             <img src={acceptIconSrc} alt="Success" className="w-20 h-20 mb-4" />
          ) : (
             <img src={notAcceptIconSrc} alt="Fail" className="w-20 h-20 mb-4" />
          )}
          <h3 className="text-xl font-bold text-gray-800 text-center">{statusModal.message}</h3>
        </div>
      </StatusModal>

    </div>
  );
};