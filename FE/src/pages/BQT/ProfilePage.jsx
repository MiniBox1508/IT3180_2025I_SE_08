import React, { useState } from "react";
// --- 1. IMPORT MODAL VÀ ICONS ---
import { StatusModal } from "../../layouts/StatusModal";
import EditButtonImage from "../../images/edit_button.svg";
import acceptIcon from "../../images/accept_icon.png";
import notAcceptIcon from "../../images/not_accept_icon.png";

// --- CẤU HÌNH API ---
const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

// --- Icons (Giữ nguyên) ---
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

// --- EditableField Component (Giữ nguyên) ---
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
        value={value || ""}
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

// --- Dữ liệu mẫu ban đầu ---
const initialUserData = {
  name: "Trị Quan Ban",
  residentId: "0002",
  role: "Ban quản trị",
  apartment: "Tầng 7 - Phòng 713",
  cccd: "077204000123",
  dob: "1999-10-30",
  email: "dovanb@gmail.com",
  phone: "0938 099 203",
  status: "người thuê",
};

// --- Main Profile Page Component ---
export const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);

  // --- LẤY USER TỪ STORAGE ---
  const getUserFromStorage = () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  };
  const user = getUserFromStorage();

  // Logic ID: userId dùng để gọi API, residentId dùng để hiển thị
  let displayId = initialUserData.residentId;
  let apiId = null;

  if (user) {
    apiId = user.id; // Quan trọng: ID thực tế trong DB
    if (user.resident_code) displayId = user.resident_code;
    else if (user.id) displayId = user.id;
  }

  // Khởi tạo form data, map từ trường Backend -> Frontend
  const initialData = {
    ...initialUserData,
    ...(user
      ? {
          residentId: displayId,
          name: user.full_name || initialUserData.name,
          role: user.role || initialUserData.role,
          apartment: user.apartment_id || initialUserData.apartment,
          cccd: user.cccd || initialUserData.cccd,
          // Chuyển đổi ngày tháng nếu cần (backend trả về ISO string)
          dob: user.birth_date
            ? user.birth_date.split("T")[0]
            : initialUserData.dob,
          email: user.email || initialUserData.email,
          phone: user.phone || initialUserData.phone,
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

  // --- HÀM SUBMIT ĐÃ CHỈNH SỬA ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!apiId) {
      setModalStatus("failure");
      setStatusMessage("Không tìm thấy ID người dùng. Vui lòng đăng nhập lại!");
      setIsStatusModalOpen(true);
      return;
    }

    // --- MAP DỮ LIỆU FRONTEND -> BACKEND ---
    const payload = {
      role: formData.role,
      apartment_id: formData.apartment, // Backend: apartment_id
      cccd: formData.cccd,
      birth_date: formData.dob, // Backend: birth_date
      email: formData.email,
      phone: formData.phone,
      residency_status: formData.status, // Backend: residency_status
      // Lưu ý: Form này không có input nhập tên nên không gửi first_name/last_name
    };

    console.log("Payload gửi đi:", payload);

    try {
      const token = getToken();
      // --- SỬA URL API: /residents/:id ---
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
        setStatusMessage("Đã sửa thông tin cá nhân thành công!");
        setIsEditing(false);
        setOriginalData(formData);

        // Cập nhật lại localStorage để dữ liệu mới hiển thị ngay nếu F5
        if (user) {
          const updatedUser = {
            ...user,
            role: payload.role,
            apartment_id: payload.apartment_id,
            cccd: payload.cccd,
            birth_date: payload.birth_date,
            email: payload.email,
            phone: payload.phone,
            residency_status: payload.residency_status,
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      } else {
        setModalStatus("failure");
        setStatusMessage(
          result.error || "Sửa thông tin cá nhân không thành công!"
        );
      }
    } catch (err) {
      console.error(err);
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
    <>
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 w-full max-w-6xl mx-auto">
        {/* Card Header: Title + Edit Button */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Thông tin cá nhân
          </h1>
          {/* --- ẨN NÚT EDIT KHI ĐANG Ở CHẾ ĐỘ CHỈNH SỬA --- */}
          {!isEditing && (
            <button
              onClick={handleEditClick}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Chỉnh sửa thông tin"
            >
              <img src={EditButtonImage} alt="Edit" className="w-8 h-8" />
            </button>
          )}
        </div>

        {/* Profile Header: Avatar + Name */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 flex-shrink-0">
            <UserIcon />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{formData.name}</h2>
            <p className="text-sm text-gray-600">
              ID Quản lý: {formData.residentId}
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
              <EditableField
                label="Vai trò"
                name="role"
                value={formData.role}
                isEditing={isEditing}
                onChange={handleChange}
              />
              <EditableField
                label="Số căn hộ"
                name="apartment"
                value={formData.apartment}
                isEditing={isEditing}
                onChange={handleChange}
              />
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
                type="date" // Thêm type date để hiện lịch
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
                isEditing={isEditing}
                onChange={handleChange}
              />
            </div>
          </div>
          {/* Nút Hủy và Confirm */}
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

        <StatusModal
          isOpen={isStatusModalOpen}
          onClose={handleCloseStatusModal}
        >
          {renderStatusModalContent()}
        </StatusModal>
      </div>
    </>
  );
};
