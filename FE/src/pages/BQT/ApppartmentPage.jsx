import React, { useState, useEffect } from "react";
import axios from "axios";

// --- API CONFIG ---
const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

// --- ICONS ---
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 hover:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

// --- COMPONENT: MODAL CHI TIẾT CƯ DÂN ---
const ApartmentDetailModal = ({ isOpen, onClose, apartmentData }) => {
  if (!isOpen || !apartmentData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-3xl p-8 relative shadow-2xl max-h-[80vh] overflow-y-auto">
        {/* Header Modal */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Danh sách cư dân</h2>
            <p className="text-blue-600 font-semibold mt-1">Căn hộ: {apartmentData.apartmentId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <CloseIcon />
          </button>
        </div>

        {/* Danh sách cư dân */}
        <div className="space-y-3">
          {apartmentData.residents.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Chưa có cư dân nào trong căn hộ này.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50">
                  <tr className="text-gray-500 text-xs uppercase tracking-wider">
                    <th className="py-4 px-6 font-bold">ID Cư dân</th>
                    <th className="py-4 px-6 font-bold">Tên cư dân</th>
                    <th className="py-4 px-6 font-bold">Email</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100 text-gray-700">
                  {apartmentData.residents.map((resident, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 font-bold text-blue-600">
                        {resident.id}
                      </td>
                      <td className="py-4 px-6 font-medium">
                        {resident.full_name}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {resident.email || "---"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-end">
          <button 
            onClick={onClose} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-8 rounded-xl shadow-lg transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
export const ApartmentPage = () => {
  const [apartments, setApartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal State
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- FETCH DATA & PROCESS ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Gọi API lấy danh sách toàn bộ cư dân
        const response = await axios.get(`${API_BASE_URL}/residents`);
        const allResidents = response.data;

        // --- XỬ LÝ DỮ LIỆU: Gom nhóm theo apartment_id ---
        const apartmentMap = {};

        allResidents.forEach((resident) => {
          // 1. Kiểm tra resident có thuộc căn hộ nào không
          // 2. Kiểm tra resident có bị xóa mềm không (state === 'inactive')
          if (!resident.apartment_id || resident.state === 'inactive') return;

          const aptId = resident.apartment_id.trim(); // Chuẩn hóa mã căn hộ

          if (!apartmentMap[aptId]) {
            apartmentMap[aptId] = {
              apartmentId: aptId,
              residents: [],
              count: 0
            };
          }

          apartmentMap[aptId].residents.push(resident);
          apartmentMap[aptId].count += 1;
        });

        // Chuyển object thành array và sắp xếp theo tên căn hộ (A-Z)
        const apartmentList = Object.values(apartmentMap).sort((a, b) => 
          a.apartmentId.localeCompare(b.apartmentId, undefined, { numeric: true, sensitivity: 'base' })
        );

        setApartments(apartmentList);
      } catch (error) {
        console.error("Lỗi tải dữ liệu căn hộ:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- HANDLERS ---
  const handleViewDetails = (aptData) => {
    setSelectedApartment(aptData);
    setIsModalOpen(true);
  };

  // --- FILTER ---
  const filteredList = apartments.filter(item => 
    item.apartmentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-blue-700 p-8"> {/* Thêm padding và background */}
      
      {/* 1. HEADER & SEARCH */}
      <div className="flex flex-col gap-6 mb-8">
        {/* Search Bar */}
        <div className="flex justify-start">
          <div className="relative w-full max-w-2xl bg-white rounded-lg overflow-hidden shadow-sm">
            <span className="absolute left-4 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </span>
            <input
              type="search"
              placeholder="Tìm kiếm số căn hộ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-gray-700 focus:outline-none h-12"
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Quản lý căn hộ</h1>
        </div>
      </div>

      {/* 2. DANH SÁCH CĂN HỘ */}
      <div className="space-y-4 pb-10">
        {isLoading ? (
          <p className="text-white text-center text-lg">Đang tải dữ liệu...</p>
        ) : filteredList.length === 0 ? (
          <p className="text-white text-center text-lg">Không tìm thấy căn hộ nào.</p>
        ) : (
          filteredList.map((item) => (
            <div key={item.apartmentId} className="bg-white rounded-[20px] p-5 flex items-center shadow-md relative min-h-[80px]">
              {/* Thanh xanh bên trái */}
              <div className="absolute left-6 top-4 bottom-4 w-1.5 bg-blue-500 rounded-full"></div>

              {/* Grid Content */}
              <div className="flex-1 grid grid-cols-12 gap-4 items-center pl-10">
                
                {/* Cột 1: Số căn hộ */}
                <div className="col-span-4">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Số căn hộ</p>
                  <p className="text-xl font-bold text-gray-900">{item.apartmentId}</p>
                </div>

                {/* Cột 2: Số lượng cư dân */}
                <div className="col-span-4">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Số lượng cư dân</p>
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-blue-600 mr-2">{item.count}</span>
                    <span className="text-sm text-gray-500">người</span>
                  </div>
                </div>

                {/* Cột 3: Nút Thông tin chi tiết */}
                <div className="col-span-4 flex justify-end items-center">
                  <button 
                    onClick={() => handleViewDetails(item)}
                    className="flex items-center text-blue-600 font-bold text-sm hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-5 py-2.5 rounded-lg"
                  >
                    <EyeIcon />
                    Thông tin chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- MODAL --- */}
      <ApartmentDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        apartmentData={selectedApartment}
      />
    </div>
  );
};