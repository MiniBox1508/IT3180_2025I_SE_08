import React, { useState, useEffect } from "react";
// --- THƯ VIỆN CHO PDF ---
import jsPDF from "jspdf";
import "jspdf-autotable";

const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

const statusColor = {
  "Đã xử lý": "text-green-600 font-bold",
  "Đã ghi nhận": "text-gray-800 font-bold",
  "Chưa xử lý": "text-red-500 font-bold",
  "Đang chờ": "text-yellow-500 font-bold",
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
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "");
  str = str.replace(/\u02C6|\u0306|\u031B/g, "");
  return str;
};

const ServicesPage = () => {
  const [search, setSearch] = useState("");
  const [services, setServices] = useState([]);
  // Multi-Select Delete Workflow states
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/services`, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });
        const data = await res.json();
        const sortedData = Array.isArray(data)
          ? data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          : [];
        setServices(sortedData);
      } catch (err) {
        setServices([]);
      }
    };
    fetchServices();
  }, []);

  // --- LOGIC TÌM KIẾM MỚI ---
  const filteredServices = services.filter((item) => {
    const term = removeVietnameseTones(search).trim();
    if (!term) return true;

    const idStr = String(item.id).toLowerCase();
    const contentStr = removeVietnameseTones(item.content || "");
    const apartmentStr = removeVietnameseTones(item.apartment_id || "");

    return (
      idStr.includes(term) ||
      contentStr.includes(term) ||
      apartmentStr.includes(term)
    );
  });

  // Multi-Select Delete logic
  const handleToggleSelect = (id) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    setShowConfirmModal(false);
    try {
      for (const id of selectedServices) {
        await fetch(`${API_BASE_URL}/services/${id}`, { method: "DELETE" });
      }
      setShowSuccessModal(true);
      const resReload = await fetch(`${API_BASE_URL}/services`);
      const dataReload = await resReload.json();
      const sortedReload = Array.isArray(dataReload)
        ? dataReload.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          )
        : [];
      setServices(sortedReload);
      setSelectedServices([]);
      setIsDeleteMode(false);
    } catch {
      setShowErrorModal(true);
    }
  };

  // --- LOGIC XUẤT PDF (ĐÃ SỬA) ---
  const handleExportPDF = () => {
    try {
      // Kiểm tra xem có dữ liệu để xuất không
      if (filteredServices.length === 0) {
        alert("Không có dữ liệu để xuất!");
        return;
      }

      const doc = new jsPDF();

      doc.text("Danh Sach Dich Vu", 14, 15); // Dùng không dấu để tránh lỗi font mặc định

      const tableColumn = [
        "ID",
        "Noi dung",
        "So can ho",
        "Trang thai",
        "Ngay xu ly",
        "Phan anh",
      ];

      const tableRows = [];

      filteredServices.forEach((item) => {
        // Lưu ý: jsPDF mặc định không hỗ trợ tiếng Việt có dấu tốt nếu không add font
        // Nên ở đây ta tạm thời dùng removeVietnameseTones cho nội dung để đảm bảo không bị lỗi ký tự lạ
        const serviceData = [
          item.id,
          removeVietnameseTones(item.content || ""),
          item.apartment_id,
          removeVietnameseTones(item.servicestatus || "Da ghi nhan"),
          item.handle_date
            ? new Date(item.handle_date).toLocaleDateString("vi-VN")
            : "----------",
          !item.problems || item.problems === "Ko vấn đề"
            ? "----------"
            : removeVietnameseTones(item.problems),
        ];
        tableRows.push(serviceData);
      });

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: { font: "helvetica", fontSize: 10 },
        headStyles: { fillColor: [22, 160, 133] },
      });

      doc.save("danh_sach_dich_vu.pdf");

      // --- QUAN TRỌNG: Hiển thị modal thành công ---
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Lỗi xuất PDF:", error);
      // --- Hiển thị modal lỗi ---
      setShowErrorModal(true);
    }
  };

  const SearchIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="w-5 h-5 text-gray-400"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );

  return (
    <>
      <div className="w-[250px]" />
      <div className="flex-1 p-8">
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex" style={{ justifyContent: "flex-start" }}>
            <div
              className="relative w-2/3 max-w-2xl"
              style={{ marginRight: "20vw" }}
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <SearchIcon />
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo ID, Nội dung hoặc Số căn hộ..."
                className="w-full bg-white rounded-lg shadow-sm px-5 py-3 text-gray-700 focus:outline-none pl-10"
                style={{ paddingLeft: "2.5rem" }}
              />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Dịch vụ</h1>
            {!isDeleteMode ? (
              <div className="flex gap-3">
                <button
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-bold shadow"
                  onClick={handleExportPDF}
                >
                  Xuất dịch vụ
                </button>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-bold shadow"
                  onClick={() => setIsDeleteMode(true)}
                >
                  Xóa dịch vụ
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-bold shadow"
                  disabled={selectedServices.length === 0}
                  onClick={() =>
                    selectedServices.length > 0 && setShowConfirmModal(true)
                  }
                >
                  Xóa các mục đã chọn
                </button>
                <button
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded font-bold shadow"
                  onClick={() => {
                    setIsDeleteMode(false);
                    setSelectedServices([]);
                  }}
                >
                  Hủy xóa
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {filteredServices.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl shadow-md flex items-stretch relative"
            >
              <div className="w-2 bg-blue-500 rounded-l-2xl" />
              <div className="flex-1 grid grid-cols-12 items-center p-4 bg-white rounded-r-2xl gap-2 text-sm">
                <div className="col-span-1">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Dịch vụ ID
                  </div>
                  <div className="font-bold text-gray-900 leading-none">
                    {item.id}
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Nội dung
                  </div>
                  <div className="font-bold text-gray-900">{item.content}</div>
                </div>
                <div className="col-span-1">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Số căn hộ
                  </div>
                  <div className="font-semibold text-gray-900">
                    {item.apartment_id}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Trạng thái
                  </div>
                  <div className="mt-1">
                    <select
                      className="text-xs border rounded px-2 py-1"
                      value={item.servicestatus || "Đã ghi nhận"}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        try {
                          const res = await fetch(
                            `${API_BASE_URL}/services/${item.id}`,
                            {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                servicestatus: newStatus,
                              }),
                            }
                          );
                          const data = await res.json();
                          if (data.message) {
                            alert("Cập nhật trạng thái thành công!");
                            const resReload = await fetch(
                              `${API_BASE_URL}/services`
                            );
                            const dataReload = await resReload.json();
                            const sortedReload = Array.isArray(dataReload)
                              ? dataReload.sort(
                                  (a, b) =>
                                    new Date(b.created_at) -
                                    new Date(a.created_at)
                                )
                              : [];
                            setServices(sortedReload);
                          } else {
                            alert(data.error || "Cập nhật thất bại");
                          }
                        } catch {
                          alert("Cập nhật thất bại");
                        }
                      }}
                    >
                      <option value="Đã ghi nhận">Đã ghi nhận</option>
                      <option value="Đã xử lý">Đã xử lý</option>
                    </select>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Ngày xử lý
                  </div>
                  <div className="font-semibold text-gray-900">
                    {item.handle_date
                      ? new Date(item.handle_date).toLocaleDateString("vi-VN")
                      : "----------"}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Phản ánh dịch vụ
                  </div>
                  <div className="font-bold text-gray-900">
                    {!item.problems || item.problems === "Ko vấn đề"
                      ? "----------"
                      : item.problems}
                  </div>
                </div>
                <div className="col-span-1 flex justify-end items-center">
                  {!isDeleteMode ? (
                    <div></div>
                  ) : (
                    <div
                      className={`w-8 h-8 flex items-center justify-center rounded-md cursor-pointer select-none transition ${
                        selectedServices.includes(item.id)
                          ? "bg-blue-500"
                          : "bg-gray-300"
                      }`}
                      onClick={() => handleToggleSelect(item.id)}
                    >
                      {selectedServices.includes(item.id) ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5 text-white"
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
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md flex flex-col items-center">
            <div className="mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-16 h-16 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                />
              </svg>
            </div>
            <div className="text-xl font-bold text-center mb-6">
              Xóa các mục đã chọn
            </div>
            <div className="flex gap-4 w-full justify-center">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-bold shadow"
                onClick={() => setShowConfirmModal(false)}
              >
                Hoàn tác
              </button>
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded font-bold shadow"
                onClick={handleDeleteSelected}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xs flex flex-col items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 text-blue-500 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4"
              />
            </svg>
            <div className="text-lg font-bold text-center mb-2">
              {/* Đã sửa nội dung thông báo cho phù hợp */}
              Thao tác thành công!
            </div>
            <button
              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded font-bold shadow"
              onClick={() => setShowSuccessModal(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xs flex flex-col items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 text-red-500 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 9l-6 6m0-6l6 6"
              />
            </svg>
            <div className="text-lg font-bold text-center mb-2">
              Thao tác không thành công!
            </div>
            <button
              className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded font-bold shadow"
              onClick={() => setShowErrorModal(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ServicesPage;
