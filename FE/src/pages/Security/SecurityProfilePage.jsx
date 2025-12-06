import React, { useState } from "react";
// --- Imports ---
import { StatusModal } from "../../layouts/StatusModal";
import acceptIcon from "../../images/accept_icon.png";
import notAcceptIcon from "../../images/not_accept_icon.png";

// --- Icons ---
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="#6B7280" // Màu xám cho giống ảnh mẫu
    viewBox="0 0 24 24"
    strokeWidth={0} // Bỏ stroke để fill màu đặc
    className="w-12 h-12"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
    />
  </svg>
);

const EditIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className="w-6 h-6 text-gray-700"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

// --- Component EditableField ---
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
      <div className="w-full bg-white rounded-lg border border-gray-200 px-4 py-3 text-gray-500">
        {value}
      </div>
    )}
  </div>
);

// --- Dữ liệu mẫu (theo ảnh Security) ---
const initialUserData = {
  name: "Đỗ Văn B",
  securityId: "0001",
  role: "Công an",
  unit: "Công an phường", // Đơn vị công tác
  badgeNumber: "CA-177013", // Số hiệu công an
  dob: "30/10/1998",
  email: "dovanb@gmail.com",
  phone: "0938 099 203",
};

export const SecurityProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(initialUserData);
  const [originalData, setOriginalData] = useState(initialUserData);

  // Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  const handleEditClick = () => {
    if (!isEditing) {
      setOriginalData(formData);
      setIsEditing(true);
    }
  };

  const cancelEditClick = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      setStatusMessage("Cập nhật thất bại. Vui lòng thử lại!");
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
      {/* Title ngoài card (Nếu cần giống ảnh 100% thì có thể bỏ, nhưng giữ lại cho đồng bộ layout) */}
      <h1 className="text-2xl font-bold text-white mb-6">Thông tin cá nhân</h1>

      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 relative">
        {/* Nút Edit nằm góc phải trên cùng của Card */}
        {!isEditing && (
          <button 
            onClick={handleEditClick}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Chỉnh sửa"
          >
            <EditIcon />
          </button>
        )}

        {/* Profile Header: Avatar + Name + ID */}
        <div className="flex items-center space-x-4 mb-8 border-b border-gray-100 pb-8">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
             {/* Dùng SVG hoặc thẻ img nếu có avatar thật */}
            <UserIcon />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{formData.name}</h2>
            <p className="text-gray-500 font-medium">
              ID Công An :{formData.securityId}
            </p>
          </div>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* Section 1: Thông tin cá nhân */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Thông tin cá nhân
            </h3>
            {/* Sử dụng grid-cols-1 để các trường trải dài hết chiều ngang giống ảnh mẫu */}
            <div className="space-y-5">
              <EditableField
                label="Vai trò"
                name="role"
                value={formData.role}
                isEditing={isEditing}
                onChange={handleChange}
              />
              <EditableField
                label="Đơn vị công tác"
                name="unit"
                value={formData.unit}
                isEditing={isEditing}
                onChange={handleChange}
              />
              <EditableField
                label="Số hiệu công an"
                name="badgeNumber"
                value={formData.badgeNumber}
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

          {/* Buttons Action */}
          {isEditing && (
            <div className="flex justify-end items-center pt-6 space-x-4">
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