import React, { useState, useEffect } from "react";
import { StatusModal } from "../../layouts/StatusModal";
import { ConfirmationModal } from "../../layouts/ConfirmationModal";
// Import Icons
import { FiPlus, FiX } from "react-icons/fi"; // Icon dấu + và x
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import acceptIcon from "../../images/accept_icon.png";
import notAcceptIcon from "../../images/not_accept_icon.png";

const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

// =========================================================================
// === INVOICE FORM MODAL (ADD = TABLE / EDIT = SINGLE FORM) ===
// =========================================================================
const InvoiceFormModal = ({
  isOpen,
  onClose,
  onSave,
  invoiceData,
  residents,
  error,
  setError,
}) => {
  const isEditing = !!invoiceData;

  // Lấy danh sách căn hộ duy nhất
  const uniqueApartments = React.useMemo(() => {
    if (!residents) return [];
    const apartments = residents
      .map((r) => r.apartment_id)
      .filter((apt) => apt && apt.trim() !== "");
    return [...new Set(apartments)].sort();
  }, [residents]);

  // --- STATE CHO FORM SỬA (SINGLE) ---
  const [singleFormData, setSingleFormData] = useState({
    apartment_id: "",
    feetype: "",
    amount: "",
    payment_date: "",
    state: 0,
  });

  // --- STATE CHO FORM THÊM (BULK TABLE) ---
  const [rows, setRows] = useState([
    { id: Date.now(), apartment_id: "", feetype: "", amount: "", payment_date: "" }
  ]);

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      if (invoiceData) {
        // Chế độ Edit: Fill dữ liệu cũ
        const paymentDate = invoiceData.payment_date
          ? new Date(invoiceData.payment_date).toISOString().split("T")[0]
          : "";
        setSingleFormData({
          apartment_id: invoiceData.apartment_id || "",
          feetype: invoiceData.feetype || "",
          amount: invoiceData.amount || "",
          payment_date: paymentDate,
          state: invoiceData.state !== undefined ? invoiceData.state : 0,
        });
      } else {
        // Chế độ Add: Reset về 1 dòng trắng
        setRows([{ id: Date.now(), apartment_id: "", feetype: "", amount: "", payment_date: "" }]);
      }
      setError("");
    }
  }, [isOpen, invoiceData, setError]);

  // --- HANDLERS CHO EDIT (SINGLE) ---
  const handleSingleChange = (e) => {
    const { name, value } = e.target;
    setSingleFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- HANDLERS CHO ADD (BULK TABLE) ---
  const handleRowChange = (id, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: Date.now(), apartment_id: "", feetype: "", amount: "", payment_date: "" },
    ]);
  };

  const removeRow = (id) => {
    if (rows.length > 1) {
      setRows((prev) => prev.filter((row) => row.id !== id));
    }
  };

  // --- SUBMIT ---
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (isEditing) {
      // --- Xử lý Submit EDIT (Giữ nguyên logic cũ) ---
      if (!singleFormData.apartment_id || !singleFormData.feetype || !singleFormData.amount) {
        setError("Vui lòng điền đủ thông tin.");
        return;
      }
      const dataToSend = {
        apartment_id: singleFormData.apartment_id,
        feetype: singleFormData.feetype,
        amount: parseFloat(singleFormData.amount),
        payment_date: singleFormData.payment_date || null,
        state: parseInt(singleFormData.state),
      };
      onSave(dataToSend, invoiceData.id);

    } else {
      // --- Xử lý Submit ADD (Gửi mảng rows) ---
      // Validate từng dòng
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row.apartment_id || !row.feetype || !row.amount) {
          setError(`Dòng ${i + 1}: Vui lòng điền đủ Số căn hộ, Loại phí và Số tiền.`);
          return;
        }
        if (parseFloat(row.amount) <= 0) {
          setError(`Dòng ${i + 1}: Số tiền phải lớn hơn 0.`);
          return;
        }
      }

      // Chuẩn hóa dữ liệu
      const dataToSend = rows.map(row => ({
        apartment_id: row.apartment_id,
        feetype: row.feetype,
        amount: parseFloat(row.amount),
        payment_date: row.payment_date || null,
        state: 0 // Mặc định chưa thanh toán
      }));

      onSave(dataToSend, null); // null ID -> Create Mode
    }
  };

  if (!isOpen) return null;

  // --- RENDER GIAO DIỆN ---
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
      <div className={`bg-white p-6 rounded-2xl shadow-2xl relative ${isEditing ? 'w-full max-w-md' : 'w-full max-w-4xl'}`}>
        
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {isEditing ? "Chỉnh sửa hóa đơn" : "Thêm hóa đơn mới"}
        </h2>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* ============ TRƯỜNG HỢP 1: ADD (TABLE LAYOUT) ============ */}
        {!isEditing && (
          <div className="overflow-hidden">
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar border border-gray-200 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-xs font-bold text-gray-500 uppercase border-b">Số căn hộ</th>
                    <th className="p-3 text-xs font-bold text-gray-500 uppercase border-b">Loại phí</th>
                    <th className="p-3 text-xs font-bold text-gray-500 uppercase border-b">Số tiền (VNĐ)</th>
                    <th className="p-3 text-xs font-bold text-gray-500 uppercase border-b">Hạn đóng</th>
                    <th className="p-3 text-xs font-bold text-gray-500 uppercase border-b w-10 text-center">
                      <button 
                        type="button" 
                        onClick={addRow}
                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors mx-auto"
                        title="Thêm dòng"
                      >
                        <FiPlus size={14} />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row, index) => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      {/* Cột 1: Căn hộ */}
                      <td className="p-2">
                        <div className="relative">
                          <select
                            value={row.apartment_id}
                            onChange={(e) => handleRowChange(row.id, "apartment_id", e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 bg-white"
                          >
                            <option value="">Chọn...</option>
                            {uniqueApartments.map((apt) => (
                              <option key={apt} value={apt}>{apt}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      {/* Cột 2: Loại phí */}
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.feetype}
                          onChange={(e) => handleRowChange(row.id, "feetype", e.target.value)}
                          placeholder="VD: Phí QL T10"
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      {/* Cột 3: Số tiền */}
                      <td className="p-2">
                        <input
                          type="number"
                          value={row.amount}
                          onChange={(e) => handleRowChange(row.id, "amount", e.target.value)}
                          placeholder="0"
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      {/* Cột 4: Hạn đóng */}
                      <td className="p-2">
                        <input
                          type="date"
                          value={row.payment_date}
                          onChange={(e) => handleRowChange(row.id, "payment_date", e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 text-gray-500"
                        />
                      </td>
                      {/* Cột 5: Xóa */}
                      <td className="p-2 text-center">
                        {rows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRow(row.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Xóa dòng"
                          >
                            <FiX size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============ TRƯỜNG HỢP 2: EDIT (SINGLE FORM - GIỮ NGUYÊN) ============ */}
        {isEditing && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Hóa đơn ID</label>
              <div className="w-full bg-gray-100 rounded-md border border-gray-200 px-3 py-2 text-gray-700">{invoiceData.id}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số căn hộ</label>
              <input type="text" value={singleFormData.apartment_id} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại phí</label>
              <input type="text" name="feetype" value={singleFormData.feetype} onChange={handleSingleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền (VND)</label>
              <input type="number" name="amount" value={singleFormData.amount} onChange={handleSingleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày thanh toán</label>
              <input type="date" name="payment_date" value={singleFormData.payment_date} onChange={handleSingleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select name="state" value={singleFormData.state} onChange={handleSingleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 outline-none">
                <option value={0}>Chưa thanh toán</option>
                <option value={1}>Đã thanh toán</option>
              </select>
            </div>
          </div>
        )}

        {/* --- FOOTER BUTTONS --- */}
        <div className="flex justify-end space-x-3 pt-6 border-t mt-4 border-gray-100">
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const isPaid = item.state === 1;
  const statusText = isPaid ? "Đã thanh toán" : "Chưa thanh toán";
  const statusColorClass = isPaid ? "text-green-500" : "text-red-500";

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 flex items-center relative overflow-hidden mb-4">
      <div className={`absolute left-4 top-3 bottom-3 w-1.5 rounded-full ${isPaid ? 'bg-green-500' : 'bg-orange-500'}`}></div>

      <div className="flex-1 grid grid-cols-6 gap-4 items-center pl-8 pr-4 text-gray-800">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Hóa đơn ID</p>
          <p className="font-semibold">{item.id}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Số căn hộ</p>
          <p className="font-medium">{item.apartment_id || "---"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Loại phí</p>
          <p className="font-medium truncate" title={item.feetype}>{item.feetype}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Ngày thanh toán</p>
          <p className="text-gray-600">{formattedDate}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Số tiền</p>
          <p className="font-semibold text-blue-600">{formatCurrency(item.amount)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
          <p className={`font-bold text-sm ${statusColorClass}`}>{statusText}</p>
        </div>
      </div>

      <div className="ml-auto flex-shrink-0 pr-2">
        <button
          onClick={handleActionClick}
          className={`${
            isDeleteMode ? "text-red-600 hover:text-red-800" : "text-blue-600 hover:text-blue-800"
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
  const [residents, setResidents] = useState([]);
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

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const [paymentsRes, residentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/payments`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/residents`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (!paymentsRes.ok || !residentsRes.ok) throw new Error("Lỗi khi tải dữ liệu từ server.");

      const paymentsData = await paymentsRes.json();
      const residentsData = await residentsRes.json();

      setInvoices(paymentsData);
      setResidents(residentsData);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredInvoices = invoices.filter((item) => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.trim().toLowerCase();
    return String(item.id).toLowerCase().includes(searchLower) || (item.apartment_id && String(item.apartment_id).toLowerCase().includes(searchLower));
  });

  const handleAddClick = () => { setIsAddModalOpen(true); setFormError(""); };
  const handleEditClick = (invoice) => { setEditingInvoice(invoice); setIsEditModalOpen(true); setFormError(""); };

  const handleSave = async (data, invoiceId) => {
    try {
      const token = localStorage.getItem("token");

      if (invoiceId) {
        // --- LOGIC CŨ: SỬA 1 HÓA ĐƠN ---
        const response = await fetch(`${API_BASE_URL}/payments/${invoiceId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Lỗi khi cập nhật hóa đơn.");
        setModalStatus("success");
        setStatusMessage("Chỉnh sửa hóa đơn thành công!");
        setIsEditModalOpen(false);

      } else {
        // --- LOGIC MỚI: THÊM HÀNG LOẠT (data là Array) ---
        // data lúc này là mảng các dòng từ bảng
        const itemsToCreate = Array.isArray(data) ? data : [data];
        
        // Sử dụng Promise.all để gửi nhiều request
        await Promise.all(itemsToCreate.map(async (item) => {
          // Tìm resident_id từ apartment_id
          const foundResident = residents.find(
            r => r.apartment_id && r.apartment_id.toLowerCase() === item.apartment_id.trim().toLowerCase()
          );
          
          if (!foundResident) {
            throw new Error(`Không tìm thấy cư dân cho căn hộ ${item.apartment_id}`);
          }

          const payload = {
            resident_id: foundResident.id,
            amount: item.amount,
            feetype: item.feetype,
            payment_form: "Tiền mặt",
            payment_date: item.payment_date // Gửi kèm nếu có
          };

          const res = await fetch(`${API_BASE_URL}/payments`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
          });

          if (!res.ok) throw new Error(`Lỗi khi tạo hóa đơn cho căn hộ ${item.apartment_id}`);
        }));

        setModalStatus("success");
        setStatusMessage(`Đã thêm ${itemsToCreate.length} hóa đơn thành công!`);
        setIsAddModalOpen(false);
      }

      fetchData();
      setIsStatusModalOpen(true);
    } catch (err) {
      console.error("Save Error:", err);
      setModalStatus("failure");
      setStatusMessage(err.message || "Đã có lỗi xảy ra.");
      setIsStatusModalOpen(true);
    }
  };

  const toggleDeleteMode = () => setIsDeleteMode(!isDeleteMode);
  const handleDeleteClick = (id) => { setItemToDeleteId(id); setShowConfirmModal(true); };

  const handleConfirmDelete = async () => {
    setShowConfirmModal(false);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/payments/${itemToDeleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Lỗi khi xóa hóa đơn.");
      fetchData();
      setModalStatus("success");
      setStatusMessage("Đã xóa hóa đơn thành công!");
      setIsStatusModalOpen(true);
    } catch (err) {
      setModalStatus("failure");
      setStatusMessage(err.message);
      setIsStatusModalOpen(true);
    } finally {
      setItemToDeleteId(null);
    }
  };

  const handleCloseStatusModal = () => { setIsStatusModalOpen(false); setModalStatus(null); setStatusMessage(""); };

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

  if (isLoading) return <div className="text-white text-lg p-4">Đang tải hóa đơn...</div>;
  if (error) return <div className="text-red-400 text-lg p-4">Lỗi tải dữ liệu: {error}</div>;

  return (
    <div>
      {/* HEADER SEARCH */}
      <div className="flex justify-start items-center mb-6">
        <div className="relative w-full max-w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <input type="search" placeholder="Tìm theo ID hóa đơn hoặc Số căn hộ..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none focus:border-blue-500" />
        </div>
      </div>

      {/* HEADER BUTTONS */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Quản lý hóa đơn</h1>
        <div className="flex space-x-4">
          {!isDeleteMode && (
            <button onClick={handleAddClick} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 flex items-center space-x-2">
              <span>+ Thêm hóa đơn</span>
            </button>
          )}
          <button onClick={toggleDeleteMode} className={`${isDeleteMode ? "bg-gray-500 hover:bg-gray-600" : "bg-red-500 hover:bg-red-600"} text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200`}>
            {isDeleteMode ? "Hoàn tất" : "Xóa hóa đơn"}
          </button>
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {filteredInvoices.length === 0 ? (
          <div className="bg-white p-6 rounded-lg text-center text-gray-500">Không có hóa đơn nào phù hợp.</div>
        ) : (
          filteredInvoices.map((item) => (
            <InvoiceItem key={item.id} item={item} isDeleteMode={isDeleteMode} onDeleteClick={handleDeleteClick} onEditClick={handleEditClick} />
          ))
        )}
      </div>

      {/* ADD MODAL (TABLE) / EDIT MODAL (SINGLE) */}
      <InvoiceFormModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
        onSave={handleSave}
        invoiceData={isEditModalOpen ? editingInvoice : null}
        residents={residents}
        error={formError}
        setError={setFormError}
      />

      <ConfirmationModal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={handleConfirmDelete} title="Chú ý: Xóa hóa đơn!!!" message="Bạn có chắc chắn muốn xóa hóa đơn này không?" />
      <StatusModal isOpen={isStatusModalOpen} onClose={handleCloseStatusModal}>{renderStatusModalContent()}</StatusModal>
    </div>
  );
};