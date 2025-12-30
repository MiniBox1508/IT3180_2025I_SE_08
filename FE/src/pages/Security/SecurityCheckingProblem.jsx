import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import dayjs from "dayjs";

// --- IMPORT THƯ VIỆN XỬ LÝ FILE (PATTERN) ---
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- IMPORT ICONS ---
import { FiUpload, FiPrinter } from "react-icons/fi";
import arrowLeft from "../../images/Arrow_Left_Mini_Circle.png";
import arrowRight from "../../images/Arrow_Right_Mini_Circle.png";
import acceptIconImg from "../../images/accept_icon.png";
import notAcceptIconImg from "../../images/not_accept_icon.png";

// --- Components Layout/Modal ---
import { StatusModal } from "../../layouts/StatusModal";

// --- API CONFIG ---
const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

// --- HELPER: Lấy User Email ---
const getCurrentUserEmail = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.email || "security@bluemoon.com";
    } catch (e) {
      return "security@bluemoon.com";
    }
  }
  return "security@bluemoon.com";
};

// --- ICONS ---
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
// === PREVIEW PDF MODAL (MẪU IMPORT/EXPORT) ===
// =========================================================================
const PreviewPdfModal = ({ isOpen, onClose, data, onPrint }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  useEffect(() => {
    if (isOpen) setCurrentPage(1);
  }, [isOpen, data]);

  if (!isOpen) return null;

  const totalPages = Math.ceil(data.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const emptyRows = itemsPerPage - currentItems.length;

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };
  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl flex flex-col h-auto">
        <div className="p-6 border-b border-gray-200 flex justify-center relative">
          <h2 className="text-2xl font-bold text-gray-800">
            Xem trước danh sách sự cố
          </h2>
        </div>
        <div className="p-8 bg-gray-50 flex flex-col">
          <div className="border border-gray-300 rounded-lg bg-white shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-sm font-bold text-gray-700 border-b w-[10%]">
                    Mã sự cố
                  </th>
                  <th className="p-3 text-sm font-bold text-gray-700 border-b w-[15%]">
                    Mã căn hộ
                  </th>
                  <th className="p-3 text-sm font-bold text-gray-700 border-b w-[30%]">
                    Nội dung
                  </th>
                  <th className="p-3 text-sm font-bold text-gray-700 border-b w-[15%]">
                    Ngày gửi
                  </th>
                  <th className="p-3 text-sm font-bold text-gray-700 border-b w-[15%]">
                    Trạng thái
                  </th>
                  <th className="p-3 text-sm font-bold text-gray-700 border-b w-[15%]">
                    Ngày xử lý
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((item, index) => (
                  <tr key={index} className="hover:bg-blue-50 h-[50px]">
                    <td className="p-3 text-sm text-gray-700">{item.id}</td>
                    <td className="p-3 text-sm text-gray-700">
                      {item.apartment_id}
                    </td>
                    <td
                      className="p-3 text-sm text-gray-700 truncate max-w-xs"
                      title={item.content}
                    >
                      {item.content}
                    </td>
                    <td className="p-3 text-sm text-gray-700">
                      {item.date_sent}
                    </td>
                    <td className="p-3 text-sm text-gray-700">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          item.status === "Đã xử lý"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-700">
                      {item.date_processed || "--/--/----"}
                    </td>
                  </tr>
                ))}
                {Array.from({ length: Math.max(0, emptyRows) }).map((_, i) => (
                  <tr key={`empty-${i}`} className="h-[50px]">
                    <td colSpan={6}></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center items-center mt-6 space-x-4">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className={`w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center ${
                currentPage === 1
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-gray-200"
              }`}
            >
              <img src={arrowLeft} className="w-4 h-4" alt="Prev" />
            </button>
            <div className="bg-gray-300 px-4 py-1 rounded-full text-gray-700 font-semibold text-sm">
              Trang {currentPage} / {totalPages}
            </div>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center ${
                currentPage === totalPages
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-gray-200"
              }`}
            >
              <img src={arrowRight} className="w-4 h-4" alt="Next" />
            </button>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-between items-center bg-white rounded-b-2xl">
          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-8 rounded-lg shadow-md transition-colors"
          >
            Thoát
          </button>
          <button
            onClick={onPrint}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-8 rounded-lg shadow-md transition-colors flex items-center gap-2"
          >
            <span>In danh sách</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: MODAL CHI TIẾT SỰ CỐ ---
const IncidentDetailModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-3xl w-full max-w-2xl p-8 relative shadow-2xl animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Chi tiết</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
                ID Sự cố
              </label>
              <div className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 font-medium bg-gray-50">
                {data.id}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
                Căn hộ
              </label>
              <div className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 font-medium bg-gray-50">
                {data.apartment_id}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
                Ngày gửi
              </label>
              <div className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 font-medium bg-gray-50">
                {data.date_sent}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
              Nội dung
            </label>
            <div className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-gray-50 min-h-[50px]">
              {data.content}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
                Trạng thái
              </label>
              <div
                className={`w-full border border-gray-200 rounded-lg px-4 py-3 font-bold ${
                  data.status === "Đã xử lý" ? "text-green-500" : "text-red-500"
                } bg-white`}
              >
                {data.status}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
                Ngày xử lý
              </label>
              <div className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-gray-50">
                {data.date_processed || "--/--/----"}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
              Ghi chú
            </label>
            <textarea
              readOnly
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-500 bg-gray-50 resize-none focus:outline-none"
              value={data.note || "--"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT MỚI: FEEDBACK DETAIL MODAL (CHI TIẾT PHẢN ÁNH) ---
const FeedbackDetailModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-3xl w-full max-w-lg p-8 relative shadow-2xl animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Chi tiết phản ánh dịch vụ
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
              Vấn đề
            </label>
            <div className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-gray-50">
              {data.problems || "--"}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
              Đánh giá chất lượng
            </label>
            <div className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-gray-50">
              {data.rates || "--"}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
              Chi tiết
            </label>
            <div className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-gray-50 min-h-[60px]">
              {data.scripts || "--"}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-8 rounded-lg shadow-md transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
export const SecurityProblem = () => {
  const getToken = () => localStorage.getItem("token");
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // FEEDBACK DETAIL MODAL STATE (MỚI)
  const [isFeedbackDetailModalOpen, setIsFeedbackDetailModalOpen] =
    useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Status Modal
  const [statusModal, setStatusModal] = useState({
    open: false,
    type: "success",
    message: "",
  });

  // State Import/Export (MẪU MỚI)
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const fileInputRef = useRef(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- FETCH DATA ---
  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const rawData = response.data;
      const mappedData = Array.isArray(rawData)
        ? rawData.map((item) => ({
            id: item.id,
            content: item.content,
            apartment_id: item.apartment_id,
            date_sent: item.created_at
              ? dayjs(item.created_at).format("DD/MM/YYYY")
              : "",
            status: item.servicestatus || "Đã ghi nhận",
            date_processed: item.handle_date
              ? dayjs(item.handle_date).format("DD/MM/YYYY")
              : "",
            note: item.note,
            ben_xu_ly: item.ben_xu_ly,
            // MAPPING THÊM 3 TRƯỜNG FEEDBACK (MỚI)
            problems: item.problems,
            rates: item.rates,
            scripts: item.scripts,
            raw_created_at: item.created_at,
          }))
        : [];
      setIncidents(mappedData.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error("Lỗi khi tải danh sách sự cố:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // --- HANDLER FEEDBACK DETAIL (MỚI) ---
  const handleViewFeedback = (item) => {
    setSelectedFeedback(item);
    setIsFeedbackDetailModalOpen(true);
  };

  // --- LOGIC NHẬP FILE EXCEL (ĐÃ SỬA) ---
  const handleImportClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const workbook = new ExcelJS.Workbook();
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const buffer = evt.target.result;
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.getWorksheet(1);

        let dataToImport = [];
        let headerRowNumber = 1;
        let colMap = {};

        // 1. Tìm Header
        worksheet.eachRow((row, rowNumber) => {
          if (Object.keys(colMap).length > 0) return;
          const rowValues = row.values;
          if (Array.isArray(rowValues)) {
            const normalizedCells = rowValues.map((v) =>
              v ? String(v).trim().toLowerCase() : ""
            );
            const idxApartment = normalizedCells.findIndex(
              (v) => v === "mã số căn hộ"
            );
            const idxContent = normalizedCells.findIndex(
              (v) => v === "nội dung"
            );
            const idxDate = normalizedCells.findIndex((v) => v === "ngày gửi");

            if (idxApartment !== -1 && idxContent !== -1) {
              headerRowNumber = rowNumber;
              colMap = {
                apartment_id: idxApartment,
                content: idxContent,
                date: idxDate,
              };
            }
          }
        });

        if (Object.keys(colMap).length === 0)
          throw new Error("Không tìm thấy cột 'Mã số căn hộ' và 'Nội dung'.");

        // 2. Tìm Max ID để Auto-increment
        let currentMaxId = incidents.reduce(
          (max, item) => Math.max(max, Number(item.id) || 0),
          0
        );

        let validSuccessCount = 0; // Đếm số dòng hợp lệ trong file
        let invalidDataCount = 0; // Đếm số dòng thiếu dữ liệu trong file

        // 3. Đọc dữ liệu và Lọc (Filter) ngay tại đây
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > headerRowNumber) {
            const rowValues = row.values;
            const apartment = rowValues[colMap.apartment_id]
              ? String(rowValues[colMap.apartment_id]).trim()
              : "";
            const content = rowValues[colMap.content]
              ? String(rowValues[colMap.content]).trim()
              : "";

            // KIỂM TRA QUAN TRỌNG: Chỉ thêm vào danh sách nếu có đủ dữ liệu
            if (apartment && content) {
              const dateVal =
                colMap.date !== -1 && rowValues[colMap.date]
                  ? rowValues[colMap.date]
                  : new Date();

              currentMaxId++;
              dataToImport.push({
                id: currentMaxId,
                apartment_id: apartment,
                content: content,
                request_date: dateVal,
                service_type: "Khiếu nại",
                status: "Chờ xử lý",
              });
              validSuccessCount++;
            } else {
              // Nếu dòng có dữ liệu nhưng thiếu cột quan trọng -> Tính là lỗi
              // (Chỉ đếm nếu dòng đó không hoàn toàn rỗng để tránh đếm dòng thừa cuối file)
              if (row.hasValues) {
                invalidDataCount++;
              }
            }
          }
        });

        // 4. Gọi API chỉ với những data đúng
        const token = getToken();
        let apiSuccessCount = 0;
        let apiFailCount = 0;

        if (dataToImport.length > 0) {
          await Promise.all(
            dataToImport.map((item) =>
              axios
                .post(`${API_BASE_URL}/services`, item, {
                  headers: { Authorization: `Bearer ${token}` },
                })
                .then(() => apiSuccessCount++)
                .catch(() => apiFailCount++)
            )
          );
        }

        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchIncidents();

        // 5. Tổng hợp kết quả
        // Tổng thất bại = Lỗi dữ liệu file (invalidDataCount) + Lỗi API (apiFailCount)
        const totalFail = invalidDataCount + apiFailCount;
        const totalSuccess = apiSuccessCount;

        let message = `Thành công: ${totalSuccess}, Thất bại: ${totalFail}`;
        let type = totalSuccess > 0 ? "success" : "failure";

        if (totalSuccess === 0 && totalFail === 0) {
          message = "File không có dữ liệu hợp lệ.";
          type = "failure";
        }

        setStatusModal({ open: true, type, message });
      } catch (err) {
        setStatusModal({
          open: true,
          type: "failure",
          message: "Lỗi xử lý file: " + err.message,
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // --- LOGIC XUẤT PDF (MẪU EXPORT) ---
  const handleExportClick = () => setShowPreviewModal(true);

  const handlePrintPDF = async () => {
    try {
      const doc = new jsPDF();
      const fontUrl =
        "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf";
      const fontResponse = await fetch(fontUrl);
      const fontBlob = await fontResponse.blob();
      const reader = new FileReader();
      reader.readAsDataURL(fontBlob);

      reader.onloadend = () => {
        const base64data = reader.result.split(",")[1];
        doc.addFileToVFS("Roboto-Regular.ttf", base64data);
        doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
        doc.setFont("Roboto");

        // Header
        doc.setFontSize(18);
        doc.text("Danh sách sự cố an ninh chung cư Blue Moon", 105, 15, {
          align: "center",
        });

        const today = new Date().toLocaleDateString("vi-VN");
        doc.setFontSize(11);
        doc.setFont("Roboto", "normal");
        doc.text(`Ngày in: ${today}`, 14, 25);
        doc.text(`Người in: ${getCurrentUserEmail()}`, 196, 25, {
          align: "right",
        });

        // Table Data
        const tableColumn = [
          "Mã sự cố",
          "Mã căn hộ",
          "Nội dung",
          "Ngày gửi",
          "Trạng thái",
          "Ngày xử lý",
        ];
        const tableRows = [];

        filteredList.forEach((item) => {
          const rowData = [
            String(item.id),
            (item.apartment_id || "").normalize("NFC"),
            (item.content || "").normalize("NFC"),
            item.date_sent,
            (item.status || "Chờ xử lý").normalize("NFC"),
            item.date_processed || "---",
          ];
          tableRows.push(rowData);
        });

        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 30,
          styles: { font: "Roboto", fontStyle: "normal", fontSize: 10 },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: "normal",
          }, // Blue Header
          theme: "grid",
          margin: { top: 30 },
          columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 25 },
            2: { cellWidth: "auto" },
            3: { cellWidth: 25 },
            4: { cellWidth: 30 },
            5: { cellWidth: 25 },
          },
        });

        doc.save("DANH_SACH_SU_CO_CONG_AN_BLUEMOON.pdf");
        setShowPreviewModal(false);
        setStatusModal({
          open: true,
          type: "success",
          message: `Xuất thành công ${filteredList.length} dòng dữ liệu!`,
        });
      };
    } catch (err) {
      setStatusModal({
        open: true,
        type: "failure",
        message: "Lỗi xuất PDF: " + err.message,
      });
    }
  };

  // --- HANDLERS KHÁC ---
  const handleViewDetail = (item) => {
    setSelectedIncident(item);
    setIsDetailModalOpen(true);
  };

  // --- SỬA LOGIC: TOGGLE BATCH MODE ---
  const toggleBatchMode = () => {
    setIsBatchMode(!isBatchMode);
    setSelectedIds([]); // Luôn reset danh sách chọn về rỗng khi bật/tắt chế độ
  };

  const handleSelect = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );

  const handleBatchProcess = async () => {
    if (selectedIds.length === 0) return;
    try {
      const token = getToken();
      await Promise.all(
        selectedIds.map((id) =>
          axios.patch(
            `${API_BASE_URL}/services/${id}`,
            { servicestatus: "Đã xử lý" },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );
      setStatusModal({
        open: true,
        type: "success",
        message: "Đã cập nhật trạng thái thành công!",
      });
      fetchIncidents();
      setIsBatchMode(false);
      setSelectedIds([]);
    } catch (error) {
      setStatusModal({
        open: true,
        type: "failure",
        message: "Có lỗi xảy ra khi cập nhật!",
      });
    }
  };

  // --- FILTER & PAGINATION ---
  const filteredList = incidents.filter((item) => {
    // 1. Chỉ hiển thị nếu ben_xu_ly là "Công an"
    if (item.ben_xu_ly !== "Công an") return false;

    // 2. Sau đó mới lọc theo từ khóa tìm kiếm
    if (!searchTerm.trim()) return true;
    const term = removeVietnameseTones(searchTerm.trim());
    return (
      String(item.id).toLowerCase().includes(term) ||
      removeVietnameseTones(item.content || "").includes(term) ||
      removeVietnameseTones(item.apartment_id || "").includes(term)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentList = filteredList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };
  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="w-full min-h-screen">
      {/* 1. THANH TÌM KIẾM */}
      <div className="flex justify-start items-center mb-8">
        <div className="relative w-full max-w-2xl bg-white rounded-lg overflow-hidden shadow-sm">
          <span className="absolute left-4 top-1/2 -translate-y-1/2">
            <SearchIcon />
          </span>
          <input
            type="search"
            placeholder="Tìm kiếm theo ID, Nội dung, Số căn hộ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-gray-700 focus:outline-none h-12"
          />
        </div>
      </div>

      {/* 2. TITLE & BUTTONS */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Quản lý sự cố</h1>

        <div className="flex space-x-3 items-center">
          {/* Input File Ẩn */}
          <input
            type="file"
            accept=".xlsx, .xls"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          {/* Nút Import/Export MỚI */}
          {!isBatchMode && (
            <>
              <button
                onClick={handleImportClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-colors"
              >
                <FiUpload size={18} /> <span>Nhập Excel</span>
              </button>
              <button
                onClick={handleExportClick}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-colors"
              >
                <FiPrinter size={18} /> <span>Xuất PDF</span>
              </button>
            </>
          )}

          {/* Nút Chuyển chế độ Batch cũ */}
          {!isBatchMode ? (
            <button
              onClick={toggleBatchMode}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg transition-colors"
            >
              Xử lý
            </button>
          ) : (
            <>
              <button
                onClick={handleBatchProcess}
                disabled={selectedIds.length === 0}
                className={`px-6 py-2.5 rounded-lg font-bold shadow-lg transition-colors text-white ${
                  selectedIds.length > 0
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Xác nhận xử lý ({selectedIds.length})
              </button>
              <button
                onClick={toggleBatchMode}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg transition-colors"
              >
                Hủy
              </button>
            </>
          )}
        </div>
      </div>

      {/* 3. DANH SÁCH SỰ CỐ */}
      <div className="space-y-4 pb-10">
        {isLoading ? (
          <div className="text-white text-center">Đang tải dữ liệu...</div>
        ) : currentList.length === 0 ? (
          <div className="text-white text-center">
            Không tìm thấy sự cố nào.
          </div>
        ) : (
          currentList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-[20px] p-5 flex items-center shadow-md relative min-h-[90px]"
            >
              <div className="absolute left-6 top-4 bottom-4 w-1 bg-blue-500 rounded-full"></div>
              <div className="flex-1 grid grid-cols-12 gap-4 items-center pl-10">
                <div className="col-span-1">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Sự cố ID
                  </p>
                  <p className="text-xl font-bold text-gray-900">{item.id}</p>
                </div>
                <div className="col-span-3">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Nội dung
                  </p>
                  <p
                    className="text-sm font-semibold text-gray-900 truncate pr-2"
                    title={item.content}
                  >
                    {item.content}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Số căn hộ
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.apartment_id}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Ngày gửi
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.date_sent}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Trạng thái
                  </p>
                  <p
                    className={`text-sm font-bold ${
                      item.status === "Đã xử lý"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {item.status}
                  </p>
                  {/* --- SỬA UI: HIỂN THỊ LINK XEM THÊM CHI TIẾT --- */}
                  {item.status === "Đã xử lý" && (
                    <button
                      onClick={() => handleViewFeedback(item)}
                      className="text-[10px] text-blue-500 font-semibold hover:underline block mt-0.5"
                    >
                      Xem thêm chi tiết
                    </button>
                  )}
                </div>
                <div className="col-span-2 flex justify-end items-center">
                  {isBatchMode ? (
                    // --- SỬA LOGIC HIỂN THỊ: Nếu đã xử lý thì không cho chọn ---
                    item.status === "Đã xử lý" ? (
                      <div className="flex items-center justify-center h-10 px-2 border border-gray-200 rounded-xl bg-gray-50">
                        <span className="text-gray-400 font-bold text-xs italic">
                          Đã xong
                        </span>
                      </div>
                    ) : (
                      <div
                        onClick={() => handleSelect(item.id)}
                        className={`w-10 h-10 rounded-xl cursor-pointer flex items-center justify-center transition-all duration-200 ${
                          selectedIds.includes(item.id)
                            ? "bg-blue-500 shadow-blue-500/50"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                      >
                        {selectedIds.includes(item.id) && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col items-end">
                      <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                        Ngày xử lý
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        {item.date_processed || "--/--/----"}
                      </p>
                      <button
                        onClick={() => handleViewDetail(item)}
                        className="text-blue-500 text-xs hover:underline font-bold"
                      >
                        Xem thêm chi tiết
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredList.length > 0 && (
        <div className="flex justify-center items-center mt-6 space-x-6 pb-8">
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

      {/* Modals */}
      <IncidentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        data={selectedIncident}
      />
      <FeedbackDetailModal
        isOpen={isFeedbackDetailModalOpen}
        onClose={() => setIsFeedbackDetailModalOpen(false)}
        data={selectedFeedback}
      />
      <PreviewPdfModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        data={filteredList}
        onPrint={handlePrintPDF}
      />

      <StatusModal
        isOpen={statusModal.open}
        onClose={() => setStatusModal({ ...statusModal, open: false })}
      >
        <div className="flex flex-col items-center justify-center p-4">
          <img
            src={
              statusModal.type === "success" ? acceptIconImg : notAcceptIconImg
            }
            alt="Status"
            className="w-20 h-20 mb-4"
          />
          <h3 className="text-xl font-bold text-gray-800 text-center">
            {statusModal.message}
          </h3>
        </div>
      </StatusModal>
    </div>
  );
};

export const SecurityProblem = React.memo(SecurityProblem);
