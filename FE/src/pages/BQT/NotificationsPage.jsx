import React, { useState, useEffect, useRef, useMemo } from "react";
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
  // State phân trang cho Popup
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; // Yêu cầu: Tối đa 7 dòng/trang trong popup

  // Reset về trang 1 khi mở modal hoặc data thay đổi
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
    }
  }, [isOpen, data]);

  if (!isOpen) return null;

  // Logic phân trang
  const totalPages = Math.ceil(data.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  // Tính số dòng trống cần bù vào để bảng không bị co lại (giữ height cố định)
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
        {/* Header Modal */}
        <div className="p-6 border-b border-gray-200 flex justify-center relative">
          <h2 className="text-2xl font-bold text-gray-800">
            Danh sách thông báo
          </h2>
        </div>

        {/* Content Table Preview */}
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
                      {item.apartment_id || item.recipient}
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

          {/* Pagination Controls trong Popup */}
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

        {/* Footer Buttons */}
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

  const [apartments, setApartments] = useState([]); // State lưu danh sách căn hộ từ API

  const [singleFormData, setSingleFormData] = useState({
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
          // Giả sử API /residents trả về danh sách cư dân có chứa apartment_id
          // Hoặc có thể dùng API /apartments nếu có
          const response = await fetch(`${API_BASE_URL}/residents`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            // Lọc lấy danh sách mã căn hộ duy nhất
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
      if (notificationData) {
        setSingleFormData({
          receiver_name: notificationData.receiver_name || "Cư dân",
          apartment_id: notificationData.apartment_id || "",
          content: notificationData.content || "",
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
      setError("");
    }
  }, [isOpen, notificationData, setError]);

  const handleSingleChange = (e) => {
    const { name, value } = e.target;
    setSingleFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRowChange = (id, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        receiver_name: "Cư dân",
        apartment_id: "",
        content: "",
      },
    ]);
  };

  const removeRow = (id) => {
    if (rows.length > 1) {
      setRows((prev) => prev.filter((row) => row.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (isEditing) {
      // Validate
      if (
        singleFormData.receiver_name === "Cư dân" &&
        !singleFormData.apartment_id
      ) {
        setError("Vui lòng chọn Mã căn hộ cho cư dân.");
        return;
      }
      if (!singleFormData.content) {
        setError("Vui lòng điền nội dung.");
        return;
      }

      const dataToSend = {
        sender_name: "Ban quản trị",
        receiver_name: singleFormData.receiver_name,
        // Nếu không phải cư dân, apartment_id có thể để trống hoặc "All"
        apartment_id:
          singleFormData.receiver_name === "Cư dân"
            ? singleFormData.apartment_id
            : "All",
        content: singleFormData.content,
      };
      onSave(dataToSend, notificationData.id);
    } else {
      // Validate từng dòng
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row.receiver_name === "Cư dân" && !row.apartment_id) {
          setError(`Dòng ${i + 1}: Vui lòng chọn Mã căn hộ.`);
          return;
        }
        if (!row.content) {
          setError(`Dòng ${i + 1}: Vui lòng điền nội dung.`);
          return;
        }
      }

      const dataToSend = rows.map((row) => ({
        sender_name: "Ban quản trị",
        receiver_name: row.receiver_name,
        apartment_id: row.receiver_name === "Cư dân" ? row.apartment_id : "All",
        content: row.content,
      }));
      onSave(dataToSend, null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
      <div
        className={`bg-white p-6 rounded-2xl shadow-2xl relative flex flex-col ${
          isEditing ? "w-full max-w-md" : "w-full max-w-4xl"
        }`}
        style={{ maxHeight: "90vh" }}
      >
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {isEditing ? "Chỉnh sửa thông báo" : "Thêm thông báo mới"}
        </h2>
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {!isEditing && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="overflow-y-auto custom-scrollbar border border-gray-200 rounded-lg flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-3 text-xs font-bold text-gray-600 uppercase border-b w-[20%]">
                      Người nhận
                    </th>
                    <th className="p-3 text-xs font-bold text-gray-600 uppercase border-b w-[20%]">
                      Mã căn hộ
                    </th>
                    <th className="p-3 text-xs font-bold text-gray-600 uppercase border-b w-[50%]">
                      Nội dung
                    </th>
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
                    <tr
                      key={row.id}
                      className="hover:bg-blue-50 transition-colors group"
                    >
                      {/* Cột 1: Loại người nhận */}
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
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Cư dân">Cư dân</option>
                          <option value="Kế toán">Kế toán</option>
                          <option value="Công an">Công an</option>
                          <option value="Tất cả">Tất cả</option>
                        </select>
                      </td>

                      {/* Cột 2: Mã căn hộ (Select Box từ API) */}
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
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">--Chọn--</option>
                            {apartments.map((apt) => (
                              <option key={apt} value={apt}>
                                {apt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-gray-400 italic text-sm p-2 block text-center">
                            ---
                          </span>
                        )}
                      </td>

                      {/* Cột 3: Nội dung */}
                      <td className="p-2 align-top">
                        <textarea
                          rows={1}
                          value={row.content}
                          onChange={(e) =>
                            handleRowChange(row.id, "content", e.target.value)
                          }
                          placeholder="Nội dung..."
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
                          style={{ minHeight: "38px" }}
                          onInput={(e) => {
                            e.target.style.height = "auto";
                            e.target.style.height =
                              e.target.scrollHeight + "px";
                          }}
                        />
                      </td>

                      {/* Cột 4: Xóa */}
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

        {isEditing && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Thông báo ID
              </label>
              <div className="w-full bg-gray-100 rounded-md border border-gray-200 px-3 py-2 text-gray-700 font-mono text-sm">
                {notificationData.id}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Người nhận
              </label>
              <select
                name="receiver_name"
                value={singleFormData.receiver_name}
                onChange={handleSingleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none mb-2"
              >
                <option value="Cư dân">Cư dân</option>
                <option value="Kế toán">Kế toán</option>
                <option value="Công an">Công an</option>
                <option value="Tất cả">Tất cả</option>
              </select>

              {singleFormData.receiver_name === "Cư dân" && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã căn hộ
                  </label>
                  <select
                    name="apartment_id"
                    value={singleFormData.apartment_id}
                    onChange={handleSingleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nội dung
              </label>
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

// --- COMPONENT ITEM THÔNG BÁO (ĐÃ CẬP NHẬT LAYOUT) ---
const NotificationItem = ({
  item,
  isDeleteMode,
  onEditClick,
  isSelected,
  onToggleSelect,
}) => {
  const handleEditClick = () => {
    if (!isDeleteMode) onEditClick(item);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 flex items-center relative overflow-hidden mb-4 min-h-[80px]">
      <div className="absolute left-4 top-3 bottom-3 w-1.5 bg-blue-500 rounded-full"></div>

      {/* Grid 12 cột */}
      <div className="flex-1 grid grid-cols-12 gap-4 items-center pl-8 pr-4 text-gray-800">
        {/* Cột 1: ID - Chiếm 1/12 */}
        <div className="col-span-1 text-center border-r border-gray-100 pr-2">
          <p className="text-[10px] text-gray-400 mb-1 uppercase font-bold tracking-wider">
            ID
          </p>
          <p className="font-bold text-lg text-blue-600">{item.id}</p>
        </div>

        {/* Cột 2: Người nhận - Chiếm 2/12 */}
        <div className="col-span-2">
          <p className="text-[10px] text-gray-400 mb-1 uppercase font-bold tracking-wider">
            Người nhận
          </p>
          <div className="flex flex-col">
            <span className="font-bold text-gray-800">
              {item.receiver_name}
            </span>
            {item.apartment_id && item.apartment_id !== "All" && (
              <span className="text-xs text-gray-500">
                ({item.apartment_id})
              </span>
            )}
          </div>
        </div>

        {/* Cột 3: Nội dung - Chiếm 7/12 (Diện tích lớn nhất) */}
        <div className="col-span-7 pl-2 border-l border-r border-gray-100">
          <p className="text-[10px] text-gray-400 mb-1 uppercase font-bold tracking-wider">
            Nội dung
          </p>
          <p
            title={item.content}
            className="text-gray-700 text-sm font-medium line-clamp-2 leading-relaxed"
          >
            {item.content}
          </p>
        </div>

        {/* Cột 4: Ngày gửi - Chiếm 2/12 */}
        <div className="col-span-2 pl-2">
          <p className="text-[10px] text-gray-400 mb-1 uppercase font-bold tracking-wider">
            Ngày gửi
          </p>
          <p className="font-medium text-gray-900 text-sm">
            {item.notification_date
              ? new Date(item.notification_date).toLocaleDateString("vi-VN")
              : "---"}
          </p>
        </div>
      </div>

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [formError, setFormError] = useState("");

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // --- PREVIEW PDF STATE ---
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- REF INPUT FILE ---
  const fileInputRef = useRef(null);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredNotifications = notifications.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = removeVietnameseTones(searchTerm.trim());
    const idMatch = String(item.id).toLowerCase().includes(term);
    const recipientMatch = removeVietnameseTones(
      item.apartment_id || item.recipient || ""
    ).includes(term);
    return idMatch || recipientMatch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNotifications = filteredNotifications.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleAddClick = () => {
    setEditingNotification(null);
    setIsModalOpen(true);
    setFormError("");
  };

  const handleEditClick = (notification) => {
    setEditingNotification(notification);
    setIsModalOpen(true);
    setFormError("");
  };

  const handleSave = async (data, notificationId) => {
    try {
      const token = getToken();
      if (notificationId) {
        const response = await fetch(
          `${API_BASE_URL}/notifications/${notificationId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          }
        );
        if (!response.ok) throw new Error("Lỗi cập nhật.");
        setModalStatus("editSuccess");
        setStatusMessage("Chỉnh sửa thông báo thành công!");
        setIsModalOpen(false);
      } else {
        const itemsToCreate = Array.isArray(data) ? data : [data];
        await Promise.all(
          itemsToCreate.map((item) =>
            fetch(`${API_BASE_URL}/notifications`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(item),
            }).then((res) => {
              if (!res.ok) throw new Error("Lỗi tạo thông báo");
              return res;
            })
          )
        );
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
    if (selectedIds.length > 0) setShowConfirmModal(true);
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
        selectedIds.map((id) =>
          fetch(`${API_BASE_URL}/notifications/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => {
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

        // Tìm header
        worksheet.eachRow((row, rowNumber) => {
          if (Object.keys(colMap).length > 0) return;
          const rowValues = row.values;
          if (Array.isArray(rowValues)) {
            const normalizedCells = rowValues.map((v) =>
              v ? String(v).trim().toLowerCase() : ""
            );
            const idxRecipient = normalizedCells.findIndex(
              (v) => v === "người nhận" || v === "căn hộ"
            );
            const idxContent = normalizedCells.findIndex(
              (v) => v === "nội dung"
            );
            const idxDate = normalizedCells.findIndex((v) => v === "ngày gửi");

            if (idxRecipient !== -1 && idxContent !== -1) {
              headerRowNumber = rowNumber;
              colMap = {
                recipient: idxRecipient,
                content: idxContent,
                date: idxDate,
              };
            }
          }
        });

        if (Object.keys(colMap).length === 0) {
          throw new Error(
            "Không tìm thấy cột 'Người nhận' và 'Nội dung' trong file Excel."
          );
        }

        // TÍNH TOÁN ID TỰ ĐỘNG (Dựa trên Max ID hiện tại)
        let maxId = notifications.reduce(
          (max, item) => Math.max(max, Number(item.id) || 0),
          0
        );

        let successCount = 0;
        let failCount = 0;

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > headerRowNumber) {
            const rowValues = row.values;
            const recipient = rowValues[colMap.recipient]
              ? String(rowValues[colMap.recipient]).trim()
              : "";
            const content = rowValues[colMap.content]
              ? String(rowValues[colMap.content]).trim()
              : "";

            // Xử lý ngày: Excel có thể trả về object Date hoặc string
            let notiDate = null;
            if (colMap.date !== -1 && rowValues[colMap.date]) {
              notiDate = rowValues[colMap.date];
            }

            if (recipient && content) {
              maxId++; // Tăng ID lên 1
              dataToImport.push({
                id: maxId, // Gán ID tự tăng
                apartment_id: recipient,
                content: content,
                notification_date: notiDate,
              });
            } else {
              failCount++; // Dữ liệu thiếu thì tính là thất bại
            }
          }
        });

        // Call API Create
        const token = getToken();
        await Promise.all(
          dataToImport.map((item) =>
            fetch(`${API_BASE_URL}/notifications`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(item),
            })
              .then((res) => {
                if (res.ok) successCount++;
                else failCount++;
              })
              .catch(() => {
                failCount++;
              })
          )
        );

        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchNotifications();

        // --- CẬP NHẬT TRẠNG THÁI ---
        if (failCount === 0 && successCount > 0) {
          setModalStatus("addSuccess");
          setStatusMessage(
            `Đã nhập thành công ${successCount} thông báo từ Excel!`
          );
        } else if (successCount > 0 && failCount > 0) {
          setModalStatus("addSuccess"); // Vẫn hiện icon success nhưng báo chi tiết
          setStatusMessage(
            `Nhập hoàn tất:\n- Thành công: ${successCount}\n- Thất bại: ${failCount}`
          );
        } else {
          setModalStatus("addFailure");
          setStatusMessage(`Nhập thất bại toàn bộ (${failCount} dòng lỗi).`);
        }

        setIsStatusModalOpen(true);
      } catch (err) {
        console.error("Excel Import Error:", err);
        setModalStatus("addFailure");
        setStatusMessage(`Lỗi nhập file: ${err.message}`);
        setIsStatusModalOpen(true);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // --- LOGIC XUẤT PDF (PRINT) ---
  const handleExportClick = () => {
    // Chỉ mở popup preview
    setShowPreviewModal(true);
  };

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

        // === TITLE ===
        doc.setFontSize(18);
        doc.text("Danh sách thông báo chung cư Blue Moon", 105, 15, {
          align: "center",
        });

        // === INFO LINE ===
        const today = new Date().toLocaleDateString("vi-VN");
        const currentUser = getCurrentUserEmail();

        doc.setFontSize(11);
        doc.setFont("Roboto", "normal");
        doc.text(`Ngày in: ${today}`, 14, 25);
        doc.text(`Người in: ${currentUser}`, 196, 25, { align: "right" });

        // === TABLE ===
        const tableColumn = [
          "Mã số thông báo",
          "Người nhận",
          "Nội dung",
          "Ngày gửi",
        ];
        const tableRows = [];

        // Xuất toàn bộ dữ liệu đang có (hoặc đã lọc)
        filteredNotifications.forEach((item) => {
          const rowData = [
            String(item.id),
            (item.apartment_id || item.recipient || "").normalize("NFC"),
            (item.content || "").normalize("NFC"),
            item.notification_date
              ? new Date(item.notification_date).toLocaleDateString("vi-VN")
              : "",
          ];
          tableRows.push(rowData);
        });

        // Cấu hình table phân trang 20 dòng
        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 30,
          styles: { font: "Roboto", fontStyle: "normal", fontSize: 10 },
          headStyles: {
            fillColor: [220, 220, 220],
            textColor: 20,
            fontStyle: "normal", // <--- FIX LỖI FONT HEADER (chuyển từ bold sang normal)
          },
          theme: "grid",
          rowPageBreak: "avoid",
          margin: { top: 30 },
          didDrawPage: (data) => {},
        });

        doc.save("danh_sach_thong_bao.pdf");
        setShowPreviewModal(false); // Đóng preview sau khi in

        // --- CẬP NHẬT TRẠNG THÁI XUẤT ---
        setModalStatus("addSuccess"); // Dùng chung icon success
        setStatusMessage(
          `Xuất thành công ${filteredNotifications.length} thông báo ra file PDF!`
        );
        setIsStatusModalOpen(true);
      };
    } catch (err) {
      console.error("PDF Export Error:", err);
      setModalStatus("addFailure");
      setStatusMessage("Lỗi xuất PDF: " + err.message);
      setIsStatusModalOpen(true);
    }
  };

  const renderStatusModalContent = () => {
    if (!modalStatus) return null;
    // Check keyword để chọn icon (bao gồm cả trạng thái update từ logic Import)
    const isSuccess = modalStatus.toLowerCase().includes("success");
    const icon = isSuccess ? acceptIcon : notAcceptIcon;
    return (
      <div className="flex flex-col items-center">
        <img src={icon} alt={modalStatus} className="w-20 h-20 mb-6" />
        <p className="text-xl font-semibold text-center text-gray-800 whitespace-pre-line">
          {statusMessage}
        </p>
      </div>
    );
  };

  if (isLoading)
    return <div className="text-white text-lg p-4">Đang tải thông báo...</div>;
  if (error)
    return (
      <div className="text-red-400 text-lg p-4">Lỗi tải dữ liệu: {error}</div>
    );

  return (
    <div>
      {/* Search Bar */}
      <div className="flex justify-start items-center mb-6">
        <div className="relative w-full max-w-md">
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
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 flex items-center space-x-2"
              >
                <FiUpload size={18} />
                <span>Nhập thông báo</span>
              </button>

              <button
                onClick={handleExportClick}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 flex items-center space-x-2"
              >
                <FiPrinter size={18} />
                <span>Xuất thông báo</span>
              </button>

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
        {currentNotifications.length === 0 ? (
          <div className="bg-white p-6 rounded-lg text-center text-gray-500">
            Không có thông báo nào phù hợp với tìm kiếm.
          </div>
        ) : (
          currentNotifications.map((item) => (
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

      {/* --- PAGINATION CONTROLS --- */}
      {filteredNotifications.length > 0 && (
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

      {/* Preview PDF Modal */}
      <PreviewPdfModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        data={filteredNotifications}
        onPrint={handlePrintPDF}
      />
    </div>
  );
};
