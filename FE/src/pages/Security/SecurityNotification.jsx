import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import dayjs from "dayjs";

// --- IMPORT LIB: EXCELJS & FILE-SAVER ---
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// --- Components Layout/Modal ---
import { StatusModal } from "../../layouts/StatusModal";

// --- IMPORT ICONS (Dùng cho Modal Bulk) ---
import { FiPlus, FiX } from "react-icons/fi";

// --- API CONFIG ---
const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

// --- ICONS ---
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-gray-500 hover:text-gray-700"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

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

const WarningIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-24 h-24 text-red-500 mx-auto mb-4"
  >
    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
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
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0309|\u0323/g, ""); 
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); 
  return str;
};

// --- MODAL THÊM/SỬA (HỖ TRỢ BULK INSERT & IMPORT EXCEL) ---
const NotificationFormModal = ({ isOpen, onClose, onSubmit, initialData, importedRows }) => {
  const isEditing = !!initialData;
  const [formData, setFormData] = useState({ apartment_id: "", content: "" });
  const [rows, setRows] = useState([{ id: Date.now(), apartment_id: "", content: "" }]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Mode: Edit single item
        setFormData({
          apartment_id: initialData.apartment_id || "",
          content: initialData.content || "",
        });
      } else if (importedRows && importedRows.length > 0) {
        // Mode: Import Excel (Pre-fill table)
        setRows(importedRows);
      } else {
        // Mode: Add New Empty
        setRows([{ id: Date.now(), apartment_id: "", content: "" }]);
      }
    }
  }, [initialData, importedRows, isOpen]);

  const handleRowChange = (id, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => {
    setRows((prev) => [...prev, { id: Date.now(), apartment_id: "", content: "" }]);
  };

  const removeRow = (id) => {
    if (rows.length > 1) {
      setRows((prev) => prev.filter((row) => row.id !== id));
    }
  };

  const handleSubmit = () => {
    if (isEditing) {
      onSubmit(formData);
    } else {
      const validRows = rows.map(({ apartment_id, content }) => ({
        apartment_id,
        content,
      }));
      onSubmit(validRows);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
      <div
        className={`bg-white rounded-2xl p-8 relative shadow-2xl ${
          isEditing ? "w-full max-w-lg" : "w-full max-w-4xl"
        }`}
        style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        <button onClick={onClose} className="absolute top-6 right-6">
          <CloseIcon />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {isEditing ? "Chỉnh sửa thông báo" : "Thêm thông báo mới"}
        </h2>

        {/* Nội dung Form */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {isEditing ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Thông báo ID</label>
                <input type="text" placeholder={initialData.id} disabled className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Người nhận</label>
                <input type="text" value={formData.apartment_id} onChange={(e) => setFormData({ ...formData, apartment_id: e.target.value })} placeholder="Nhập mã căn hộ" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Nội dung</label>
                <input type="text" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Nhập nội dung" className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 shadow-sm" />
              </div>
            </div>
          ) : (
            <div className="overflow-y-auto custom-scrollbar border border-gray-200 rounded-lg flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-3 text-sm font-bold text-gray-600 uppercase border-b w-[30%]">Người nhận</th>
                    <th className="p-3 text-sm font-bold text-gray-600 uppercase border-b w-[60%]">Nội dung</th>
                    <th className="p-3 text-sm font-bold text-gray-600 uppercase border-b w-[10%] text-center">
                      <button onClick={addRow} className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors mx-auto shadow-md" title="Thêm dòng"><FiPlus size={16} /></button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-blue-50 transition-colors">
                      <td className="p-2 align-top">
                        <input type="text" value={row.apartment_id} onChange={(e) => handleRowChange(row.id, "apartment_id", e.target.value)} placeholder="VD: P.101" className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </td>
                      <td className="p-2 align-top">
                        <textarea rows={1} value={row.content} onChange={(e) => handleRowChange(row.id, "content", e.target.value)} placeholder="Nội dung..." className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden" style={{ minHeight: "42px" }} onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }} />
                      </td>
                      <td className="p-2 text-center align-top pt-3">
                        {rows.length > 1 && (
                          <button onClick={() => removeRow(row.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1"><FiX size={20} /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <button onClick={handleSubmit} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-10 rounded-xl transition-colors shadow-lg shadow-blue-500/30">
            {isEditing ? "Lưu thay đổi" : "Xác nhận thêm"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MODAL XÁC NHẬN XÓA ---
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md text-center shadow-2xl animate-fade-in-up">
        <WarningIcon />
        <h3 className="text-2xl font-bold text-gray-800 mb-8">Xóa các mục đã chọn</h3>
        <div className="flex justify-between space-x-4">
          <button onClick={onClose} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all">Hoàn tác</button>
          <button onClick={onConfirm} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-green-500/30 transition-all">Xác nhận</button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
export const SecurityNotification = () => {
  const getToken = () => localStorage.getItem("token");
  const fileInputRef = useRef(null); // Ref cho input file

  // State Data
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // State UI Modes
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // State Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [importedRows, setImportedRows] = useState(null); // State chứa dữ liệu từ file Excel
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Status Modal
  const [statusModal, setStatusModal] = useState({ open: false, type: "success", message: "" });
  const [acceptIconSrc, setAcceptIconSrc] = useState(null);
  const [notAcceptIconSrc, setNotAcceptIconSrc] = useState(null);

  useEffect(() => {
    import("../../images/accept_icon.png").then((m) => setAcceptIconSrc(m.default));
    import("../../images/not_accept_icon.png").then((m) => setNotAcceptIconSrc(m.default));
  }, []);

  // --- FETCH DATA ---
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/notifications`, { headers: { Authorization: `Bearer ${token}` } });
      const sorted = response.data.sort((a, b) => new Date(b.created_at || b.notification_date) - new Date(a.created_at || a.notification_date));
      setNotifications(sorted);
    } catch (error) {
      console.error("Lỗi tải data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  // --- FILTER ---
  const filteredList = notifications.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = removeVietnameseTones(searchTerm.trim());
    return String(item.id).toLowerCase().includes(term) || removeVietnameseTones(item.content || "").includes(term);
  });

  // --- HANDLER EXPORT EXCEL ---
  const handleExportExcel = async () => {
    const dataToExport = selectedIds.length > 0 ? notifications.filter(item => selectedIds.includes(item.id)) : filteredList;
    if (dataToExport.length === 0) {
        setStatusModal({ open: true, type: "failure", message: "Không có dữ liệu để xuất!" });
        return;
    }
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('DanhSachThongBao');
    worksheet.columns = [
      { header: 'ID Thông báo', key: 'id', width: 15 },
      { header: 'Người nhận (Căn hộ)', key: 'apartment_id', width: 20 },
      { header: 'Nội dung', key: 'content', width: 50 },
      { header: 'Ngày gửi', key: 'notification_date', width: 25 },
      { header: 'Ngày tạo', key: 'created_at', width: 25 },
    ];
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    dataToExport.forEach((item) => {
      worksheet.addRow({
        id: item.id,
        apartment_id: item.apartment_id,
        content: item.content,
        notification_date: item.notification_date ? dayjs(item.notification_date).format("DD/MM/YYYY HH:mm:ss") : "",
        created_at: item.created_at ? dayjs(item.created_at).format("DD/MM/YYYY HH:mm:ss") : "",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `DanhSachThongBao_${dayjs().format('DDMMYYYY_HHmm')}.xlsx`);
  };

  // --- NEW: HANDLER IMPORT EXCEL (ĐÃ CẬP NHẬT LOGIC) ---
  const handleImportClick = () => {
    fileInputRef.current.click(); // Kích hoạt input file ẩn
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(file);
      
      const worksheet = workbook.getWorksheet(1); // Lấy sheet đầu tiên
      
      // 1. TÌM VỊ TRÍ CỘT DỰA VÀO HEADER (DÒNG 1)
      const headerRow = worksheet.getRow(1);
      let apartmentColIdx = -1;
      let contentColIdx = -1;

      headerRow.eachCell((cell, colNumber) => {
        // Chuẩn hóa tên cột để so sánh (chữ thường, xóa khoảng trắng thừa)
        const cellValue = cell.text ? cell.text.toLowerCase().trim() : "";
        
        // Tìm cột "Người nhận"
        if (cellValue.includes("người nhận") || cellValue.includes("nguoi nhan")) {
            apartmentColIdx = colNumber;
        }
        
        // Tìm cột "Nội dung"
        if (cellValue.includes("nội dung") || cellValue.includes("noi dung")) {
            contentColIdx = colNumber;
        }
      });

      // 2. KIỂM TRA ĐỊNH DẠNG FILE
      if (apartmentColIdx === -1 || contentColIdx === -1) {
        setStatusModal({ 
            open: true, 
            type: "failure", 
            message: "File sai định dạng! Cần có cột 'Người nhận' và 'Nội dung'." 
        });
        e.target.value = null; // Reset input
        return;
      }

      // 3. ĐỌC DỮ LIỆU TỪ CÁC CỘT ĐÃ TÌM ĐƯỢC
      const rowsFromFile = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        // Lấy giá trị chính xác từ cột đã tìm thấy
        const apartmentVal = row.getCell(apartmentColIdx).text; 
        const contentVal = row.getCell(contentColIdx).text;

        // Chỉ thêm nếu có dữ liệu
        if (apartmentVal || contentVal) {
          rowsFromFile.push({
            id: Date.now() + rowNumber,
            apartment_id: apartmentVal,
            content: contentVal
          });
        }
      });

      if (rowsFromFile.length > 0) {
        setImportedRows(rowsFromFile); // Lưu data vào state
        setEditingItem(null);          // Đảm bảo không phải chế độ edit
        setShowFormModal(true);        // Mở modal để user check lại
      } else {
        setStatusModal({ open: true, type: "failure", message: "File Excel rỗng!" });
      }

    } catch (error) {
      console.error("Lỗi đọc file:", error);
      setStatusModal({ open: true, type: "failure", message: "Lỗi khi đọc file Excel!" });
    } finally {
      e.target.value = null; // Reset input để chọn lại file cũ được
    }
  };

  // --- HANDLERS UI ---
  const handleAddClick = () => {
    setEditingItem(null);
    setImportedRows(null); // Reset import state
    setShowFormModal(true);
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setImportedRows(null);
    setShowFormModal(true);
  };

  // --- HANDLER SUBMIT FORM ---
  const handleSubmitForm = async (data) => {
    setShowFormModal(false);
    try {
      const token = getToken();
      if (Array.isArray(data)) {
        await Promise.all(data.map((item) => axios.post(`${API_BASE_URL}/notifications`, item, { headers: { Authorization: `Bearer ${token}` } })));
        setStatusModal({ open: true, type: "success", message: `Đã thêm ${data.length} thông báo mới!` });
      } else if (editingItem) {
        await axios.put(`${API_BASE_URL}/notifications/${editingItem.id}`, data, { headers: { Authorization: `Bearer ${token}` } });
        setStatusModal({ open: true, type: "success", message: "Cập nhật thành công!" });
      }
      fetchNotifications();
    } catch (error) {
      setStatusModal({ open: true, type: "failure", message: "Thao tác thất bại!" });
    }
  };

  // --- DELETE LOGIC ---
  const toggleDeleteMode = () => { setIsDeleteMode(!isDeleteMode); setSelectedIds([]); };
  const handleSelect = (id) => { setSelectedIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]); };
  const handleDeleteConfirmClick = () => { if (selectedIds.length > 0) setShowConfirmDelete(true); };

  const executeDelete = async () => {
    setShowConfirmDelete(false);
    try {
      const token = getToken();
      await Promise.all(selectedIds.map((id) => axios.delete(`${API_BASE_URL}/notifications/${id}`, { headers: { Authorization: `Bearer ${token}` } })));
      setStatusModal({ open: true, type: "success", message: "Xóa thành công!" });
      fetchNotifications();
      setIsDeleteMode(false);
      setSelectedIds([]);
    } catch (error) {
      setStatusModal({ open: true, type: "failure", message: "Xóa thất bại!" });
    }
  };

  return (
    <div className="w-full min-h-screen">
      {/* Input File Ẩn */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".xlsx, .xls" 
        className="hidden" 
      />

      {/* 1. SEARCH BAR */}
      <div className="flex justify-start items-center mb-8">
        <div className="relative w-full max-w-2xl bg-white rounded-lg overflow-hidden shadow-sm">
          <span className="absolute left-4 top-1/2 -translate-y-1/2"><SearchIcon /></span>
          <input type="search" placeholder="Tìm theo ID hoặc Nội dung thông báo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 text-gray-700 focus:outline-none h-12" />
        </div>
      </div>

      {/* 2. TITLE & BUTTONS */}
      <div className="flex justify-between items-end mb-6">
        <h1 className="text-3xl font-bold text-white">Thông Báo</h1>
        <div className="flex space-x-4">
          {!isDeleteMode && (
            <>
              {/* Nút Import Excel */}
              <button onClick={handleImportClick} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold flex items-center shadow-lg transition-colors">
                <UploadIcon /> Nhập Excel
              </button>
              
              {/* Nút Export Excel */}
              <button onClick={handleExportExcel} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-bold flex items-center shadow-lg transition-colors">
                <DownloadIcon /> Xuất Excel
              </button>
            </>
          )}

          {!isDeleteMode ? (
            <>
              <button onClick={handleAddClick} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold flex items-center shadow-lg transition-colors">
                + Thêm thông báo
              </button>
              <button onClick={toggleDeleteMode} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg transition-colors">
                Xóa thông báo
              </button>
            </>
          ) : (
            <>
              <button onClick={handleDeleteConfirmClick} className={`px-6 py-2.5 rounded-lg font-bold shadow-lg transition-colors ${selectedIds.length > 0 ? "bg-red-500 hover:bg-red-600 text-white" : "bg-red-300 text-white cursor-not-allowed"}`}>
                Xóa các mục đã chọn
              </button>
              <button onClick={toggleDeleteMode} className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg transition-colors">
                Hủy xóa
              </button>
            </>
          )}
        </div>
      </div>

      {/* 3. LIST */}
      <div className="space-y-4 pb-10">
        {isLoading ? ( <p className="text-white">Đang tải...</p> ) : (
          filteredList.map((item) => (
            <div key={item.id} className="bg-white rounded-[20px] p-5 flex items-center shadow-md relative min-h-[90px]">
              <div className="absolute left-6 top-4 bottom-4 w-1 bg-blue-500 rounded-full"></div>
              <div className="flex-1 grid grid-cols-12 gap-4 items-center pl-10">
                <div className="col-span-3 sm:col-span-2">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Thông báo ID</p>
                  <p className="text-2xl font-bold text-gray-900 leading-none">{item.id}</p>
                </div>
                <div className="col-span-5 sm:col-span-6">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Nội dung thông báo</p>
                  <p className="text-sm font-semibold text-gray-900 truncate pr-4" title={item.content}>{item.content || "Nội dung thông báo"}</p>
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">Ngày gửi</p>
                  <p className="text-sm font-semibold text-gray-900">{item.notification_date ? dayjs(item.notification_date).format("DD/MM/YYYY") : "---"}</p>
                </div>
                <div className="col-span-1 sm:col-span-2 flex justify-end items-center">
                  {!isDeleteMode ? (
                    <button onClick={() => handleEditClick(item)} className="text-blue-500 font-bold text-sm hover:underline">Chỉnh sửa</button>
                  ) : (
                    <div onClick={() => handleSelect(item.id)} className={`w-10 h-10 rounded-xl cursor-pointer flex items-center justify-center transition-all duration-200 ${selectedIds.includes(item.id) ? "bg-blue-500 shadow-blue-500/50" : "bg-gray-300 hover:bg-gray-400"}`}>
                      {selectedIds.includes(item.id) && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- MODALS --- */}
      <NotificationFormModal isOpen={showFormModal} onClose={() => setShowFormModal(false)} onSubmit={handleSubmitForm} initialData={editingItem} importedRows={importedRows} />
      <DeleteConfirmModal isOpen={showConfirmDelete} onClose={() => setShowConfirmDelete(false)} onConfirm={executeDelete} />
      <StatusModal isOpen={statusModal.open} onClose={() => setStatusModal({ ...statusModal, open: false })}>
        <div className="flex flex-col items-center justify-center p-4">
          {statusModal.type === "success" ? <img src={acceptIconSrc} alt="Success" className="w-20 h-20 mb-4" /> : <img src={notAcceptIconSrc} alt="Fail" className="w-20 h-20 mb-4" />}
          <h3 className="text-xl font-bold text-gray-800 text-center">{statusModal.message}</h3>
        </div>
      </StatusModal>
    </div>
  );
};