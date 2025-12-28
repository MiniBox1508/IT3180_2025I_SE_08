import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";

// --- THÊM IMPORT THƯ VIỆN PDF ---
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FiPrinter } from "react-icons/fi"; // Icon in

// --- Components Layout/Modal ---
import { StatusModal } from "../../layouts/StatusModal";
import acceptIcon from "../../images/accept_icon.png";
import notAcceptIcon from "../../images/not_accept_icon.png";

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
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // huyền, sắc, hỏi, ngã, nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // mũ â (ê), mũ ă, mũ ơ (ư)
  return str;
};

// --- COMPONENT: MODAL CHI TIẾT ---
const IncidentDetailModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-3xl w-full max-w-2xl p-8 relative shadow-2xl animate-fade-in-up">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Chi tiết</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content Form */}
        <div className="space-y-6">
          {/* Row 1: ID - Căn hộ - Ngày gửi */}
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

          {/* Row 2: Nội dung */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
              Nội dung
            </label>
            <div className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-gray-50 min-h-[50px]">
              {data.content}
            </div>
          </div>

          {/* Row 3: Trạng thái - Ngày xử lý */}
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

          {/* Row 4: Ghi chú */}
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

// --- MAIN PAGE ---
export const SecurityProblem = () => {
  // Hàm lấy JWT token
  const getToken = () => {
    return localStorage.getItem("token");
  };

  // State dữ liệu chính
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // States cho Modal Chi tiết
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // States cho Chế độ Xử lý hàng loạt (Batch Mode)
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Status Modal
  const [statusModal, setStatusModal] = useState({
    open: false,
    type: "success",
    message: "",
  });

  // --- FETCH DATA TỪ API ---
  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      // Gọi API lấy danh sách services (sự cố/khiếu nại)
      const response = await axios.get(`${API_BASE_URL}/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const rawData = response.data;

      // Map dữ liệu từ Backend sang format của UI
      const mappedData = Array.isArray(rawData)
        ? rawData.map((item) => ({
            id: item.id,
            content: item.content,
            apartment_id: item.apartment_id,
            // Format ngày gửi
            date_sent: item.created_at
              ? dayjs(item.created_at).format("DD/MM/YYYY")
              : "",
            status: item.servicestatus || "Đã ghi nhận",
            // Format ngày xử lý
            date_processed: item.handle_date
              ? dayjs(item.handle_date).format("DD/MM/YYYY")
              : "",
            note: item.note,
          }))
        : [];

      // Sắp xếp mới nhất lên đầu
      const sortedData = mappedData.sort((a, b) => b.id - a.id);
      setIncidents(sortedData);
    } catch (error) {
      console.error("Lỗi khi tải danh sách sự cố:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Gọi API khi component mount
  useEffect(() => {
    fetchIncidents();
  }, []);

  // --- FILTER (LOGIC TÌM KIẾM MỚI: ID + NỘI DUNG + CĂN HỘ + KHÔNG DẤU) ---
  const filteredList = incidents.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = removeVietnameseTones(searchTerm.trim());

    const contentStr = removeVietnameseTones(item.content || "");
    const idStr = String(item.id).toLowerCase();
    const apartmentStr = removeVietnameseTones(item.apartment_id || "");

    return (
      idStr.includes(term) ||
      contentStr.includes(term) ||
      apartmentStr.includes(term)
    );
  });

  // --- LOGIC XUẤT PDF ---
  const handleExportPDF = async () => {
    if (filteredList.length === 0) {
      setStatusModal({
        open: true,
        type: "failure",
        message: "Không có dữ liệu để xuất!",
      });
      return;
    }

    try {
      const doc = new jsPDF();

      // 1. Tải Font Roboto từ CDN để hỗ trợ tiếng Việt
      const fontUrl =
        "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf";
      const fontResponse = await fetch(fontUrl);
      const fontBlob = await fontResponse.blob();

      const reader = new FileReader();
      reader.readAsDataURL(fontBlob);
      reader.onloadend = () => {
        const base64data = reader.result.split(",")[1];

        // Add font
        doc.addFileToVFS("Roboto-Regular.ttf", base64data);
        doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
        doc.setFont("Roboto");

        // 2. Tạo nội dung PDF
        doc.setFontSize(18);
        doc.text("DANH SÁCH SỰ CỐ AN NINH", 105, 20, { align: "center" });

        doc.setFontSize(11);
        doc.text(
          `Ngày xuất: ${dayjs().format("DD/MM/YYYY HH:mm")}`,
          105,
          30,
          { align: "center" }
        );

        // Định nghĩa cột
        const tableColumn = [
          "ID",
          "Căn hộ",
          "Nội dung",
          "Ngày gửi",
          "Trạng thái",
          "Ngày xử lý",
        ];
        const tableRows = [];

        filteredList.forEach((item) => {
          const rowData = [
            item.id,
            item.apartment_id,
            item.content,
            item.date_sent,
            item.status,
            item.date_processed || "--/--/----",
          ];
          tableRows.push(rowData);
        });

        // Tạo bảng
        autoTable(doc, {
          startY: 40,
          head: [tableColumn],
          body: tableRows,
          styles: { font: "Roboto", fontStyle: "normal" },
          headStyles: { fillColor: [59, 130, 246] }, // Blue header
        });

        // Lưu file
        doc.save(`Su_co_an_ninh_${dayjs().format("DDMMYYYY")}.pdf`);
      };
    } catch (error) {
      console.error("Lỗi xuất PDF:", error);
      setStatusModal({
        open: true,
        type: "failure",
        message: "Xuất PDF thất bại!",
      });
    }
  };

  // --- HANDLERS ---

  // Mở chi tiết
  const handleViewDetail = (item) => {
    setSelectedIncident(item);
    setIsDetailModalOpen(true);
  };

  // Toggle chế độ hàng loạt
  const toggleBatchMode = () => {
    if (isBatchMode) {
      setIsBatchMode(false);
      setSelectedIds([]);
    } else {
      setIsBatchMode(true);
      // Pre-select những item đã xử lý (logic cũ)
      const processedIds = incidents
        .filter((item) => item.status === "Đã xử lý")
        .map((item) => item.id);
      setSelectedIds(processedIds);
    }
  };

  // Chọn item
  const handleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Xử lý hàng loạt (GỌI API THỰC TẾ)
  const handleBatchProcess = async () => {
    if (selectedIds.length === 0) return;

    try {
      const token = getToken();
      
      // Gửi nhiều request cập nhật song song
      await Promise.all(
        selectedIds.map((id) =>
          axios.patch(
            `${API_BASE_URL}/services/${id}`,
            { servicestatus: "Đã xử lý" }, // Cập nhật trạng thái
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );

      setStatusModal({
        open: true,
        type: "success",
        message: "Đã cập nhật trạng thái thành công!",
      });
      
      // Reload lại dữ liệu sau khi cập nhật
      fetchIncidents();
      
      setIsBatchMode(false);
      setSelectedIds([]);
    } catch (error) {
      console.error("Lỗi cập nhật hàng loạt:", error);
      setStatusModal({
        open: true,
        type: "failure",
        message: "Có lỗi xảy ra khi cập nhật!",
      });
    }
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

        {/* Nút Chuyển chế độ */}
        {!isBatchMode ? (
          <div className="flex gap-3">
            {/* NÚT XUẤT PDF MỚI THÊM */}
            <button
              onClick={handleExportPDF}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg transition-colors flex items-center"
            >
              <FiPrinter className="mr-2" /> Xuất PDF
            </button>

            <button
              onClick={toggleBatchMode}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg transition-colors"
            >
              Xử lý
            </button>
          </div>
        ) : (
          <div className="flex space-x-3">
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
          </div>
        )}
      </div>

      {/* 3. DANH SÁCH SỰ CỐ */}
      <div className="space-y-4 pb-10">
        {isLoading ? (
          <div className="text-white text-center">Đang tải dữ liệu...</div>
        ) : filteredList.length === 0 ? (
          <div className="text-white text-center">Không tìm thấy sự cố nào.</div>
        ) : (
          filteredList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-[20px] p-5 flex items-center shadow-md relative min-h-[90px]"
            >
              {/* Thanh xanh bên trái */}
              <div className="absolute left-6 top-4 bottom-4 w-1 bg-blue-500 rounded-full"></div>

              {/* Grid Content */}
              <div className="flex-1 grid grid-cols-12 gap-4 items-center pl-10">
                {/* ID */}
                <div className="col-span-1">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Sự cố ID
                  </p>
                  <p className="text-xl font-bold text-gray-900">{item.id}</p>
                </div>

                {/* Nội dung */}
                <div className="col-span-3">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Nội dung
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.content}
                  </p>
                </div>

                {/* Số căn hộ */}
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Số căn hộ
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.apartment_id}
                  </p>
                </div>

                {/* Ngày gửi */}
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Ngày gửi
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.date_sent}
                  </p>
                </div>

                {/* Trạng thái */}
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
                </div>

                {/* Ngày xử lý / Action */}
                <div className="col-span-2 flex justify-end items-center">
                  {/* Nếu ở chế độ Batch: Hiện Checkbox */}
                  {isBatchMode ? (
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
                  ) : (
                    // Chế độ thường: Hiện nút Xem chi tiết hoặc Ngày xử lý
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

      {/* --- MODAL SECTIONS --- */}

      {/* 1. Detail Modal */}
      <IncidentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        data={selectedIncident}
      />

      {/* 2. Status Modal */}
      <StatusModal
        isOpen={statusModal.open}
        onClose={() => setStatusModal({ ...statusModal, open: false })}
      >
        <div className="flex flex-col items-center justify-center p-4">
          <img
            src={statusModal.type === "success" ? acceptIcon : notAcceptIcon}
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