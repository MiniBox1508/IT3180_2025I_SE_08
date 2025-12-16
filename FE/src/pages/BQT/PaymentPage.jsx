import React, { useState, useEffect, useMemo } from "react";
// === Import Layout
import { StatusModal } from "../../layouts/StatusModal";
import { ConfirmationModal } from "../../layouts/ConfirmationModal";
// === Import Icons
import { FiCheckCircle, FiXCircle, FiPlus, FiX } from "react-icons/fi";
import acceptIcon from "../../images/accept_icon.png";
import notAcceptIcon from "../../images/not_accept_icon.png";

// === Khai báo API Base URL
const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

// --- HÀM LẤY TOKEN TỪ LOCALSTORAGE ---
const getToken = () => {
  return localStorage.getItem("token");
};

// --- Helper format tiền tệ ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// --- HELPER: Xóa dấu tiếng Việt để tìm kiếm ---
const removeVietnameseTones = (str) => {
  if (!str) return "";
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  // Một số hệ thống mã hóa tiếng Việt bằng tổ hợp ký tự
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // huyền, sắc, hỏi, ngã, nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // mũ â (ê), mũ ă, mũ ơ (ư)
  return str;
};

// ====================================================

// === COMPONENT: PAYMENT FORM MODAL (BULK INSERT TABLE) ===
const PaymentFormModal = ({
  isOpen,
  onClose,
  onSave,
  residentOptions,
  error,
  setError,
}) => {
  // Tạo danh sách căn hộ duy nhất từ residentOptions để hiển thị trong Dropdown
  const uniqueApartments = useMemo(() => {
    if (!residentOptions) return [];
    const apartments = residentOptions
      .map((r) => r.apartment_id)
      .filter((apt) => apt && apt.trim() !== "");
    return [...new Set(apartments)].sort();
  }, [residentOptions]);

  // State quản lý danh sách các dòng (rows)
  const [rows, setRows] = useState([
    { id: Date.now(), apartment_id: "", feetype: "", amount: "", due_date: "" }
  ]);

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      setRows([{ id: Date.now(), apartment_id: "", feetype: "", amount: "", due_date: "" }]);
      setError("");
    }
  }, [isOpen, setError]);

  // Handler thay đổi giá trị trong dòng
  const handleRowChange = (id, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  // Thêm dòng mới
  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: Date.now(), apartment_id: "", feetype: "", amount: "", due_date: "" },
    ]);
  };

  // Xóa dòng
  const removeRow = (id) => {
    if (rows.length > 1) {
      setRows((prev) => prev.filter((row) => row.id !== id));
    }
  };

  // Xử lý Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 1. Validate dữ liệu từng dòng
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.apartment_id || !row.feetype || !row.amount) {
        setError(`Dòng ${i + 1}: Vui lòng chọn Căn hộ, nhập Loại phí và Số tiền.`);
        return;
      }
      if (parseFloat(row.amount) <= 0) {
        setError(`Dòng ${i + 1}: Số tiền phải lớn hơn 0.`);
        return;
      }
    }

    try {
      const token = getToken();
      
      // 2. Gửi API song song cho tất cả các dòng
      await Promise.all(rows.map(async (row) => {
        // Tìm resident_id tương ứng với apartment_id được chọn
        const resident = residentOptions.find(
          r => r.apartment_id === row.apartment_id && r.state === 'active'
        );

        if (!resident) {
          throw new Error(`Không tìm thấy cư dân cho căn hộ ${row.apartment_id}`);
        }

        const dataToSend = {
          resident_id: resident.id,
          amount: parseFloat(row.amount),
          feetype: row.feetype,
          payment_form: "Chuyển khoản QR", 
        };

        const response = await fetch(`${API_BASE_URL}/payments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dataToSend),
        });

        if (!response.ok) {
          const result = await response.json().catch(() => ({}));
          throw new Error(result.error || `Lỗi khi tạo hóa đơn cho ${row.apartment_id}`);
        }
      }));

      // 3. Thành công
      onSave(); 
      onClose();
    } catch (err) {
      console.error("API Error:", err);
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-5xl flex flex-col" style={{ maxHeight: '90vh' }}>
        
        <h2 className="text-xl font-bold mb-4 text-gray-800">Thêm hóa đơn mới</h2>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-hidden flex flex-col border border-gray-200 rounded-lg">
          {/* Table Header */}
          <div className="overflow-y-auto custom-scrollbar flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-3 text-xs font-bold text-gray-600 uppercase border-b w-[20%]">Số căn hộ</th>
                  <th className="p-3 text-xs font-bold text-gray-600 uppercase border-b w-[25%]">Loại phí</th>
                  <th className="p-3 text-xs font-bold text-gray-600 uppercase border-b w-[20%]">Số tiền (VNĐ)</th>
                  <th className="p-3 text-xs font-bold text-gray-600 uppercase border-b w-[25%]">Hạn đóng</th>
                  <th className="p-3 text-xs font-bold text-gray-600 uppercase border-b w-[10%] text-center">
                    <button 
                      type="button" 
                      onClick={addRow}
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors mx-auto shadow-md"
                      title="Thêm dòng mới"
                    >
                      <FiPlus size={16} />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-blue-50 transition-colors">
                    {/* Cột 1: Căn hộ */}
                    <td className="p-2">
                      <select
                        value={row.apartment_id}
                        onChange={(e) => handleRowChange(row.id, "apartment_id", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        <option value="">-- Chọn --</option>
                        {uniqueApartments.map((apt) => (
                          <option key={apt} value={apt}>{apt}</option>
                        ))}
                      </select>
                    </td>
                    
                    {/* Cột 2: Loại phí */}
                    <td className="p-2">
                      <input
                        type="text"
                        value={row.feetype}
                        onChange={(e) => handleRowChange(row.id, "feetype", e.target.value)}
                        placeholder="VD: Phí QL T10"
                        className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>

                    {/* Cột 3: Số tiền */}
                    <td className="p-2">
                      <input
                        type="number"
                        value={row.amount}
                        onChange={(e) => handleRowChange(row.id, "amount", e.target.value)}
                        placeholder="0"
                        className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                    </td>

                    {/* Cột 4: Hạn đóng */}
                    <td className="p-2">
                      <input
                        type="date"
                        value={row.due_date}
                        onChange={(e) => handleRowChange(row.id, "due_date", e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>

                    {/* Cột 5: Xóa */}
                    <td className="p-2 text-center">
                      {rows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRow(row.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                          title="Xóa dòng"
                        >
                          <FiX size={20} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end space-x-4 pt-6 mt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Hoàn tác
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg shadow-blue-500/30"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

// === COMPONENT: CHANGE STATUS MODAL (Giữ nguyên) ===
const ChangeStatusModal = ({ isOpen, onClose, payment, onConfirm }) => {
  const [newStatus, setNewStatus] = useState(null);

  useEffect(() => {
    if (isOpen) {
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

  return (
    <div className="fixed left-0 right-0 top-0 bottom-0 flex justify-center items-center z-50 pointer-events-none">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg text-gray-900 pointer-events-auto shadow-xl">
        <h2 className="text-lg font-bold mb-6 text-center">
          Thay đổi trạng thái thanh toán {payment.id}
        </h2>

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

// ===================================================

// === COMPONENT: PAYMENT ITEM (Giữ nguyên giao diện cũ) ===
const PaymentItem = ({ item, onStatusClick, isDeleteMode, isSelected, onToggleSelect }) => {
  const isPaid = item.status_text === "Đã thanh toán";
  const formattedPaymentDate = item.payment_date
    ? new Date(item.payment_date).toLocaleDateString("vi-VN")
    : "---";

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex items-center space-x-6 relative overflow-hidden mb-4">
      {/* Hiển thị Checkbox khi ở chế độ Xóa */}
      {isDeleteMode && (
        <div className="pl-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(item.id)}
            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
          />
        </div>
      )}

      <div className="absolute left-4 top-3 bottom-3 w-1.5 bg-blue-500 rounded-full"></div>
      
      {/* Grid thông tin */}
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
          {/* Nếu đang xóa thì disable click đổi trạng thái */}
          <p
            className={`font-semibold mb-2 cursor-pointer ${
              isDeleteMode
                ? "text-gray-400 cursor-not-allowed" // Disable visual
                : isPaid
                ? "text-green-600 hover:underline"
                : "text-red-600 hover:underline"
            }`}
            onClick={() => !isDeleteMode && onStatusClick(item)}
          >
            {item.status_text}
          </p>
        </div>
      </div>
    </div>
  );
};

// ====================================================
// === COMPONENT: TRANG THANH TOÁN CHÍNH ===
export const PaymentPage = () => {
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

  // --- STATE MỚI CHO CHỨC NĂNG XÓA ---
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]); 
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  // ------------------------------------

  // Hàm Fetch dữ liệu Thanh toán
  const fetchPayments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/payments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu thanh toán.");
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

  // Hàm Fetch dữ liệu Cư dân (để dùng cho Modal Thêm)
  const fetchResidents = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/residents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setResidents(data.filter((r) => r.state === "active"));
      }
    } catch (err) {
      console.error("Fetch Residents Error:", err);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchResidents();
  }, []);

  // --- LOGIC LỌC VÀ SẮP XẾP (ĐÃ CẬP NHẬT) ---
  const filteredPayments = payments
    .filter((payment) => {
      if (!searchTerm.trim()) return true;
      const term = removeVietnameseTones(searchTerm.trim());
      
      const idMatch = String(payment.id).toLowerCase().includes(term);
      const feeMatch = removeVietnameseTones(payment.feetype || "").includes(term);
      const apartmentMatch = removeVietnameseTones(payment.apartment_id || "").includes(term);

      return idMatch || feeMatch || apartmentMatch;
    })
    .sort((a, b) => {
      const isAPaid = a.status_text === "Đã thanh toán" ? 1 : 0;
      const isBPaid = b.status_text === "Đã thanh toán" ? 1 : 0;
      if (isAPaid !== isBPaid) return isAPaid - isBPaid;
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

  // --- HANDLERS CHO XÓA HÀNG LOẠT ---
  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedIds([]); 
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleDeleteSelectedClick = () => {
    if (selectedIds.length > 0) {
      setShowConfirmModal(true); 
    }
  };

  const handleConfirmDelete = async () => {
    setShowConfirmModal(false);
    
    if (selectedIds.length === 0) return;

    try {
      const token = getToken();
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`${API_BASE_URL}/payments/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).then((res) => {
            if (!res.ok) throw new Error(`Xóa thất bại ID: ${id}`);
            return res;
          })
        )
      );

      fetchPayments(); // Reload list
      setModalStatus("success"); // Sử dụng icon success
      setStatusMessage(`Đã xóa ${selectedIds.length} khoản phí thành công!`);
      setIsStatusModalOpen(true);
      
      // Reset trạng thái
      setIsDeleteMode(false);
      setSelectedIds([]);

    } catch (err) {
      console.error("Delete Error:", err);
      setModalStatus("failure"); // Sử dụng icon failure
      setStatusMessage("Có lỗi xảy ra khi xóa. Vui lòng thử lại.");
      setIsStatusModalOpen(true);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
  };
  // ----------------------------------

  // --- HÀM XỬ LÝ MODAL TRẠNG THÁI ---
  const handleCloseStatusModal = () => {
    setIsStatusModalOpen(false);
    setModalStatus(null);
    setStatusMessage("");
  };

  const renderStatusModalContent = () => {
    if (!modalStatus) return null;

    // Logic icon thống nhất
    const isSuccess = modalStatus === "success" || modalStatus === "update_success";
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

  // --- HÀM GỌI KHI LƯU FORM ADD THÀNH CÔNG ---
  const handleAddPaymentSuccess = () => {
    fetchPayments();
    setModalStatus("success");
    setStatusMessage(
      "Thêm các khoản phí mới thành công!"
    );
    setIsStatusModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setAddModalError("");
  };

  // --- HANDLERS FOR CHANGE STATUS MODAL ---
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
    const newStateValue = newStatus ? 1 : 0;

    try {
      const token = getToken();
      const response = await fetch(
        `${API_BASE_URL}/payments/${selectedPayment.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ state: newStateValue }),
        }
      );

      if (!response.ok) {
        throw new Error("Lỗi khi cập nhật trạng thái.");
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

  if (isLoading) return <div className="text-white text-lg p-4">Đang tải danh sách...</div>;
  if (error) return <div className="text-red-400 text-lg p-4">Lỗi tải dữ liệu: {error}</div>;

  return (
    <>
      <div className="flex justify-start items-center mb-6">
        <div className="relative w-full max-w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Tìm kiếm theo ID, Căn hộ, Loại phí..." // Cập nhật placeholder
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Danh sách Thanh toán</h1>
        <div className="flex space-x-4">
          
          {/* Cụm nút chuyển đổi giữa các chế độ */}
          {!isDeleteMode ? (
            // Chế độ thường: Hiện Thêm + Xóa (để vào chế độ xóa)
            <>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition-colors flex items-center space-x-2"
              >
                <span>+ Thêm hóa đơn</span>
              </button>
              <button
                onClick={toggleDeleteMode}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-md transition-colors flex items-center text-sm"
              >
                Xóa khoản phí
              </button>
            </>
          ) : (
            // Chế độ xóa: Hiện Xóa đã chọn + Hủy
            <>
              <button
                onClick={handleDeleteSelectedClick}
                disabled={selectedIds.length === 0}
                className={`font-bold py-2 px-6 rounded-md transition-colors flex items-center text-sm ${
                  selectedIds.length === 0
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                Xóa các mục đã chọn ({selectedIds.length})
              </button>
              <button
                onClick={toggleDeleteMode}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-md transition-colors flex items-center text-sm"
              >
                Hủy
              </button>
            </>
          )}

        </div>
      </div>

      <div className="space-y-4">
        {filteredPayments.length === 0 ? (
          <div className="bg-white p-6 rounded-lg text-center text-gray-500 shadow-md">
            Không có hóa đơn thanh toán nào phù hợp với tìm kiếm.
          </div>
        ) : (
          filteredPayments.map((item) => (
            <PaymentItem
              key={item.id}
              item={item}
              onStatusClick={handleOpenChangeStatusModal}
              isDeleteMode={isDeleteMode}
              isSelected={selectedIds.includes(item.id)}
              onToggleSelect={handleToggleSelect}
            />
          ))
        )}
      </div>

      {/* Modal Thêm Thanh Toán (Bulk Insert) */}
      <PaymentFormModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSave={handleAddPaymentSuccess}
        residentOptions={residents}
        error={addModalError}
        setError={setAddModalError}
        invoiceData={null} // Chế độ Thêm
      />

      {/* Change Status Modal */}
      <ChangeStatusModal
        isOpen={isChangeStatusModalOpen}
        onClose={handleCloseChangeStatusModal}
        payment={selectedPayment}
        onConfirm={handleStatusUpdate}
      />

      {/* Confirmation Modal (Xóa) */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Xác nhận Xóa Thanh Toán"
        message={`Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedIds.length} khoản phí đã chọn không?`}
      />

      {/* Status Modal (Thông báo kết quả) */}
      <StatusModal isOpen={isStatusModalOpen} onClose={handleCloseStatusModal}>
        {renderStatusModalContent()}
      </StatusModal>
    </>
  );
}