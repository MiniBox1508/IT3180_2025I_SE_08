import React, { useState, useEffect } from "react";
import { StatusModal } from "../../layouts/StatusModal";
import { ConfirmationModal } from "../../layouts/ConfirmationModal";

const API_BASE_URL = 'https://off-be-deploy.vercel.app';

import acceptIcon from "../../images/accept_icon.png";
import notAcceptIcon from "../../images/not_accept_icon.png";

// =========================================================================
// === INVOICE FORM MODAL (ADD/EDIT) ===
// =========================================================================
const InvoiceFormModal = ({ isOpen, onClose, onSave, invoiceData, error, setError }) => {
  const isEditing = !!invoiceData;
  
  const [formData, setFormData] = useState({
    apartment_id: "",
    feetype: "",
    amount: "",
    payment_date: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (invoiceData) {
        const paymentDate = invoiceData.payment_date 
          ? new Date(invoiceData.payment_date).toISOString().split('T')[0] 
          : "";
        
        setFormData({
          apartment_id: invoiceData.apartment_id || "",
          feetype: invoiceData.feetype || "",
          amount: invoiceData.amount || "",
          payment_date: paymentDate,
        });
      } else {
        setFormData({
          apartment_id: "",
          feetype: "",
          amount: "",
          payment_date: "",
        });
      }
    }
  }, [isOpen, invoiceData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!formData.apartment_id || !formData.feetype || !formData.amount) {
      setError("Vui lòng điền đủ Số căn hộ, Loại phí và Số tiền.");
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      setError("Số tiền phải lớn hơn 0.");
      return;
    }

    const dataToSend = {
      apartment_id: formData.apartment_id,
      feetype: formData.feetype,
      amount: parseFloat(formData.amount),
      payment_date: formData.payment_date || null,
    };

    onSave(dataToSend, isEditing ? invoiceData.id : null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md text-gray-900">
        <h2 className="text-lg font-bold mb-4">
          {isEditing ? "Chỉnh sửa hóa đơn" : "Thêm hóa đơn mới"}
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-2 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Hóa đơn ID
              </label>
              <div className="w-full bg-gray-100 rounded-lg border border-gray-200 px-4 py-3 text-gray-700">
                {invoiceData.id}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="apartment_id" className="block text-sm font-medium text-gray-700 mb-1">
              Số căn hộ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="apartment_id"
              name="apartment_id"
              value={formData.apartment_id}
              onChange={handleChange}
              placeholder="VD: A7-106"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              required
            />
          </div>

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

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Số tiền (VND) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="VD: 100000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              required
              min="1"
            />
          </div>

          <div>
            <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700 mb-1">
              Ngày thanh toán
            </label>
            <input
              type="date"
              id="payment_date"
              name="payment_date"
              value={formData.payment_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
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
              type="button"
              onClick={handleSubmit}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              {isEditing ? "Lưu Thay Đổi" : "Thêm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// === INVOICE ITEM COMPONENT ===
// =========================================================================
const InvoiceItem = ({ item, isDeleteMode, onDeleteClick, onEditClick }) => {
  const handleActionClick = () => {
    if (isDeleteMode) {
      onDeleteClick(item.id);
    } else {
      onEditClick(item);
    }
  };

  const formattedDate = item.payment_date
    ? new Date(item.payment_date).toLocaleDateString("vi-VN")
    : "---";

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 flex items-center relative overflow-hidden mb-4">
      <div className="absolute left-4 top-3 bottom-3 w-1.5 bg-blue-500 rounded-full"></div>

      <div className="flex-1 grid grid-cols-5 gap-4 items-center pl-8 pr-4 text-gray-800">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Hóa đơn ID</p>
          <p className="font-semibold">{item.id}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">Số căn hộ</p>
          <p className="font-medium">{item.apartment_id}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">Loại phí</p>
          <p className="font-medium">{item.feetype}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">Ngày thanh toán</p>
          <p className="text-gray-600">{formattedDate}</p>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500 mb-1">Số tiền</p>
          <p className="font-semibold text-blue-600">
            {item.amount.toLocaleString("vi-VN")} VND
          </p>
        </div>
      </div>

      <div className="ml-auto flex-shrink-0 pr-2">
        <button
          onClick={handleActionClick}
          className={`${
            isDeleteMode
              ? "text-red-600 hover:text-red-800"
              : "text-blue-600 hover:text-blue-800"
          } hover:underline text-sm font-medium`}
        >
          {isDeleteMode ? "Xóa hóa đơn" : "Chỉnh sửa"}
        </button>
      </div>
    </div>
  );
};

// =========================================================================
// === MAIN PAGE COMPONENT ===
// =========================================================================
export const AccountPayment = () => {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [formError, setFormError] = useState("");

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDeleteId, setItemToDeleteId] = useState(null);

  // Fetch invoices from API
  const fetchInvoices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/payments`);
      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu hóa đơn.');
      }
      const data = await response.json();
      setInvoices(data);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Filter invoices
  const filteredInvoices = invoices.filter((item) => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.trim().toLowerCase();
    return String(item.id).toLowerCase().includes(searchLower);
  });

  // Handlers
  const handleAddClick = () => {
    setIsAddModalOpen(true);
    setFormError("");
  };

  const handleEditClick = (invoice) => {
    setEditingInvoice(invoice);
    setIsEditModalOpen(true);
    setFormError("");
  };

  const handleSave = async (data, invoiceId) => {
    try {
      if (invoiceId) {
        // Update - sử dụng endpoint PATCH /payments/:id
        const response = await fetch(`${API_BASE_URL}/payments/${invoiceId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || 'Lỗi khi cập nhật hóa đơn.');
        }

        setModalStatus("success");
        setStatusMessage("Chỉnh sửa hóa đơn thành công!");
        setIsEditModalOpen(false);
      } else {
        // Create - sử dụng endpoint POST /payments
        const response = await fetch(`${API_BASE_URL}/payments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resident_id: 1, // Bạn cần lấy resident_id thực tế
            ...data
          }),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || 'Lỗi khi tạo hóa đơn.');
        }

        setModalStatus("success");
        setStatusMessage("Đã thêm hóa đơn mới!");
        setIsAddModalOpen(false);
      }
      
      fetchInvoices(); // Refresh list
      setIsStatusModalOpen(true);
    } catch (err) {
      console.error("Save Error:", err);
      setFormError(err.message);
    }
  };

  const toggleDeleteMode = () => setIsDeleteMode(!isDeleteMode);

  const handleDeleteClick = (id) => {
    setItemToDeleteId(id);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmModal(false);
    
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${itemToDeleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Lỗi khi xóa hóa đơn.');
      }

      fetchInvoices(); // Refresh list
      setModalStatus("success");
      setStatusMessage("Đã xóa hóa đơn thành công!");
      setIsStatusModalOpen(true);
    } catch (err) {
      console.error("Delete Error:", err);
      setModalStatus("failure");
      setStatusMessage(err.message);
      setIsStatusModalOpen(true);
    } finally {
      setItemToDeleteId(null);
    }
  };

  const handleCloseStatusModal = () => {
    setIsStatusModalOpen(false);
    setModalStatus(null);
    setStatusMessage("");
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
    return <div className="text-white text-lg p-4">Đang tải hóa đơn...</div>;
  }

  if (error) {
    return <div className="text-red-400 text-lg p-4">Lỗi tải dữ liệu: {error}</div>;
  }

  return (
    <div>
      {/* Search Bar */}
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
            placeholder="Tìm theo ID hóa đơn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Quản lý hóa đơn</h1>
        <div className="flex space-x-4">
          {!isDeleteMode && (
            <button
              onClick={handleAddClick}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 flex items-center space-x-2"
            >
              <span>+ Thêm hóa đơn</span>
            </button>
          )}
          <button
            onClick={toggleDeleteMode}
            className={`${
              isDeleteMode
                ? "bg-gray-500 hover:bg-gray-600"
                : "bg-red-500 hover:bg-red-600"
            } text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200`}
          >
            {isDeleteMode ? "Hoàn tất" : "Xóa hóa đơn"}
          </button>
        </div>
      </div>

      {/* Invoice List */}
      <div className="space-y-4">
        {filteredInvoices.length === 0 ? (
          <div className="bg-white p-6 rounded-lg text-center text-gray-500">
            Không có hóa đơn nào phù hợp với tìm kiếm.
          </div>
        ) : (
          filteredInvoices.map((item) => (
            <InvoiceItem
              key={item.id}
              item={item}
              isDeleteMode={isDeleteMode}
              onDeleteClick={handleDeleteClick}
              onEditClick={handleEditClick}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <InvoiceFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSave}
        invoiceData={null}
        error={formError}
        setError={setFormError}
      />

      <InvoiceFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSave}
        invoiceData={editingInvoice}
        error={formError}
        setError={setFormError}
      />

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        title="Chú ý: Xóa hóa đơn!!!"
        message="Bạn có chắc chắn muốn xóa hóa đơn này không?"
      />

      <StatusModal isOpen={isStatusModalOpen} onClose={handleCloseStatusModal}>
        {renderStatusModalContent()}
      </StatusModal>
    </div>
  );
};