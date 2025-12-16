import React, { useState } from "react";
// --- 1. IMPORT MODAL VÀ ICONS ---
import { StatusModal } from "../../layouts/StatusModal";
import EditButtonImage from "../../images/edit_button.svg"; // Icon bút chì
import acceptIcon from "../../images/accept_icon.png";
import notAcceptIcon from "../../images/not_accept_icon.png";

// --- CẤU HÌNH API URL ---
// Dựa trên allowedOrigins trong app.js, backend của bạn nằm ở đây:
const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

// --- Icons ---
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-10 h-10"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
    />
  </svg>
);

// --- EditableField Component ---
const EditableField = ({
  label,
  value,
  isEditing,
  onChange,
  name,
  type = "text",
}) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-500 mb-1"
    >
      {label}
    </label>
    {isEditing ? (
      <input
        type={type}
        id={name}
        name={name}
        value={value || ""} // Xử lý trường hợp null/undefined
        onChange={onChange}
        className="w-full bg-white rounded-lg border border-gray-300 px-4 py-3 text-gray-900 min-h-[46px] focus:border-blue-500 focus:ring-blue-500"
      />
    ) : (
      <div className="w-full bg-gray-50 rounded-lg border border-gray-200 px-4 py-3 text-gray-900 min-h-[46px] flex items-center">
        {value || "Chưa cập nhật"}
      </div>
    )}
  </div>
);

// --- Dữ liệu mặc định (Fallback) ---
const initialUserData = {
  name: "Kế toán Đoàn Văn B",
  residentId: "0003",
  role: "Kế toán",
  apartment: "Tầng 7 - Phòng 714",
  cccd: "077204000124",
  dob: "1999-10-30",
  email: "dovanb@gmail.com",
  phone: "0938099203",
  status: "người thuê",
};

// --- Main Component ---
export const AccountantProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);

  // --- LẤY USER TỪ LOCALSTORAGE ---
  const getUserFromStorage = () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  };

  const user = getUserFromStorage();

  // Logic lấy ID hiển thị (residentId) và ID thực tế (userId để gọi API)
  let displayId = initialUserData.residentId;
  let apiId = null;

  if (user) {
    apiId = user.id; // ID dùng để gọi API (Backend yêu cầu /residents/:id)
    if (user.resident_code) displayId = user.resident_code;
    else if (user.id) displayId = user.id;
  }

  // Khởi tạo state từ localStorage hoặc fallback
  const initialData = {
    ...initialUserData,
    ...(user
      ? {
          residentId: displayId,
          name: user.full_name || initialUserData.name,
          role: user.role || initialUserData.role,
          apartment: user.apartment_id || initialUserData.apartment,
          cccd: user.cccd || initialUserData.cccd,
          // Backend trả về birth_date, Frontend dùng dob
          dob: user.birth_date
            ? user.birth_date.split("T")[0]
            : initialUserData.dob,
          email: user.email || initialUserData.email,
          phone: user.phone || initialUserData.phone,
          // Backend trả về residency_status, Frontend dùng status
          status: user.residency_status || initialUserData.status,
        }
      : {}),
  };

  const [formData, setFormData] = useState(initialData);
  const [originalData, setOriginalData] = useState(initialData);

  // --- STATE MODAL ---
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  const handleEditClick = () => {
    setOriginalData(formData);
    setIsEditing(true);
  };

  const cancelEditClick = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const getToken = () => localStorage.getItem("token");

  // --- XỬ LÝ SUBMIT (QUAN TRỌNG: Đã chỉnh sửa để khớp Backend) ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!apiId) {
      setModalStatus("failure");
      setStatusMessage("Không tìm thấy ID người dùng. Vui lòng đăng nhập lại!");
      setIsStatusModalOpen(true);
      return;
    }

    // Chuẩn bị payload khớp với keys mà Backend mong đợi (app.put("/residents/:id"))
    const payload = {
      // Backend nhận: phone, apartment_id, cccd, birth_date, email, role, residency_status
      phone: formData.phone,
      email: formData.email,
      cccd: formData.cccd,
      birth_date: formData.dob, // Map từ dob -> birth_date
      apartment_id: formData.apartment, // Map từ apartment -> apartment_id
      role: formData.role,
      residency_status: formData.status, // Map từ status -> residency_status
    };

    console.log("Sending payload to Backend:", payload);

    try {
      const token = getToken();
      // Gọi đúng endpoint: /residents/:id
      const response = await fetch(`${API_BASE_URL}/residents/${apiId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setModalStatus("success");
        setStatusMessage("Cập nhật thông tin thành công!");
        setIsEditing(false);
        setOriginalData(formData);

        // Cập nhật lại localStorage để đồng bộ dữ liệu
        if (user) {
          const updatedUser = {
            ...user,
            phone: payload.phone,
            email: payload.email,
            cccd: payload.cccd,
            birth_date: payload.birth_date,
            apartment_id: payload.apartment_id,
            residency_status: payload.residency_status,
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      } else {
        setModalStatus("failure");
        setStatusMessage(result.error || "Cập nhật thất bại!");
      }
    } catch (err) {
      console.error("Error:", err);
      setModalStatus("failure");
      setStatusMessage("Lỗi kết nối đến máy chủ!");
    }
    setIsStatusModalOpen(true);
  };

  const handleCloseStatusModal = () => {
    setIsStatusModalOpen(false);
    setModalStatus(null);
    setStatusMessage("");
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

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 w-full max-w-6xl mx-auto relative">
      {/* Nút Edit (Icon bút chì) - Chỉ hiện khi KHÔNG phải chế độ edit */}
      {!isEditing && (
        <button
          onClick={handleEditClick}
          className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Chỉnh sửa thông tin"
        >
          <img src={EditButtonImage} alt="Edit" className="w-6 h-6" />
        </button>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Thông tin cá nhân
        </h1>
      </div>

      {/* Avatar & Name */}
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 flex-shrink-0">
          <UserIcon />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{formData.name}</h2>
          <p className="text-sm text-gray-600">
            ID Kế toán: {formData.residentId}
          </p>
        </div>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Section 1: Thông tin cá nhân */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Thông tin cá nhân
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {/* Các trường thường không đổi hoặc admin mới đổi được -> isEditing=false */}
            <EditableField
              label="Vai trò"
              name="role"
              value={formData.role}
              isEditing={false}
              onChange={handleChange}
            />
            <EditableField
              label="Số căn hộ"
              name="apartment"
              value={formData.apartment}
              isEditing={false}
              onChange={handleChange}
            />
            {/* Các trường cho phép sửa */}
            <EditableField
              label="Số CCCD"
              name="cccd"
              value={formData.cccd}
              isEditing={isEditing}
              onChange={handleChange}
            />
            <EditableField
              label="Ngày sinh"
              name="dob"
              type="date" // Đặt type date để hiển thị lịch chọn
              value={formData.dob}
              isEditing={isEditing}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Section 2: Thông tin liên hệ */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Thông tin liên hệ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <EditableField
              label="Email"
              name="email"
              value={formData.email}
              isEditing={isEditing}
              onChange={handleChange}
            />
            <EditableField
              label="Điện thoại"
              name="phone"
              value={formData.phone}
              isEditing={isEditing}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Section 3: Tình trạng cư trú */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Tình trạng cư trú
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <EditableField
              label="Tình trạng cư trú"
              name="status"
              value={formData.status}
              isEditing={false} // Thường không tự sửa được
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Buttons Action */}
        {isEditing && (
          <div className="flex flex-col sm:flex-row justify-end items-center pt-4 border-t border-gray-200 space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              onClick={cancelEditClick}
              className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-8 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-8 rounded-lg transition-colors"
            >
              Confirm
            </button>
          </div>
        )}
      </form>

      {/* Status Modal */}
      <StatusModal isOpen={isStatusModalOpen} onClose={handleCloseStatusModal}>
        {renderStatusModalContent()}
      </StatusModal>
    </div>
  );
};
