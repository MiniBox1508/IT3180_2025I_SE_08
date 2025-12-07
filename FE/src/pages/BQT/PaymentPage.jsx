import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StatusModal } from "../../layouts/StatusModal";
import { ConfirmationModal } from "../../layouts/ConfirmationModal"; // <<< THÊM: Import modal xác nhận
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

import acceptIcon from "../../images/accept_icon.png";
import notAcceptIcon from "../../images/not_accept_icon.png";

// =========================================================================
// === COMPONENT: PAYMENT FORM MODAL (ADD NEW) ===
// (Giữ nguyên không đổi)
// =========================================================================
const PaymentFormModal = ({
  isOpen,
  onClose,
  onSave,
  residentOptions,
  error,
  setError,
}) => {
  const [formData, setFormData] = useState({
    resident_id: residentOptions[0]?.id || "", // Mặc định chọn resident đầu tiên
    amount: "",
    feetype: "",
    payment_form: "Chuyển khoản QR", // Mặc định là Chuyển khoản QR
  });

  useEffect(() => {
    if (isOpen && residentOptions.length > 0 && !formData.resident_id) {
      // Đặt resident_id mặc định khi mở modal lần đầu nếu chưa có
      setFormData((prev) => ({ ...prev, resident_id: residentOptions[0].id }));
    }
  }, [isOpen, residentOptions, formData.resident_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const dataToSend = {
      resident_id: parseInt(formData.resident_id),
      amount: parseFloat(formData.amount),
      feetype: formData.feetype,
      payment_form: formData.payment_form,
    };

    // Kiểm tra trường bắt buộc
    if (
      !dataToSend.resident_id ||
      isNaN(dataToSend.amount) ||
      dataToSend.amount <= 0 ||
      !dataToSend.feetype
    ) {
      setError("Vui lòng điền đủ ID Cư dân, Số tiền hợp lệ (> 0) và Loại phí.");
      return;
    }

    try {
      // Gọi API POST /payment
      const response = await fetch(`${API_BASE_URL}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Lỗi khi tạo giao dịch thanh toán.");
      }

      // Mặc định là Chưa thanh toán (state = 0) ở BE, nên chỉ cần onSave để refresh danh sách
      onSave();
      onClose();
    } catch (err) {
      console.error("API Error:", err);
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md text-gray-900">
        <h2 className="text-lg font-bold mb-4">Tạo thanh toán mới</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Resident ID (Select) */}
          <div>
            <label className="mb-1 text-sm font-medium text-gray-700 block">
              Cư dân (ID)
            </label>
            <select
              name="resident_id"
              value={formData.resident_id}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded text-sm w-full bg-white text-gray-900 focus:border-blue-500"
              required
            >
              {residentOptions.map((res) => (
                <option
                  key={res.id}
                  value={res.id}
                >{`${res.full_name} (ID: ${res.id})`}</option>
              ))}
            </select>
          </div>

          {/* 2. Amount */}
          <div>
            <label className="mb-1 text-sm font-medium text-gray-700 block">
              Số tiền (VND)
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Ví dụ: 350000"
              className="p-2 border border-gray-300 rounded text-sm w-full text-gray-900 focus:border-blue-500"
              required
              min="1"
            />
          </div>

          {/* 3. Fee Type */}
          <div>
            <label className="mb-1 text-sm font-medium text-gray-700 block">
              Loại phí
            </label>
            <input
              type="text"
              name="feetype"
              value={formData.feetype}
              onChange={handleChange}
              placeholder="Ví dụ: Phí quản lý tháng 12"
              className="p-2 border border-gray-300 rounded text-sm w-full text-gray-900 focus:border-blue-500"
              required
            />
          </div>

          {/* 4. Payment Form (chỉ để hiển thị cho API) */}
          <div>
            <label className="mb-1 text-sm font-medium text-gray-700 block">
              Hình thức TT dự kiến (Mặc định)
            </label>
            <select
              name="payment_form"
              value={formData.payment_form}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded text-sm w-full bg-gray-100 text-gray-600 cursor-default"
              disabled
            >
              <option value="Chuyển khoản QR">Chuyển khoản QR</option>
              <option value="Tiền mặt">Tiền mặt</option>
              <option value="Chưa xác định">Chưa xác định</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Giao dịch mới luôn có trạng thái: **Chưa thanh toán**.
            </p>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Tạo Giao Dịch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =========================================================================
// === COMPONENT: CHANGE STATUS MODAL ===
// (Giữ nguyên không đổi)
// =========================================================================
const ChangeStatusModal = ({ isOpen, onClose, payment, onConfirm }) => {
  const [newStatus, setNewStatus] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // Reset status when modal opens
      setNewStatus(null);
    }
  }, [isOpen]);

  if (!isOpen || !payment) return null;

  const currentStatusIsPaid = payment.status_text === "Đã thanh toán";

  const handleConfirm = () => {
    if (newStatus !== null) {
      onConfirm(newStatus);
    }
  };

  // Remove overlay: just show modal as absolutely positioned, no background
  return (
    <div className="fixed left-0 right-0 top-0 bottom-0 flex justify-center items-center z-50 pointer-events-none">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg text-gray-900 pointer-events-auto shadow-xl">
        <h2 className="text-lg font-bold mb-6 text-center">
          Thay đổi trạng thái thanh toán {payment.id}
        </h2>

        {/* Buttons on one row, spaced apart */}
        <div className="flex flex-row justify-center gap-8 mb-6">
          <button
            onClick={() => setNewStatus(true)}
            className={`py-2 px-8 rounded-md font-semibold transition-colors ${
              newStatus === true
                ? "bg-green-600 text-white ring-2 ring-green-400"
                : "bg-green-100 text-green-800 hover:bg-green-200"
            }`}
          >
            Đã thanh toán
          </button>
          <button
            onClick={() => setNewStatus(false)}
            className={`py-2 px-8 rounded-md font-semibold transition-colors ${
              newStatus === false
                ? "bg-red-600 text-white ring-2 ring-red-400"
                : "bg-red-100 text-red-800 hover:bg-red-200"
            }`}
          >
            Chưa thanh toán
          </button>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={newStatus === null || newStatus === currentStatusIsPaid}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// === COMPONENT: PAYMENT ITEM (ĐÃ SỬA) ===
// =========================================================================
const PaymentItem = ({ item, onStatusClick, isDeleteMode, onDeleteClick }) => {
  // <<< THÊM: isDeleteMode, onDeleteClick
  const navigate = useNavigate();
  const isPaid = item.status_text === "Đã thanh toán";

  const formattedPaymentDate = item.payment_date
    ? new Date(item.payment_date).toLocaleDateString("vi-VN")
    : "---";

  return (
    // <<< SỬA: Thêm style đỏ khi ở chế độ Xóa
    <div
      className={`bg-white rounded-2xl shadow-md p-5 flex items-center space-x-6 relative overflow-hidden mb-4 ${
        isDeleteMode ? "ring-2 ring-red-500" : ""
      }`}
    >
      <div className="absolute left-4 top-3 bottom-3 w-1.5 bg-blue-500 rounded-full"></div>
      <div className="flex-1 grid grid-cols-6 gap-4 items-center pl-8">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Thanh toán ID</p>
          <p className="font-semibold text-gray-800">{item.id}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Số căn hộ</p>
          <p className="font-medium text-gray-700">
            {item.apartment_id || "N/A"}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Loại phí</p>
          <p className="font-medium text-gray-700">{item.feetype}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Ngày thanh toán</p>
          <p className="text-gray-600">{formattedPaymentDate}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Hình thức thanh toán</p>
          <p className="text-gray-600">{item.payment_form || "---"}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
          {/* <<< SỬA: Thay đổi hành vi và nội dung của nút này */}
          <p
            className={`font-semibold mb-2 cursor-pointer ${
              isDeleteMode
                ? "text-red-600 hover:underline"
                : isPaid
                ? "text-green-600 hover:underline"
                : "text-red-600 hover:underline"
            }`}
            onClick={() => {
              if (isDeleteMode) {
                onDeleteClick(item.id); // Gọi hàm xóa
              } else {
                onStatusClick(item); // Gọi hàm sửa status
              }
            }}
          >
            {isDeleteMode ? "Xóa thanh toán" : item.status_text}
          </p>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// === COMPONENT: TRANG THANH TOÁN CHÍNH (ĐÃ SỬA) ===
// =========================================================================
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
        `${API_BASE_URL}/payments/${selectedPayment.id}`,
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
