import React, { useState, useEffect } from "react";
// --- 1. IMPORT MODAL VÀ ICONS ---
import { StatusModal } from "../../layouts/StatusModal";
import EditButtonImage from "../../images/edit_button.svg";
import acceptIcon from "../../images/accept_icon.png";
import notAcceptIcon from "../../images/not_accept_icon.png";

// --- Icons ---
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="#6B7280" // Đổi màu fill thành xám để giống ảnh
    viewBox="0 0 24 24"
    strokeWidth={0} // Bỏ stroke
    className="w-12 h-12" // Kích thước icon bên trong avatar
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
  </svg>
);

// --- EditableField Component ---
const EditableField = ({ label, value, isEditing, onChange, name }) => (
  <div className="w-full">
    <label
      htmlFor={name}
      className="block text-sm font-bold text-gray-700 mb-2" // Đậm hơn chút để giống ảnh
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
        className="w-full bg-white rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
      />
    ) : (
      // Style ở chế độ xem: Giống một input disabled nhưng nền trắng/xám nhẹ và có border
      <div className="w-full bg-white rounded-lg border border-gray-200 px-4 py-3 text-gray-500 min-h-[48px] flex items-center">
        {value}
      </div>
    )}
  </div>
);

// --- Dữ liệu mẫu ---
const initialUserData = {
  name: "Đỗ Văn B",
  residentId: "0002",
  role: "Cư dân",
  apartment: "Tầng 7 - Phòng 713",
  cccd: "077204000123",
  dob: "30/10/1998",
  email: "dovanb@gmail.com",
  phone: "0938 099 203",
  status: "Người thuê",
};

// --- Main Profile Page Component ---
export const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Lấy data từ localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const initialData = user ? {
    name: user.full_name || "",
    residentId: user.id || "",
    role: user.role || "",
    apartment: user.apartment_id || "",
    cccd: user.cccd || "",
    dob: user.birth_date ? new Date(user.birth_date).toLocaleDateString("vi-VN") : "",
    email: user.email || "",
    phone: user.phone || "",
    status: user.residency_status || ""
  } : initialUserData;

  const [formData, setFormData] = useState(initialData);
  const [originalData, setOriginalData] = useState(initialData);

  // Status Modal State
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
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Giả lập API
    const isSuccess = Math.random() > 0.3;

    if (isSuccess) {
      setModalStatus("success");
      setStatusMessage("Cập nhật thông tin thành công!");
      setIsEditing(false);
      setOriginalData(formData);
    } else {
      setModalStatus("failure");
      setStatusMessage("Cập nhật thất bại!");
    }
    setIsStatusModalOpen(true);
  };

  const handleCloseStatusModal = () => {
    setIsStatusModalOpen(false);
    setModalStatus(null);
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
    <div className="w-full max-w-5xl mx-auto">
      {/* 1. Tiêu đề nằm ngoài Card (chữ trắng) */}
      <h1 className="text-2xl font-bold text-white mb-6">Thông tin cá nhân</h1>

      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 relative">
        
        {/* 2. Nút Edit nằm góc phải trên cùng (Absolute) */}
        {!isEditing && (
          <button 
            onClick={handleEditClick}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Chỉnh sửa thông tin"
          >
            <img src={EditButtonImage} alt="Edit" className="w-6 h-6" />
          </button>
        )}

        {/* 3. Header: Avatar + Tên + ID */}
        <div className="flex items-center space-x-4 mb-8 border-b border-gray-100 pb-8">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
             <UserIcon />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{formData.name}</h2>
            <p className="text-gray-500 font-medium">ID Cư dân:{formData.residentId}</p>
          </div>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* Section 1: Thông tin cá nhân */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Thông tin cá nhân
            </h3>
            {/* Sử dụng 1 cột (stack vertical) để giống ảnh mẫu */}
            <div className="space-y-5">
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
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Thông tin liên hệ
            </h3>
            <div className="space-y-5">
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
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Tình trạng cư trú
            </h3>
            <div className="space-y-5">
              <EditableField
                label="Tình trạng cư trú"
                name="status"
                value={formData.status}
                isEditing={isEditing}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Buttons Action */}
          {isEditing && (
            <div className="flex justify-end items-center pt-6 space-x-4 border-t border-gray-100">
              <button
                type="button"
                onClick={cancelEditClick}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Lưu thay đổi
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Status Modal */}
      <StatusModal
        isOpen={isStatusModalOpen}
        onClose={handleCloseStatusModal}
      >
        {renderStatusModalContent()}
      </StatusModal>
    </div>
  );
};