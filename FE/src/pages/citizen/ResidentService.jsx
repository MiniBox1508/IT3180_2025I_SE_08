import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import dayjs from "dayjs";
import ExcelJS from "exceljs";

// --- IMPORT ẢNH MŨI TÊN CHO PHÂN TRANG ---
import arrowLeft from "../../images/Arrow_Left_Mini_Circle.png"; 
import arrowRight from "../../images/Arrow_Right_Mini_Circle.png";

// --- FEEDBACK DROPDOWN & SUBMODAL ---
const PROBLEM_OPTIONS = [
  "Không vấn đề",
  "Chi phí đắt",
  "Phản hồi chậm",
  "Thiếu chuyên nghiệp",
];

const CustomDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <div
        className="border border-gray-300 rounded px-3 py-2 bg-white cursor-pointer flex items-center justify-between"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={value ? "text-gray-800" : "text-gray-400"}>
          {value || "Chọn vấn đề"}
        </span>
        <svg
          className="w-4 h-4 text-gray-400 ml-2"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg">
          {PROBLEM_OPTIONS.map((opt) => (
            <div
              key={opt}
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-gray-700"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SuccessModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-center border border-gray-200">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <svg
            className="h-6 w-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
          Thành công
        </h3>
        <p className="text-sm text-gray-500 mb-4">{message}</p>
        <button
          onClick={onClose}
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:text-sm"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

const ErrorModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-center border border-gray-200">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <svg
            className="h-6 w-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
          Lỗi
        </h3>
        <p className="text-sm text-gray-500 mb-4">{message}</p>
        <button
          onClick={onClose}
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:text-sm"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

// --- SUBMODAL PHẢN HỒI ---
const FeedbackSubModal = ({
  isOpen,
  onClose,
  serviceId,
  currentProblem,
  onSuccess,
}) => {
  const [problem, setProblem] = useState(currentProblem || "");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProblem(currentProblem || "");
      setShowSuccess(false);
      setShowError(false);
    }
  }, [isOpen, currentProblem]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `https://testingdeploymentbe-2.vercel.app/services/${serviceId}`,
        { problems: problem },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSuccess(); // Reload list & close modal
      }, 1500);
    } catch (err) {
      console.error(err);
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-xl p-6 w-96 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h3 className="text-xl font-bold mb-4 text-center">Phản ánh dịch vụ</h3>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vấn đề gặp phải
          </label>
          <CustomDropdown value={problem} onChange={setProblem} />
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded text-gray-700 hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Đang gửi..." : "Gửi phản ánh"}
          </button>
        </div>

        {/* Thông báo con bên trong Modal Phản hồi */}
        <SuccessModal
          isOpen={showSuccess}
          onClose={() => setShowSuccess(false)}
          message="Gửi phản ánh thành công!"
        />
        <ErrorModal
          isOpen={showError}
          onClose={() => setShowError(false)}
          message="Gửi phản ánh thất bại!"
        />
      </div>
    </div>
  );
};

// --- MODAL ĐĂNG KÝ MỚI ---
const RegisterServiceModal = ({ isOpen, onClose, onSubmit, apartments }) => {
  const [formData, setFormData] = useState({ apartment_id: "", content: "" });

  useEffect(() => {
    if (isOpen) {
      // Nếu chỉ có 1 căn hộ, chọn luôn
      if (apartments.length === 1) {
        setFormData({ apartment_id: apartments[0], content: "" });
      } else {
        setFormData({ apartment_id: "", content: "" });
      }
    }
  }, [isOpen, apartments]);

  const handleSubmit = () => {
    if (!formData.apartment_id || !formData.content) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Đăng ký dịch vụ
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Căn hộ
            </label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.apartment_id}
              onChange={(e) =>
                setFormData({ ...formData, apartment_id: e.target.value })
              }
            >
              <option value="">-- Chọn căn hộ --</option>
              {apartments.map((apt) => (
                <option key={apt} value={apt}>
                  {apt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nội dung đăng ký
            </label>
            <textarea
              rows={4}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Nhập nội dung dịch vụ cần đăng ký..."
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
            />
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 shadow-md transition-all"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MODAL CHI TIẾT ---
const ServiceDetailModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative animate-fade-in-up">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">Chi tiết dịch vụ</h2>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                ID Dịch vụ
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 font-semibold">
                {data.id}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Căn hộ
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 font-semibold">
                {data.apartment_id}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Nội dung
            </label>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
              {data.content}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Ngày gửi
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                {dayjs(data.created_at).format("DD/MM/YYYY")}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Ngày xử lý
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                {data.handle_date
                  ? dayjs(data.handle_date).format("DD/MM/YYYY")
                  : "---"}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Trạng thái
              </label>
              <div
                className={`p-3 rounded-lg border border-gray-200 font-bold ${
                  data.servicestatus === "Đã xử lý"
                    ? "text-green-600 bg-green-50"
                    : "text-blue-600 bg-blue-50"
                }`}
              >
                {data.servicestatus || "Đã ghi nhận"}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Phản ánh
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800">
                {data.problems || "Không vấn đề"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- CUSTOM CONFIRM MODAL ---
const CustomModal = ({ isOpen, onClose, type, title, onConfirm }) => {
  if (!isOpen) return null;
  const isDelete = type === "delete";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl p-6 w-96 text-center">
        <div className="mb-4 flex justify-center">
          {isDelete ? (
            <svg
              className="w-16 h-16 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
              />
            </svg>
          ) : (
            <svg
              className="w-16 h-16 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>
        <h3 className="text-xl font-bold mb-6">{title}</h3>
        <div className="flex justify-center gap-4">
          {isDelete ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-bold"
              >
                Hoàn tác
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-bold"
              >
                Xác nhận
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-bold"
            >
              Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- HELPER ---
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

// --- MAIN COMPONENT ---
const ResidentService = () => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [uniqueApartments, setUniqueApartments] = useState([]);

  // States Mode
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: "success",
    title: "",
  });

  // State for Feedback SubModal (Popup nhỏ)
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackServiceId, setFeedbackServiceId] = useState(null);
  const [feedbackCurrentProblem, setFeedbackCurrentProblem] = useState("");

  // States thông báo top-level
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // --- STATE PHÂN TRANG (MỚI) ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getToken = () => localStorage.getItem("token");

  // Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const myApartmentId = user?.apartment_id || "";

      // 1. Get services
      const resServices = await axios.get(
        "https://testingdeploymentbe-2.vercel.app/services",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Filter only user's apartment
      const myServices = resServices.data
        .filter(
          (s) =>
            s.apartment_id &&
            String(s.apartment_id).toLowerCase() === myApartmentId.toLowerCase()
        )
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setServices(myServices);

      // 2. Get unique apartments of current user (usually just 1)
      if (myApartmentId) {
        setUniqueApartments([myApartmentId]);
      }
    } catch (error) {
      console.error(error);
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

  // Filter Logic
  const filteredServices = services.filter((item) => {
    const term = removeVietnameseTones(searchTerm.trim());
    if (!term) return true;
    const idMatch = String(item.id).toLowerCase().includes(term);
    const contentMatch = removeVietnameseTones(item.content || "").includes(
      term
    );
    return idMatch || contentMatch;
  });

  // --- LOGIC CẮT DỮ LIỆU ĐỂ HIỂN THỊ (PAGINATION) ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentServices = filteredServices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

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

  // Handlers
  const handleRegisterSubmit = async (data) => {
    setIsRegisterModalOpen(false);
    try {
      const token = getToken();
      await axios.post(
        "https://testingdeploymentbe-2.vercel.app/services",
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModalState({
        isOpen: true,
        type: "success",
        title: "Đăng ký dịch vụ thành công!",
      });
      fetchData();
    } catch (err) {
      setModalState({
        isOpen: true,
        type: "success", // dùng icon success nhưng title báo lỗi? Hoặc thêm icon error. Tạm theo code cũ.
        title: "Đăng ký thất bại!",
      });
    }
  };

  const handleDeleteModeToggle = () => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedIds([]);
  };

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDeleteConfirm = () => {
    if (selectedIds.length === 0) return;
    setModalState({
      isOpen: true,
      type: "delete",
      title: "Xóa các mục đã chọn",
    });
  };

  const executeDelete = async () => {
    setModalState({ ...modalState, isOpen: false });
    try {
      const token = getToken();
      await Promise.all(
        selectedIds.map((id) =>
          axios.delete(
            `https://testingdeploymentbe-2.vercel.app/services/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );
      setIsDeleteMode(false);
      setSelectedIds([]);
      fetchData();
      // Show success modal (reuse CustomModal or add new one)
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewDetail = (item) => {
    setSelectedService(item);
    setIsDetailModalOpen(true);
  };

  // Mở Popup Phản hồi
  const handleFeedbackClick = (item) => {
    setFeedbackServiceId(item.id);
    setFeedbackCurrentProblem(item.problems);
    setFeedbackModalOpen(true);
  };

  const handleCloseFeedbackModal = () => {
    setFeedbackModalOpen(false);
    setFeedbackServiceId(null);
    setFeedbackCurrentProblem("");
  };

  return (
    <div className="w-full min-h-screen bg-transparent p-8">
      {/* Search & Header */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="relative w-full max-w-2xl bg-white rounded-lg overflow-hidden shadow-sm">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
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
            placeholder="Tìm kiếm theo ID, Nội dung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-gray-700 focus:outline-none h-12"
          />
        </div>

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Dịch vụ đã đăng ký</h1>
          <div className="flex gap-3">
            {!isDeleteMode ? (
              <>
                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg flex items-center transition-colors"
                >
                  <span className="mr-2 text-xl font-bold">+</span> Đăng ký dịch
                  vụ
                </button>
                <button
                  onClick={handleDeleteModeToggle}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-colors"
                >
                  Xóa dịch vụ
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleDeleteConfirm}
                  className={`px-6 py-2 rounded-lg font-bold shadow-lg transition-colors text-white ${
                    selectedIds.length > 0
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                  disabled={selectedIds.length === 0}
                >
                  Xóa các mục đã chọn
                </button>
                <button
                  onClick={handleDeleteModeToggle}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition-colors"
                >
                  Hủy xóa
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4 pb-10">
        {isLoading ? (
          <div className="text-white text-center">Đang tải...</div>
        ) : currentServices.length === 0 ? (
          <div className="text-white text-center">
            Không tìm thấy dịch vụ nào.
          </div>
        ) : (
          currentServices.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-[20px] p-5 flex items-center shadow-md relative min-h-[90px]"
            >
              <div className="absolute left-6 top-4 bottom-4 w-1 bg-blue-500 rounded-full"></div>
              <div className="flex-1 grid grid-cols-12 gap-4 items-center pl-10">
                {/* ID */}
                <div className="col-span-1">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Dịch vụ ID
                  </p>
                  <p className="text-xl font-bold text-gray-900">{item.id}</p>
                </div>
                {/* Content */}
                <div className="col-span-3">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Nội dung
                  </p>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {item.content}
                  </p>
                </div>
                {/* Căn hộ */}
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Số căn hộ
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.apartment_id}
                  </p>
                </div>
                {/* Status */}
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Trạng thái
                  </p>
                  <div
                    className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                      item.servicestatus === "Đã xử lý"
                        ? "text-green-600 bg-green-100"
                        : "text-blue-600 bg-blue-100"
                    }`}
                  >
                    {item.servicestatus || "Đã ghi nhận"}
                  </div>
                </div>
                {/* Feedback */}
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Phản ánh
                  </p>
                  {/* Nếu đang xóa thì ko cho click */}
                  {isDeleteMode ? (
                    <span className="text-sm font-semibold text-gray-900">
                      {item.problems || "Không vấn đề"}
                    </span>
                  ) : (
                    <div
                      className="cursor-pointer flex items-center group"
                      onClick={() => handleFeedbackClick(item)}
                    >
                      <span className="text-sm font-semibold text-gray-900 mr-1 group-hover:text-blue-600">
                        {item.problems || "Không vấn đề"}
                      </span>
                      <svg
                        className="w-3 h-3 text-gray-400 group-hover:text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                {/* Action */}
                <div className="col-span-2 flex justify-end items-center">
                  {isDeleteMode ? (
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
                          className="w-6 h-6 text-white"
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
                    <button
                      onClick={() => handleViewDetail(item)}
                      className="text-blue-500 text-xs font-bold hover:underline"
                    >
                      Xem chi tiết
                    </button>
                  )}
                </div>
              </div>

              {/* SubModal Phản ánh (Render riêng cho từng item hoặc dùng 1 modal chung) */}
              {/* Ở đây dùng 1 modal chung bên ngoài loop để tối ưu, trigger bằng handleFeedbackClick */}
              {feedbackModalOpen && feedbackServiceId === item.id && (
                <div className="absolute top-full right-20 mt-2 z-50">
                  {/* Đây là vị trí tương đối, để modal popup ngay tại dòng đó */}
                  <div className="relative">
                    {/* tam giác chỉ lên */}
                    <div className="absolute -top-2 right-4 w-4 h-4 bg-white transform rotate-45 border-t border-l border-gray-200"></div>
                    <FeedbackSubModal
                      isOpen={true}
                      onClose={handleCloseFeedbackModal}
                      serviceId={item.id}
                      currentProblem={item.problems}
                      onSuccess={() => {
                        handleCloseFeedbackModal();
                        fetchData();
                      }}
                    />
                    <SuccessModal
                      isOpen={showSuccessModal}
                      onClose={() => {
                        setShowSuccessModal(false);
                        handleCloseFeedbackModal();
                      }}
                      message="Gửi phản ánh thành công!"
                    />
                    <ErrorModal
                      isOpen={showErrorModal}
                      onClose={() => {
                        setShowErrorModal(false);
                        handleCloseFeedbackModal();
                      }}
                      message="Gửi phản ánh thất bại!"
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* --- PAGINATION CONTROLS --- */}
      {filteredServices.length > 0 && (
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

      <RegisterServiceModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSubmit={handleRegisterSubmit}
        apartments={uniqueApartments}
      />

      <CustomModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        type={modalState.type}
        title={modalState.title}
        onConfirm={executeDelete}
      />

      <ServiceDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        data={selectedService}
      />
    </div>
  );
};

export default ResidentService;