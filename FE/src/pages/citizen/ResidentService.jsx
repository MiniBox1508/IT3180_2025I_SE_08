import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";

// --- API CONFIG ---
const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

// --- CẤU HÌNH DỊCH VỤ (Mapping Logic) ---
// Key là giá trị hiển thị/logic, value là cấu hình chi tiết
const SERVICE_MAPPING = {
  "Dịch vụ chung cư": {
    backendValue: "Dịch vụ trung cư", // Giá trị gửi về BE (khớp app.js)
    contents: ["Làm thẻ xe", "Sửa chữa căn hộ", "Vận chuyển đồ", "Dọn dẹp căn hộ"],
    handler: "Ban quản trị"
  },
  "Khiếu nại": {
    backendValue: "Khiếu nại",
    contents: ["tài sản chung", "mất tài sản"],
    handler: "Công an"
  },
  "Khai báo tạm trú": {
    backendValue: "Khai báo tạm trú",
    contents: ["Khai báo thông tin"],
    handler: "Ban quản trị"
  }
};

// --- ICONS & COMPONENTS ---
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 hover:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Icons cho Modal thông báo
const WarningIcon = () => (
  <div className="w-20 h-20 mx-auto mb-4 border-4 border-red-500 rounded-full flex items-center justify-center">
      <span className="text-5xl text-red-500 font-bold">!</span>
  </div>
);

const SuccessIcon = () => (
  <div className="w-20 h-20 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
    </svg>
  </div>
);

const ErrorIcon = () => (
  <div className="w-20 h-20 mx-auto mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-red-600">
        <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
      </svg>
  </div>
);

// --- COMPONENT: MODAL ĐĂNG KÝ DỊCH VỤ (FORM) ---
const RegisterServiceModal = ({ isOpen, onClose, onSubmit }) => {
  const [selectedType, setSelectedType] = useState("Dịch vụ chung cư");
  const [selectedContent, setSelectedContent] = useState(SERVICE_MAPPING["Dịch vụ chung cư"].contents[0]);
  const [note, setNote] = useState("");

  // Khi thay đổi loại dịch vụ, tự động reset nội dung về mục đầu tiên của loại đó
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setSelectedType(newType);
    setSelectedContent(SERVICE_MAPPING[newType].contents[0]);
  };

  const handleSubmit = () => {
    const payload = {
      // Lấy giá trị backendValue để gửi ("Dịch vụ trung cư" thay vì "Dịch vụ chung cư")
      service_type: SERVICE_MAPPING[selectedType].backendValue,
      content: selectedContent,
      note: note
    };
    onSubmit(payload);
  };

  if (!isOpen) return null;

  const currentConfig = SERVICE_MAPPING[selectedType];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 p-1 rounded-full hover:bg-gray-100 transition-colors">
          <CloseIcon />
        </button>
        
        <h2 className="text-xl font-bold text-gray-800 mb-6">Đăng ký dịch vụ</h2>

        <div className="space-y-4">
          {/* 1. Loại dịch vụ */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Loại dịch vụ</label>
            <select 
              value={selectedType}
              onChange={handleTypeChange}
              className="w-full p-3 bg-blue-50 border border-blue-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              {Object.keys(SERVICE_MAPPING).map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>

          {/* 2. Nội dung */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Nội dung</label>
            <select 
              value={selectedContent}
              onChange={(e) => setSelectedContent(e.target.value)}
              className="w-full p-3 bg-blue-50 border border-blue-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              {currentConfig.contents.map(content => (
                <option key={content} value={content}>{content}</option>
              ))}
            </select>
          </div>

          {/* 3. Bên xử lý (Readonly) */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Bên xử lý</label>
            <input 
              type="text" 
              value={currentConfig.handler} 
              readOnly 
              className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg focus:outline-none"
            />
          </div>

          {/* 4. Ghi chú */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Ghi chú</label>
            <input 
              type="text" 
              placeholder="Enter here"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-3 bg-white border border-gray-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-8 rounded-xl shadow-lg transition-all"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: MODAL THÔNG BÁO (Confirm, Success, Error) ---
const CustomModal = ({ isOpen, onClose, type, title, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md text-center shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors">
          <CloseIcon />
        </button>
        <div className="mt-2">
          {type === "warning" && <WarningIcon />}
          {type === "success" && <SuccessIcon />}
          {type === "error" && <ErrorIcon />}
          <h3 className="text-xl font-bold text-gray-800 mb-8">{title}</h3>
          {type === "warning" && (
            <div className="flex justify-between space-x-4">
              <button onClick={onClose} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all">Hoàn tác</button>
              <button onClick={onConfirm} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all">Xác nhận</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
export const ResidentService = () => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  
  // States cho Modals
  const [modalState, setModalState] = useState({ type: null, isOpen: false, title: "" });
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // --- FETCH DATA ---
  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.apartment_id) throw new Error("Không tìm thấy thông tin căn hộ");

      // Gọi API lấy dịch vụ theo căn hộ
      const response = await axios.get(`${API_BASE_URL}/services/by-apartment/${user.apartment_id}`);
      // Sort mới nhất lên đầu
      const sortedData = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setServices(sortedData);
    } catch (error) {
      console.error("Lỗi tải dịch vụ:", error);
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // --- HANDLERS ---
  const toggleDeleteMode = () => {
    if (isDeleteMode) {
      setIsDeleteMode(false);
      setSelectedIds([]);
    } else {
      setIsDeleteMode(true);
    }
  };

  const handleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteConfirmClick = () => {
    if (selectedIds.length === 0) return;
    setModalState({ type: "warning", isOpen: true, title: "Xóa các mục đã chọn" });
  };

  const executeDelete = async () => {
    setModalState({ ...modalState, isOpen: false });
    try {
      await Promise.all(selectedIds.map(id => axios.delete(`${API_BASE_URL}/services/${id}`)));
      await fetchServices();
      setTimeout(() => {
        setModalState({ type: "success", isOpen: true, title: "Xóa đăng ký thành công!" });
      }, 300);
      setIsDeleteMode(false);
      setSelectedIds([]);
    } catch (error) {
      setTimeout(() => {
        setModalState({ type: "error", isOpen: true, title: "Xóa đăng ký không thành công!" });
      }, 300);
    }
  };

  // --- XỬ LÝ ĐĂNG KÝ DỊCH VỤ ---
  const handleRegisterSubmit = async (formData) => {
    setIsRegisterModalOpen(false); // Đóng form nhập liệu trước
    
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.apartment_id) {
        alert("Vui lòng đăng nhập lại để lấy thông tin căn hộ.");
        return;
      }

      await axios.post(`${API_BASE_URL}/services`, {
        apartment_id: user.apartment_id,
        service_type: formData.service_type,
        content: formData.content,
        note: formData.note
      });
      
      await fetchServices(); // Reload list
      
      // Hiện popup thành công
      setTimeout(() => {
        setModalState({ type: "success", isOpen: true, title: "Đăng ký dịch vụ thành công!" });
      }, 300);

    } catch (e) {
      console.error(e);
      // Hiện popup thất bại
      setTimeout(() => {
        setModalState({ type: "error", isOpen: true, title: "Đăng ký dịch vụ thất bại!" });
      }, 300);
    }
  };

  const filteredList = services.filter((item) =>
    (item.content && item.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
    String(item.id).includes(searchTerm)
  );

  return (
    <div className="w-full min-h-screen text-gray-800">
      {/* Search Bar */}
      <div className="flex justify-start items-center mb-8">
        <div className="relative w-full max-w-2xl bg-white rounded-lg overflow-hidden shadow-sm">
          <span className="absolute left-4 top-1/2 -translate-y-1/2"><SearchIcon /></span>
          <input type="search" placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 text-gray-700 focus:outline-none h-12" />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between items-end mb-6">
        <h1 className="text-3xl font-bold text-white">Dịch vụ</h1>
        <div className="flex space-x-3">
          {!isDeleteMode ? (
            <>
              {/* Nút mở Modal Đăng ký */}
              <button 
                onClick={() => setIsRegisterModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg font-bold flex items-center shadow-lg transition-colors text-sm"
              >
                <PlusIcon /> Đăng ký dịch vụ
              </button>
              
              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-lg font-bold shadow-lg transition-colors text-sm">
                Phản ánh dịch vụ
              </button>
              
              <button 
                onClick={toggleDeleteMode} 
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg font-bold shadow-lg transition-colors text-sm"
              >
                Xóa dịch vụ
              </button>
            </>
          ) : (
            <>
              <button onClick={handleDeleteConfirmClick} className={`px-4 py-2.5 rounded-lg font-bold shadow-lg transition-colors text-sm ${selectedIds.length > 0 ? "bg-red-500 hover:bg-red-600 text-white" : "bg-red-300 text-white cursor-not-allowed"}`}>Xóa các mục đã chọn</button>
              <button onClick={toggleDeleteMode} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2.5 rounded-lg font-bold shadow-lg transition-colors text-sm">Hủy xóa</button>
            </>
          )}
        </div>
      </div>

      {/* List Services */}
      <div className="space-y-4 pb-10">
        {isLoading ? (
          <p className="text-white text-center">Đang tải...</p>
        ) : filteredList.length === 0 ? (
          <p className="text-white text-center">Chưa có dịch vụ nào.</p>
        ) : (
          filteredList.map((item) => (
            <div key={item.id} className="bg-white rounded-[20px] p-5 flex items-center shadow-md relative min-h-[90px]">
              <div className="absolute left-6 top-4 bottom-4 w-1 bg-blue-500 rounded-full"></div>
              <div className="flex-1 grid grid-cols-12 gap-4 items-center pl-10">
                <div className="col-span-1">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Dịch vụ ID</p>
                  <p className="text-2xl font-bold text-gray-900 leading-none">{item.id}</p>
                </div>
                <div className="col-span-3">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Nội dung</p>
                  <p className="text-sm font-bold text-gray-900">{item.content}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Số căn hộ</p>
                  <p className="text-sm font-semibold text-gray-900">{item.apartment_id}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Trạng thái</p>
                  <p className={`text-sm font-bold ${item.servicestatus === "Đã xử lý" ? "text-green-500" : "text-gray-800"}`}>
                    {item.servicestatus || "Đã ghi nhận"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Ngày xử lý</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.handle_date ? dayjs(item.handle_date).format("DD/MM/YYYY") : "----------"}
                  </p>
                </div>
                <div className="col-span-2 flex justify-end items-center">
                  {!isDeleteMode ? (
                    <button className="text-blue-500 font-bold text-xs hover:underline">Xem thêm chi tiết</button>
                  ) : (
                    <div onClick={() => handleSelect(item.id)} className={`w-10 h-10 rounded-xl cursor-pointer flex items-center justify-center transition-all duration-200 ${selectedIds.includes(item.id) ? "bg-blue-500 shadow-blue-500/50" : "bg-gray-300 hover:bg-gray-400"}`}>
                      {selectedIds.includes(item.id) && <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- MODALS --- */}
      {/* 1. Modal Form Đăng ký */}
      <RegisterServiceModal 
        isOpen={isRegisterModalOpen} 
        onClose={() => setIsRegisterModalOpen(false)} 
        onSubmit={handleRegisterSubmit}
      />

      {/* 2. Modal Thông báo (Success/Error/Warning) */}
      <CustomModal 
        isOpen={modalState.isOpen} 
        onClose={() => setModalState({...modalState, isOpen: false})} 
        type={modalState.type} 
        title={modalState.title} 
        onConfirm={executeDelete} 
      />
    </div>
  );
};