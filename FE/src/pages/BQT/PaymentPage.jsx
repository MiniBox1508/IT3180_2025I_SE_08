import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";

// ... existing imports

const PaymentPage = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userName = user?.full_name || "Ban quản trị";
  const [payments, setPayments] = useState([]);
  const [residents, setResidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [addModalError, setAddModalError] = useState("");

  const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // <<< THÊM: State cho chế độ Xóa
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState(null);
  // ---------------------------------

  // Hàm Fetch dữ liệu Thanh toán (Giữ nguyên)
  const fetchPayments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/payments`);
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Lỗi không xác định khi tải dữ liệu." }));
        throw new Error(errorData.error || "Không thể tải dữ liệu thanh toán.");
      }
      const data = await response.json();
      setPayments(data);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm Fetch dữ liệu Cư dân (Giữ nguyên)
  const fetchResidents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/residents`);
      if (!response.ok) {
        throw new Error("Không thể tải danh sách cư dân.");
      }
      const data = await response.json();
      setResidents(data.filter((r) => r.state === "active"));
    } catch (err) {
      console.error("Fetch Residents Error:", err);
    }
  };
  // -----------------------------------------------------

  // Gọi API khi component mount (Giữ nguyên)
  useEffect(() => {
    fetchPayments();
    fetchResidents();
  }, []);

  // Logic Lọc và Sắp xếp dữ liệu (Giữ nguyên)
  const filteredPayments = payments
    .filter((payment) => {
      if (!searchTerm.trim()) {
        return true;
      }
      const searchLower = searchTerm.trim().toLowerCase();
      const idMatch = String(payment.id).toLowerCase().includes(searchLower);
      return idMatch;
    })
    .sort((a, b) => {
      const isAPaid = a.status_text === "Đã thanh toán" ? 1 : 0;
      const isBPaid = b.status_text === "Đã thanh toán" ? 1 : 0;

      if (isAPaid !== isBPaid) {
        return isAPaid - isBPaid;
      }

      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
  // ----------------------------

  // --- HÀM XỬ LÝ MODAL TRẠNG THÁI (ĐÃ SỬA) ---
  const handleCloseStatusModal = () => {
    setIsStatusModalOpen(false);
    setModalStatus(null);
    setStatusMessage("");
  };

  const renderStatusModalContent = () => {
    if (!modalStatus) return null;

    // <<< SỬA: Dùng statusMessage thay vì text cứng
    // Áp dụng cho cả Sửa Trạng thái và Xóa
    if (modalStatus === "update_success" || modalStatus === "update_failure") {
      const isSuccess = modalStatus === "update_success";
      const icon = isSuccess ? (
        <FiCheckCircle className="text-blue-500 text-6xl mb-4" />
      ) : (
        <FiXCircle className="text-red-500 text-6xl mb-4" />
      );
      return (
        <div className="flex flex-col items-center">
          {icon}
          <p className="text-xl font-semibold text-center text-gray-800">
            {/* Sử dụng statusMessage đã set */}
            {statusMessage || (isSuccess ? "Thành công!" : "Thất bại!")}
          </p>
        </div>
      );
    }
    // -----------------------------------------

    // Giữ nguyên logic cho Thêm mới
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

  // --- HÀM GỌI KHI LƯU FORM ADD (Giữ nguyên) ---
  const handleAddPaymentSuccess = () => {
    fetchPayments(); // Refresh danh sách
    setModalStatus("success");
    setStatusMessage(
      "Đã tạo giao dịch thanh toán mới thành công! (Trạng thái: Chưa thanh toán)"
    );
    setIsStatusModalOpen(true);
  };

  // --- HÀM XỬ LÝ KHI ĐÓNG MODAL ADD (Giữ nguyên) ---
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setAddModalError(""); // Clear lỗi form
  };

  // --- HANDLERS FOR CHANGE STATUS MODAL (Giữ nguyên) ---
  const handleOpenChangeStatusModal = (payment) => {
    setSelectedPayment(payment);
    setIsChangeStatusModalOpen(true);
  };

  const handleCloseChangeStatusModal = () => {
    setSelectedPayment(null);
    setIsChangeStatusModalOpen(false);
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedPayment) return;

    const newStateValue = newStatus ? 1 : 0; // Convert boolean to 0 or 1

    try {
      const response = await fetch(
        `${API_BASE_URL}/payment/${selectedPayment.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state: newStateValue }),
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Lỗi khi cập nhật trạng thái.");
      }

      handleCloseChangeStatusModal();
      setModalStatus("update_success");
      setStatusMessage("Thay đổi trạng thái thành công!");
      setIsStatusModalOpen(true);
      fetchPayments();
    } catch (err) {
      console.error("Update Status Error:", err);
      handleCloseChangeStatusModal();
      setModalStatus("update_failure");
      setStatusMessage(err.message);
      setIsStatusModalOpen(true);
    }
  };

  // <<< THÊM: CÁC HÀM XỬ LÝ XÓA
  const toggleDeleteMode = () => setIsDeleteMode(!isDeleteMode);

  const handleDeleteClick = (id) => {
    setItemToDeleteId(id);
    setShowConfirmModal(true);
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setItemToDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmModal(false);
    if (!itemToDeleteId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/payments/${itemToDeleteId}`,
        {
          method: "DELETE", // Gọi API DELETE
        }
      );

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "Lỗi khi xóa thanh toán.");
      }

      // Thành công
      fetchPayments(); // Refresh list
      setModalStatus("update_success"); // Dùng style icon FiCheckCircle
      setStatusMessage("Đã xóa thanh toán thành công!"); // Set message
      setIsStatusModalOpen(true);
    } catch (err) {
      console.error("Delete Error:", err);
      setModalStatus("update_failure"); // Dùng style icon FiXCircle
      setStatusMessage(err.message); // Set message
      setIsStatusModalOpen(true);
    } finally {
      setItemToDeleteId(null);
      setIsDeleteMode(false); // Tắt chế độ xóa sau khi thực hiện
    }
  };
  // ---------------------------------

  // Xử lý Loading State (Giữ nguyên)
  if (isLoading) {
    return (
      <div className="text-white text-lg p-4">
        Đang tải danh sách thanh toán...
      </div>
    );
  }

  // Xử lý Error State (Giữ nguyên)
  if (error) {
    return (
      <div className="text-red-400 text-lg p-4">Lỗi tải dữ liệu: {error}</div>
    );
  }

  // Hiển thị nội dung (ĐÃ SỬA)
  const renderContent = () => {
    if (filteredPayments.length === 0) {
      return (
        <div className="bg-white p-6 rounded-lg text-center text-gray-500 shadow-md">
          Không có hóa đơn thanh toán nào phù hợp với tìm kiếm.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredPayments.map((item) => (
          <PaymentItem
            key={item.id}
            item={item}
            onStatusClick={handleOpenChangeStatusModal}
            isDeleteMode={isDeleteMode} // <<< THÊM
            onDeleteClick={handleDeleteClick} // <<< THÊM
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>{`${userName} | Ban quản trị`}</title>
      </Helmet>
      {/* Thanh Tìm kiếm Full Width (Giữ nguyên) */}
      <div className="flex justify-start items-center mb-6">
        <div className="relative w-full max-w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Tìm theo ID thanh toán..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* <<< SỬA: Header và Nút Thêm/Xóa Thanh Toán */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Danh sách Thanh toán</h1>
        <div className="flex space-x-4">
          {/* Nút Xóa / Hoàn tất */}
          <button
            onClick={toggleDeleteMode} // Bật/tắt chế độ xóa
            className={`${
              isDeleteMode
                ? "bg-gray-500 hover:bg-gray-600" // Style khi đang xóa
                : "bg-red-500 hover:bg-red-700" // Style mặc định
            } text-white font-bold py-2 px-6 rounded-md transition-colors flex items-center text-sm`}
          >
            {isDeleteMode ? "Hoàn tất" : "Xóa Thanh Toán"}
          </button>

          {/* Chỉ hiển thị nút Thêm khi KHÔNG ở chế độ xóa */}
          {!isDeleteMode && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition-colors flex items-center text-sm"
            >
              + Tạo Thanh Toán
            </button>
          )}
        </div>
      </div>
      {/* ------------------------------------------- */}

      {renderContent()}

      {/* Modal Thêm Thanh Toán (Giữ nguyên) */}
      <PaymentFormModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSave={handleAddPaymentSuccess}
        residentOptions={residents}
        error={addModalError}
        setError={setAddModalError}
      />

      {/* Change Status Modal (Giữ nguyên) */}
      <ChangeStatusModal
        isOpen={isChangeStatusModalOpen}
        onClose={handleCloseChangeStatusModal}
        payment={selectedPayment}
        onConfirm={handleStatusUpdate}
      />

      {/* <<< THÊM: Confirmation Modal (Xóa) */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Xác nhận Xóa Thanh Toán"
        message="Bạn có chắc chắn muốn xóa vĩnh viễn thanh toán này không?"
      />

      {/* Status Modal (Thông báo kết quả) (Giữ nguyên) */}
      <StatusModal isOpen={isStatusModalOpen} onClose={handleCloseStatusModal}>
        {renderStatusModalContent()}
      </StatusModal>
    </>
  );
};

export default PaymentPage;
