import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import dayjs from "dayjs";

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
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50">
          {PROBLEM_OPTIONS.map((opt) => (
            <div
              key={opt}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                value === opt ? "bg-gray-100 font-bold" : ""
              }`}
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

const RATING_OPTIONS = [
  { value: "Rất hài lòng", desc: "Dịch vụ xuất sắc, vượt mong đợi" },
  { value: "Hài lòng", desc: "Dịch vụ tốt, đáp ứng nhu cầu" },
  { value: "Tạm ổn", desc: "Dịch vụ chấp nhận được" },
  { value: "Không hài lòng", desc: "Cần cải thiện nhiều" },
];

const QualitySubModal = ({ value, onConfirm, onCancel }) => {
  const [selected, setSelected] = useState(value);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl w-[90%] max-w-[400px] p-6 shadow-2xl relative">
        <h3 className="text-lg font-bold mb-4">Đánh giá chất lượng dịch vụ</h3>
        <div className="space-y-3 mb-6">
          {RATING_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-start space-x-3 cursor-pointer"
            >
              <input
                type="radio"
                className="mt-1 accent-blue-600"
                checked={selected === opt.value}
                onChange={() => setSelected(opt.value)}
              />
              <div>
                <span className="font-semibold">{opt.value}</span>
                <div className="text-xs text-gray-500">{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded border border-red-500 text-red-500 font-bold hover:bg-red-50"
          >
            Hoàn tác
          </button>
          <button
            onClick={() => onConfirm(selected)}
            className="px-4 py-2 rounded bg-green-600 text-white font-bold hover:bg-green-700"
            disabled={!selected}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

// --- FEEDBACK MODAL STATE ---

// ...existing code...

// --- API CONFIG ---
const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

// --- CẤU HÌNH DỊCH VỤ ---
const SERVICE_MAPPING = {
  "Dịch vụ chung cư": {
    backendValue: "Dịch vụ trung cư",
    contents: [
      "Làm thẻ xe",
      "Sửa chữa căn hộ",
      "Vận chuyển đồ",
      "Dọn dẹp căn hộ",
    ],
    handler: "Ban quản trị",
  },
  "Khiếu nại": {
    backendValue: "Khiếu nại",
    contents: ["tài sản chung", "mất tài sản"],
    handler: "Công an",
  },
  "Khai báo tạm trú": {
    backendValue: "Khai báo tạm trú",
    contents: ["Khai báo thông tin"],
    handler: "Ban quản trị",
  },
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

const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-1"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
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

const WarningIcon = () => (
  <div className="w-20 h-20 mx-auto mb-4 border-4 border-red-500 rounded-full flex items-center justify-center">
    <span className="text-5xl text-red-500 font-bold">!</span>
  </div>
);

const SuccessIcon = () => (
  <div className="w-20 h-20 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-10 w-10 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={4}
        d="M5 13l4 4L19 7"
      />
    </svg>
  </div>
);

const ErrorIcon = () => (
  <div className="w-20 h-20 mx-auto mb-4">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-full h-full text-red-600"
    >
      <path
        fillRule="evenodd"
        d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
        clipRule="evenodd"
      />
    </svg>
  </div>
);

// --- COMPONENT: MODAL CHI TIẾT DỊCH VỤ ---
const ServiceDetailModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl p-8 relative shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Chi tiết dịch vụ</h2>
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
                ID Dịch vụ
              </label>
              <div className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-600 bg-gray-50 font-medium">
                {data.id}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
                Căn hộ
              </label>
              <div className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-600 bg-gray-50 font-medium">
                {data.apartment_id}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
                Ngày gửi
              </label>
              <div className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-600 bg-gray-50 font-medium">
                {dayjs(data.created_at).format("DD/MM/YYYY")}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
              Nội dung yêu cầu
            </label>
            <div className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-600 bg-gray-50 min-h-[50px] flex items-center">
              <span className="font-bold mr-2">[{data.service_type}]:</span>{" "}
              {data.content}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
                Trạng thái
              </label>
              <div
                className={`w-full border border-gray-200 rounded-lg px-4 py-3 font-bold bg-white ${
                  data.servicestatus === "Đã xử lý"
                    ? "text-green-500"
                    : "text-gray-800"
                }`}
              >
                {data.servicestatus || "Đã ghi nhận"}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">
                Ngày xử lý
              </label>
              <div className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-600 bg-gray-50 font-medium">
                {data.handle_date
                  ? dayjs(data.handle_date).format("DD/MM/YYYY")
                  : "---"}
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
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-600 bg-gray-50 resize-none focus:outline-none"
              value={data.note || "--"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: MODAL ĐĂNG KÝ DỊCH VỤ ---
const RegisterServiceModal = ({ isOpen, onClose, onSubmit, apartments }) => {
  const [selectedType, setSelectedType] = useState("Dịch vụ chung cư");
  const [selectedContent, setSelectedContent] = useState(
    SERVICE_MAPPING["Dịch vụ chung cư"].contents[0]
  );
  const [note, setNote] = useState("");

  const [residenceForm, setResidenceForm] = useState({
    fullName: "",
    apartment_id: "",
    dob: "",
    cccd: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setSelectedType(newType);
    setSelectedContent(SERVICE_MAPPING[newType].contents[0]);
  };

  const handleResidenceChange = (e) => {
    setResidenceForm({ ...residenceForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const backendType = SERVICE_MAPPING[selectedType].backendValue;

    if (selectedType === "Khai báo tạm trú") {
      if (!residenceForm.apartment_id) {
        alert("Vui lòng chọn căn hộ!");
        return;
      }
      const payload = {
        isResidence: true,
        service_type: backendType,
        content: "Khai báo thông tin",
        formData: residenceForm,
      };
      onSubmit(payload);
    } else {
      const payload = {
        isResidence: false,
        service_type: backendType,
        content: selectedContent,
        note: note,
      };
      onSubmit(payload);
    }
  };

  if (!isOpen) return null;
  const currentConfig = SERVICE_MAPPING[selectedType];
  const isResidence = selectedType === "Khai báo tạm trú";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
      <div
        className={`bg-white rounded-3xl p-8 w-full ${
          isResidence ? "max-w-2xl" : "max-w-lg"
        } shadow-2xl relative max-h-[90vh] overflow-y-auto`}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <CloseIcon />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {isResidence ? "Phiếu khai báo tạm trú" : "Đăng ký dịch vụ"}
        </h2>

        {isResidence && (
          <div className="text-sm text-gray-600 mb-6 border-b pb-4">
            <p>
              <span className="font-bold">Tên cơ sở lưu trú:</span> Chung cư
              Bluemoon
            </p>
            <p>
              <span className="font-bold">Địa chỉ:</span> 23 Đường X, Phường A,
              Quận B, TP. Hà Nội
            </p>
            <p>
              <span className="font-bold">Điện thoại:</span> 0913006207
            </p>
          </div>
        )}

        {!isResidence && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Loại dịch vụ
              </label>
              <select
                value={selectedType}
                onChange={handleTypeChange}
                className="w-full p-3 bg-blue-50 border border-blue-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {Object.keys(SERVICE_MAPPING).map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Nội dung
              </label>
              <select
                value={selectedContent}
                onChange={(e) => setSelectedContent(e.target.value)}
                className="w-full p-3 bg-blue-50 border border-blue-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {currentConfig.contents.map((content) => (
                  <option key={content} value={content}>
                    {content}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Bên xử lý
              </label>
              <input
                type="text"
                value={currentConfig.handler}
                readOnly
                className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Ghi chú
              </label>
              <input
                type="text"
                placeholder="Enter here"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full p-3 bg-white border border-gray-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {isResidence && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Loại dịch vụ đang chọn
              </label>
              <select
                value={selectedType}
                onChange={handleTypeChange}
                className="w-full p-3 bg-blue-50 border border-blue-200 text-gray-700 rounded-lg mb-4"
              >
                {Object.keys(SERVICE_MAPPING).map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Họ và tên
              </label>
              <input
                name="fullName"
                value={residenceForm.fullName}
                onChange={handleResidenceChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Căn hộ tạm trú
              </label>
              <div className="relative">
                <select
                  name="apartment_id"
                  value={residenceForm.apartment_id}
                  onChange={handleResidenceChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="" disabled>
                    -- Chọn căn hộ --
                  </option>
                  {apartments &&
                    apartments.map((apt) => (
                      <option key={apt} value={apt}>
                        {apt}
                      </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Ngày sinh
              </label>
              <input
                type="date"
                name="dob"
                value={residenceForm.dob}
                onChange={handleResidenceChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                CCCD
              </label>
              <input
                name="cccd"
                value={residenceForm.cccd}
                onChange={handleResidenceChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Ngày bắt đầu tạm trú
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={residenceForm.startDate}
                  onChange={handleResidenceChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Ngày kết thúc tạm trú
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={residenceForm.endDate}
                  onChange={handleResidenceChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Lý do/ mục đích tạm trú
              </label>
              <input
                name="reason"
                value={residenceForm.reason}
                onChange={handleResidenceChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-8 rounded-xl shadow-lg transition-all"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: MODAL THÔNG BÁO (CẬP NHẬT NÚT ĐÓNG) ---
const CustomModal = ({ isOpen, onClose, type, title, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md text-center shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <CloseIcon />
        </button>
        <div className="mt-2">
          {type === "warning" && <WarningIcon />}
          {type === "success" && <SuccessIcon />}
          {type === "error" && <ErrorIcon />}
          <h3 className="text-xl font-bold text-gray-800 mb-8">{title}</h3>

          {/* Nút Footer thay đổi theo loại */}
          {type === "warning" ? (
            <div className="flex justify-between space-x-4">
              <button
                onClick={onClose}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all"
              >
                Hoàn tác
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all"
              >
                Xác nhận
              </button>
            </div>
          ) : (
            // Success hoặc Error -> Hiện nút Đóng
            <div className="flex justify-center">
              <button
                onClick={onClose}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-8 rounded-xl shadow-lg transition-all"
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
const ResidentService = () => {
  // --- FEEDBACK SELECTION MODE STATE ---
  const [isFeedbackMode, setIsFeedbackMode] = useState(false);
  // --- FEEDBACK MODAL STATE & HANDLERS ---
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    service: null,
    problem: "",
    rating: "",
    details: "",
    isSubModalOpen: false,
  });

  const handleOpenFeedbackModal = (service) => {
    setFeedbackModal({
      isOpen: true,
      service,
      problem: "",
      rating: "",
      details: "",
      isSubModalOpen: false,
    });
  };

  const handleCloseFeedbackModal = () => {
    setFeedbackModal((prev) => ({
      ...prev,
      isOpen: false,
      isSubModalOpen: false,
    }));
  };

  const handleOpenSubModal = () => {
    setFeedbackModal((prev) => ({ ...prev, isSubModalOpen: true }));
  };

  const handleCloseSubModal = () => {
    setFeedbackModal((prev) => ({ ...prev, isSubModalOpen: false }));
  };
  const [services, setServices] = useState([]);
  const [residents, setResidents] = useState([]); // List all residents to get apartments
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [modalState, setModalState] = useState({
    type: null,
    isOpen: false,
    title: "",
  });
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // --- FETCH DATA ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.apartment_id)
        throw new Error("Không tìm thấy thông tin căn hộ");

      const servicesRes = await axios.get(
        `${API_BASE_URL}/services/by-apartment/${user.apartment_id}`
      );
      const sortedServices = servicesRes.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setServices(sortedServices);

      const residentsRes = await axios.get(`${API_BASE_URL}/residents`);
      setResidents(residentsRes.data);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const uniqueApartments = useMemo(() => {
    if (!residents) return [];
    const apts = residents.map((r) => r.apartment_id).filter((a) => a);
    return [...new Set(apts)].sort();
  }, [residents]);

  // --- HANDLERS ---
  const toggleDeleteMode = () => {
    if (isDeleteMode) {
      setIsDeleteMode(false);
      setSelectedIds([]);
    } else {
      setIsDeleteMode(true);
    }
  };

  const handleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteConfirmClick = () => {
    if (selectedIds.length === 0) return;
    setModalState({
      type: "warning",
      isOpen: true,
      title: "Xóa các mục đã chọn",
    });
  };

  const executeDelete = async () => {
    setModalState({ ...modalState, isOpen: false });
    try {
      await Promise.all(
        selectedIds.map((id) => axios.delete(`${API_BASE_URL}/services/${id}`))
      );
      await fetchData();
      setTimeout(() => {
        setModalState({
          type: "success",
          isOpen: true,
          title: "Xóa đăng ký thành công!",
        });
      }, 300);
      setIsDeleteMode(false);
      setSelectedIds([]);
    } catch (error) {
      setTimeout(() => {
        setModalState({
          type: "error",
          isOpen: true,
          title: "Xóa đăng ký không thành công!",
        });
      }, 300);
    }
  };

  // --- XỬ LÝ ĐĂNG KÝ ---
  const handleRegisterSubmit = async (payload) => {
    setIsRegisterModalOpen(false);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.apartment_id) {
        alert("Vui lòng đăng nhập lại.");
        return;
      }

      if (payload.isResidence) {
        // --- LOGIC KHAI BÁO TẠM TRÚ ---
        const formData = payload.formData;

        // 1. Tạo Service Request
        const serviceRes = await axios.post(`${API_BASE_URL}/services`, {
          apartment_id: formData.apartment_id,
          service_type: payload.service_type,
          content: payload.content,
          note: "Yêu cầu khai báo tạm trú",
        });
        const serviceId = serviceRes.data.service_id;

        // 2. Tạo Form chi tiết
        await axios.post(`${API_BASE_URL}/forms`, {
          service_id: serviceId,
          apartment_id: formData.apartment_id,
          full_name: formData.fullName,
          cccd: formData.cccd,
          dob: formData.dob,
          start_date: formData.startDate,
          end_date: formData.endDate,
          note: formData.reason,
        });

        // 3. Tạo Resident (Khách tạm trú)
        const nameParts = formData.fullName.trim().split(" ");
        const lastName = nameParts.pop() || "";
        const firstName = nameParts.join(" ");

        await axios.post(`${API_BASE_URL}/residents`, {
          first_name: firstName,
          last_name: lastName,
          phone: `000000${Date.now().toString().slice(-4)}`,
          apartment_id: formData.apartment_id,
          cccd: formData.cccd,
          birth_date: formData.dob,
          role: "Cư dân",
          residency_status: "khách tạm trú",
          email: null,
          password: "123",
        });

        // Thông báo thành công riêng cho Khai báo tạm trú
        await fetchData();
        setTimeout(() => {
          setModalState({
            type: "success",
            isOpen: true,
            title: "Khai báo tạm trú thành công!",
          });
        }, 300);
      } else {
        // --- LOGIC DỊCH VỤ THƯỜNG ---
        await axios.post(`${API_BASE_URL}/services`, {
          apartment_id: user.apartment_id,
          service_type: payload.service_type,
          content: payload.content,
          note: payload.note,
        });

        await fetchData();
        setTimeout(() => {
          setModalState({
            type: "success",
            isOpen: true,
            title: "Đăng ký dịch vụ thành công!",
          });
        }, 300);
      }
    } catch (e) {
      console.error(e);
      setTimeout(() => {
        setModalState({
          type: "error",
          isOpen: true,
          title: "Thao tác thất bại! Vui lòng thử lại.",
        });
      }, 300);
    }
  };

  const handleViewDetail = (service) => {
    setSelectedService(service);
    setIsDetailModalOpen(true);
  };

  const filteredList = services.filter(
    (item) =>
      (item.content &&
        item.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
      String(item.id).includes(searchTerm)
  );

  return (
    <div className="w-full min-h-screen text-gray-800">
      <div className="flex justify-start items-center mb-8">
        <div className="relative w-full max-w-2xl bg-white rounded-lg overflow-hidden shadow-sm">
          <span className="absolute left-4 top-1/2 -translate-y-1/2">
            <SearchIcon />
          </span>
          <input
            type="search"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-gray-700 focus:outline-none h-12"
          />
        </div>
      </div>

      <div className="flex justify-between items-end mb-6">
        <h1 className="text-3xl font-bold text-white">Dịch vụ</h1>
        <div className="flex space-x-3">
          {!isDeleteMode ? (
            !isFeedbackMode ? (
              <>
                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg font-bold flex items-center shadow-lg transition-colors text-sm"
                >
                  <PlusIcon /> Đăng ký dịch vụ
                </button>
                <button
                  onClick={() => setIsFeedbackMode(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-lg font-bold shadow-lg transition-colors text-sm"
                >
                  Phản ánh dịch vụ
                </button>
                <button
                  onClick={toggleDeleteMode}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg font-bold shadow-lg transition-colors text-sm"
                >
                  Xóa dịch vụ
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsFeedbackMode(false)}
                className="bg-gray-400 text-white rounded-md px-4 py-2 font-bold shadow-lg transition-colors text-sm"
              >
                Quay lại
              </button>
            )
          ) : (
            <>
              <button
                onClick={handleDeleteConfirmClick}
                className={`px-4 py-2.5 rounded-lg font-bold shadow-lg transition-colors text-sm ${
                  selectedIds.length > 0
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-red-300 text-white cursor-not-allowed"
                }`}
              >
                Xóa các mục đã chọn
              </button>
              <button
                onClick={toggleDeleteMode}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2.5 rounded-lg font-bold shadow-lg transition-colors text-sm"
              >
                Hủy xóa
              </button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4 pb-10">
        {isLoading ? (
          <p className="text-white text-center">Đang tải...</p>
        ) : filteredList.length === 0 ? (
          <p className="text-white text-center">Chưa có dịch vụ nào.</p>
        ) : (
          filteredList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-[20px] p-5 flex items-center shadow-md relative min-h-[90px]"
            >
              <div className="absolute left-6 top-4 bottom-4 w-1 bg-blue-500 rounded-full"></div>
              <div className="flex-1 grid grid-cols-12 gap-4 items-center pl-10">
                <div className="col-span-1">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Dịch vụ ID
                  </p>
                  <p className="text-2xl font-bold text-gray-900 leading-none">
                    {item.id}
                  </p>
                </div>
                <div className="col-span-3">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Nội dung
                  </p>
                  <p className="text-sm font-bold text-gray-900">
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
                    Trạng thái
                  </p>
                  <p
                    className={`text-sm font-bold ${
                      item.servicestatus === "Đã xử lý"
                        ? "text-green-500"
                        : "text-gray-800"
                    }`}
                  >
                    {item.servicestatus || "Đã ghi nhận"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Ngày xử lý
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.handle_date
                      ? dayjs(item.handle_date).format("DD/MM/YYYY")
                      : "----------"}
                  </p>
                </div>
                <div className="col-span-2 flex justify-end items-center">
                  {!isDeleteMode ? (
                    !isFeedbackMode ? (
                      <button
                        onClick={() => handleViewDetail(item)}
                        className="text-blue-500 font-bold text-xs hover:underline"
                      >
                        Xem thêm chi tiết
                      </button>
                    ) : (
                      <span
                        className="ml-auto text-green-600 underline cursor-pointer font-bold"
                        onClick={() => handleOpenFeedbackModal(item)}
                      >
                        Phản ánh dịch vụ
                      </span>
                    )
                  ) : (
                    <div
                      onClick={() => handleSelect(item.id)}
                      className={`w-10 h-10 rounded-xl cursor-pointer flex items-center justify-center transition-all duration-200 ${
                        selectedIds.includes(item.id)
                          ? "bg-blue-500 shadow-blue-500/50"
                          : "bg-gray-300 hover:bg-gray-400"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
                {/* --- MAIN FEEDBACK MODAL --- */}
                {feedbackModal.isOpen && (
                  <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl w-[90%] max-w-lg p-6 shadow-2xl relative">
                      {/* Close Button */}
                      <button
                        onClick={handleCloseFeedbackModal}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
                      >
                        <CloseIcon />
                      </button>
                      {/* Title */}
                      <h2 className="text-xl font-bold mb-4">
                        Phản ánh dịch vụ
                      </h2>
                      {/* Service Info */}
                      <div className="mb-4">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                          ID Dịch vụ
                        </label>
                        <input
                          className="w-full bg-gray-100 text-gray-500 rounded px-3 py-2 mb-2 cursor-not-allowed"
                          value={feedbackModal.service?.id || ""}
                          readOnly
                        />
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                          Nội dung
                        </label>
                        <input
                          className="w-full bg-gray-100 text-gray-500 rounded px-3 py-2 cursor-not-allowed"
                          value={feedbackModal.service?.content || ""}
                          readOnly
                        />
                      </div>
                      {/* Problem Dropdown */}
                      <div className="mb-4 relative">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                          Vấn đề
                        </label>
                        <CustomDropdown
                          value={feedbackModal.problem}
                          onChange={(val) =>
                            setFeedbackModal((prev) => ({
                              ...prev,
                              problem: val,
                            }))
                          }
                        />
                      </div>
                      {/* Service Quality Rating Trigger */}
                      <div className="mb-4">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                          Đánh giá chất lượng
                        </label>
                        <div
                          className="w-full border border-gray-300 rounded px-3 py-2 bg-white cursor-pointer flex items-center justify-between"
                          onClick={handleOpenSubModal}
                        >
                          <span
                            className={
                              feedbackModal.rating
                                ? "text-gray-800"
                                : "text-gray-400"
                            }
                          >
                            {feedbackModal.rating || "Chọn mức độ hài lòng"}
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
                      </div>
                      {/* Details */}
                      <div className="mb-6">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                          Chi tiết
                        </label>
                        <textarea
                          rows={4}
                          className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                          value={feedbackModal.details}
                          onChange={(e) =>
                            setFeedbackModal((prev) => ({
                              ...prev,
                              details: e.target.value,
                            }))
                          }
                        />
                      </div>
                      {/* Footer */}
                      <button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all"
                        onClick={async () => {
                          // Gửi phản ánh dịch vụ qua API PATCH
                          try {
                            const id = feedbackModal.service?.id;
                            if (!id) return;
                            // Map problem & rating sang giá trị BE
                            let problems = feedbackModal.problem || "Ko vấn đề";
                            // Chuẩn hóa cho BE
                            if (problems === "Không vấn đề")
                              problems = "Ko vấn đề";
                            let rates = "Chất lượng ổn";
                            if (feedbackModal.rating === "Rất hài lòng")
                              rates = "Chất lượng cao";
                            else if (feedbackModal.rating === "Hài lòng")
                              rates = "Chất lượng tốt";
                            else if (feedbackModal.rating === "Tạm ổn")
                              rates = "Chất lượng ổn";
                            else if (feedbackModal.rating === "Không hài lòng")
                              rates = "Chất lượng kém";
                            await axios.patch(
                              `${API_BASE_URL}/services/${id}`,
                              {
                                problems,
                                rates,
                                scripts: feedbackModal.details || null,
                              }
                            );
                          } catch (err) {
                            alert("Gửi phản ánh thất bại!");
                          }
                          handleCloseFeedbackModal();
                        }}
                      >
                        Thêm
                      </button>
                      {/* Sub-Modal */}
                      {feedbackModal.isSubModalOpen && (
                        <QualitySubModal
                          value={feedbackModal.rating}
                          onConfirm={(val) =>
                            setFeedbackModal((prev) => ({
                              ...prev,
                              rating: val,
                              isSubModalOpen: false,
                            }))
                          }
                          onCancel={handleCloseSubModal}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

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
