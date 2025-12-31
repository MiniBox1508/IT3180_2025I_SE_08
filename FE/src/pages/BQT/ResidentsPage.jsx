import React, { useState, useEffect, useRef } from "react";
import { ConfirmationModal } from "../../layouts/ConfirmationModal";
import { StatusModal } from "../../layouts/StatusModal";
import acceptIcon from "../../images/accept_icon.png";
import notAcceptIcon from "../../images/not_accept_icon.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
// --- THƯ VIỆN CHO EXCEL ---
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import arrowLeft from "../../images/Arrow_Left_Mini_Circle.png";
import arrowRight from "../../images/Arrow_Right_Mini_Circle.png";

const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

// --- VALIDATION HELPERS ---
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPhone = (phone) => {
  return /^\d{10,11}$/.test(phone);
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

// --- COMPONENT MODAL FORM ---
const ResidentFormModal = ({
  isOpen,
  onClose,
  residentData,
  onSave,
  isViewing = false,
}) => {
  const isEditing = !!residentData && !isViewing;

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    apartment_id: "",
    email: "",
    role: "Cư dân",
    residency_status: "chủ hộ",
    cccd: "",
    birth_date: "",
    state: "active",
    password: "",
    ...(residentData || {}),
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (residentData) {
      setFormData({
        ...residentData,
        birth_date: residentData.birth_date
          ? new Date(residentData.birth_date).toISOString().split("T")[0]
          : "",
        password: "",
      });
    } else {
      setFormData({
        first_name: "",
        last_name: "",
        phone: "",
        apartment_id: "",
        email: "",
        role: "Cư dân",
        residency_status: "người thuê",
        cccd: "",
        birth_date: "",
        state: "active",
        password: "",
      });
    }
    setError("");
  }, [residentData, isOpen, isViewing]);

  const handleChange = (e) => {
    if (isViewing) return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewing) return;
    setError("");

    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.phone ||
      !formData.apartment_id
    ) {
      setError("Vui lòng điền đủ Họ, Tên, Số điện thoại và Mã căn hộ.");
      return;
    }
    if (!isValidPhone(formData.phone)) {
      setError("Số điện thoại không hợp lệ (Phải là 10-11 chữ số).");
      return;
    }
    if (formData.email && !isValidEmail(formData.email)) {
      setError("Định dạng Email không hợp lệ.");
      return;
    }

    const url = isEditing
      ? `${API_BASE_URL}/residents/${formData.id}`
      : `${API_BASE_URL}/residents`;
    const method = isEditing ? "PUT" : "POST";

    let submitData = { ...formData };

    if (isEditing && !formData.password) {
      delete submitData.password;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || `Lỗi ${isEditing ? "cập nhật" : "thêm mới"} cư dân.`
        );
      }

      onSave(result);
      onClose();
    } catch (err) {
      console.error("API Error:", err);
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  const modalTitle = isViewing
    ? "Chi tiết Người dùng"
    : isEditing
    ? "Chỉnh sửa Người dùng"
    : "Thêm Người dùng mới";

  return (
    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl text-gray-900">
        <h2 className="text-xl font-bold mb-4">{modalTitle}</h2>
        {error && !isViewing && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-2 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <InputGroup
            label="Tên"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
            readOnly={isViewing}
          />
          <InputGroup
            label="Họ"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
            readOnly={isViewing}
          />
          <InputGroup
            label="Số điện thoại"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required
            readOnly={isViewing}
          />
          <InputGroup
            label="Mã căn hộ"
            name="apartment_id"
            value={formData.apartment_id}
            onChange={handleChange}
            required
            readOnly={isViewing}
          />
          <InputGroup
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            readOnly={isViewing}
          />
          <InputGroup
            label="CCCD"
            name="cccd"
            value={formData.cccd}
            onChange={handleChange}
            readOnly={isViewing}
          />
          <InputGroup
            label="Ngày sinh"
            name="birth_date"
            type="date"
            value={formData.birth_date}
            onChange={handleChange}
            readOnly={isViewing}
          />
          <SelectGroup
            label="Trạng thái cư trú"
            name="residency_status"
            value={formData.residency_status}
            onChange={handleChange}
            options={["chủ hộ", "người thuê", "khách tạm trú"]}
            disabled={isViewing}
          />
          <SelectGroup
            label="Vai trò"
            name="role"
            value={formData.role}
            onChange={handleChange}
            options={["Quản lý", "Cư dân", "Kế toán", "Công an"]}
            disabled={isViewing}
          />
          <SelectGroup
            label="Trạng thái"
            name="state"
            value={formData.state}
            onChange={handleChange}
            options={["active", "inactive"]}
            disabled={isViewing || !isEditing}
          />

          {!isViewing && (
            <InputGroup
              label="Mật khẩu"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required={!isEditing}
              readOnly={false}
              placeholder={
                isEditing ? "Để trống nếu giữ mật khẩu cũ" : "Nhập mật khẩu..."
              }
            />
          )}

          <div className="col-span-2 flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition-colors"
            >
              {isViewing ? "Đóng" : "Hủy"}
            </button>
            {!isViewing && (
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                {isEditing ? "Lưu Thay Đổi" : "Thêm Mới"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// --- COMPONENT INPUT GROUP ---
const InputGroup = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  readOnly = false,
  placeholder = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = name === "password";

  return (
    <div className="flex flex-col relative">
      <label className="mb-1 text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={isPasswordField && showPassword ? "text" : type}
          name={name}
          value={value || ""}
          onChange={onChange}
          required={required && !readOnly}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`w-full p-2 border border-gray-300 rounded text-sm focus:outline-none ${
            readOnly
              ? "bg-gray-100 text-gray-600 cursor-default"
              : "bg-white text-gray-900 focus:border-blue-500"
          } ${isPasswordField ? "pr-10" : ""}`}
        />

        {isPasswordField && !readOnly && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

const SelectGroup = ({
  label,
  name,
  value,
  onChange,
  options,
  disabled = false,
}) => (
  <div className="flex flex-col">
    <label className="mb-1 text-sm font-medium text-gray-700">{label}</label>
    <select
      name={name}
      value={value || ""}
      onChange={onChange}
      disabled={disabled}
      className={`p-2 border border-gray-300 rounded text-sm focus:outline-none ${
        disabled
          ? "bg-gray-100 text-gray-600 cursor-default"
          : "bg-white text-gray-900 focus:border-blue-500"
      }`}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

// --- MAIN PAGE ---
export const ResidentsPage = () => {
  const [residents, setResidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingResident, setViewingResident] = useState(null);

  // Delete States
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [residentToDelete, setResidentToDelete] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  // Status Modal
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  // --- STATE PHÂN TRANG (MỚI) ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Số lượng ô dữ liệu / 1 trang

  // Reference cho input file
  const fileInputRef = useRef(null);

  const getToken = () => localStorage.getItem("token");

  const fetchResidents = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/residents`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!response.ok) throw new Error("Failed to fetch residents");
      const data = await response.json();
      setResidents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  // --- RESET TRANG KHI TÌM KIẾM ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // --- LOGIC TÌM KIẾM ---
  const filteredResidents = residents.filter((resident) => {
    if (!searchTerm.trim()) {
      return true;
    }
    const term = removeVietnameseTones(searchTerm.trim());
    const idMatch = String(resident.id).toLowerCase().includes(term);
    const nameMatch = removeVietnameseTones(resident.full_name || "").includes(
      term
    );
    // Logic mới: Tìm kiếm theo mã căn hộ
    const apartmentMatch = removeVietnameseTones(
      resident.apartment_id || ""
    ).includes(term);

    return idMatch || nameMatch || apartmentMatch;
  });

  // --- LOGIC CẮT DỮ LIỆU ĐỂ HIỂN THỊ (PAGINATION) ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentResidents = filteredResidents.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredResidents.length / itemsPerPage);

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

  // Handlers
  const handleAddClick = () => {
    setEditingResident(null);
    setIsModalOpen(true);
  };
  const handleEditClick = (resident) => {
    setEditingResident(resident);
    setIsModalOpen(true);
  };
  const handleSave = () => {
    fetchResidents();
  };
  const handleViewClick = (resident) => {
    setViewingResident(resident);
    setIsViewModalOpen(true);
  };

  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    setResidentToDelete(null);
    setSelectedIds([]);
  };

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleDeleteClick = (resident) => {
    setResidentToDelete(resident);
    setIsConfirmModalOpen(true);
  };

  const handleDeleteSelectedClick = () => {
    if (selectedIds.length > 0) setIsConfirmModalOpen(true);
  };

  const handleCloseStatusModal = () => {
    setIsStatusModalOpen(false);
    setModalStatus(null);
    setStatusMessage("");
  };

  // --- LOGIC XUẤT FILE EXCEL ---
  const handleExport = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Residents");

      // Định nghĩa cột
      worksheet.columns = [
        { header: "Tên", key: "first_name", width: 15 },
        { header: "Họ", key: "last_name", width: 15 },
        { header: "Số điện thoại", key: "phone", width: 15 },
        { header: "Mã căn hộ", key: "apartment_id", width: 15 },
        { header: "Mật khẩu", key: "password", width: 15 }, // Để trống khi xuất
        { header: "Email", key: "email", width: 25 },
        { header: "CCCD", key: "cccd", width: 20 },
        { header: "Ngày sinh", key: "birth_date", width: 15 },
        { header: "Trạng thái cư trú", key: "residency_status", width: 20 },
        { header: "Vai trò", key: "role", width: 15 },
        { header: "Trạng thái", key: "state", width: 15 },
      ];

      // Thêm dữ liệu (Xuất TOÀN BỘ danh sách hiện có, không phải chỉ trang hiện tại)
      residents.forEach((res) => {
        worksheet.addRow({
          first_name: res.first_name,
          last_name: res.last_name,
          phone: res.phone,
          apartment_id: res.apartment_id,
          password: "",
          email: res.email || "",
          cccd: res.cccd || "",
          birth_date: res.birth_date
            ? new Date(res.birth_date).toISOString().split("T")[0]
            : "",
          residency_status: res.residency_status || "chủ hộ",
          role: res.role || "Cư dân",
          state: res.state || "active",
        });
      });

      // Tạo style cho header
      worksheet.getRow(1).font = { bold: true };

      // Xuất file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "DANH_SACH_NGUOI_DUNG_BQT_BLUEMOON.xlsx");

      setModalStatus("success");
      setStatusMessage("Xuất dữ liệu người dùng thành công!");
      setIsStatusModalOpen(true);
    } catch (err) {
      console.error("Export Error:", err);
      setModalStatus("failure");
      setStatusMessage("Xuất dữ liệu thất bại.");
      setIsStatusModalOpen(true);
    }
  };

  // --- LOGIC NHẬP FILE EXCEL ---
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
        const worksheet = workbook.getWorksheet(1); // Lấy sheet đầu tiên

        const dataToImport = [];
        let successCount = 0;
        let failCount = 0;

        // Đọc từng dòng (bỏ qua header dòng 1)
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) {
            const rowData = {
              first_name: row.getCell(1).text,
              last_name: row.getCell(2).text,
              phone: row.getCell(3).text,
              apartment_id: row.getCell(4).text,
              password: row.getCell(5).text, // Bắt buộc khi import
              email: row.getCell(6).text,
              cccd: row.getCell(7).text,
              birth_date: row.getCell(8).value
                ? new Date(row.getCell(8).value).toISOString().split("T")[0]
                : "",
              residency_status: row.getCell(9).text || "chủ hộ",
              role: row.getCell(10).text || "Cư dân",
              state: row.getCell(11).text || "active",
            };
            dataToImport.push(rowData);
          }
        });

        const token = getToken();
        await Promise.all(
          dataToImport.map(async (userData) => {
            if (
              !userData.first_name ||
              !userData.last_name ||
              !userData.phone ||
              !userData.apartment_id ||
              !userData.password
            ) {
              failCount++;
              return;
            }

            try {
              const res = await fetch(`${API_BASE_URL}/residents`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(userData),
              });

              if (res.ok) {
                successCount++;
              } else {
                failCount++;
              }
            } catch (err) {
              failCount++;
            }
          })
        );

        if (fileInputRef.current) fileInputRef.current.value = "";

        fetchResidents();
        setModalStatus("success");
        setStatusMessage(
          `Nhập dữ liệu hoàn tất:\nThành công: ${successCount}\nThất bại: ${failCount}`
        );
        setIsStatusModalOpen(true);
      } catch (err) {
        console.error("Import Error:", err);
        setModalStatus("failure");
        setStatusMessage("Lỗi đọc file Excel.");
        setIsStatusModalOpen(true);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const confirmDelete = async () => {
    const idsToDelete =
      selectedIds.length > 0
        ? selectedIds
        : residentToDelete
        ? [residentToDelete.id]
        : [];

    if (idsToDelete.length === 0) {
      setIsConfirmModalOpen(false);
      return;
    }

    setIsConfirmModalOpen(false);

    try {
      const token = getToken();

      await Promise.all(
        idsToDelete.map((id) =>
          fetch(`${API_BASE_URL}/residents/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).then((res) => {
            if (!res.ok) throw new Error(`Failed to delete resident ${id}`);
            return res;
          })
        )
      );

      fetchResidents();
      setModalStatus("success");
      setStatusMessage(
        idsToDelete.length > 1
          ? `Đã xóa ${idsToDelete.length} cư dân.`
          : "Xóa cư dân thành công."
      );
    } catch (err) {
      console.error("Delete Error:", err);
      setModalStatus("failure");
      setStatusMessage("Xóa thất bại. Vui lòng kiểm tra quyền hạn.");
    } finally {
      setResidentToDelete(null);
      setSelectedIds([]);
      setIsStatusModalOpen(true);
    }
  };

  const renderStatusModalContent = () => {
    if (!modalStatus) return null;
    const isSuccess = modalStatus === "success";
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
    return (
      <div className="p-8 text-white text-lg bg-blue-700 min-h-screen">
        Đang tải...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-red-100 text-lg bg-blue-700 min-h-screen">
        Lỗi: {error}
      </div>
    );

  return (
    <div className="flex-1 p-8 bg-blue-700 min-h-screen text-white">
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
            placeholder="Tìm theo ID, Họ tên hoặc Mã căn hộ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none"
          />
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-6">Thông tin người dùng</h1>

      <div className="flex justify-end gap-4 mb-8">
        {!isDeleteMode ? (
          <>
            <input
              type="file"
              accept=".xlsx, .xls"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <button
              onClick={handleImportClick}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Nhập người dùng
            </button>
            <button
              onClick={handleExport}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Xuất người dùng
            </button>

            <button
              onClick={handleAddClick}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Thêm người dùng
            </button>
            <button
              onClick={toggleDeleteMode}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Xóa người dùng
            </button>
          </>
        ) : (
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

      <div className="space-y-4">
        {/* Render danh sách đã được cắt (Pagination) */}
        {currentResidents.length === 0 ? (
          <div className="bg-white p-6 rounded-lg text-center text-gray-500">
            Không tìm thấy cư dân nào.
          </div>
        ) : (
          currentResidents.map((resident) => (
            <div
              key={resident.id}
              className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4 text-gray-900 relative"
            >
              {isDeleteMode && (
                <div className="flex items-center h-full">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(resident.id)}
                    onChange={() => handleSelect(resident.id)}
                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
              )}
              <div className="bg-gray-100 p-3 rounded-full flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="flex-grow grid grid-cols-5 gap-x-4 items-center text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs mb-1">Họ và tên</span>
                  <span
                    className="font-semibold truncate"
                    title={resident.full_name}
                  >
                    {resident.full_name}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs mb-1">Mã căn hộ</span>
                  <span className="font-semibold">{resident.apartment_id}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs mb-1">Ngày sinh</span>
                  <span className="font-semibold">
                    {resident.birth_date
                      ? new Date(resident.birth_date).toLocaleDateString(
                          "vi-VN"
                        )
                      : "--/--/----"}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs mb-1">Trạng thái</span>
                  <span
                    className={`font-semibold ${
                      resident.state === "active"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {resident.state === "active" ? "Hoạt động" : "Vô hiệu hóa"}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs mb-1">Chi tiết</span>
                  <button
                    onClick={() => handleViewClick(resident)}
                    className={`text-blue-500 hover:underline text-left font-semibold ${
                      isDeleteMode ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    Xem thêm
                  </button>
                </div>
              </div>

              {isDeleteMode ? (
                <button
                  onClick={() => handleDeleteClick(resident)}
                  className="text-gray-400 hover:text-red-500 p-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
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
              ) : (
                <button
                  onClick={() => handleEditClick(resident)}
                  className="text-blue-500 hover:text-blue-700 font-semibold text-sm bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition-colors"
                >
                  Chỉnh sửa
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* --- PAGINATION CONTROLS --- */}
      {filteredResidents.length > 0 && (
        <div className="flex justify-center items-center mt-6 space-x-6">
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

      <ResidentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        residentData={editingResident}
        onSave={handleSave}
        isViewing={false}
      />
      <ResidentFormModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        residentData={viewingResident}
        onSave={() => {}}
        isViewing={true}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDelete}
        title="Xác nhận Xóa"
        message={
          selectedIds.length > 0
            ? `Bạn có chắc chắn muốn xóa ${selectedIds.length} cư dân đã chọn?`
            : residentToDelete
            ? `Bạn có chắc chắn muốn xóa cư dân "${residentToDelete.full_name}"?`
            : ""
        }
      />

      <StatusModal isOpen={isStatusModalOpen} onClose={handleCloseStatusModal}>
        {renderStatusModalContent()}
      </StatusModal>
    </div>
  );
};
