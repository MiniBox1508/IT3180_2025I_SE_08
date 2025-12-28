import React, { useState, useEffect, useRef } from "react";
import { StatusModal } from "../../layouts/StatusModal";
import { ConfirmationModal } from "../../layouts/ConfirmationModal";
// Import Icons
import { FiPlus, FiX } from "react-icons/fi";
import acceptIcon from "../../images/accept_icon.png";
import notAcceptIcon from "../../images/not_accept_icon.png";

// --- NEW IMPORT: EXCEL EXPORT ---
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// --- IMPORT ẢNH MŨI TÊN CHO PHÂN TRANG ---
import arrowLeft from "../../images/Arrow_Left_Mini_Circle.png"; 
import arrowRight from "../../images/Arrow_Right_Mini_Circle.png";

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

// --- COMPONENT SEARCH ICON ---
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// --- HELPER: Xóa dấu tiếng Việt ---
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
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "");
  str = str.replace(/\u02C6|\u0306|\u031B/g, "");
  return str;
};

// =========================================================================
// === INVOICE FORM MODAL (THÊM / SỬA) ===
// =========================================================================
const InvoiceFormModal = ({ isOpen, onClose, onSave, invoiceData, residents, error, setError, importedData }) => {
  const isEditing = !!invoiceData;
  const isImporting = importedData && importedData.length > 0;

  // --- STATE CHO CHẾ ĐỘ SỬA (SINGLE FORM) ---
  const [singleFormData, setSingleFormData] = useState({
    resident_id: "",
    feetype: "",
    amount: "",
    due_date: ""
  });

  // --- STATE CHO CHẾ ĐỘ THÊM (BULK TABLE) ---
  const [rows, setRows] = useState([
    { id: Date.now(), apartment_id: "", feetype: "", amount: "", due_date: "" }
  ]);

  // Reset Data khi mở Modal
  useEffect(() => {
    if (isOpen) {
      setError("");
      if (isEditing) {
        // Chế độ Edit: Fill data cũ
        const currentResident = residents.find(r => String(r.id) === String(invoiceData.resident_id));
        setSingleFormData({
          resident_id: invoiceData.resident_id,
          apartment_id: currentResident ? currentResident.apartment_id : "", // Chỉ để hiển thị
          feetype: invoiceData.feetype || "",
          amount: invoiceData.amount || "",
          due_date: invoiceData.due_date ? new Date(invoiceData.due_date).toISOString().split('T')[0] : ""
        });
      } else if (isImporting) {
        // Chế độ Import Excel: Fill data từ file excel
        const initialRows = importedData.map((item, index) => ({
          id: Date.now() + index,
          apartment_id: item.apartment_id || "",
          feetype: item.feetype || "",
          amount: item.amount || "",
          due_date: item.due_date ? new Date(item.due_date).toISOString().split('T')[0] : ""
        }));
        setRows(initialRows);
      } else {
        // Chế độ Add thủ công: 1 dòng trắng
        setRows([{ id: Date.now(), apartment_id: "", feetype: "", amount: "", due_date: "" }]);
      }
    }
  }, [isOpen, invoiceData, importedData, residents, isEditing, isImporting, setError]);

  // --- HANDLERS CHO EDIT ---
  const handleSingleChange = (e) => {
    const { name, value } = e.target;
    setSingleFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- HANDLERS CHO ADD (BULK) ---
  const handleRowChange = (id, field, value) => {
    setRows(prevRows => prevRows.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const addRow = () => {
    setRows(prev => [...prev, { id: Date.now(), apartment_id: "", feetype: "", amount: "", due_date: "" }]);
  };

  const removeRow = (id) => {
    if (rows.length > 1) {
      setRows(prev => prev.filter(row => row.id !== id));
    }
  };

  // --- SUBMIT ---
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (isEditing) {
      // Logic Sửa
      if (!singleFormData.feetype || !singleFormData.amount) {
        setError("Vui lòng điền đủ Loại phí và Số tiền.");
        return;
      }
      onSave(singleFormData, invoiceData.id);
    } else {
      // Logic Thêm Nhiều
      // 1. Validate
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row.apartment_id || !row.feetype || !row.amount) {
          setError(`Dòng ${i + 1}: Thiếu thông tin (Căn hộ, Loại phí hoặc Số tiền).`);
          return;
        }
        // Kiểm tra căn hộ có tồn tại không
        const resident = residents.find(r => r.apartment_id === row.apartment_id && r.state === 'active');
        if (!resident) {
          setError(`Dòng ${i + 1}: Không tìm thấy chủ hộ cho căn hộ ${row.apartment_id}`);
          return;
        }
      }

      // 2. Map data
      const dataToSend = rows.map(row => {
        const resident = residents.find(r => r.apartment_id === row.apartment_id && r.state === 'active');
        return {
          resident_id: resident.id,
          feetype: row.feetype,
          amount: parseFloat(row.amount),
          payment_form: "Chuyển khoản",
          status: "Chưa thanh toán",
          due_date: row.due_date || null
        };
      });

      onSave(dataToSend, null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
      <div className={`bg-white p-6 rounded-2xl shadow-2xl relative flex flex-col ${isEditing ? 'w-full max-w-md' : 'w-full max-w-6xl'}`} style={{ maxHeight: '90vh' }}>
        
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {isEditing ? "Chỉnh sửa hóa đơn" : isImporting ? "Xác nhận nhập từ Excel" : "Thêm hóa đơn mới"}
        </h2>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* --- FORM THÊM MỚI (TABLE) --- */}
        {!isEditing && (
          <div className="flex-1 overflow-hidden flex flex-col border border-gray-200 rounded-lg">
            <div className="overflow-y-auto custom-scrollbar flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-3 text-xs font-bold text-gray-600 uppercase border-b w-[15%]">Căn hộ</th>
                    <th className="p-3 text-xs font-bold text-gray-600 uppercase border-b w-[30%]">Loại phí</th>
                    <th className="p-3 text-xs font-bold text-gray-600 uppercase border-b w-[20%]">Số tiền (VNĐ)</th>
                    <th className="p-3 text-xs font-bold text-gray-600 uppercase border-b w-[25%]">Hạn đóng</th>
                    <th className="p-3 text-xs font-bold text-gray-600 uppercase border-b w-[10%] text-center">
                      <button type="button" onClick={addRow} className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto shadow-md"><FiPlus size={16} /></button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-blue-50 transition-colors">
                      <td className="p-2"><input type="text" value={row.apartment_id} onChange={(e) => handleRowChange(row.id, "apartment_id", e.target.value)} placeholder="A101" className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" /></td>
                      <td className="p-2"><input type="text" value={row.feetype} onChange={(e) => handleRowChange(row.id, "feetype", e.target.value)} placeholder="Phí..." className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" /></td>
                      <td className="p-2"><input type="number" value={row.amount} onChange={(e) => handleRowChange(row.id, "amount", e.target.value)} placeholder="0" className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:border-blue-500" /></td>
                      <td className="p-2"><input type="date" value={row.due_date} onChange={(e) => handleRowChange(row.id, "due_date", e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:border-blue-500 text-gray-600" /></td>
                      <td className="p-2 text-center">{rows.length > 1 && <button type="button" onClick={() => removeRow(row.id)} className="text-gray-400 hover:text-red-500 p-1"><FiX size={20} /></button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- FORM SỬA (SINGLE) --- */}
        {isEditing && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Căn hộ (Read-only)</label>
              <div className="w-full bg-gray-100 rounded-md border border-gray-200 px-3 py-2 text-gray-700">{singleFormData.apartment_id}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại phí</label>
              <input type="text" name="feetype" value={singleFormData.feetype} onChange={handleSingleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền (VNĐ)</label>
              <input type="number" name="amount" value={singleFormData.amount} onChange={handleSingleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hạn đóng</label>
              <input type="date" name="due_date" value={singleFormData.due_date} onChange={handleSingleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:border-blue-500 text-gray-600" />
            </div>
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

// === INVOICE ITEM COMPONENT ===
const InvoiceItem = ({ item, isDeleteMode, onEditClick, isSelected, onToggleSelect }) => {
  const isPaid = item.state === 1; // 1 = Đã thanh toán, 0 = Chưa

  return (
    <div className={`bg-white rounded-2xl shadow-md p-4 flex items-center relative overflow-hidden mb-4 transition-all ${isSelected ? 'ring-2 ring-blue-400 bg-blue-50' : ''}`}>
      <div className={`absolute left-4 top-3 bottom-3 w-1.5 rounded-full ${isPaid ? 'bg-green-500' : 'bg-orange-500'}`}></div>

      <div className="flex-1 grid grid-cols-6 gap-4 items-center pl-8 pr-4 text-gray-800">
        {/* ID */}
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Hóa đơn ID</p>
          <p className="font-semibold">{item.id}</p>
        </div>
        {/* Căn hộ */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Căn hộ</p>
          <p className="font-medium">{item.apartment_id}</p>
        </div>
        {/* Loại phí */}
        <div className="col-span-2">
          <p className="text-xs text-gray-500 mb-1">Loại phí</p>
          <p className="font-medium text-gray-700 truncate" title={item.feetype}>{item.feetype}</p>
        </div>
        {/* Số tiền */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Số tiền</p>
          <p className="font-bold text-gray-900">{formatCurrency(item.amount)}</p>
        </div>
        {/* Trạng thái */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${isPaid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
            {isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
          </span>
        </div>
      </div>

      {/* Action Area */}
      <div className="ml-auto flex-shrink-0 pr-2 w-24 flex justify-end">
        {isDeleteMode ? (
          <div className="flex items-center justify-center h-full">
            <input type="checkbox" checked={isSelected} onChange={() => onToggleSelect(item.id)} className="w-6 h-6 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer" />
          </div>
        ) : (
          !isPaid && (
            <button onClick={() => onEditClick(item)} className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium">Chỉnh sửa</button>
          )
        )}
      </div>
    </div>
  );
};

// =========================================================================
// === MAIN PAGE: ACCOUNTANT PAYMENT MANAGEMENT ===
// =========================================================================
export const AccountPayment = () => {
  const [invoices, setInvoices] = useState([]);
  const [residents, setResidents] = useState([]); // Để map apartment_id -> resident_id
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // States Modal Add/Edit
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [formError, setFormError] = useState("");
  const [importedInvoices, setImportedInvoices] = useState([]); // Dữ liệu từ Excel

  // States Modal Delete
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Status Modal
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  // --- STATE PHÂN TRANG (MỚI) ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Số lượng ô dữ liệu / 1 trang

  // --- FETCH DATA ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      // 1. Lấy danh sách hóa đơn
      const resInvoices = await fetch(`${API_BASE_URL}/payments`, { headers: { Authorization: `Bearer ${token}` } });
      const dataInvoices = await resInvoices.json();
      
      // 2. Lấy danh sách cư dân (để check apartment_id khi thêm mới)
      const resResidents = await fetch(`${API_BASE_URL}/residents`, { headers: { Authorization: `Bearer ${token}` } });
      const dataResidents = await resResidents.json();

      setInvoices(Array.isArray(dataInvoices) ? dataInvoices.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)) : []);
      setResidents(dataResidents);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- RESET TRANG KHI TÌM KIẾM ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // --- FILTER ---
  const filteredInvoices = invoices.filter(item => {
    if (!searchTerm.trim()) return true;
    const term = removeVietnameseTones(searchTerm.trim());
    
    const idMatch = String(item.id).toLowerCase().includes(term);
    const apartmentMatch = removeVietnameseTones(item.apartment_id || "").includes(term);
    const feeMatch = removeVietnameseTones(item.feetype || "").includes(term);

    return idMatch || apartmentMatch || feeMatch;
  });

  // --- LOGIC CẮT DỮ LIỆU ĐỂ HIỂN THỊ (PAGINATION) ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  // --- HANDLER CHUYỂN TRANG ---
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

  // --- HANDLERS: ADD / EDIT ---
  const handleAddClick = () => {
    setEditingInvoice(null);
    setImportedInvoices([]);
    setIsAddModalOpen(true);
    setFormError("");
  };

  const handleEditClick = (invoice) => {
    setEditingInvoice(invoice);
    setIsEditModalOpen(true);
    setFormError("");
  };

  const handleSave = async (data, invoiceId) => {
    const token = getToken();
    try {
      if (invoiceId) {
        // --- EDIT (PUT) ---
        // API yêu cầu body chỉ chứa field cần update? Hoặc full? 
        // Với hóa đơn, thường chỉ cho sửa số tiền, loại phí khi chưa thanh toán.
        const res = await fetch(`${API_BASE_URL}/payments/${invoiceId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error("Lỗi cập nhật");
        setModalStatus("editSuccess");
        setStatusMessage("Cập nhật hóa đơn thành công!");
      } else {
        // --- ADD MULTIPLE (POST) ---
        // data là mảng các object
        await Promise.all(data.map(item => 
          fetch(`${API_BASE_URL}/payments`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(item)
          }).then(r => { if(!r.ok) throw new Error("Lỗi thêm mới"); return r; })
        ));
        setModalStatus("addSuccess");
        setStatusMessage(`Đã tạo ${data.length} hóa đơn mới!`);
      }
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      fetchData();
      setIsStatusModalOpen(true);
    } catch (err) {
      setFormError(err.message);
    }
  };

  // --- HANDLERS: DELETE ---
  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedIds([]);
  };

  const handleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDeleteConfirmClick = () => {
    if (selectedIds.length > 0) setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmModal(false);
    try {
      const token = getToken();
      await Promise.all(selectedIds.map(id => 
        fetch(`${API_BASE_URL}/payments/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        })
      ));
      setModalStatus("deleteSuccess");
      setStatusMessage(`Đã xóa ${selectedIds.length} hóa đơn!`);
      setIsDeleteMode(false);
      setSelectedIds([]);
      fetchData();
    } catch (err) {
      setModalStatus("failure");
      setStatusMessage("Xóa thất bại!");
    } finally {
      setIsStatusModalOpen(true);
    }
  };

  const handleCancelDelete = () => setShowConfirmModal(false);

  // --- EXCEL IMPORT / EXPORT HANDLERS ---
  const fileInputRef = useRef(null);

  // 1. Import Excel
  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const buffer = evt.target.result;
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.getWorksheet(1); // Sheet đầu tiên

      const imported = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Bỏ header
          // Giả sử cột: 1=Căn hộ, 2=Loại phí, 3=Số tiền, 4=Hạn đóng(YYYY-MM-DD)
          imported.push({
            apartment_id: row.getCell(1).text,
            feetype: row.getCell(2).text,
            amount: row.getCell(3).value,
            due_date: row.getCell(4).text,
          });
        }
      });

      setImportedInvoices(imported);
      setEditingInvoice(null);
      setIsAddModalOpen(true); // Mở modal form add nhưng fill data từ excel
      e.target.value = null; // Reset input
    };
    reader.readAsArrayBuffer(file);
  };

  // 2. Export Excel
  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("DanhSachHoaDon");

    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Căn hộ", key: "apartment_id", width: 15 },
      { header: "Loại phí", key: "feetype", width: 25 },
      { header: "Số tiền", key: "amount", width: 15 },
      { header: "Trạng thái", key: "status", width: 20 },
      { header: "Ngày tạo", key: "created_at", width: 20 },
    ];

    // Xuất dữ liệu đã lọc (filteredInvoices) hoặc tất cả nếu muốn
    filteredInvoices.forEach(inv => {
      worksheet.addRow({
        id: inv.id,
        apartment_id: inv.apartment_id,
        feetype: inv.feetype,
        amount: inv.amount,
        status: inv.state === 1 ? "Đã thanh toán" : "Chưa thanh toán",
        created_at: inv.created_at ? new Date(inv.created_at).toLocaleDateString() : ""
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, `DanhSachHoaDon_${Date.now()}.xlsx`);
  };

  // --- RENDER ---
  const renderStatusModalContent = () => {
    if (!modalStatus) return null;
    const isSuccess = modalStatus.toLowerCase().includes("success");
    const icon = isSuccess ? acceptIcon : notAcceptIcon;
    return (
      <div className="flex flex-col items-center">
        <img src={icon} alt={modalStatus} className="w-20 h-20 mb-6" />
        <p className="text-xl font-semibold text-center text-gray-800">{statusMessage}</p>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen">
      {/* Search Bar */}
      <div className="flex justify-start items-center mb-6">
        <div className="relative w-full max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2"><SearchIcon /></span>
          <input
            type="search"
            placeholder="Tìm theo Căn hộ, Loại phí, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none"
          />
        </div>
      </div>

      {/* Header & Actions */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Quản lý thu phí</h1>
        <div className="flex space-x-3">
          {/* Nút Import/Export Excel - Chỉ hiện khi không xóa */}
          {!isDeleteMode && (
            <>
              <input type="file" accept=".xlsx, .xls" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImportExcel} />
              <button onClick={() => fileInputRef.current.click()} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold shadow transition-colors flex items-center">
                Nhập Excel
              </button>
              <button onClick={handleExportExcel} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold shadow transition-colors flex items-center">
                <DownloadIcon /> Xuất Excel
              </button>
            </>
          )}

          {!isDeleteMode ? (
            <>
              <button onClick={handleAddClick} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow transition-colors flex items-center">
                + Thêm hóa đơn
              </button>
              <button onClick={toggleDeleteMode} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow transition-colors">
                Xóa hóa đơn
              </button>
            </>
          ) : (
            <>
              <button onClick={handleDeleteConfirmClick} disabled={selectedIds.length === 0} className={`px-4 py-2 rounded-lg font-bold shadow transition-colors text-white ${selectedIds.length > 0 ? "bg-red-500 hover:bg-red-600" : "bg-gray-400 cursor-not-allowed"}`}>
                Xóa đã chọn ({selectedIds.length})
              </button>
              <button onClick={toggleDeleteMode} className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200">
                Hủy
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {currentInvoices.length === 0 ? (
          <div className="bg-white p-6 rounded-lg text-center text-gray-500">Không có hóa đơn nào phù hợp với tìm kiếm.</div>
        ) : (
          currentInvoices.map((item) => (
            <InvoiceItem key={item.id} item={item} isDeleteMode={isDeleteMode} onEditClick={handleEditClick} isSelected={selectedIds.includes(item.id)} onToggleSelect={handleSelect} />
          ))
        )}
      </div>

      {/* --- PAGINATION CONTROLS (GIỐNG RESIDENTSPAGE) --- */}
      {filteredInvoices.length > 0 && (
        <div className="flex justify-center items-center mt-6 space-x-6 pb-8">
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

      <ConfirmationModal isOpen={showConfirmModal} onClose={handleCancelDelete} onConfirm={handleConfirmDelete} title="Chú ý: Xóa hóa đơn!!!" message={`Bạn có chắc chắn muốn xóa ${selectedIds.length} hóa đơn đã chọn?`} />

      <StatusModal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)}>
        {renderStatusModalContent()}
      </StatusModal>
    </div>
  );
};