import React, { useState, useEffect } from "react";
import { ConfirmationModal } from "../../layouts/ConfirmationModal";
import { StatusModal } from "../../layouts/StatusModal";
import acceptIcon from "../../images/accept_icon.png";
import notAcceptIcon from "../../images/not_accept_icon.png";
// --- THÊM ICON ĐỂ HIỂN THỊ MẬT KHẨU ---
import { FaEye, FaEyeSlash } from "react-icons/fa";

const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

// --- VALIDATION HELPERS ---
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPhone = (phone) => {
  return /^\d{10,11}$/.test(phone);
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
        // --- SỬA ĐỔI: Lấy mật khẩu từ data nếu có, thay vì set rỗng ---
        password: residentData.password || "", 
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

    // Validate
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
    // Nếu đang sửa và ô mật khẩu trống, xóa trường password để không gửi lên server (giữ pass cũ)
    if (isEditing && !formData.password) {
      delete submitData.password;
    }

    try {
      const token = localStorage.getItem('token'); 
      const response = await fetch(url, {
        method: method,
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
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
    ? "Chi tiết Cư dân"
    : isEditing
    ? "Chỉnh sửa Cư dân"
    : "Thêm Cư dân mới";

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
          <InputGroup label="Tên (First Name)" name="first_name" value={formData.first_name} onChange={handleChange} required readOnly={isViewing} />
          <InputGroup label="Họ (Last Name)" name="last_name" value={formData.last_name} onChange={handleChange} required readOnly={isViewing} />
          <InputGroup label="Số điện thoại" name="phone" type="tel" value={formData.phone} onChange={handleChange} required readOnly={isViewing} />
          <InputGroup label="Mã căn hộ" name="apartment_id" value={formData.apartment_id} onChange={handleChange} required readOnly={isViewing} />
          <InputGroup label="Email" name="email" type="email" value={formData.email} onChange={handleChange} readOnly={isViewing} />
          <InputGroup label="CCCD" name="cccd" value={formData.cccd} onChange={handleChange} readOnly={isViewing} />
          <InputGroup label="Ngày sinh" name="birth_date" type="date" value={formData.birth_date} onChange={handleChange} readOnly={isViewing} />
          <SelectGroup label="Trạng thái cư trú" name="residency_status" value={formData.residency_status} onChange={handleChange} options={["chủ hộ", "người thuê", "khách tạm trú"]} disabled={isViewing} />
          <SelectGroup label="Vai trò" name="role" value={formData.role} onChange={handleChange} options={["Quản lý", "Cư dân", "Kế toán", "Công an"]} disabled={isViewing} />
          <SelectGroup label="Trạng thái" name="state" value={formData.state} onChange={handleChange} options={["active", "inactive"]} disabled={isViewing || !isEditing} />
          
          {/* Ô MẬT KHẨU */}
          {!isViewing && (
            <InputGroup 
              label="Mật khẩu" 
              name="password" 
              type="password" 
              value={formData.password || ""} 
              onChange={handleChange} 
              required={!isEditing} 
              readOnly={false} 
            />
          )}
          
          <div className="col-span-2 flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition-colors">
              {isViewing ? "Đóng" : "Hủy"}
            </button>
            {!isViewing && (
              <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors">
                {isEditing ? "Lưu Thay Đổi" : "Thêm Mới"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// --- CẬP NHẬT INPUT GROUP ĐỂ CÓ NÚT HIỆN MẬT KHẨU ---
const InputGroup = ({ label, name, value, onChange, type = "text", required = false, readOnly = false }) => {
  // State quản lý ẩn/hiện mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = name === "password";

  return (
    <div className="flex flex-col relative">
      <label className="mb-1 text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          // Nếu là field password và đang bật showPassword -> text, ngược lại giữ nguyên type
          type={isPasswordField && showPassword ? "text" : type}
          name={name}
          value={value || ""}
          onChange={onChange}
          required={required && !readOnly}
          readOnly={readOnly}
          className={`w-full p-2 border border-gray-300 rounded text-sm focus:outline-none ${
            readOnly ? "bg-gray-100 text-gray-600 cursor-default" : "bg-white text-gray-900 focus:border-blue-500"
          } ${isPasswordField ? "pr-10" : ""}`} // Thêm padding phải nếu là password để tránh đè icon
        />
        
        {/* Nút con mắt ẩn hiện mật khẩu */}
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

const SelectGroup = ({ label, name, value, onChange, options, disabled = false }) => (
  <div className="flex flex-col">
    <label className="mb-1 text-sm font-medium text-gray-700">{label}</label>
    <select name={name} value={value || ""} onChange={onChange} disabled={disabled} className={`p-2 border border-gray-300 rounded text-sm focus:outline-none ${disabled ? "bg-gray-100 text-gray-600 cursor-default" : "bg-white text-gray-900 focus:border-blue-500"}`}>
      {options.map((option) => (<option key={option} value={option}>{option}</option>))}
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
  const [selectedIds, setSelectedIds] = useState([]); // Array ID chọn xóa
  
  // Status Modal
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  const getToken = () => localStorage.getItem('token');

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

  useEffect(() => { fetchResidents(); }, []);

  const filteredResidents = residents.filter((resident) => {
    if (resident.state === 'inactive') return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      resident.full_name?.toLowerCase().includes(term) ||
      resident.apartment_id?.toLowerCase().includes(term) ||
      String(resident.id).includes(term)
    );
  });

  // Handlers
  const handleAddClick = () => { setEditingResident(null); setIsModalOpen(true); };
  const handleEditClick = (resident) => { setEditingResident(resident); setIsModalOpen(true); };
  const handleSave = () => { fetchResidents(); };
  const handleViewClick = (resident) => { setViewingResident(resident); setIsViewModalOpen(true); };
  
  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    setResidentToDelete(null);
    setSelectedIds([]); // Reset
  };

  const handleSelect = (id) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
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

  // --- CONFIRM DELETE ---
  const confirmDelete = async () => {
    const idsToDelete = selectedIds.length > 0 
        ? selectedIds 
        : (residentToDelete ? [residentToDelete.id] : []);

    if (idsToDelete.length === 0) {
        setIsConfirmModalOpen(false);
        return;
    }
    
    setIsConfirmModalOpen(false);

    try {
      const token = getToken(); // Lấy Token
      
      await Promise.all(
          idsToDelete.map(id => 
              fetch(`${API_BASE_URL}/residents/${id}`, { 
                  method: "DELETE",
                  headers: { 
                      "Authorization": `Bearer ${token}`
                  }
              })
              .then(res => {
                  if (!res.ok) throw new Error(`Failed to delete resident ${id}`);
                  return res;
              })
          )
      );

      fetchResidents();
      setModalStatus("success");
      setStatusMessage(idsToDelete.length > 1 ? `Đã xóa ${idsToDelete.length} cư dân.` : "Xóa cư dân thành công.");

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
        <p className="text-xl font-semibold text-center text-gray-800">{statusMessage}</p>
      </div>
    );
  };

  if (isLoading) return <div className="p-8 text-white text-lg bg-blue-700 min-h-screen">Đang tải...</div>;
  if (error) return <div className="p-8 text-red-100 text-lg bg-blue-700 min-h-screen">Lỗi: {error}</div>;

  return (
    <div className="flex-1 p-8 bg-blue-700 min-h-screen text-white">
      <div className="flex justify-start items-center mb-6">
        <div className="relative w-full max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></span>
          <input type="search" placeholder="Tìm kiếm cư dân..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none" />
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-6">Thông tin người dùng</h1>

      <div className="flex justify-end gap-4 mb-8">
        {!isDeleteMode ? (
          <>
            <button onClick={handleAddClick} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">Thêm cư dân</button>
            <button onClick={toggleDeleteMode} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">Xóa cư dân</button>
          </>
        ) : (
          <>
            <button onClick={handleDeleteSelectedClick} disabled={selectedIds.length === 0} className={`font-bold py-2 px-6 rounded-lg transition-colors ${selectedIds.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white"}`}>Xóa các mục đã chọn ({selectedIds.length})</button>
            <button onClick={toggleDeleteMode} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">Hủy</button>
          </>
        )}
      </div>

      <div className="space-y-4">
        {filteredResidents.length === 0 ? (
          <div className="bg-white p-6 rounded-lg text-center text-gray-500">Không tìm thấy cư dân nào.</div>
        ) : (
          filteredResidents.map((resident) => (
            <div key={resident.id} className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4 text-gray-900 relative">
              {isDeleteMode && (
                <div className="flex items-center h-full">
                    <input type="checkbox" checked={selectedIds.includes(resident.id)} onChange={() => handleSelect(resident.id)} className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer" />
                </div>
              )}
              <div className="bg-gray-100 p-3 rounded-full flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <div className="flex-grow grid grid-cols-5 gap-x-4 items-center text-sm">
                <div className="flex flex-col"><span className="text-gray-500 text-xs mb-1">Họ và tên</span><span className="font-semibold truncate" title={resident.full_name}>{resident.full_name}</span></div>
                <div className="flex flex-col"><span className="text-gray-500 text-xs mb-1">ID</span><span className="font-semibold">{resident.id}</span></div>
                <div className="flex flex-col"><span className="text-gray-500 text-xs mb-1">Ngày sinh</span><span className="font-semibold">{resident.birth_date ? new Date(resident.birth_date).toLocaleDateString("vi-VN") : "--/--/----"}</span></div>
                <div className="flex flex-col"><span className="text-gray-500 text-xs mb-1">Căn hộ</span><span className="font-semibold">{resident.apartment_id}</span></div>
                <div className="flex flex-col"><span className="text-gray-500 text-xs mb-1">Chi tiết</span><button onClick={() => handleViewClick(resident)} className={`text-blue-500 hover:underline text-left font-semibold ${isDeleteMode ? "opacity-50 pointer-events-none" : ""}`}>Xem thêm</button></div>
              </div>
              
              {isDeleteMode ? (
                 <button onClick={() => handleDeleteClick(resident)} className="text-gray-400 hover:text-red-500 p-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
              ) : (
                 <button onClick={() => handleEditClick(resident)} className="text-blue-500 hover:text-blue-700 font-semibold text-sm bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition-colors">Chỉnh sửa</button>
              )}
            </div>
          ))
        )}
      </div>

      <ResidentFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} residentData={editingResident} onSave={handleSave} isViewing={false} />
      <ResidentFormModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} residentData={viewingResident} onSave={() => {}} isViewing={true} />
      
      <ConfirmationModal 
        isOpen={isConfirmModalOpen} 
        onClose={() => setIsConfirmModalOpen(false)} 
        onConfirm={confirmDelete} 
        title="Xác nhận Xóa" 
        message={selectedIds.length > 0 ? `Bạn có chắc chắn muốn xóa ${selectedIds.length} cư dân đã chọn?` : (residentToDelete ? `Bạn có chắc chắn muốn xóa cư dân "${residentToDelete.full_name}"?` : "")} 
      />
      
      <StatusModal isOpen={isStatusModalOpen} onClose={handleCloseStatusModal}>{renderStatusModalContent()}</StatusModal>
    </div>
  );
};