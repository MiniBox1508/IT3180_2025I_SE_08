import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios"; // Đảm bảo import axios
import { StatusModal } from "../../layouts/StatusModal";
import { ConfirmationModal } from "../../layouts/ConfirmationModal";
// --- IMPORT ICONS ---
import { FiPlus, FiX, FiUpload, FiPrinter } from "react-icons/fi";
import acceptIcon from "../../images/accept_icon.png";
import notAcceptIcon from "../../images/not_accept_icon.png";

// --- IMPORT ẢNH MŨI TÊN CHO PHÂN TRANG ---
import arrowLeft from "../../images/Arrow_Left_Mini_Circle.png";
import arrowRight from "../../images/Arrow_Right_Mini_Circle.png";

// --- IMPORT THƯ VIỆN XỬ LÝ FILE ---
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";

const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

// --- HÀM LẤY TOKEN & USER ---
const getToken = () => localStorage.getItem("token");
const getCurrentUserEmail = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.email || "admin@bluemoon.com";
    } catch (e) {
      return "admin@bluemoon.com";
    }
  }
  return "admin@bluemoon.com";
};

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
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "");
  str = str.replace(/\u02C6|\u0306|\u031B/g, "");
  return str;
};

// =========================================================================
// === PREVIEW PDF MODAL (Popup xem trước khi in) ===
// =========================================================================
const PreviewPdfModal = ({ isOpen, onClose, data, onPrint }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
    }
  }, [isOpen, data]);

  if (!isOpen) return null;

  const totalPages = Math.ceil(data.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const emptyRows = itemsPerPage - currentItems.length;

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col h-auto">
        <div className="p-6 border-b border-gray-200 flex justify-center relative">
          <h2 className="text-2xl font-bold text-gray-800">
            Danh sách thông báo
          </h2>
        </div>
        <div className="p-8 bg-gray-50 flex flex-col">
          <div className="border border-gray-300 rounded-lg bg-white shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-sm font-bold text-gray-700 border-b border-gray-300 w-[15%]">
                    Mã số thông báo
                  </th>
                  <th className="p-3 text-sm font-bold text-gray-700 border-b border-gray-300 w-[20%]">
                    Người nhận
                  </th>
                  <th className="p-3 text-sm font-bold text-gray-700 border-b border-gray-300 w-[45%]">
                    Nội dung
                  </th>
                  <th className="p-3 text-sm font-bold text-gray-700 border-b border-gray-300 w-[20%]">
                    Ngày gửi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((item, index) => (
                  <tr key={index} className="hover:bg-blue-50 h-[50px]">
                    <td className="p-3 text-sm text-gray-700">{item.id}</td>
                    <td className="p-3 text-sm text-gray-700">
                      {item.receiver_name === "Cư dân"
                        ? item.apartment_id
                        : item.receiver_name}
                    </td>
                    <td
                      className="p-3 text-sm text-gray-700 truncate max-w-xs"
                      title={item.content}
                    >
                      {item.content}
                    </td>
                    <td className="p-3 text-sm text-gray-700">
                      {item.notification_date
                        ? new Date(item.notification_date).toLocaleDateString(
                            "vi-VN"
                          )
                        : ""}
                    </td>
                  </tr>
                ))}
                {Array.from({ length: Math.max(0, emptyRows) }).map((_, i) => (
                  <tr key={`empty-${i}`} className="h-[50px]">
                    <td className="border-b border-gray-100"></td>
                    <td className="border-b border-gray-100"></td>
                    <td className="border-b border-gray-100"></td>
                    <td className="border-b border-gray-100"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center items-center mt-6 space-x-4">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className={`w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center ${
                currentPage === 1
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-gray-200"
              }`}
            >
              <img src={arrowLeft} className="w-4 h-4" alt="Prev" />
            </button>
            <div className="bg-gray-300 px-4 py-1 rounded-full text-gray-700 font-semibold text-sm">
              Trang{" "}
              <span className="bg-gray-400 text-white px-2 py-0.5 rounded ml-1">
                {currentPage}
              </span>{" "}
              / {totalPages}
            </div>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center ${
                currentPage === totalPages
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-gray-200"
              }`}
            >
              <img src={arrowRight} className="w-4 h-4" alt="Next" />
            </button>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-between items-center bg-white rounded-b-2xl">
          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-8 rounded-lg shadow-md transition-colors"
          >
            Thoát
          </button>
          <button
            onClick={onPrint}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-8 rounded-lg shadow-md transition-colors flex items-center gap-2"
          >
            <span>In danh sách</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// === MODAL THÊM/SỬA (HỖ TRỢ BULK INSERT & SELECT DROPDOWN) ===
// =========================================================================
const NotificationFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const isEditing = !!initialData;
  const [apartments, setApartments] = useState([]); // State lưu danh sách căn hộ từ API

  const [formData, setFormData] = useState({
    receiver_name: "Cư dân",
    apartment_id: "",
    content: "",
  });
  const [rows, setRows] = useState([
    { id: Date.now(), receiver_name: "Cư dân", apartment_id: "", content: "" },
  ]);

  // --- CALL API LẤY DANH SÁCH CĂN HỘ ---
  useEffect(() => {
    if (isOpen) {
      const fetchApartments = async () => {
        try {
          const token = getToken();
          const response = await fetch(`${API_BASE_URL}/residents`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            // Lọc lấy danh sách mã căn hộ duy nhất và sắp xếp
            const uniqueApts = [
              ...new Set(data.map((r) => r.apartment_id).filter((id) => id)),
            ].sort();
            setApartments(uniqueApts);
          }
        } catch (err) {
          console.error("Failed to fetch apartments", err);
        }
      };
      fetchApartments();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          receiver_name: initialData.receiver_name || "Cư dân",
          apartment_id: initialData.apartment_id || "",
          content: initialData.content || "",
        });
      } else {
        setRows([
          {
            id: Date.now(),
            receiver_name: "Cư dân",
            apartment_id: "",
            content: "",
          },
        ]);
      }
    }
  }, [initialData, isOpen]);

  const handleRowChange = (id, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        receiver_name: "Cư dân",
        apartment_id: "",
        content: "",
      },
    ]);

  const removeRow = (id) => {
    if (rows.length > 1) setRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleSubmit = () => {
    if (isEditing) {
      const dataToSend = {
        sender_name: "Kế toán",
        receiver_name: formData.receiver_name,
        apartment_id:
          formData.receiver_name === "Cư dân" ? formData.apartment_id : "All",
        content: formData.content,
      };
      onSubmit(dataToSend);
    } else {
      const validRows = rows.map(
        ({ receiver_name, apartment_id, content }) => ({
          sender_name: "Kế toán",
          receiver_name,
          apartment_id: receiver_name === "Cư dân" ? apartment_id : "All",
          content,
        })
      );
      onSubmit(validRows);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div
        className={`bg-white rounded-2xl p-8 relative shadow-2xl animate-fade-in-up ${
          isEditing ? "w-full max-w-lg" : "w-full max-w-5xl"
        }`}
        style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 hover:bg-gray-100 rounded-full p-1 transition-colors"
        >
          <FiX className="w-6 h-6 text-gray-500" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {isEditing ? "Chỉnh sửa thông báo" : "Thêm thông báo mới"}
        </h2>
        <div className="flex-1 overflow-hidden flex flex-col">
          {isEditing ? (
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
                <select
                  value={formData.receiver_name}
                  onChange={(e) =>
                    setFormData({ ...formData, receiver_name: e.target.value })
                  }
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 mb-3"
                >
                  <option value="Cư dân">Cư dân</option>
                  <option value="Ban quản trị">Ban quản trị</option>
                  <option value="Công an">Công an</option>
                  <option value="Tất cả">Tất cả</option>
                </select>

                {formData.receiver_name === "Cư dân" && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mã căn hộ
                    </label>
                    <select
                      value={formData.apartment_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          apartment_id: e.target.value,
                        })
                      }
                      className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">--Chọn căn hộ--</option>
                      {apartments.map((apt) => (
                        <option key={apt} value={apt}>
                          {apt}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Nội dung
                </label>
                <textarea
                  rows="4"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Nhập nội dung thông báo..."
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          ) : (
            <div className="overflow-y-auto custom-scrollbar border border-gray-200 rounded-lg flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-3 text-sm font-bold text-gray-600 uppercase border-b w-[20%]">
                      Người nhận
                    </th>
                    <th className="p-3 text-sm font-bold text-gray-600 uppercase border-b w-[20%]">
                      Mã căn hộ
                    </th>
                    <th className="p-3 text-sm font-bold text-gray-600 uppercase border-b w-[50%]">
                      Nội dung
                    </th>
                    <th className="p-3 text-sm font-bold text-gray-600 uppercase border-b w-[10%] text-center">
                      <button
                        onClick={addRow}
                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors mx-auto shadow-md"
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
                      <td className="p-2 align-top">
                        <select
                          value={row.receiver_name}
                          onChange={(e) =>
                            handleRowChange(
                              row.id,
                              "receiver_name",
                              e.target.value
                            )
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Cư dân">Cư dân</option>
                          <option value="Ban quản trị">Ban quản trị</option>
                          <option value="Công an">Công an</option>
                          <option value="Tất cả">Tất cả</option>
                        </select>
                      </td>

                      {/* SỬA: Hiển thị Select Mã căn hộ khi chọn Cư dân */}
                      <td className="p-2 align-top">
                        {row.receiver_name === "Cư dân" ? (
                          <select
                            value={row.apartment_id}
                            onChange={(e) =>
                              handleRowChange(
                                row.id,
                                "apartment_id",
                                e.target.value
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">--Chọn--</option>
                            {apartments.map((apt) => (
                              <option key={apt} value={apt}>
                                {apt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="p-2 text-gray-400 text-sm italic text-center">
                            ---
                          </div>
                        )}
                      </td>

                      <td className="p-2 align-top">
                        <textarea
                          rows={1}
                          value={row.content}
                          onChange={(e) =>
                            handleRowChange(row.id, "content", e.target.value)
                          }
                          placeholder="Nội dung..."
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
                          style={{ minHeight: "38px" }}
                          onInput={(e) => {
                            e.target.style.height = "auto";
                            e.target.style.height =
                              e.target.scrollHeight + "px";
                          }}
                        />
                      </td>
                      <td className="p-2 text-center align-top pt-3">
                        {rows.length > 1 && (
                          <button
                            onClick={() => removeRow(row.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
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
        {/* Warning Icon SVG */}
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <svg
            className="h-6 w-6 text-red-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
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
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // State Status Modal
  const [statusModal, setStatusModal] = useState({
    open: false,
    type: "success",
    message: "",
  });

  // State Import/Export (MỚI)
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const fileInputRef = useRef(null);

  // State Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- FETCH DATA ---
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
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
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // --- LOGIC NHẬP FILE EXCEL ---
  const handleImportClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const workbook = new ExcelJS.Workbook();
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const buffer = evt.target.result;
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.getWorksheet(1);
        const dataToImport = [];
        let headerRowNumber = 1;
        let colMap = {};

        // 1. CALL API LẤY DANH SÁCH CĂN HỘ HỢP LỆ (Để validate)
        let validApartmentIds = [];
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(`${API_BASE_URL}/residents`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          validApartmentIds = res.data
            .map((r) =>
              r.apartment_id ? String(r.apartment_id).trim().toLowerCase() : ""
            )
            .filter((id) => id);
        } catch (apiErr) {
          console.error("Không thể lấy danh sách căn hộ để validate:", apiErr);
          // Vẫn cho phép tiếp tục, nhưng có thể cảnh báo user nếu cần
        }

        // 2. TÌM HEADER
        worksheet.eachRow((row, rowNumber) => {
          if (Object.keys(colMap).length > 0) return;
          const rowValues = row.values;
          if (Array.isArray(rowValues)) {
            const normalizedCells = rowValues.map((v) =>
              v ? String(v).trim().toLowerCase() : ""
            );

            const idxRecipient = normalizedCells.findIndex(
              (v) => v === "người nhận" || v === "mã căn hộ"
            );
            const idxContent = normalizedCells.findIndex(
              (v) => v === "nội dung"
            );

            if (idxRecipient !== -1 && idxContent !== -1) {
              headerRowNumber = rowNumber;
              colMap = { recipient: idxRecipient, content: idxContent };
            }
          }
        });

        if (Object.keys(colMap).length === 0)
          throw new Error(
            "Không tìm thấy cột 'Người nhận/Mã căn hộ' và 'Nội dung'."
          );

        // 3. DUYỆT DATA (Đếm tổng data rows thực tế)
        let totalDataRows = 0;

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > headerRowNumber) {
            const rowValues = row.values;
            const rawRecipient = rowValues[colMap.recipient]
              ? String(rowValues[colMap.recipient]).trim().normalize("NFC")
              : "";
            const content = rowValues[colMap.content]
              ? String(rowValues[colMap.content]).trim()
              : "";

            // Chỉ xử lý nếu có dữ liệu
            if (rawRecipient || content) {
              totalDataRows++;

              if (rawRecipient && content) {
                // --- LOGIC PHÂN LOẠI & VALIDATE ---
                let receiverName = "";
                let apartmentId = "";
                let isValidRow = false;

                const specialRoles = ["Ban quản trị", "Công an", "Tất cả"];
                const normalizedRaw = rawRecipient.toLowerCase();
                const noToneRaw =
                  removeVietnameseTones(rawRecipient).toLowerCase();

                // Check 1: Role đặc biệt
                const matchRole = specialRoles.find((role) => {
                  const roleLower = role.toLowerCase();
                  const roleNoTone = removeVietnameseTones(role).toLowerCase();
                  return (
                    roleLower === normalizedRaw || roleNoTone === noToneRaw
                  );
                });

                if (matchRole) {
                  receiverName = matchRole;
                  apartmentId = "All";
                  isValidRow = true;
                } else {
                  // Check 2: Mã căn hộ hợp lệ
                  if (validApartmentIds.includes(normalizedRaw)) {
                    receiverName = "Cư dân";
                    apartmentId = rawRecipient;
                    isValidRow = true;
                  } else {
                    // Data lỗi (Role lạ / Căn hộ ko tồn tại) -> Không import
                    isValidRow = false;
                  }
                }

                if (isValidRow) {
                  dataToImport.push({
                    sender_name: "Kế toán",
                    receiver_name: receiverName,
                    apartment_id: apartmentId,
                    content: content,
                  });
                }
              }
            }
          }
        });

        // 4. GỌI API IMPORT
        const token = localStorage.getItem("token");
        let successCount = 0;
        let apiFailCount = 0;

        await Promise.all(
          dataToImport.map((item) =>
            axios
              .post(`${API_BASE_URL}/notifications`, item, {
                headers: { Authorization: `Bearer ${token}` },
              })
              .then(() => successCount++)
              .catch(() => apiFailCount++)
          )
        );

        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchNotifications();

        // 5. TÍNH TOÁN KẾT QUẢ & HIỂN THỊ
        // Số dòng lỗi = (Tổng dòng có data - Dòng hợp lệ đã lọc) + (Dòng call API lỗi)
        // Trong đó: (Tổng dòng có data - Dòng hợp lệ) = Dòng bị sai Role/Căn hộ/Thiếu thông tin
        const invalidDataCount = totalDataRows - dataToImport.length;
        const totalFail = invalidDataCount + apiFailCount;

        let message = "";
        let type = "success";

        if (totalFail === 0 && successCount > 0)
          message = `Nhập thành công ${successCount} thông báo!`;
        else if (successCount > 0)
          message = `Nhập thành công ${successCount} thông báo!
          Nhập thất bại ${totalFail} thông báo!`;
        else {
          message = "Nhập thất bại toàn bộ.";
          type = "failure";
        }

        setStatusModal({ open: true, type, message });
      } catch (err) {
        setStatusModal({
          open: true,
          type: "failure",
          message: "Lỗi file: " + err.message,
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // --- LOGIC XUẤT PDF ---
  const handleExportClick = () => setShowPreviewModal(true);

  const handlePrintPDF = async () => {
    try {
      const doc = new jsPDF();
      const fontUrl =
        "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf";
      const fontResponse = await fetch(fontUrl);
      const fontBlob = await fontResponse.blob();
      const reader = new FileReader();
      reader.readAsDataURL(fontBlob);

      reader.onloadend = () => {
        const base64data = reader.result.split(",")[1];
        doc.addFileToVFS("Roboto-Regular.ttf", base64data);
        doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
        doc.setFont("Roboto");

        doc.setFontSize(18);
        doc.text("Danh sách thông báo - Phòng kế toán", 105, 15, {
          align: "center",
        });

        const today = new Date().toLocaleDateString("vi-VN");
        doc.setFontSize(11);
        doc.setFont("Roboto", "normal");
        doc.text(`Ngày in: ${today}`, 14, 25);
        doc.text(`Người in: ${getCurrentUserEmail()}`, 196, 25, {
          align: "right",
        });

        const tableColumn = ["Mã ID", "Người nhận", "Nội dung", "Ngày gửi"];
        const tableRows = [];

        filteredList.forEach((item) => {
          const rowData = [
            String(item.id),
            (item.receiver_name === "Cư dân"
              ? item.apartment_id
              : item.receiver_name || ""
            ).normalize("NFC"),
            (item.content || "").normalize("NFC"),
            item.sent_date
              ? dayjs(item.sent_date).format("DD/MM/YYYY")
              : item.notification_date
              ? dayjs(item.notification_date).format("DD/MM/YYYY")
              : "",
          ];
          tableRows.push(rowData);
        });

        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 30,
          styles: { font: "Roboto", fontStyle: "normal", fontSize: 10 },
          headStyles: {
            fillColor: [220, 220, 220],
            textColor: 20,
            fontStyle: "normal",
          },
          theme: "grid",
          margin: { top: 30 },
        });

        doc.save("DANH_SACH_THONG_BAO_KE_TOAN_BLUEMOON.pdf");
        setShowPreviewModal(false);
        setStatusModal({
          open: true,
          type: "success",
          message: `Xuất thành công ${filteredList.length} dòng!`,
        });
      };
    } catch (err) {
      setStatusModal({
        open: true,
        type: "failure",
        message: "Lỗi xuất PDF: " + err.message,
      });
    }
  };

  // --- CRUD HANDLERS ---
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
      fetchNotifications();
    } catch (error) {
      setStatusModal({
        open: true,
        type: "failure",
        message: "Thao tác thất bại!",
      });
    }
  };

  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedIds([]);
  };
  const handleSelect = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  const handleDeleteConfirmClick = () => {
    if (selectedIds.length > 0) setShowConfirmDelete(true);
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
      setStatusModal({
        open: true,
        type: "failure",
        message: "Xóa thông báo không thành công!",
      });
    }
  };

  // --- FILTER & PAGINATION ---
  const filteredList = notifications.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = removeVietnameseTones(searchTerm.trim());
    return (
      String(item.id).toLowerCase().includes(term) ||
      removeVietnameseTones(item.content || "").includes(term)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };
  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
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
              {/* Input Excel Ẩn */}
              <input
                type="file"
                accept=".xlsx, .xls"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />

              <button
                onClick={handleImportClick}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-colors"
              >
                <FiUpload size={18} /> <span>Nhập Excel</span>
              </button>

              <button
                onClick={handleExportClick}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-colors"
              >
                <FiPrinter size={18} /> <span>Xuất PDF</span>
              </button>

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

      {/* Danh sách Card Thông báo - GRID LAYOUT 12 COLUMNS */}
      <div className="space-y-4 pb-4">
        {isLoading ? (
          <p className="text-white text-center">Đang tải dữ liệu...</p>
        ) : currentItems.length === 0 ? (
          <p className="text-white text-center">Không có dữ liệu.</p>
        ) : (
          currentItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-[20px] p-5 flex items-center shadow-md relative min-h-[90px]"
            >
              <div className="absolute left-6 top-4 bottom-4 w-1 bg-blue-500 rounded-full"></div>

              <div className="flex-1 grid grid-cols-12 gap-4 items-center pl-10">
                {/* ID - 2/12 */}
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Thông báo ID
                  </p>
                  <p className="text-2xl font-bold text-gray-900 leading-none">
                    {item.id}
                  </p>
                </div>

                {/* Người nhận - 2/12 */}
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Người nhận
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.receiver_name === "Cư dân"
                      ? item.apartment_id
                      : item.receiver_name}
                  </p>
                </div>

                {/* Nội dung - 6/12 */}
                <div className="col-span-6">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Nội dung
                  </p>
                  <p
                    className="text-sm font-semibold text-gray-900 truncate pr-4"
                    title={item.content}
                  >
                    {item.content || "Nội dung thông báo"}
                  </p>
                </div>

                {/* Ngày gửi - 2/12 */}
                <div className="col-span-2 text-right">
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
              </div>

              {/* Actions */}
              <div className="ml-4 flex items-center">
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- PAGINATION CONTROLS --- */}
      {filteredList.length > 0 && (
        <div className="flex justify-center items-center mt-6 space-x-6 pb-8">
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
          <div className="bg-gray-400/80 backdrop-blur-sm text-white font-bold py-3 px-8 rounded-full flex items-center space-x-4 shadow-lg">
            <span className="text-lg">Trang</span>
            <div className="bg-gray-500/60 rounded-lg px-4 py-1 text-xl shadow-inner">
              {currentPage}
            </div>
            <span className="text-lg">/ {totalPages}</span>
          </div>
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

      {/* Modals */}
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
      <PreviewPdfModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        data={filteredList}
        onPrint={handlePrintPDF}
      />

      <StatusModal
        isOpen={statusModal.open}
        onClose={() => setStatusModal({ ...statusModal, open: false })}
      >
        <div className="flex flex-col items-center justify-center p-4">
          <img
            src={statusModal.type === "success" ? acceptIcon : notAcceptIcon}
            alt="Status"
            className="w-20 h-20 mb-4"
          />
          <h3 className="text-xl font-bold text-gray-800 text-center">
            {statusModal.message}
          </h3>
        </div>
      </StatusModal>
    </div>
  );
};

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
