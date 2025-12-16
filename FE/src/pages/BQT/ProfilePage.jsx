import React, { useState } from "react";
// --- 1. IMPORT MODAL VÀ ICONS ---
import { StatusModal } from "../../layouts/StatusModal"; // Đảm bảo đường dẫn đúng
import EditButtonImage from "../../images/edit_button.svg";
import acceptIcon from "../../images/accept_icon.png"; // Icon thành công
// ...existing code...
import notAcceptIcon from "../../images/not_accept_icon.png"; // Icon thất bại

// --- Icons ---
const UserIcon = () => (
  // ... (SVG code giữ nguyên)
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

// --- EditableField Component (giữ nguyên) ---
const EditableField = ({ label, value, isEditing, onChange, name }) => (
  // ... (JSX code giữ nguyên)
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-500 mb-1"
    >
      {label}
    </label>
    {isEditing ? (
      <input
        type="text"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-white rounded-lg border border-gray-300 px-4 py-3 text-gray-900 min-h-[46px] focus:border-blue-500 focus:ring-blue-500"
      />
    ) : (
      <div className="w-full bg-gray-50 rounded-lg border border-gray-200 px-4 py-3 text-gray-900 min-h-[46px]">
        {value}
      </div>
    )}
  </div>
);

// --- Dữ liệu mẫu ban đầu (giữ nguyên) ---
const initialUserData = {
  name: "Trị Quan Ban",
  residentId: "0002",
  role: "Ban quản trị",
  apartment: "Tầng 7 - Phòng 713",
  cccd: "077204000123",
  dob: "30/10/1999",
  email: "dovanb@gmail.com",
  phone: "0938 099 203",
  status: "người thuê",
};

// --- Main Profile Page Component ---
export const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  // Nếu không có user, dùng dữ liệu mẫu
  const initialData = user
    ? {
        name: user.full_name || "",
        residentId: user.id || "",
        role: user.role || "",
        apartment: user.apartment_id || "",
        cccd: user.cccd || "",
        dob: user.birth_date || "",
        email: user.email || "",
        phone: user.phone || "",
        status: user.residency_status || "",
      }
    : initialUserData;
  const [formData, setFormData] = useState(initialData);
  const [originalData, setOriginalData] = useState(initialData);

  // --- 2. THÊM STATE CHO STATUS MODAL ---
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState(null); // 'success' or 'failure'
  const [statusMessage, setStatusMessage] = useState("");

  // Hàm xử lý khi nhấn nút Edit
  const handleEditClick = () => {
    setOriginalData(formData); // Lưu lại trạng thái hiện tại trước khi sửa
    setIsEditing(true);
  };

  // Hàm xử lý khi nhấn nút Hủy
  const cancelEditClick = () => {
    setFormData(originalData); // Khôi phục dữ liệu gốc
    setIsEditing(false);
  };

  // Hàm xử lý khi thay đổi input (giữ nguyên)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // --- 3. CẬP NHẬT handleSubmit ---
  // --- HÀM LẤY TOKEN TỪ LOCALSTORAGE ---
  const getToken = () => {
    return localStorage.getItem("token");
  };

  // --- CẬP NHẬT handleSubmit GỌI API VÀ GỬI TOKEN ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Dữ liệu gửi đi:", formData);

    try {
      const token = getToken();
      // Gọi API cập nhật thông tin cá nhân
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        // Thành công
        setModalStatus("success");
        setStatusMessage("Đã sửa thông tin cá nhân thành công!");
        setIsEditing(false);
        setOriginalData(formData);
      } else {
        // Thất bại
        setModalStatus("failure");
        setStatusMessage("Sửa thông tin cá nhân không thành công!");
      }
    } catch (err) {
      setModalStatus("failure");
      setStatusMessage("Sửa thông tin cá nhân không thành công!");
    }
    setIsStatusModalOpen(true);
  };

  // --- HÀM ĐÓNG STATUS MODAL ---
  const handleCloseStatusModal = () => {
    setIsStatusModalOpen(false);
    setModalStatus(null);
    setStatusMessage("");
  };

  // --- HÀM RENDER NỘI DUNG CHO STATUS MODAL ---
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
        {/* ... (phần header và avatar giữ nguyên) ... */}
        {/* Card Header: Title + Edit Button */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Thông tin cá nhân
          </h1>
          {/* --- ẨN NÚT EDIT KHI ĐANG Ở CHẾ ĐỘ CHỈNH SỬA --- */}
          {!isEditing && (
            <button
              onClick={handleEditClick} // Thêm onClick handler
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
            {/* --- SỬ DỤNG DỮ LIỆU TỪ STATE --- */}
            <h2 className="text-xl font-bold text-gray-900">{formData.name}</h2>
            <p className="text-sm text-gray-600">
              ID Quản lý: {formData.residentId}
            </p>
          </div>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* ... (các section thông tin giữ nguyên) ... */}
          {/* Section 1: Thông tin cá nhân */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Thông tin cá nhân
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              {/* --- THAY THẾ InfoField BẰNG EditableField --- */}
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
          {/* Nút Hủy và Confirm (giữ nguyên layout responsive) */}
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

        {/* --- 4. THÊM STATUS MODAL --- */}
        <StatusModal
          isOpen={isStatusModalOpen}
          onClose={handleCloseStatusModal}
          // Bỏ title đi để nút X tự căn giữa phải
        >
          {renderStatusModalContent()}
        </StatusModal>
      </div>
    </>
  );
};
