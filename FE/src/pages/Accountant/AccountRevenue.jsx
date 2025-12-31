import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { StatusModal } from "../../layouts/StatusModal";
import { ConfirmationModal } from "../../layouts/ConfirmationModal";

// --- IMPORT ICONS ---
import {
  FiPlus,
  FiX,
  FiTrash2,
  FiSave,
  FiUpload,
  FiPrinter,
} from "react-icons/fi";
import acceptIcon from "../../images/accept_icon.png";
import notAcceptIcon from "../../images/not_accept_icon.png";
import arrowLeft from "../../images/Arrow_Left_Mini_Circle.png";
import arrowRight from "../../images/Arrow_Right_Mini_Circle.png";

// --- IMPORT LIB ---
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

// --- HELPERS ---
const getToken = () => localStorage.getItem("token");

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// --- ICONS SVG ---
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-400"
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
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-gray-500 hover:text-gray-700"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

// =========================================================================
// === REVENUE BATCH MODAL (MODAL TẠO KHOẢN THU HÀNG LOẠT) ===
// =========================================================================
const RevenueBatchModal = ({
  isOpen,
  onClose,
  onSave,
  residents,
  error,
  setError,
}) => {
  // Lấy danh sách mã căn hộ duy nhất
  const uniqueApartments = React.useMemo(() => {
    if (!residents) return [];
    const apartments = residents
      .map((r) => r.apartment_id)
      .filter((apt) => apt && apt.trim() !== "");
    return [...new Set(apartments)].sort();
  }, [residents]);

  const [rows, setRows] = useState([
    {
      id: Date.now(),
      apartment_id: "",
      type: "Tiền điện",
      quantity: 0,
      unit_price: 3500,
      total: 0,
      note: "",
    },
  ]);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (isOpen) {
      setRows([
        {
          id: Date.now(),
          apartment_id: "",
          type: "Tiền điện",
          quantity: 0,
          unit_price: 3500,
          total: 0,
          note: "",
        },
      ]);
      setError("");
    }
  }, [isOpen, setError]);

  const handleRowChange = (id, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value };

          if (field === "quantity" || field === "unit_price") {
            const qty = field === "quantity" ? parseFloat(value) : row.quantity;
            const price =
              field === "unit_price" ? parseFloat(value) : row.unit_price;
            updatedRow.total =
              (isNaN(qty) ? 0 : qty) * (isNaN(price) ? 0 : price);
          }

          if (field === "type") {
            if (value === "Tiền điện") updatedRow.unit_price = 3500;
            else if (value === "Tiền nước") updatedRow.unit_price = 6000;
            else if (value === "Phí gửi xe") updatedRow.unit_price = 100000;
            updatedRow.total = updatedRow.quantity * updatedRow.unit_price;
          }

          return updatedRow;
        }
        return row;
      })
    );
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        apartment_id: "",
        type: "Tiền điện",
        quantity: 0,
        unit_price: 3500,
        total: 0,
        note: "",
      },
    ]);
  };

  const removeRow = (id) => {
    if (rows.length > 1) {
      setRows((prev) => prev.filter((row) => row.id !== id));
    }
  };

  const handleSubmit = () => {
    setError("");
    const validRows = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.apartment_id) {
        setError(`Dòng ${i + 1}: Vui lòng chọn Mã căn hộ.`);
        return;
      }
      if (row.total <= 0) {
        setError(`Dòng ${i + 1}: Tổng tiền phải lớn hơn 0.`);
        return;
      }

      const feetype = `${row.type} - T${month}/${year}`;

      validRows.push({
        apartment_id: row.apartment_id,
        feetype: feetype,
        amount: row.total,
        quantity: row.quantity,
        unit_price: row.unit_price,
      });
    }

    onSave(validRows);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
      <div
        className="bg-white p-6 rounded-2xl shadow-2xl relative flex flex-col w-full max-w-6xl"
        style={{ maxHeight: "90vh" }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Tạo khoản thu dịch vụ (Điện/Nước/Xe)
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex space-x-4 mb-4 items-center bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-semibold text-gray-700">
              Tháng:
            </label>
            <input
              type="number"
              min="1"
              max="12"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-16 p-2 border border-gray-300 rounded text-center"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-semibold text-gray-700">Năm:</label>
            <input
              type="number"
              min="2020"
              max="2030"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-20 p-2 border border-gray-300 rounded text-center"
            />
          </div>
          <div className="text-sm text-gray-500 italic ml-auto">
            * Hệ thống sẽ tự động tạo nội dung thu theo định dạng: "Tên dịch vụ
            - Tháng/Năm"
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="overflow-y-auto custom-scrollbar border border-gray-200 rounded-lg flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-3 text-xs font-bold text-gray-600 uppercase border-b w-[15%]">
                    Căn hộ
                  </th>
                  <th className="p-3 text-xs font-bold text-gray-600 uppercase border-b w-[20%]">
                    Loại dịch vụ
                  </th>
                  <th className="p-3 text-xs font-bold text-gray-600 uppercase border-b w-[15%]">
                    Số lượng
                  </th>
                  <th className="p-3 text-xs font-bold text-gray-600 uppercase border-b w-[20%]">
                    Đơn giá (VNĐ)
                  </th>
                  <th className="p-3 text-xs font-bold text-gray-600 uppercase border-b w-[20%]">
                    Thành tiền (VNĐ)
                  </th>
                  <th className="p-3 text-xs font-bold text-gray-600 uppercase border-b w-[10%] text-center">
                    <button
                      onClick={addRow}
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto shadow"
                    >
                      <FiPlus size={16} />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="p-2">
                      <select
                        value={row.apartment_id}
                        onChange={(e) =>
                          handleRowChange(
                            row.id,
                            "apartment_id",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">-- Chọn --</option>
                        <option value="ALL" className="font-bold text-blue-600">
                          -- Tất cả căn hộ --
                        </option>
                        {uniqueApartments.map((apt) => (
                          <option key={apt} value={apt}>
                            {apt}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2">
                      <select
                        value={row.type}
                        onChange={(e) =>
                          handleRowChange(row.id, "type", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="Tiền điện">Tiền điện</option>
                        <option value="Tiền nước">Tiền nước</option>
                        <option value="Phí gửi xe">Phí gửi xe</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="0"
                        value={row.quantity}
                        onChange={(e) =>
                          handleRowChange(row.id, "quantity", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="0"
                        value={row.unit_price}
                        onChange={(e) =>
                          handleRowChange(row.id, "unit_price", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        readOnly
                        value={formatCurrency(row.total)}
                        className="w-full p-2 border border-gray-200 bg-gray-50 rounded text-sm font-bold text-blue-600 focus:outline-none"
                      />
                    </td>
                    <td className="p-2 text-center">
                      {rows.length > 1 && (
                        <button
                          onClick={() => removeRow(row.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t mt-4 border-gray-100">
          <button
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg flex items-center gap-2"
          >
            <FiSave /> Lưu khoản thu
          </button>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// === MAIN PAGE COMPONENT ===
// =========================================================================
export const AccountRevenue = () => {
  const [invoices, setInvoices] = useState([]);
  const [residents, setResidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  const fileInputRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getToken();
      const [paymentsRes, residentsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/payments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/residents`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const allPayments = paymentsRes.data;
      const revenuePayments = allPayments.filter((p) => {
        const type = p.feetype ? p.feetype.toLowerCase() : "";
        return (
          type.includes("điện") || type.includes("nước") || type.includes("xe")
        );
      });

      setInvoices(revenuePayments);
      setResidents(residentsRes.data);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredList = invoices.filter((item) => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.trim().toLowerCase();
    return (
      String(item.id).toLowerCase().includes(searchLower) ||
      (item.apartment_id &&
        String(item.apartment_id).toLowerCase().includes(searchLower)) ||
      (item.feetype && String(item.feetype).toLowerCase().includes(searchLower))
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };
  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleSaveBatch = async (data) => {
    setIsModalOpen(false);
    const token = getToken();
    let successCount = 0;

    try {
      const expandedData = [];
      const activeResidents = residents.filter(
        (r) => r.state === "active" && r.apartment_id
      );
      const allApartments = [
        ...new Set(activeResidents.map((r) => r.apartment_id)),
      ];

      data.forEach((item) => {
        if (item.apartment_id === "ALL") {
          allApartments.forEach((aptId) => {
            expandedData.push({ ...item, apartment_id: aptId });
          });
        } else {
          expandedData.push(item);
        }
      });

      await Promise.all(
        expandedData.map(async (item) => {
          const resident = residents.find(
            (r) => r.apartment_id === item.apartment_id && r.state === "active"
          );

          if (resident) {
            const payload = {
              resident_id: resident.id,
              amount: item.amount,
              feetype: item.feetype,
              payment_form: "Chuyển khoản/Tiền mặt",
            };

            const res = await axios.post(`${API_BASE_URL}/payments`, payload, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 201) successCount++;
          }
        })
      );

      setModalStatus("success");
      setStatusMessage(`Đã tạo thành công ${successCount} khoản thu!`);
      fetchData();
    } catch (err) {
      console.error(err);
      setModalStatus("failure");
      setStatusMessage("Có lỗi xảy ra trong quá trình lưu dữ liệu.");
    } finally {
      setIsStatusModalOpen(true);
    }
  };

  // --- LOGIC NHẬP EXCEL (IMPORT) ---
  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(file);
      const worksheet = workbook.getWorksheet(1);
      const dataToImport = [];

      // Giả định file excel có 4 cột: Mã căn hộ, Loại dịch vụ, Số lượng, Đơn giá
      // Row 1 là header
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          // Bỏ qua header
          const aptId = row.getCell(1).text ? row.getCell(1).text.trim() : "";
          const type = row.getCell(2).text ? row.getCell(2).text.trim() : "";
          const qty = row.getCell(3).value
            ? parseFloat(row.getCell(3).value)
            : 0;
          const price = row.getCell(4).value
            ? parseFloat(row.getCell(4).value)
            : 0;

          if (aptId && type && qty >= 0 && price >= 0) {
            const total = qty * price;
            const feetype = `${type} - T${currentMonth}/${currentYear}`;
            dataToImport.push({
              apartment_id: aptId,
              feetype: feetype,
              amount: total,
              quantity: qty,
              unit_price: price,
            });
          }
        }
      });

      if (dataToImport.length > 0) {
        handleSaveBatch(dataToImport); // Tái sử dụng hàm save
      } else {
        setModalStatus("failure");
        setStatusMessage("File không có dữ liệu hợp lệ hoặc sai định dạng.");
        setIsStatusModalOpen(true);
      }
    } catch (err) {
      console.error(err);
      setModalStatus("failure");
      setStatusMessage("Lỗi đọc file Excel.");
      setIsStatusModalOpen(true);
    } finally {
      e.target.value = null; // Reset input
    }
  };

  // --- LOGIC XUẤT EXCEL (EXPORT) ---
  const handleExportExcel = async () => {
    if (filteredList.length === 0) {
      setModalStatus("failure");
      setStatusMessage("Không có dữ liệu để xuất.");
      setIsStatusModalOpen(true);
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Danh sách khoản thu");

    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Căn hộ", key: "apartment_id", width: 15 },
      { header: "Nội dung thu", key: "feetype", width: 30 },
      { header: "Tổng tiền (VNĐ)", key: "amount", width: 20 },
      { header: "Trạng thái", key: "status", width: 20 },
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F81BD" },
    };

    filteredList.forEach((item) => {
      worksheet.addRow({
        id: item.id,
        apartment_id: item.apartment_id,
        feetype: item.feetype,
        amount: item.amount,
        status: item.state === 1 ? "Đã thanh toán" : "Chưa thanh toán",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(
      blob,
      `Danh_Sach_Khoan_Thu_${new Date()
        .toLocaleDateString("vi-VN")
        .replace(/\//g, "-")}.xlsx`
    );

    setModalStatus("success");
    setStatusMessage(`Đã xuất ${filteredList.length} dòng ra file Excel.`);
    setIsStatusModalOpen(true);
  };

  const handleCloseStatusModal = () => {
    setIsStatusModalOpen(false);
    setModalStatus(null);
  };

  const renderStatusModalContent = () => {
    if (!modalStatus) return null;
    const isSuccess = modalStatus === "success";
    const icon = isSuccess ? acceptIcon : notAcceptIcon;
    return (
      <div className="flex flex-col items-center">
        <img src={icon} alt={modalStatus} className="w-20 h-20 mb-6" />
        <div className="text-xl font-semibold text-center text-gray-800">
          {statusMessage}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Input File Ẩn */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx, .xls"
        className="hidden"
      />

      {/* HEADER SEARCH */}
      <div className="flex justify-start items-center mb-6">
        <div className="relative w-full max-w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </span>
          <input
            type="search"
            placeholder="Tìm theo ID, Số căn hộ, Loại phí..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* HEADER TITLE & BUTTONS */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">
          Quản lý thu Dịch vụ (Điện/Nước/Xe)
        </h1>
        <div className="flex space-x-4">
          <button
            onClick={handleImportClick}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 flex items-center space-x-2 shadow-md"
          >
            <FiUpload size={18} /> <span>Nhập khoản thu</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 flex items-center space-x-2 shadow-md"
          >
            <FiPrinter size={18} /> <span>Xuất khoản thu</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 flex items-center space-x-2 shadow-md"
          >
            <FiPlus size={20} />
            <span>Tạo khoản thu mới</span>
          </button>
        </div>
      </div>

      {/* DATA TABLE */}
      {isLoading ? (
        <div className="text-white text-center text-lg">
          Đang tải dữ liệu...
        </div>
      ) : (
        <div className="space-y-4 pb-10">
          {currentItems.length === 0 ? (
            <div className="bg-white p-6 rounded-lg text-center text-gray-500">
              Không có dữ liệu khoản thu Điện/Nước/Xe nào.
            </div>
          ) : (
            currentItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-md p-4 flex items-center relative overflow-hidden mb-4"
              >
                <div
                  className={`absolute left-4 top-3 bottom-3 w-1.5 rounded-full ${
                    item.state === 1 ? "bg-green-500" : "bg-orange-500"
                  }`}
                ></div>
                <div className="flex-1 grid grid-cols-5 gap-4 items-center pl-8 pr-4 text-gray-800">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">ID</p>
                    <p className="font-semibold">{item.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Căn hộ</p>
                    <p className="font-bold text-blue-700">
                      {item.apartment_id || "---"}
                    </p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-xs text-gray-500 mb-1">Nội dung thu</p>
                    <p className="font-medium">{item.feetype}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tổng tiền</p>
                    <p className="font-bold text-lg text-gray-900">
                      {formatCurrency(item.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        item.state === 1
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {item.state === 1 ? "Đã thanh toán" : "Chưa thanh toán"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* PAGINATION */}
      {filteredList.length > 0 && (
        <div className="flex justify-center items-center mt-6 space-x-6 pb-6">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className={`w-12 h-12 rounded-full border-2 border-black flex items-center justify-center transition-transform hover:scale-105 ${
              currentPage === 1
                ? "opacity-50 cursor-not-allowed bg-gray-200"
                : "cursor-pointer bg-white"
            }`}
          >
            <img
              src={arrowLeft}
              alt="Previous"
              className="w-6 h-6 object-contain"
            />
          </button>
          <div className="bg-gray-400/80 backdrop-blur-sm text-white font-bold py-3 px-8 rounded-full flex items-center space-x-4 shadow-lg">
            <span className="text-lg">Trang</span>
            <div className="bg-gray-500/60 rounded-lg px-4 py-1 text-xl shadow-inner">
              {currentPage}
            </div>
            <span className="text-lg">/ {totalPages}</span>
          </div>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={`w-12 h-12 rounded-full border-2 border-black flex items-center justify-center transition-transform hover:scale-105 ${
              currentPage === totalPages
                ? "opacity-50 cursor-not-allowed bg-gray-200"
                : "cursor-pointer bg-white"
            }`}
          >
            <img
              src={arrowRight}
              alt="Next"
              className="w-6 h-6 object-contain"
            />
          </button>
        </div>
      )}

      {/* MODALS */}
      <RevenueBatchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBatch}
        residents={residents}
        error={formError}
        setError={setFormError}
      />

      <StatusModal isOpen={isStatusModalOpen} onClose={handleCloseStatusModal}>
        {renderStatusModalContent()}
      </StatusModal>
    </div>
  );
};
