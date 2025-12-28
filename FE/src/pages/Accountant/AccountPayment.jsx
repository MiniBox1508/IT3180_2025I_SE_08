import React, { useState, useEffect, useRef } from "react";
import { StatusModal } from "../../layouts/StatusModal";
import { ConfirmationModal } from "../../layouts/ConfirmationModal";
// Import Icons
import { FiPlus, FiX } from "react-icons/fi";
import acceptIcon from "../../images/accept_icon.png";
import notAcceptIcon from "../../images/not_accept_icon.png";

// --- IMPORTS CHO PHÂN TRANG (MỚI) ---
import arrowLeft from "../../images/Arrow_Left_Mini_Circle.png"; 
import arrowRight from "../../images/Arrow_Right_Mini_Circle.png";

// --- NEW IMPORT: EXCEL EXPORT ---
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

// --- HÀM LẤY TOKEN ---
const getToken = () => localStorage.getItem("token");

// --- FORMAT TIỀN TỆ ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// --- ICON DOWNLOAD ---
const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

// --- NEW: UPLOAD ICON ---
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m-4-4v12" />
  </svg>
);

// =========================================================================
// === INVOICE FORM MODAL ===
// =========================================================================
const InvoiceFormModal = ({
  isOpen,
  onClose,
  onSave,
  invoiceData,
  residents,
  error,
  setError,
  importedData // PROPS: Dữ liệu từ Excel
}) => {
  const isEditing = !!invoiceData;

  const uniqueApartments = React.useMemo(() => {
    if (!residents) return [];
    const apartments = residents
      .map((r) => r.apartment_id)
      .filter((apt) => apt && apt.trim() !== "");
    return [...new Set(apartments)].sort();
  }, [residents]);

  const [singleFormData, setSingleFormData] = useState({
    apartment_id: "",
    feetype: "",
    amount: "",
    payment_date: "",
    state: 0,
  });

  const [rows, setRows] = useState([
    { id: Date.now(), apartment_id: "", feetype: "", amount: "", payment_date: "" }
  ]);

  useEffect(() => {
    if (isOpen) {
      if (invoiceData) {
        // Mode: Edit Single
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
      } else if (importedData && importedData.length > 0) {
        // Mode: Import Excel -> Fill Rows
        setRows(importedData);
      } else {
        // Mode: Add New Empty
        setRows([{ id: Date.now(), apartment_id: "", feetype: "", amount: "", payment_date: "" }]);
      }
      setError("");
    }
  }, [isOpen, invoiceData, importedData, setError]);

  const handleSingleChange = (e) => {
    const { name, value } = e.target;
    setSingleFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (isEditing) {
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
      const dataToSend = rows.map(row => ({
        apartment_id: row.apartment_id,
        feetype: row.feetype,
        amount: parseFloat(row.amount),
        payment_date: row.payment_date || null,
        state: 0
      }));
      onSave(dataToSend, null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
      <div className={`bg-white p-6 rounded-2xl shadow-2xl relative flex flex-col ${isEditing ? 'w-full max-w-md' : 'w-full max-w-5xl'}`} style={{ maxHeight: '90vh' }}>
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {isEditing ? "Chỉnh sửa hóa đơn" : "Thêm hóa đơn mới"}
        </h2>
        {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        {!isEditing && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="overflow-y-auto custom-scrollbar border border-gray-200 rounded-lg flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-3 text-xs font-bold text-gray-600 uppercase border-b w-1/4">Số căn hộ</th>
                    <th className="p-3 text-xs font-bold text-gray-600 uppercase border-b w-1/4">Loại phí</th>
                    <th className="p-3 text-xs font-bold text-gray-600 uppercase border-b w-1/5">Số tiền (VNĐ)</th>
                    <th className="p-3 text-xs font-bold text-gray-600 uppercase border-b w-1/5">Hạn đóng</th>
                    <th className="p-3 text-xs font-bold text-gray-600 uppercase border-b w-12 text-center">
                      <button type="button" onClick={addRow} className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors mx-auto shadow-md"><FiPlus size={16} /></button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-blue-50 transition-colors group">
                      <td className="p-2">
                        <select value={row.apartment_id} onChange={(e) => handleRowChange(row.id, "apartment_id", e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option value="">-- Chọn --</option>
                          {uniqueApartments.map((apt) => (<option key={apt} value={apt}>{apt}</option>))}
                        </select>
                      </td>
                      <td className="p-2"><input type="text" value={row.feetype} onChange={(e) => handleRowChange(row.id, "feetype", e.target.value)} placeholder="VD: Phí QL T12" className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></td>
                      <td className="p-2"><input type="number" value={row.amount} onChange={(e) => handleRowChange(row.id, "amount", e.target.value)} placeholder="0" className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" min="0" /></td>
                      <td className="p-2"><input type="date" value={row.payment_date} onChange={(e) => handleRowChange(row.id, "payment_date", e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" /></td>
                      <td className="p-2 text-center">
                        {rows.length > 1 && (<button type="button" onClick={() => removeRow(row.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"><FiX size={20} /></button>)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isEditing && (
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-500 mb-1">Hóa đơn ID</label><div className="w-full bg-gray-100 rounded-md border border-gray-200 px-3 py-2 text-gray-700 font-mono text-sm">{invoiceData.id}</div></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Số căn hộ</label><input type="text" value={singleFormData.apartment_id} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 focus:outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Loại phí</label><input type="text" name="feetype" value={singleFormData.feetype} onChange={handleSingleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Số tiền (VND)</label><input type="number" name="amount" value={singleFormData.amount} onChange={handleSingleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Ngày thanh toán</label><input type="date" name="payment_date" value={singleFormData.payment_date} onChange={handleSingleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label><select name="state" value={singleFormData.state} onChange={handleSingleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 outline-none"><option value={0}>Chưa thanh toán</option><option value={1}>Đã thanh toán</option></select></div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-6 border-t mt-4 border-gray-100">
          <button type="button" onClick={onClose} className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-colors">Hủy</button>
          <button type="button" onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg shadow-blue-500/30">Xác nhận</button>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// === INVOICE ITEM COMPONENT ===
// =========================================================================
const InvoiceItem = ({ item, isDeleteMode, onEditClick, isSelected, onToggleSelect }) => {
  const formattedDate = item.payment_date
    ? new Date(item.payment_date).toLocaleDateString("vi-VN")
    : "---";

  const isPaid = item.state === 1;
  const statusText = isPaid ? "Đã thanh toán" : "Chưa thanh toán";
  const statusColorClass = isPaid ? "text-green-500" : "text-red-500";

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 flex items-center relative overflow-hidden mb-4">
      <div className={`absolute left-4 top-3 bottom-3 w-1.5 rounded-full ${isPaid ? 'bg-green-500' : 'bg-orange-500'}`}></div>
      <div className="flex-1 grid grid-cols-6 gap-4 items-center pl-8 pr-4 text-gray-800">
        <div className="text-center"><p className="text-xs text-gray-500 mb-1">Hóa đơn ID</p><p className="font-semibold">{item.id}</p></div>
        <div><p className="text-xs text-gray-500 mb-1">Số căn hộ</p><p className="font-medium">{item.apartment_id || "---"}</p></div>
        <div><p className="text-xs text-gray-500 mb-1">Loại phí</p><p className="font-medium truncate" title={item.feetype}>{item.feetype}</p></div>
        <div><p className="text-xs text-gray-500 mb-1">Ngày thanh toán</p><p className="text-gray-600">{formattedDate}</p></div>
        <div><p className="text-xs text-gray-500 mb-1">Số tiền</p><p className="font-semibold text-blue-600">{formatCurrency(item.amount)}</p></div>
        <div><p className="text-xs text-gray-500 mb-1">Trạng thái</p><p className={`font-bold text-sm ${statusColorClass}`}>{statusText}</p></div>
      </div>
      <div className="ml-auto flex-shrink-0 pr-2 w-24 flex justify-end">
        {isDeleteMode ? (
          <div className="flex items-center justify-center h-full">
             <input type="checkbox" checked={isSelected} onChange={() => onToggleSelect(item.id)} className="w-6 h-6 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer" />
          </div>
        ) : (
          <button onClick={() => onEditClick(item)} className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium">Chỉnh sửa</button>
        )}
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
  const [importedInvoices, setImportedInvoices] = useState(null); 

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // --- STATE PHÂN TRANG (MỚI) ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Số lượng item / 1 trang

  const fileInputRef = useRef(null); 

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getToken();
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

  // --- RESET TRANG KHI TÌM KIẾM (MỚI) ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredInvoices = invoices.filter((item) => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.trim().toLowerCase();
    return String(item.id).toLowerCase().includes(searchLower) || (item.apartment_id && String(item.apartment_id).toLowerCase().includes(searchLower));
  });

  // --- LOGIC CẮT DỮ LIỆU ĐỂ HIỂN THỊ (PAGINATION - MỚI) ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  // --- HANDLER CHUYỂN TRANG (MỚI) ---
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleExportExcel = async () => {
    const dataToExport = filteredInvoices; // Xuất toàn bộ dữ liệu lọc, không chỉ trang hiện tại

    if (dataToExport.length === 0) {
      setModalStatus("failure");
      setStatusMessage("Không có dữ liệu để xuất!");
      setIsStatusModalOpen(true);
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Danh sách hóa đơn");

    worksheet.columns = [
      { header: "ID Hóa đơn", key: "id", width: 15 },
      { header: "Số căn hộ", key: "apartment_id", width: 15 },
      { header: "Loại phí", key: "feetype", width: 30 },
      { header: "Ngày thanh toán", key: "payment_date", width: 20 },
      { header: "Số tiền (VNĐ)", key: "amount", width: 20 },
      { header: "Trạng thái", key: "state", width: 20 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F81BD" } };
    worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

    dataToExport.forEach((item) => {
      const row = worksheet.addRow({
        id: item.id,
        apartment_id: item.apartment_id || "---",
        feetype: item.feetype,
        payment_date: item.payment_date ? new Date(item.payment_date).toLocaleDateString("vi-VN") : "---",
        amount: item.amount,
        state: item.state === 1 ? "Đã thanh toán" : "Chưa thanh toán",
      });

      const stateCell = row.getCell("state");
      if (item.state === 1) {
        stateCell.font = { color: { argb: "FF008000" }, bold: true };
      } else {
        stateCell.font = { color: { argb: "FFFF0000" }, bold: true };
      }
      row.getCell("amount").numFmt = '#,##0'; 
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const fileName = `DanhSachHoaDon_${new Date().toLocaleDateString("vi-VN").replace(/\//g, "")}.xlsx`;
    saveAs(blob, fileName);
  };

  const handleImportClick = () => { fileInputRef.current.click(); };

  // --- LOGIC ĐỌC FILE VÀ CHECK LỖI ---
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(file);
      const worksheet = workbook.getWorksheet(1);

      const validRows = [];
      const errorMessages = [];
      const validApartmentIds = residents.map(r => r.apartment_id ? r.apartment_id.toLowerCase().trim() : "");

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        const aptId = row.getCell(1).text ? row.getCell(1).text.trim() : "";
        const feeType = row.getCell(2).text || "";
        const amount = row.getCell(3).value ? Number(row.getCell(3).value) : 0;
        
        let paymentDate = "";
        const dateCell = row.getCell(4).value;
        if (dateCell instanceof Date) {
            paymentDate = dateCell.toISOString().split('T')[0];
        } else if (typeof dateCell === 'string') {
             paymentDate = dateCell; 
        }

        if (aptId) {
          if (!validApartmentIds.includes(aptId.toLowerCase())) {
            // Căn hộ KHÔNG tồn tại -> Đẩy vào list lỗi
            errorMessages.push(`Dòng ${rowNumber}: Căn hộ "${aptId}" không tồn tại trong hệ thống.`);
          } else {
            // Căn hộ hợp lệ -> Đẩy vào list hợp lệ
            validRows.push({
              id: Date.now() + rowNumber,
              apartment_id: aptId,
              feetype: feeType,
              amount: amount,
              payment_date: paymentDate
            });
          }
        }
      });

      if (errorMessages.length > 0) {
        // TRƯỜNG HỢP CÓ LỖI: HIỆN POPUP LỖI
        setModalStatus("failure");
        
        // Tạo thông báo lỗi + Thông báo về việc sẽ tiếp tục với các dòng hợp lệ
        const displayErrors = errorMessages.slice(0, 5);
        if (errorMessages.length > 5) displayErrors.push(`...và ${errorMessages.length - 5} lỗi khác.`);
        
        setStatusMessage(
          <div>
            <p className="font-bold mb-2">Phát hiện lỗi trong file Excel!</p>
            <ul className="text-left text-sm list-disc pl-5 mb-3 text-red-600 bg-red-50 p-2 rounded">
                {displayErrors.map((err, idx) => <li key={idx}>{err}</li>)}
            </ul>
            {validRows.length > 0 ? (
                <p className="text-sm font-semibold text-green-700">
                    Nhấn "Đóng" để tiếp tục thêm {validRows.length} hóa đơn hợp lệ.
                </p>
            ) : (
                <p className="text-sm text-gray-600">Vui lòng kiểm tra lại file.</p>
            )}
          </div>
        );

        // Lưu tạm các dòng hợp lệ để dùng sau khi đóng modal
        if (validRows.length > 0) {
            setImportedInvoices(validRows);
        } else {
            setImportedInvoices(null);
        }
        setIsStatusModalOpen(true);

      } else if (validRows.length > 0) {
        // TRƯỜNG HỢP KHÔNG CÓ LỖI: Mở luôn form
        setImportedInvoices(validRows);
        setFormError("");
        setIsAddModalOpen(true);
      } else {
        setModalStatus("failure");
        setStatusMessage("File Excel rỗng hoặc không đúng định dạng!");
        setIsStatusModalOpen(true);
      }

    } catch (err) {
      console.error("Import Error:", err);
      setModalStatus("failure");
      setStatusMessage("Lỗi khi đọc file Excel!");
      setIsStatusModalOpen(true);
    } finally {
      e.target.value = null; 
    }
  };

  const handleAddClick = () => { 
      setImportedInvoices(null); 
      setIsAddModalOpen(true); 
      setFormError(""); 
  };
  
  const handleEditClick = (invoice) => { 
      setImportedInvoices(null);
      setEditingInvoice(invoice); 
      setIsEditModalOpen(true); 
      setFormError(""); 
  };

  const handleSave = async (data, invoiceId) => {
    try {
      const token = getToken();

      if (invoiceId) {
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
        const itemsToCreate = Array.isArray(data) ? data : [data];
        
        await Promise.all(itemsToCreate.map(async (item) => {
          const foundResident = residents.find(
            r => r.apartment_id && r.apartment_id.toLowerCase() === item.apartment_id.trim().toLowerCase()
          );
          
          if (!foundResident) {
            throw new Error(`Không tìm thấy dữ liệu cư dân cho căn hộ ${item.apartment_id}`);
          }

          const createPayload = {
            resident_id: foundResident.id,
            amount: item.amount,
            feetype: item.feetype,
            payment_form: "Tiền mặt",
            payment_date: item.payment_date 
          };

          const res = await fetch(`${API_BASE_URL}/payments`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(createPayload),
          });

          if (!res.ok) throw new Error(`Lỗi khi tạo hóa đơn cho ${item.apartment_id}`);
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

  const toggleDeleteMode = () => { setIsDeleteMode(!isDeleteMode); setSelectedIds([]); };
  const handleSelect = (id) => { setSelectedIds((prev) => prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]); };
  const handleDeleteSelectedClick = () => { if (selectedIds.length > 0) setShowConfirmModal(true); };

  const handleConfirmDelete = async () => {
    setShowConfirmModal(false);
    if (selectedIds.length === 0) return;

    try {
      const token = getToken();
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`${API_BASE_URL}/payments/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => { if (!res.ok) throw new Error(`Xóa thất bại ID: ${id}`); return res; })
        )
      );

      fetchData();
      setModalStatus("success");
      setStatusMessage(`Đã xóa ${selectedIds.length} hóa đơn thành công!`);
      setIsStatusModalOpen(true);
      setIsDeleteMode(false);
      setSelectedIds([]);

    } catch (err) {
      setModalStatus("failure");
      setStatusMessage(err.message);
      setIsStatusModalOpen(true);
    }
  };

  const handleCancelDelete = () => { setShowConfirmModal(false); };
  
  const handleCloseStatusModal = () => {
    setIsStatusModalOpen(false);
    
    // Nếu vừa đóng popup lỗi import (failure) MÀ vẫn có dữ liệu hợp lệ đang chờ -> Mở form thêm
    if (modalStatus === "failure" && importedInvoices && importedInvoices.length > 0) {
        setIsAddModalOpen(true);
    }
    
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
        <div className="text-xl font-semibold text-center text-gray-800">{statusMessage}</div>
      </div>
    );
  };

  if (isLoading) return <div className="text-white text-lg p-4">Đang tải hóa đơn...</div>;
  if (error) return <div className="text-red-400 text-lg p-4">Lỗi tải dữ liệu: {error}</div>;

  return (
    <div>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx, .xls" className="hidden" />

      <div className="flex justify-start items-center mb-6">
        <div className="relative w-full max-w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <input type="search" placeholder="Tìm theo ID hóa đơn hoặc Số căn hộ..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none focus:border-blue-500" />
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Quản lý công nợ</h1>
        <div className="flex space-x-4">
          {!isDeleteMode ? (
            <>
              <button onClick={handleImportClick} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 flex items-center shadow-md">
                <UploadIcon /> Nhập Excel
              </button>
              <button onClick={handleExportExcel} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 flex items-center shadow-md">
                <DownloadIcon /> Xuất Excel
              </button>
              <button onClick={handleAddClick} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 flex items-center space-x-2">
                <span>+ Thêm hóa đơn</span>
              </button>
              <button onClick={toggleDeleteMode} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200">
                Xóa hóa đơn
              </button>
            </>
          ) : (
            <>
              <button onClick={handleDeleteSelectedClick} disabled={selectedIds.length === 0} className={`font-semibold py-2 px-4 rounded-md transition-colors duration-200 ${selectedIds.length === 0 ? "bg-gray-400 cursor-not-allowed text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}>
                Xóa các mục đã chọn ({selectedIds.length})
              </button>
              <button onClick={toggleDeleteMode} className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200">
                Hủy
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {currentItems.length === 0 ? (
          <div className="bg-white p-6 rounded-lg text-center text-gray-500">
             {filteredInvoices.length === 0 ? "Không có hóa đơn nào phù hợp với tìm kiếm." : "Trang này không có dữ liệu."}
          </div>
        ) : (
          // Thay đổi: Render currentItems thay vì filteredInvoices
          currentItems.map((item) => (
            <InvoiceItem key={item.id} item={item} isDeleteMode={isDeleteMode} onEditClick={handleEditClick} isSelected={selectedIds.includes(item.id)} onToggleSelect={handleSelect} />
          ))
        )}
      </div>

      {/* --- PAGINATION CONTROLS (MỚI - ĐƯỢC THÊM VÀO) --- */}
      {filteredInvoices.length > 0 && (
        <div className="flex justify-center items-center mt-6 space-x-6 pb-6">
          {/* Nút Prev */}
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className={`w-12 h-12 rounded-full border-2 border-black flex items-center justify-center transition-transform hover:scale-105 ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed bg-gray-200" : "cursor-pointer bg-white"
            }`}
          >
            <img src={arrowLeft} alt="Previous" className="w-6 h-6 object-contain" />
          </button>

          {/* Thanh hiển thị số trang */}
          <div className="bg-gray-400/80 backdrop-blur-sm text-white font-bold py-3 px-8 rounded-full flex items-center space-x-4 shadow-lg">
            <span className="text-lg">Trang</span>
            <div className="bg-gray-500/60 rounded-lg px-4 py-1 text-xl shadow-inner">
              {currentPage}
            </div>
            <span className="text-lg">/ {totalPages}</span>
          </div>

          {/* Nút Next */}
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={`w-12 h-12 rounded-full border-2 border-black flex items-center justify-center transition-transform hover:scale-105 ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed bg-gray-200" : "cursor-pointer bg-white"
            }`}
          >
            <img src={arrowRight} alt="Next" className="w-6 h-6 object-contain" />
          </button>
        </div>
      )}

      <InvoiceFormModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
        onSave={handleSave}
        invoiceData={isEditModalOpen ? editingInvoice : null}
        residents={residents}
        error={formError}
        setError={setFormError}
        importedData={importedInvoices}
      />

      <ConfirmationModal isOpen={showConfirmModal} onClose={handleCancelDelete} onConfirm={handleConfirmDelete} title="Chú ý: Xóa hóa đơn!!!" message={`Bạn có chắc chắn muốn xóa ${selectedIds.length} hóa đơn đã chọn không?`} />
      <StatusModal isOpen={isStatusModalOpen} onClose={handleCloseStatusModal}>{renderStatusModalContent()}</StatusModal>
    </div>
  );
};