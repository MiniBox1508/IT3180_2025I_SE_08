import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";

// --- Components Layout/Modal ---
import { StatusModal } from "../../layouts/StatusModal";

// --- IMPORT ICONS CHO MODAL BULK ---
import { FiPlus, FiX } from "react-icons/fi";

// --- IMPORT ẢNH MŨI TÊN CHO PHÂN TRANG ---
import arrowLeft from "../../images/Arrow_Left_Mini_Circle.png"; 
import arrowRight from "../../images/Arrow_Right_Mini_Circle.png";

// --- API CONFIG ---
const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

// --- ICONS (SVG) ---
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

// =========================================================================
// === MODAL THÊM/SỬA (HỖ TRỢ BULK INSERT) ===
// =========================================================================
const NotificationFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const isEditing = !!initialData;

  // --- STATE CHO CHẾ ĐỘ SỬA (SINGLE FORM) ---
  const [formData, setFormData] = useState({ apartment_id: "", content: "" });

  // --- STATE CHO CHẾ ĐỘ THÊM (BULK TABLE) ---
  const [rows, setRows] = useState([
    { id: Date.now(), apartment_id: "", content: "" },
  ]);

  // Reset dữ liệu khi mở modal
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
      // Logic Sửa: Gửi object
      onSubmit(formData);
    } else {
      // Logic Thêm Nhiều: Gửi mảng rows
      const validRows = rows.map(({ apartment_id, content }) => ({
        apartment_id,
        content,
      }));
      onSubmit(validRows);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
      {/* Điều chỉnh độ rộng modal tùy theo chế độ */}
      <div
        className={`bg-white rounded-2xl p-8 relative shadow-2xl animate-fade-in-up ${
          isEditing ? "w-full max-w-lg" : "w-full max-w-4xl"
        }`}
        style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 hover:bg-gray-100 rounded-full p-1 transition-colors"
        >
          <CloseIcon />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {isEditing ? "Chỉnh sửa thông báo" : "Thêm thông báo mới"}
        </h2>

        {/* --- NỘI DUNG FORM --- */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {isEditing ? (
            // === FORM SỬA (SINGLE - 3 Ô NHƯ CŨ) ===
            <div className="space-y-6">
              {/* ID (Readonly) */}
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

              {/* Người nhận */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Người nhận (Mã căn hộ)
                </label>
                <input
                  type="text"
                  value={formData.apartment_id}
                  onChange={(e) =>
                    setFormData({ ...formData, apartment_id: e.target.value })
                  }
                  placeholder="Nhập mã căn hộ (VD: A101) hoặc 'all'"
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all"
                />
              </div>

              {/* Nội dung */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Nội dung / Loại thông báo
                </label>
                <input
                  type="text"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Nhập nội dung (VD: Nợ phí điện)"
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all"
                />
              </div>
            </div>
          ) : (
            // === FORM THÊM (TABLE BULK - GIỐNG ACCOUNTPAYMENT) ===
            <div className="overflow-y-auto custom-scrollbar border border-gray-200 rounded-lg flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-3 text-sm font-bold text-gray-600 uppercase border-b w-[30%]">
                      Người nhận
                    </th>
                    <th className="p-3 text-sm font-bold text-gray-600 uppercase border-b w-[60%]">
                      Nội dung / Loại thông báo
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
                          placeholder="VD: A101"
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      {/* Cột 2: Nội dung */}
                      <td className="p-2 align-top">
                        <input
                          type="text"
                          value={row.content}
                          onChange={(e) =>
                            handleRowChange(row.id, "content", e.target.value)
                          }
                          placeholder="Nội dung..."
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Xóa các mục đã chọn
        </h3>
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

  // State Status Modal
  const [statusModal, setStatusModal] = useState({
    open: false,
    type: "success",
    message: "",
  });
  const [acceptIconSrc, setAcceptIconSrc] = useState(null);
  const [notAcceptIconSrc, setNotAcceptIconSrc] = useState(null);

  // --- STATE PHÂN TRANG (MỚI) ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Số lượng ô dữ liệu / 1 trang

  useEffect(() => {
    import("../../images/accept_icon.png").then((m) =>
      setAcceptIconSrc(m.default)
    );
    import("../../images/not_accept_icon.png").then((m) =>
      setNotAcceptIconSrc(m.default)
    );
  }, []);

  // --- 1. FETCH DỮ LIỆU TỪ DATABASE ---
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const sortedData = response.data.sort(
        (a, b) =>
          new Date(b.created_at || b.notification_date) -
          new Date(a.created_at || a.notification_date)
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

  // --- RESET TRANG KHI TÌM KIẾM ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // --- 2. XỬ LÝ THÊM / SỬA (UPDATED) ---
  const handleAddClick = () => {
    setEditingItem(null);
    setShowFormModal(true);
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setShowFormModal(true);
  };

  const handleSubmitForm = async (data) => {
    setShowFormModal(false);
    const token = localStorage.getItem("token");

    try {
      if (Array.isArray(data)) {
        // === XỬ LÝ THÊM NHIỀU (BULK ADD) ===
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
        // === XỬ LÝ SỬA (SINGLE EDIT) ===
        await axios.put(
          `${API_BASE_URL}/notifications/${editingItem.id}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStatusModal({
          open: true,
          type: "success",
          message: "Cập nhật thành công!",
        });
      }

      fetchNotifications(); // Reload
    } catch (error) {
      console.error(error);
      setStatusModal({
        open: true,
        type: "failure",
        message: "Thao tác thất bại!",
      });
    }
  };

  // --- 3. XỬ LÝ XÓA (HÀNG LOẠT) ---
  const toggleDeleteMode = () => {
    if (isDeleteMode) {
      setIsDeleteMode(false);
      setSelectedIds([]);
    } else {
      setIsDeleteMode(true);
    }
  };

  const handleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
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
      const token = localStorage.getItem("token");
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
        message: "Xóa thông báo thành công!",
      });
      fetchNotifications();
      setIsDeleteMode(false);
      setSelectedIds([]);
    } catch (error) {
      console.error(error);
      setStatusModal({
        open: true,
        type: "failure",
        message: "Xóa thông báo không thành công!",
      });
    }
  };

  // --- 4. LỌC DỮ LIỆU (CẬP NHẬT) ---
  const filteredList = notifications.filter((item) => {
    // Nếu không nhập gì thì hiện tất cả
    if (!searchTerm.trim()) return true;

    // Chuẩn hóa từ khóa tìm kiếm
    const term = removeVietnameseTones(searchTerm.trim());
    
    // Chuẩn hóa dữ liệu (ID và Loại thông báo)
    const contentStr = removeVietnameseTones(item.content || "");
    const idStr = String(item.id).toLowerCase();

    // So sánh
    return idStr.includes(term) || contentStr.includes(term);
  });

  // --- LOGIC CẮT DỮ LIỆU ĐỂ HIỂN THỊ (PAGINATION) ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNotifications = filteredList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

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
            placeholder="Tìm theo ID hoặc Loại thông báo..."
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

      {/* Danh sách Card Thông báo */}
      <div className="space-y-4 pb-10">
        {isLoading ? (
          <p className="text-white text-center">Đang tải dữ liệu...</p>
        ) : currentNotifications.length === 0 ? (
          <p className="text-white text-center">
            Không tìm thấy thông báo nào.
          </p>
        ) : (
          currentNotifications.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-[20px] p-5 flex items-center shadow-md relative min-h-[90px]"
            >
              <div className="absolute left-6 top-4 bottom-4 w-1 bg-blue-500 rounded-full"></div>

              <div className="flex-1 grid grid-cols-12 gap-4 items-center pl-10">
                {/* ID */}
                <div className="col-span-3 sm:col-span-2">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Thông báo ID
                  </p>
                  <p className="text-2xl font-bold text-gray-900 leading-none">
                    {item.id}
                  </p>
                </div>

                {/* Nội dung */}
                <div className="col-span-5 sm:col-span-6">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Loại thông báo
                  </p>
                  <p
                    className="text-sm font-semibold text-gray-900 truncate pr-4"
                    title={item.content}
                  >
                    {item.content || "Nội dung thông báo"}
                  </p>
                </div>

                {/* Ngày gửi */}
                <div className="col-span-3 sm:col-span-2">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Ngày gửi
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.sent_date
                      ? dayjs(item.sent_date).format("DD/MM/YYYY")
                      : item.notification_date
                      ? dayjs(item.notification_date).format("DD/MM/YYYY")
                      : "---"}
                  </p>
                </div>

                {/* Action */}
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

      {/* --- PAGINATION CONTROLS --- */}
      {filteredList.length > 0 && (
        <div className="flex justify-center items-center mt-6 space-x-6 pb-8">
          {/* Nút Prev */}
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className={`w-12 h-12 rounded-full border-2 border-black flex items-center justify-center transition-transform hover:scale-105 ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed bg-gray-200" : "cursor-pointer bg-white"
            }`}
          >
            <img src={arrowLeft} alt="Previous" className="w-6 h-6 object-contain" />
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
              currentPage === totalPages ? "opacity-50 cursor-not-allowed bg-gray-200" : "cursor-pointer bg-white"
            }`}
          >
            <img src={arrowRight} alt="Next" className="w-6 h-6 object-contain" />
          </button>
        </div>
      )}

      {/* --- MODALS --- */}
      <NotificationFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleSubmitForm}
        initialData={editingItem}
      />

      <DeleteConfirmModal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={executeDelete}
      />

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