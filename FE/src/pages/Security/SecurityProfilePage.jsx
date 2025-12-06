import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
// --- Imports Components ---
import { StatusModal } from "../../layouts/StatusModal";
import acceptIcon from "../../images/accept_icon.png";
import notAcceptIcon from "../../images/not_accept_icon.png";

// --- CẤU HÌNH API ---
const API_BASE_URL = "https://off-be-deploy.vercel.app";

// --- Icons (Giữ nguyên) ---
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="#6B7280"
    viewBox="0 0 24 24"
    strokeWidth={0}
    className="w-12 h-12"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
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
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
    />
  </svg>
);

// --- Component EditableField (Giữ nguyên) ---
const EditableField = ({ label, value, isEditing, onChange, name, type = "text" }) => (
  <div className="w-full">
    <label
      htmlFor={name}
      className="block text-sm font-bold text-gray-700 mb-2"
    >
      {label}
    </label>
    {isEditing ? (
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-white rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
      />
    ) : (
      <div className="w-full bg-white rounded-lg border border-gray-200 px-4 py-3 text-gray-500 min-h-[48px]">
        {value || "Chưa cập nhật"}
      </div>
    )}
  </div>
);

export const SecurityProfilePage = () => {
  // --- STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // State lưu dữ liệu form
  const [formData, setFormData] = useState({
    name: "",
    securityId: "",
    role: "",
    unit: "",
    badgeNumber: "", // Sẽ map với CCCD hoặc cột khác trong DB
    dob: "",
    email: "",
    phone: "",
  });
  
  // State lưu dữ liệu gốc để khôi phục khi hủy
  const [originalData, setOriginalData] = useState({});

  // Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  // Lấy User ID từ localStorage (Giả định bạn đã lưu khi Login)
  // Nếu chưa có login flow, bạn có thể hardcode id ví dụ: const userId = 1;
  const getUserFromStorage = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) return JSON.parse(userStr);
    return null;
  };

  const user = getUserFromStorage();
  const userId = user ? user.id : null; 

  // --- 1. FETCH DATA TỪ API ---
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        alert("Không tìm thấy thông tin đăng nhập!");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/residents/${userId}`);
        const data = response.data;

        // Map dữ liệu từ DB (snake_case) sang UI state
        // Lưu ý: DB bạn dùng 'apartment_id', tôi tạm map nó vào 'unit' (Đơn vị)
        // 'cccd' tạm map vào 'badgeNumber' (Số hiệu)
        const mappedData = {
          name: data.full_name || "",
          securityId: String(data.id).padStart(4, '0'), // Format ID thành 0001
          role: data.role || "Công an",
          unit: data.apartment_id || "", 
          badgeNumber: data.cccd || "",
          // Convert ISO date (YYYY-MM-DD) sang DD/MM/YYYY để hiển thị
          dob: data.birth_date ? dayjs(data.birth_date).format("YYYY-MM-DD") : "",  
          email: data.email || "",
          phone: data.phone || "",
        };

        setFormData(mappedData);
        setOriginalData(mappedData);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        setModalStatus("failure");
        setStatusMessage("Không tải được thông tin cá nhân.");
        setIsStatusModalOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // --- HANDLERS ---
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

  // --- 2. UPDATE DATA LÊN API ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Convert ngày sinh từ DD/MM/YYYY sang YYYY-MM-DD để lưu vào MySQL
    let formattedDob = null;
    if (formData.dob) {
      // Parse theo định dạng VN
      const dateParts = formData.dob.split("/");
      if (dateParts.length === 3) {
        // format: YYYY-MM-DD
        formattedDob = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`; 
      }
    }

    // Chuẩn bị payload gửi lên server (khớp với body của API PUT /residents/:id)
    const payload = {
      full_name: formData.name,
      role: formData.role,
      apartment_id: formData.unit, // Map 'unit' về 'apartment_id'
      cccd: formData.badgeNumber, // Map 'badgeNumber' về 'cccd'
      birth_date: formattedDob, 
      email: formData.email,
      phone: formData.phone,
      // Các trường khác giữ nguyên hoặc null
    };

    try {
      await axios.put(`${API_BASE_URL}/residents/${userId}`, payload);
      
      setModalStatus("success");
      setStatusMessage("Cập nhật thông tin thành công!");
      setIsEditing(false);
      
      // Cập nhật lại originalData bằng data mới nhất
      setOriginalData(formData); 
      
      // Cập nhật lại localStorage nếu cần (để tên hiển thị trên header đổi theo)
      if (user) {
        const updatedUser = { ...user, ...payload };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
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

  if (isLoading) {
    return <div className="text-white text-center mt-10">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Thông tin cá nhân</h1>

      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 relative">
        {/* Nút Edit */}
        {!isEditing && (
          <button 
            onClick={handleEditClick}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Chỉnh sửa"
          >
            <EditIcon />
          </button>
        )}

        {/* Profile Header */}
        <div className="flex items-center space-x-4 mb-8 border-b border-gray-100 pb-8">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            <UserIcon />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{formData.name}</h2>
            <p className="text-gray-500 font-medium">
              ID Công An: {formData.securityId}
            </p>
          </div>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* Section 1: Thông tin cá nhân */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Thông tin cá nhân
            </h3>
            <div className="space-y-5">
              <EditableField
                label="Vai trò"
                name="role"
                value={formData.role}
                isEditing={isEditing}
                onChange={handleChange}
              />
              <EditableField
                label="Đơn vị công tác" // Map vào apartment_id trong DB
                name="unit"
                value={formData.unit}
                isEditing={isEditing}
                onChange={handleChange}
              />
              <EditableField
                label="Số hiệu công an" // Map vào cccd trong DB
                name="badgeNumber"
                value={formData.badgeNumber}
                isEditing={isEditing}
                onChange={handleChange}
              />
              <EditableField
                label="Ngày sinh (DD/MM/YYYY)"
                name="dob"
                value={formData.dob}
                isEditing={isEditing}
                onChange={handleChange}
                // Nếu muốn input type date thì cần xử lý format khác
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