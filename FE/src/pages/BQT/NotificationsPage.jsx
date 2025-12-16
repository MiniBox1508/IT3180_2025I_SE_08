import React, { useState, useEffect } from "react";
import { StatusModal } from "../../layouts/StatusModal";
import { ConfirmationModal } from "../../layouts/ConfirmationModal";
// --- IMPORT ICONS CHO MODAL ---
import { FiPlus, FiX } from "react-icons/fi"; 
import acceptIcon from "../../images/accept_icon.png";
import notAcceptIcon from "../../images/not_accept_icon.png";

const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

// --- HÀM LẤY TOKEN ---
const getToken = () => localStorage.getItem("token");

// --- HELPER: Xóa dấu tiếng Việt để tìm kiếm ---
const removeVietnameseTones = (str) => {
  if (!str) return "";
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // huyền, sắc, hỏi, ngã, nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // mũ â (ê), mũ ă, mũ ơ (ư)
  return str;
};

// =========================================================================
// === NOTIFICATION FORM MODAL (ADD = TABLE / EDIT = SINGLE FORM) ===
// =========================================================================
const NotificationFormModal = ({
  isOpen,
  onClose,
  onSave,
  notificationData,
  error,
  setError,
}) => {
  const isEditing = !!notificationData;

  // --- STATE CHO CHẾ ĐỘ SỬA (SINGLE FORM) ---
  const [singleFormData, setSingleFormData] = useState({
    apartment_id: "",
    content: "",
  });

  // --- STATE CHO CHẾ ĐỘ THÊM (BULK TABLE) ---
  const [rows, setRows] = useState([
    { id: Date.now(), apartment_id: "", content: "" }
  ]);

  // --- EFFECT: RESET DATA KHI MỞ MODAL ---
  useEffect(() => {
    if (isOpen) {
      if (notificationData) {
        // Chế độ Edit: Fill dữ liệu cũ
        setSingleFormData({
          apartment_id: notificationData.apartment_id || notificationData.recipient || "",
          content: notificationData.content || "",
        });
      } else {
        // Chế độ Add: Reset về 1 dòng trắng
        setRows([{ id: Date.now(), apartment_id: "", content: "" }]);
      }
      setError("");
    }
  }, [isOpen, notificationData, setError]);

  // --- HANDLERS CHO EDIT (SINGLE) ---
  const handleSingleChange = (e) => {
    const { name, value } = e.target;
    setSingleFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- HANDLERS CHO ADD (BULK TABLE) ---
  const handleRowChange = (id, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: Date.now(), apartment_id: "", content: "" },
    ]);
  };

  const removeRow = (id) => {
    if (rows.length > 1) {
      setRows((prev) => prev.filter((row) => row.id !== id));
    }
  };

  // --- SUBMIT HANDLER ---
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (isEditing) {
      // === LOGIC SỬA ===
      if (!singleFormData.apartment_id || !singleFormData.content) {
        setError("Vui lòng điền đủ Người nhận và Nội dung.");
        return;
      }
      const dataToSend = {
        apartment_id: singleFormData.apartment_id,
        content: singleFormData.content,
      };
      onSave(dataToSend, notificationData.id);

    } else {
      // === LOGIC THÊM NHIỀU DÒNG ===
      // 1. Validate từng dòng
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row.apartment_id || !row.content) {
          setError(`Dòng ${i + 1}: Vui lòng điền đủ Người nhận và Nội dung.`);
          return;
        }
      }

      // 2. Chuẩn hóa dữ liệu gửi đi (Array)
      const dataToSend = rows.map(row => ({
        apartment_id: row.apartment_id,
        content: row.content,
      }));

      onSave(dataToSend, null); // null ID -> Create Mode
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
      {/* Điều chỉnh độ rộng Modal */}
      <div className={`bg-white p-6 rounded-2xl shadow-2xl relative flex flex-col ${isEditing ? 'w-full max-w-md' : 'w-full max-w-4xl'}`} style={{ maxHeight: '90vh' }}>
        
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {isEditing ? "Chỉnh sửa thông báo" : "Thêm thông báo mới"}
        </h2>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* ============ GIAO DIỆN 1: THÊM MỚI (DẠNG BẢNG - 2 CỘT NHẬP LIỆU) ============ */}
        {!isEditing && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="overflow-y-auto custom-scrollbar border border-gray-200 rounded-lg flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                    {/* Điều chỉnh width để cân đối */}
                    <th className="p-3 text-xs font-bold text-gray-600 uppercase border-b w-[30%]">Người nhận</th>
                    <th className="p-3 text-xs font-bold text-gray-600 uppercase border-b w-[60%]">Nội dung</th>
                    <th className="p-3 text-xs font-bold text-gray-600 uppercase border-b w-[10%] text-center">
                      <button 
                        type="button" 
                        onClick={addRow}
                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors mx-auto shadow-md"
                        title="Thêm dòng mới"
                      >
                        <FiPlus size={16} />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-blue-50 transition-colors group">
                      {/* Cột 1: Người nhận */}
                      <td className="p-2 align-top">
                        <input
                          type="text"
                          value={row.apartment_id}
                          onChange={(e) => handleRowChange(row.id, "apartment_id", e.target.value)}
                          placeholder="VD: P.101 hoặc All"
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>
                      
                      {/* Cột 2: Nội dung */}
                      <td className="p-2 align-top">
                        <textarea
                          rows={1}
                          value={row.content}
                          onChange={(e) => handleRowChange(row.id, "content", e.target.value)}
                          placeholder="Nội dung..."
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none overflow-hidden"
                          style={{ minHeight: "38px" }}
                          onInput={(e) => {
                            e.target.style.height = "auto";
                            e.target.style.height = e.target.scrollHeight + "px";
                          }}
                        />
                      </td>
                      
                      {/* Cột 3: Xóa */}
                      <td className="p-2 text-center align-top pt-3">
                        {rows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRow(row.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                            title="Xóa dòng này"
                          >
                            <FiX size={20} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============ GIAO DIỆN 2: CHỈNH SỬA (FORM ĐƠN - 3 Ô NHƯ CŨ) ============ */}
        {isEditing && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Thông báo ID</label>
              <div className="w-full bg-gray-100 rounded-md border border-gray-200 px-3 py-2 text-gray-700 font-mono text-sm">{notificationData.id}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Người nhận</label>
              <input 
                type="text" 
                name="apartment_id"
                value={singleFormData.apartment_id} 
                onChange={handleSingleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
              <textarea 
                name="content"
                rows="4"
                value={singleFormData.content} 
                onChange={handleSingleChange} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" 
              />
            </div>
          </div>
        )}

        {/* --- FOOTER BUTTONS --- */}
        <div className="flex justify-end space-x-3 pt-6 border-t mt-4 border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg shadow-blue-500/30"
          >
            Xác nhận
          </button>
        </div>

      </div>
    </div>
  );
};

// --- COMPONENT ITEM THÔNG BÁO ---
const NotificationItem = ({
  item,
  isDeleteMode,
  onEditClick,
  isSelected,
  onToggleSelect
}) => {

  const handleEditClick = () => {
    if (!isDeleteMode) {
      onEditClick(item);
    }
  };

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
      {/* Thanh màu bên trái */}
      <div className="absolute left-4 top-3 bottom-3 w-1.5 bg-blue-500 rounded-full"></div>

      {/* Nội dung thông báo */}
      <div className="flex-1 grid grid-cols-4 gap-4 items-center pl-8 pr-4 text-gray-800">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Thông báo ID</p>
          <p className="font-semibold">{item.id}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Người nhận</p>
          <p className="font-medium">{item.apartment_id || item.recipient}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Nội dung</p>
          <div className="flex flex-col">
             {/* Nếu API có title thì hiện, không thì thôi */}
             {item.title && <span className="font-bold text-sm text-blue-700 mb-0.5">{item.title}</span>}
             <span className="font-medium text-gray-700 text-sm" title={item.content}>
                {truncateContent(item.content)}
             </span>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Ngày gửi</p>
          <p className="text-gray-600">
            {item.notification_date
              ? new Date(item.notification_date).toLocaleDateString("vi-VN")
              : "---"}
          </p>
        </div>
      </div>

      {/* Khu vực hành động */}
      <div className="ml-auto flex-shrink-0 pr-2 w-24 flex justify-end">
        {isDeleteMode ? (
          <div className="flex items-center justify-center h-full">
             <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelect(item.id)}
                className="w-6 h-6 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
              />
          </div>
        ) : (
          <button
            onClick={handleEditClick}
            className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
          >
            Chỉnh sửa
          </button>
        )}
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // States Modal (Gộp chung Add/Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [formError, setFormError] = useState("");

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  // States Delete
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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

  // --- FILTER (LOGIC TÌM KIẾM MỚI) ---
  const filteredNotifications = notifications.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = removeVietnameseTones(searchTerm.trim());
    
    // Tìm theo ID
    const idMatch = String(item.id).toLowerCase().includes(term);
    // Tìm theo Người nhận (Căn hộ)
    const recipientMatch = removeVietnameseTones(item.apartment_id || item.recipient || "").includes(term);

    return idMatch || recipientMatch;
  });

  // --- HANDLERS ADD/EDIT ---
  const handleAddClick = () => {
    setEditingNotification(null); // Null = Add Mode
    setIsModalOpen(true);
    setFormError("");
  };

  const handleEditClick = (notification) => {
    setEditingNotification(notification); // Object = Edit Mode
    setIsModalOpen(true);
    setFormError("");
  };

  // --- HANDLE SAVE (Dùng chung cho Add & Edit) ---
  const handleSave = async (data, notificationId) => {
    try {
      const token = getToken();

      if (notificationId) {
        // --- LOGIC SỬA (1 Item) ---
        const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Lỗi cập nhật.");
        setModalStatus("editSuccess");
        setStatusMessage("Chỉnh sửa thông báo thành công!");
        setIsModalOpen(false);

      } else {
        // --- LOGIC THÊM (Bulk - Nhiều dòng) ---
        const itemsToCreate = Array.isArray(data) ? data : [data];
        
        await Promise.all(itemsToCreate.map(item => 
          fetch(`${API_BASE_URL}/notifications`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(item),
          }).then(res => {
             if (!res.ok) throw new Error("Lỗi tạo thông báo");
             return res;
          })
        ));

        setModalStatus("addSuccess");
        setStatusMessage(`Đã thêm ${itemsToCreate.length} thông báo mới!`);
        setIsModalOpen(false);
      }

      fetchNotifications();
      setIsStatusModalOpen(true);
    } catch (err) {
      setFormError(err.message); 
    }
  };

  // --- HANDLERS DELETE ---
  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedIds([]);
  };

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleDeleteSelectedClick = () => {
    if (selectedIds.length > 0) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedIds.length === 0) {
        setShowConfirmModal(false);
        return;
    }
    setShowConfirmModal(false);
    setError(null);

    try {
      const token = getToken();
      await Promise.all(
          selectedIds.map(id =>
              fetch(`${API_BASE_URL}/notifications/${id}`, { 
                  method: "DELETE",
                  headers: { "Authorization": `Bearer ${token}` }
              }).then(res => {
                  if (!res.ok) throw new Error(`Failed to delete ${id}`);
                  return res;
              })
          )
      );

      fetchNotifications();
      setModalStatus("deleteSuccess");
      setStatusMessage(`Đã xóa ${selectedIds.length} thông báo thành công!`);
      setIsDeleteMode(false); 
      setSelectedIds([]);
    } catch (err) {
      console.error("API Error:", err);
      setModalStatus("deleteFailure");
      setStatusMessage("Có lỗi xảy ra khi xóa. Vui lòng thử lại.");
    } finally {
      setIsStatusModalOpen(true);
    }
  };

  const handleCancelDelete = () => setShowConfirmModal(false);

  const handleCloseStatusModal = () => {
    setIsStatusModalOpen(false);
    setModalStatus(null);
    setStatusMessage("");
  };

  const renderStatusModalContent = () => {
    if (!modalStatus) return null;
    const isSuccess = modalStatus.toLowerCase().includes("success");
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
            placeholder="Tìm theo ID thông báo hoặc Người nhận..."
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
          {!isDeleteMode ? (
            <>
              <button
                onClick={handleAddClick}
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
              onEditClick={handleEditClick}
              isSelected={selectedIds.includes(item.id)}
              onToggleSelect={handleSelect}
            />
          ))
        )}
      </div>

      {/* Form Modal (Add & Edit) */}
      <NotificationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        notificationData={editingNotification}
        error={formError}
        setError={setFormError}
      />

      {/* Confirmation Modal (Xóa) */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Chú ý: Xóa thông báo!!!"
        message={
            selectedIds.length > 0 
            ? `Bạn có chắc chắn muốn xóa ${selectedIds.length} thông báo đã chọn không?` 
            : "Vui lòng chọn ít nhất một thông báo để xóa."
        }
      />

      {/* Status Modal (Thông báo kết quả) */}
      <StatusModal isOpen={isStatusModalOpen} onClose={handleCloseStatusModal}>
        {renderStatusModalContent()}
      </StatusModal>
    </div>
  );
};