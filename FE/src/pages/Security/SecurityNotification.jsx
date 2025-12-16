import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";

// --- Components Layout/Modal ---
import { StatusModal } from "../../layouts/StatusModal";
// Chúng ta sẽ tự define Modal Confirm và Form để giống hệt ảnh thiết kế 100%
// thay vì dùng ConfirmationModal chung nếu nó không khớp style.

// --- IMPORT ICONS (Dùng cho Modal Bulk) ---
import { FiPlus, FiX } from "react-icons/fi";

// --- API CONFIG ---
const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

// --- ICONS ---
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-400"
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
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-gray-500 hover:text-gray-700"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const WarningIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-24 h-24 text-red-500 mx-auto mb-4"
  >
    <path
      fillRule="evenodd"
      d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
      clipRule="evenodd"
    />
  </svg>
);

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

// --- MODAL THÊM/SỬA (HỖ TRỢ BULK INSERT) ---
const NotificationFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const isEditing = !!initialData;

  // --- STATE CHO CHẾ ĐỘ SỬA (SINGLE FORM) ---
  const [formData, setFormData] = useState({ apartment_id: "", content: "" });

  // --- STATE CHO CHẾ ĐỘ THÊM (BULK TABLE) ---
  const [rows, setRows] = useState([
    { id: Date.now(), apartment_id: "", content: "" },
  ]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Chế độ Edit: Fill dữ liệu cũ
        setFormData({
          apartment_id: initialData.apartment_id || "",
          content: initialData.content || "",
        });
      } else {
        // Chế độ Add: Reset về 1 dòng trắng
        setRows([{ id: Date.now(), apartment_id: "", content: "" }]);
      }
    }
  }, [initialData, isOpen]);

  // --- HANDLERS CHO ADD (TABLE) ---
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

  // --- HANDLER SUBMIT ---
  const handleSubmit = () => {
    if (isEditing) {
      // Logic Sửa
      onSubmit(formData);
    } else {
      // Logic Thêm Nhiều
      // Validate sơ bộ
      const validRows = rows.map(({ apartment_id, content }) => ({
        apartment_id,
        content,
      }));
      // Bạn có thể thêm validate rỗng tại đây nếu cần
      onSubmit(validRows);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
      {/* Điều chỉnh độ rộng modal tùy theo chế độ */}
      <div
        className={`bg-white rounded-2xl p-8 relative shadow-2xl ${
          isEditing ? "w-full max-w-lg" : "w-full max-w-4xl"
        }`}
        style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        <button onClick={onClose} className="absolute top-6 right-6">
          <CloseIcon />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {isEditing ? "Chỉnh sửa thông báo" : "Thêm thông báo mới"}
        </h2>

        {/* --- NỘI DUNG FORM --- */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {isEditing ? (
            // === FORM SỬA (SINGLE) ===
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Thông báo ID
                </label>
                <input
                  type="text"
                  placeholder={initialData.id}
                  disabled
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Người nhận
                </label>
                <input
                  type="text"
                  value={formData.apartment_id}
                  onChange={(e) =>
                    setFormData({ ...formData, apartment_id: e.target.value })
                  }
                  placeholder="Nhập mã căn hộ hoặc 'all'"
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Nội dung
                </label>
                <input
                  type="text"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Nhập nội dung thông báo"
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>
            </div>
          ) : (
            // === FORM THÊM (TABLE BULK) ===
            <div className="overflow-y-auto custom-scrollbar border border-gray-200 rounded-lg flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-3 text-sm font-bold text-gray-600 uppercase border-b w-[30%]">
                      Người nhận
                    </th>
                    <th className="p-3 text-sm font-bold text-gray-600 uppercase border-b w-[60%]">
                      Nội dung
                    </th>
                    <th className="p-3 text-sm font-bold text-gray-600 uppercase border-b w-[10%] text-center">
                      <button
                        onClick={addRow}
                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors mx-auto shadow-md"
                        title="Thêm dòng"
                      >
                        <FiPlus size={16} />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      {/* Cột 1: Người nhận */}
                      <td className="p-2 align-top">
                        <input
                          type="text"
                          value={row.apartment_id}
                          onChange={(e) =>
                            handleRowChange(row.id, "apartment_id", e.target.value)
                          }
                          placeholder="VD: P.101"
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      {/* Cột 2: Nội dung */}
                      <td className="p-2 align-top">
                        <textarea
                          rows={1}
                          value={row.content}
                          onChange={(e) =>
                            handleRowChange(row.id, "content", e.target.value)
                          }
                          placeholder="Nội dung..."
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
                          style={{ minHeight: "42px" }}
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
                            onClick={() => removeRow(row.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            title="Xóa dòng"
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
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-10 rounded-xl transition-colors shadow-lg shadow-blue-500/30"
          >
            {isEditing ? "Lưu thay đổi" : "Xác nhận thêm"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MODAL XÁC NHẬN XÓA ---
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md text-center shadow-2xl animate-fade-in-up">
        <WarningIcon />
        <h3 className="text-2xl font-bold text-gray-800 mb-8">
          Xóa các mục đã chọn
        </h3>
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

// --- MAIN PAGE ---
export const SecurityNotification = () => {
  const getToken = () => localStorage.getItem("token");

  // State Data
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // State UI Modes
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // State Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Status Modal
  const [statusModal, setStatusModal] = useState({
    open: false,
    type: "success",
    message: "",
  });
  const [acceptIconSrc, setAcceptIconSrc] = useState(null);
  const [notAcceptIconSrc, setNotAcceptIconSrc] = useState(null);

  useEffect(() => {
    import("../../images/accept_icon.png").then((m) =>
      setAcceptIconSrc(m.default)
    );
    import("../../images/not_accept_icon.png").then((m) =>
      setNotAcceptIconSrc(m.default)
    );
  }, []);

  // --- FETCH DATA ---
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sorted = response.data.sort(
        (a, b) =>
          new Date(b.created_at || b.notification_date) -
          new Date(a.created_at || a.notification_date)
      );
      setNotifications(sorted);
    } catch (error) {
      console.error("Lỗi tải data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // --- HANDLERS ---
  const handleAddClick = () => {
    setEditingItem(null);
    setShowFormModal(true);
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setShowFormModal(true);
  };

  // --- HANDLER SUBMIT FORM (XỬ LÝ CẢ ĐƠN VÀ ĐA) ---
  const handleSubmitForm = async (data) => {
    setShowFormModal(false);
    try {
      const token = getToken();
      
      if (Array.isArray(data)) {
        // === XỬ LÝ THÊM NHIỀU (BULK ADD) ===
        // Gửi nhiều request song song
        await Promise.all(
          data.map((item) =>
            axios.post(`${API_BASE_URL}/notifications`, item, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );
        setStatusModal({
          open: true,
          type: "success",
          message: `Đã thêm ${data.length} thông báo mới!`,
        });

      } else if (editingItem) {
        // === XỬ LÝ SỬA (EDIT SINGLE) ===
        await axios.put(
          `${API_BASE_URL}/notifications/${editingItem.id}`,
          data, // data là object { apartment_id, content }
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStatusModal({
          open: true,
          type: "success",
          message: "Cập nhật thành công!",
        });
      }

      fetchNotifications();
    } catch (error) {
      setStatusModal({
        open: true,
        type: "failure",
        message: "Thao tác thất bại!",
      });
    }
  };

  // --- DELETE LOGIC ---
  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedIds([]);
  };

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteConfirmClick = () => {
    if (selectedIds.length > 0) setShowConfirmDelete(true);
  };

  const executeDelete = async () => {
    setShowConfirmDelete(false);
    try {
      const token = getToken();
      await Promise.all(
        selectedIds.map((id) =>
          axios.delete(`${API_BASE_URL}/notifications/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );

      setStatusModal({
        open: true,
        type: "success",
        message: "Xóa thành công!",
      });
      fetchNotifications();
      setIsDeleteMode(false);
      setSelectedIds([]);
    } catch (error) {
      setStatusModal({
        open: true,
        type: "failure",
        message: "Xóa thất bại!",
      });
    }
  };

  // --- FILTER ---
  const filteredList = notifications.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = removeVietnameseTones(searchTerm.trim());
    
    // Tìm kiếm theo ID (không phân biệt hoa thường)
    const idMatch = String(item.id).toLowerCase().includes(term);
    
    // Tìm kiếm theo Nội dung (không dấu)
    const contentMatch = removeVietnameseTones(item.content || "").includes(term);

    return idMatch || contentMatch;
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
            placeholder="Tìm theo ID hoặc Nội dung thông báo..." // Cập nhật placeholder
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-gray-700 focus:outline-none h-12"
          />
        </div>
      </div>

      {/* 2. TITLE & BUTTONS */}
      <div className="flex justify-between items-end mb-6">
        <h1 className="text-3xl font-bold text-white">Thông Báo</h1>

        <div className="flex space-x-4">
          {!isDeleteMode ? (
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
            <>
              <button
                onClick={handleDeleteConfirmClick}
                className={`px-6 py-2.5 rounded-lg font-bold shadow-lg transition-colors ${
                  selectedIds.length > 0
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-red-300 text-white cursor-not-allowed"
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

      {/* 3. DANH SÁCH THÔNG BÁO */}
      <div className="space-y-4 pb-10">
        {isLoading ? (
          <p className="text-white">Đang tải...</p>
        ) : (
          filteredList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-[20px] p-5 flex items-center shadow-md relative min-h-[90px]"
            >
              <div className="absolute left-6 top-4 bottom-4 w-1 bg-blue-500 rounded-full"></div>

              <div className="flex-1 grid grid-cols-12 gap-4 items-center pl-10">
                <div className="col-span-3 sm:col-span-2">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Thông báo ID
                  </p>
                  <p className="text-2xl font-bold text-gray-900 leading-none">
                    {item.id}
                  </p>
                </div>

                <div className="col-span-5 sm:col-span-6">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Nội dung thông báo
                  </p>
                  <p
                    className="text-sm font-semibold text-gray-900 truncate pr-4"
                    title={item.content}
                  >
                    {item.content || "Nội dung thông báo"}
                  </p>
                </div>

                <div className="col-span-3 sm:col-span-2">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Ngày gửi
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.notification_date
                      ? dayjs(item.notification_date).format("DD/MM/YYYY")
                      : "---"}
                  </p>
                </div>

                <div className="col-span-1 sm:col-span-2 flex justify-end items-center">
                  {!isDeleteMode ? (
                    <button
                      onClick={() => handleEditClick(item)}
                      className="text-blue-500 font-bold text-sm hover:underline"
                    >
                      Chỉnh sửa
                    </button>
                  ) : (
                    <div
                      onClick={() => handleSelect(item.id)}
                      className={`w-10 h-10 rounded-xl cursor-pointer flex items-center justify-center transition-all duration-200 ${
                        selectedIds.includes(item.id)
                          ? "bg-blue-500 shadow-blue-500/50"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    >
                      {selectedIds.includes(item.id) && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
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

      {/* --- MODAL SECTIONS --- */}

      {/* 1. Modal Thêm/Sửa */}
      <NotificationFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleSubmitForm}
        initialData={editingItem}
      />

      {/* 2. Modal Xác nhận Xóa (Custom giống ảnh) */}
      <DeleteConfirmModal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={executeDelete}
      />

      {/* 3. Modal Trạng thái (Success/Fail) */}
      <StatusModal
        isOpen={statusModal.open}
        onClose={() => setStatusModal({ ...statusModal, open: false })}
      >
        <div className="flex flex-col items-center justify-center p-4">
          {statusModal.type === "success" ? (
            <img src={acceptIconSrc} alt="Success" className="w-20 h-20 mb-4" />
          ) : (
            <img src={notAcceptIconSrc} alt="Fail" className="w-20 h-20 mb-4" />
          )}
          <h3 className="text-xl font-bold text-gray-800 text-center">
            {statusModal.message}
          </h3>
        </div>
      </StatusModal>
    </div>
  );
};