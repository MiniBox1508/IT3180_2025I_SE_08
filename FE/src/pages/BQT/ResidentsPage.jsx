import React, { useState, useEffect } from "react";
import { ConfirmationModal } from "../../layouts/ConfirmationModal";
import { StatusModal } from "../../layouts/StatusModal";
import acceptIcon from "../../images/accept_icon.png";
import notAcceptIcon from "../../images/not_accept_icon.png";

const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

// Giả định component này đã có sẵn (như trong file gốc của bạn)
// Tôi giữ nguyên phần khai báo ResidentFormModal để code chạy được,
// nhưng tập trung thay đổi ở phần chính ResidentsPage
const ResidentFormModal = ({ isOpen, onClose, residentData, onSave }) => {
    // (Giữ nguyên code của ResidentFormModal như file gốc của bạn)
    // ...
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg">
                <h2>Modal Form Cư Dân (Placeholder)</h2>
                <button onClick={onClose}>Đóng</button>
            </div>
        </div>
    )
};


export const ResidentsPage = () => {
  const [residents, setResidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // States cho Modals và chế độ xóa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState(null);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [residentToDelete, setResidentToDelete] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  // --- STATE MỚI CHO XÓA HÀNG LOẠT ---
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchResidents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/residents`);
      if (!response.ok) throw new Error("Failed to fetch residents");
      const data = await response.json();
      setResidents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  const filteredResidents = residents.filter((resident) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      resident.full_name?.toLowerCase().includes(term) ||
      resident.apartment_id?.toLowerCase().includes(term) ||
      resident.phone?.includes(term)
    );
  });

  // --- HANDLERS ---
  const handleAddClick = () => {
    setEditingResident(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (resident) => {
    setEditingResident(resident);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    fetchResidents();
  };

  // Chuyển đổi chế độ xóa
  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    setResidentToDelete(null);
    setSelectedIds([]); // Reset selection
  };

  // Xử lý khi tick vào checkbox
  const handleSelect = (id) => {
    setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleDeleteClick = (resident) => {
    setResidentToDelete(resident);
    setIsConfirmModalOpen(true);
  };

   // Click nút "Xóa các mục đã chọn" (xóa nhiều)
   const handleDeleteSelectedClick = () => {
    if (selectedIds.length > 0) {
        setIsConfirmModalOpen(true);
    }
}

  const handleCloseStatusModal = () => {
    setIsStatusModalOpen(false);
    setModalStatus(null);
    setStatusMessage("");
  };

  // --- HÀM CONFIRM DELETE ĐÃ ĐƯỢC NÂNG CẤP ---
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
       // Sử dụng Promise.all để xóa nhiều
      await Promise.all(
          idsToDelete.map(id =>
              fetch(`${API_BASE_URL}/residents/${id}`, { method: "DELETE" })
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
      setStatusMessage("Có lỗi xảy ra khi xóa. Vui lòng thử lại.");
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
        <p className="text-xl font-semibold text-center text-gray-800">
          {statusMessage}
        </p>
      </div>
    );
  };

  if (isLoading) return <div className="p-8 text-white">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="flex-1 p-8 bg-blue-700 min-h-screen text-white">
      {/* Search Bar */}
      <div className="flex justify-start items-center mb-6">
        <div className="relative w-full max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Tìm kiếm cư dân..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none"
          />
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-6">Thông tin cư dân</h1>

      {/* Actions Buttons - CẬP NHẬT GIAO DIỆN */}
      <div className="flex justify-end gap-4 mb-6">
        <button
          onClick={handleAddClick}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Thêm cư dân
        </button>
        {!isDeleteMode ? (
            <button
                onClick={toggleDeleteMode}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
                Xóa cư dân
            </button>
        ) : (
            <>
                 <button
                    onClick={handleDeleteSelectedClick}
                    disabled={selectedIds.length === 0}
                    className={`font-bold py-2 px-6 rounded-lg transition-colors ${
                        selectedIds.length === 0
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
                >
                    Xóa các mục đã chọn ({selectedIds.length})
                </button>
                <button
                    onClick={toggleDeleteMode}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                    Hủy
                </button>
            </>
        )}
      </div>

      {/* Resident List */}
      <div className="space-y-4">
        {filteredResidents.map((resident) => (
          <div key={resident.id} className="bg-white p-4 rounded-lg shadow flex items-center gap-4 text-gray-900 relative">
             {/* --- CHECKBOX CHO CHẾ ĐỘ XÓA --- */}
             {isDeleteMode && (
                <div className="flex items-center h-full">
                    <input
                        type="checkbox"
                        checked={selectedIds.includes(resident.id)}
                        onChange={() => handleSelect(resident.id)}
                        className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />
                </div>
            )}
            {/* Icon User */}
            <div className="bg-gray-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>

            {/* Info Grid */}
            <div className="flex-grow grid grid-cols-4 gap-4 items-center text-sm">
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs">Họ và tên</span>
                <span className="font-semibold">{resident.full_name}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs">Số điện thoại</span>
                <span className="font-semibold">{resident.phone}</span>
              </div>
               <div className="flex flex-col">
                <span className="text-gray-500 text-xs">Căn hộ</span>
                <span className="font-semibold">{resident.apartment_id}</span>
              </div>
               <div className="flex flex-col">
                <span className="text-gray-500 text-xs">Vai trò</span>
                 <span className={`font-semibold ${resident.role === 'Quản lý' ? 'text-blue-600' : ''}`}>{resident.role}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
               <button
                  onClick={() => handleEditClick(resident)}
                   className={`text-blue-500 hover:text-blue-700 font-semibold text-sm p-2 transition-colors ${isDeleteMode ? "opacity-50 pointer-events-none" : ""}`}
                >
                  Chỉnh sửa
                </button>

              {isDeleteMode && (
                <button
                  onClick={() => handleDeleteClick(resident)}
                  className="text-red-500 hover:text-red-700 p-2 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>

          </div>
        ))}
         {filteredResidents.length === 0 && (
          <p className="text-center text-gray-200 mt-8">
            Không tìm thấy cư dân nào.
          </p>
        )}
      </div>

      {/* Modals */}
      <ResidentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        residentData={editingResident}
        onSave={handleSave}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDelete}
        title="Xác nhận Xóa"
        message={
            selectedIds.length > 0
                ? `Bạn có chắc chắn muốn xóa ${selectedIds.length} cư dân đã chọn không?`
                : (residentToDelete ? `Bạn có chắc chắn muốn xóa cư dân "${residentToDelete.full_name}" không?` : "")
        }
      />

      <StatusModal isOpen={isStatusModalOpen} onClose={handleCloseStatusModal}>
        {renderStatusModalContent()}
      </StatusModal>
    </div>
  );
};