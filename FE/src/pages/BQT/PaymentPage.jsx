import React, { useState, useEffect } from "react";
import { ConfirmationModal } from "../../layouts/ConfirmationModal";
import { StatusModal } from "../../layouts/StatusModal";
import acceptIcon from "../../images/accept_icon.png";
import notAcceptIcon from "../../images/not_accept_icon.png";

const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

// --- HELPERS ---
const getToken = () => localStorage.getItem("token");

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// --- COMPONENT: PAYMENT FORM MODAL (Đã thêm Token) ---
const PaymentFormModal = ({
  isOpen,
  onClose,
  onSave,
  error,
  setError,
}) => {
  const [formData, setFormData] = useState({
    resident_id: "",
    amount: "",
    feetype: "",
    payment_form: "Tiền mặt",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.resident_id || !formData.amount || !formData.feetype) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/payments`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}` // <--- Token
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Lỗi khi tạo khoản phí.");
      }

      onSave();
      onClose();
      // Reset form
      setFormData({
        resident_id: "",
        amount: "",
        feetype: "",
        payment_form: "Tiền mặt",
      });
    } catch (err) {
      console.error("API Error:", err);
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md text-gray-900">
        <h2 className="text-xl font-bold mb-4">Thêm khoản phí mới</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID Cư dân</label>
            <input
              type="text"
              name="resident_id"
              value={formData.resident_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại phí</label>
            <input
              type="text"
              name="feetype"
              value={formData.feetype}
              onChange={handleChange}
              placeholder="VD: Phí quản lý tháng 10"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền (VND)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hình thức thanh toán</label>
            <select
              name="payment_form"
              value={formData.payment_form}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
            >
              <option value="Tiền mặt">Tiền mặt</option>
              <option value="Chuyển khoản">Chuyển khoản</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Thêm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH: PAYMENT PAGE ---
export default function PaymentPage() {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalError, setAddModalError] = useState("");
  
  // Delete States
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]); // State chọn nhiều

  // Status Modal
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  // --- FETCH DATA ---
  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/payments`, {
        headers: { "Authorization": `Bearer ${getToken()}` } // <--- Token
      });
      if (!response.ok) throw new Error("Failed to fetch payments");
      const data = await response.json();
      const sortedData = data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setPayments(sortedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((payment) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      payment.feetype?.toLowerCase().includes(term) ||
      String(payment.apartment_id)?.toLowerCase().includes(term) ||
      String(payment.id).includes(term)
    );
  });

  // --- HANDLERS ---
  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    setPaymentToDelete(null);
    setSelectedIds([]); // Reset
  };

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleDeleteClick = (payment) => {
    setPaymentToDelete(payment);
    setIsConfirmModalOpen(true);
  };

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

  const handleAddPaymentSuccess = () => {
    fetchPayments();
    setModalStatus("success");
    setStatusMessage("Thêm khoản phí thành công!");
    setIsStatusModalOpen(true);
  };

  // --- CONFIRM DELETE (Xóa lẻ + Xóa nhiều + Token) ---
  const confirmDelete = async () => {
    const idsToDelete = selectedIds.length > 0
        ? selectedIds
        : (paymentToDelete ? [paymentToDelete.id] : []);

    if (idsToDelete.length === 0) {
        setIsConfirmModalOpen(false);
        return;
    }

    setIsConfirmModalOpen(false);

    try {
      const token = getToken(); // Lấy Token
      
      await Promise.all(
          idsToDelete.map(id =>
              fetch(`${API_BASE_URL}/payments/${id}`, { 
                  method: "DELETE",
                  headers: { 
                      "Authorization": `Bearer ${token}` // <--- Token
                  }
              })
              .then(res => {
                  if (!res.ok) throw new Error(`Failed to delete payment ${id}`);
                  return res;
              })
          )
      );

      fetchPayments();
      setModalStatus("success");
      setStatusMessage(idsToDelete.length > 1 ? `Đã xóa ${idsToDelete.length} khoản phí.` : "Xóa khoản phí thành công.");

    } catch (err) {
      console.error("Delete Error:", err);
      setModalStatus("failure");
      setStatusMessage("Có lỗi xảy ra khi xóa.");
    } finally {
      setPaymentToDelete(null);
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
            placeholder="Tìm kiếm theo ID, Căn hộ, Loại phí..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none"
          />
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-6">Quản lý các khoản phí</h1>

      {/* Actions Buttons */}
      <div className="flex justify-end gap-4 mb-6">
        <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Thêm khoản phí
        </button>
        {!isDeleteMode ? (
            <button
                onClick={toggleDeleteMode}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
                Xóa khoản phí
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

      {/* Payment List */}
      <div className="space-y-4">
        {filteredPayments.map((payment) => (
          <div key={payment.id} className="bg-white p-4 rounded-lg shadow flex items-center gap-4 text-gray-900 relative">
             {/* CHECKBOX */}
             {isDeleteMode && (
                <div className="flex items-center h-full">
                    <input
                        type="checkbox"
                        checked={selectedIds.includes(payment.id)}
                        onChange={() => handleSelect(payment.id)}
                        className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />
                </div>
            )}
            
            {/* Icon */}
            <div className="bg-blue-100 p-3 rounded-full flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>

            {/* Info Grid */}
            <div className="flex-1 grid grid-cols-4 gap-4 items-center text-sm">
              <div>
                <p className="text-gray-500 text-xs uppercase font-bold mb-1">Loại phí</p>
                <h3 className="font-bold text-lg">{payment.feetype}</h3>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase font-bold mb-1">Căn hộ</p>
                <p className="font-semibold">{payment.apartment_id}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-xs uppercase font-bold mb-1">Trạng thái</p>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    payment.state === 1
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {payment.state === 1 ? "Đã thanh toán" : "Chưa thanh toán"}
                </span>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-xs uppercase font-bold mb-1">Số tiền</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(payment.amount)}
                </p>
              </div>
            </div>

            {/* Delete Button (Single) */}
            {isDeleteMode && (
              <button
                onClick={() => handleDeleteClick(payment)}
                className="text-gray-400 hover:text-red-500 transition-colors p-2"
                title="Xóa khoản phí này"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        ))}
        {filteredPayments.length === 0 && (
          <p className="text-center text-gray-200 mt-8">
            Không tìm thấy khoản phí nào.
          </p>
        )}
      </div>

      {/* Modals */}
      <PaymentFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddPaymentSuccess}
        error={addModalError}
        setError={setAddModalError}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDelete}
        title="Xác nhận Xóa"
        message={
            selectedIds.length > 0
                ? `Bạn có chắc chắn muốn xóa ${selectedIds.length} khoản phí đã chọn không?`
                : (paymentToDelete ? "Bạn có chắc chắn muốn xóa khoản phí này không?" : "")
        }
      />

      <StatusModal isOpen={isStatusModalOpen} onClose={handleCloseStatusModal}>
        {renderStatusModalContent()}
      </StatusModal>
    </div>
  );
}