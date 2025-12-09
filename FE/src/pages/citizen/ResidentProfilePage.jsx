import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";

// --- IMPORTS ---
import { StatusModal } from "../../layouts/StatusModal";
import acceptIcon from "../../images/accept_icon.png";
import notAcceptIcon from "../../images/not_accept_icon.png";
import EditButtonImage from "../../images/edit_button.svg"; // Icon bút chì

const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

// --- Icons ---
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="#9CA3AF" // Màu xám nhạt (text-gray-400)
    viewBox="0 0 24 24"
    strokeWidth={0}
    className="w-16 h-16"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
  </svg>
);

// --- Component EditableField ---
const EditableField = ({ label, value, isEditing, onChange, name, type = "text" }) => (
  <div className="w-full">
    <label className="block text-sm font-bold text-gray-700 mb-2">
      {label}
    </label>
    {isEditing ? (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-white rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500 transition-colors"
      />
    ) : (
      <div className="w-full bg-white rounded-lg border border-gray-200 px-4 py-3 text-gray-500 min-h-[48px] flex items-center">
        {value || "Chưa cập nhật"}
      </div>
    )}
  </div>
);

export const ResidentProfilePage = () => {
  // --- STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dữ liệu form
  const [formData, setFormData] = useState({
    name: "",
    residentId: "",
    role: "",
    apartment: "",
    cccd: "",
    dob: "", // Format YYYY-MM-DD cho input date
    email: "",
    phone: "",
    status: "",
  });
  
  const [originalData, setOriginalData] = useState({});

  // Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState(null); 
  const [statusMessage, setStatusMessage] = useState("");

  // Lấy User
  const getUserFromStorage = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) return JSON.parse(userStr);
    return null;
  };
  const user = getUserFromStorage();
  const userId = user ? user.id : null;

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${API_BASE_URL}/residents/${userId}`);
        const data = response.data;

        const mappedData = {
          name: data.full_name || "",
          residentId: String(data.id).padStart(4, '0'),
          role: data.role || "Cư dân",
          apartment: data.apartment_id || "",
          cccd: data.cccd || "",
          dob: data.birth_date ? dayjs(data.birth_date).format("YYYY-MM-DD") : "",
          email: data.email || "",
          phone: data.phone || "",
          status: data.residency_status || "Chưa xác định",
        };

        setFormData(mappedData);
        setOriginalData(mappedData);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  // --- HANDLERS ---
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Chỉ gửi các trường cho phép sửa
    const payload = {
      cccd: formData.cccd,
      birth_date: formData.dob,
      email: formData.email,
      phone: formData.phone,
    };

    try {
      await axios.put(`${API_BASE_URL}/residents/${userId}`, payload);
      
      setModalStatus("success");
      setStatusMessage("Cập nhật thông tin thành công!");
      setIsEditing(false);
      setOriginalData(formData);

      if (user) {
        const updatedUser = { 
            ...user, 
            cccd: formData.cccd, 
            birth_date: formData.dob, 
            email: formData.email, 
            phone: formData.phone 
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

    } catch (error) {
      console.error(error);
      setModalStatus("failure");
      setStatusMessage("Cập nhật thất bại. Vui lòng thử lại!");
    }
    setIsStatusModalOpen(true);
  };

  const displayDob = isEditing 
    ? formData.dob 
    : (formData.dob ? dayjs(formData.dob).format("DD/MM/YYYY") : "");

  if (isLoading) return <div className="text-white text-center mt-10">Đang tải...</div>;

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Tiêu đề trang nằm ngoài Card */}
      <h1 className="text-2xl font-bold text-white mb-6">Thông tin cá nhân</h1>

      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 relative">
        
        {/* --- NÚT CHỈNH SỬA (Góc phải trên cùng) --- */}
        {!isEditing && (
          <button 
            onClick={handleEditClick}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Chỉnh sửa thông tin"
          >
            <img src={EditButtonImage} alt="Edit" className="w-6 h-6" />
          </button>
        )}

        {/* --- HEADER: AVATAR + NAME --- */}
        <div className="flex items-center space-x-4 mb-8 border-b border-gray-100 pb-8">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
             <UserIcon />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{formData.name}</h2>
            <p className="text-gray-500 font-medium">ID Cư dân: {formData.residentId}</p>
          </div>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          
          {/* Section 1: Thông tin cá nhân */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Thông tin cá nhân</h3>
            {/* Sử dụng layout 1 cột (stack) thay vì grid để giống ảnh */}
            <div className="space-y-5">
              
              {/* READ-ONLY */}
              <EditableField label="Vai trò" value={formData.role} isEditing={false} />
              <EditableField label="Số căn hộ" value={formData.apartment} isEditing={false} />
              
              {/* EDITABLE */}
              <EditableField 
                label="Số CCCD" 
                name="cccd" 
                value={formData.cccd} 
                isEditing={isEditing} 
                onChange={handleChange} 
              />

              {/* EDITABLE DATE */}
              <div className="w-full">
                <label className="block text-sm font-bold text-gray-700 mb-2">Ngày sinh</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full bg-white rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  />
                ) : (
                  <div className="w-full bg-white rounded-lg border border-gray-200 px-4 py-3 text-gray-500 min-h-[48px] flex items-center">
                    {displayDob || "Chưa cập nhật"}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Section 2: Thông tin liên hệ */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Thông tin liên hệ</h3>
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
            <h3 className="text-lg font-bold text-gray-800 mb-4">Tình trạng cư trú</h3>
            <div className="space-y-5">
               {/* READ-ONLY */}
               <EditableField label="Tình trạng cư trú" value={formData.status} isEditing={false} />
            </div>
          </div>

          {/* Buttons Action */}
          {isEditing && (
            <div className="flex justify-end items-center pt-6 space-x-4 border-t border-gray-100">
              <button
                type="button"
                onClick={cancelEditClick}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2.5 px-8 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-8 rounded-lg transition-colors"
              >
                Xác nhận
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Status Modal */}
      <StatusModal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)}>
        <div className="flex flex-col items-center">
            <img src={modalStatus === "success" ? acceptIcon : notAcceptIcon} alt={modalStatus} className="w-20 h-20 mb-6" />
            <p className="text-xl font-semibold text-center text-gray-800">
                {statusMessage}
            </p>
        </div>
      </StatusModal>
    </div>
  );
};