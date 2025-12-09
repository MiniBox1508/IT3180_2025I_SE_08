import React, { useState, useEffect } from "react";
const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

const statusColor = {
  "Đã xử lý": "text-green-600 font-bold",
  "Đã ghi nhận": "text-gray-800 font-bold", // Thêm màu cho trạng thái mặc định
  "Chưa xử lý": "text-red-500 font-bold",
  "Đang chờ": "text-yellow-500 font-bold",
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

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/services`);
        const data = await res.json();
        // Sắp xếp mới nhất lên đầu
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

  const filteredServices = services.filter(
    (item) =>
      (item.content?.toLowerCase() || "").includes(search.toLowerCase()) ||
      String(item.id).includes(search)
  );

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
      // Reload lại danh sách
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

  // Kính lúp SVG
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
      {/* Sidebar placeholder */}
      <div className="w-[250px]" />
      {/* Main content */}
      <div className="flex-1 p-8">
        {/* Header Section */}
        <div className="flex flex-col gap-6 mb-8">
          {/* Search Bar */}
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
                placeholder="Search"
                className="w-full bg-white rounded-lg shadow-sm px-5 py-3 text-gray-700 focus:outline-none pl-10"
                style={{ paddingLeft: "2.5rem" }}
              />
            </div>
          </div>
          {/* Title & Actions */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Dịch vụ</h1>
            {!isDeleteMode ? (
              <div className="flex gap-3">
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

        {/* Service List */}
        <div className="flex flex-col gap-4">
          {filteredServices.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl shadow-md flex items-stretch relative"
            >
              {/* Accent bar */}
              <div className="w-2 bg-blue-500 rounded-l-2xl" />
              {/* Card Content */}
              <div className="flex-1 grid grid-cols-12 items-center p-4 bg-white rounded-r-2xl gap-2 text-sm">
                {/* ID */}
                <div className="col-span-1">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Dịch vụ ID
                  </div>
                  <div className="font-bold text-gray-900 leading-none">
                    {item.id}
                  </div>
                </div>
                {/* Content */}
                <div className="col-span-3">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Nội dung
                  </div>
                  <div className="font-bold text-gray-900">{item.content}</div>
                </div>
                {/* Apartment */}
                <div className="col-span-1">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Số căn hộ
                  </div>
                  <div className="font-semibold text-gray-900">
                    {item.apartment_id}
                  </div>
                </div>
                {/* Status - SỬA item.status THÀNH item.servicestatus */}
                <div className="col-span-2">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Trạng thái
                  </div>
                  {/* <div
                    className={
                      statusColor[item.servicestatus] ||
                      "text-gray-800 font-bold"
                    }
                  >
                    {item.servicestatus || "Đã ghi nhận"}
                  </div> */}
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
                            // Reload lại danh sách dịch vụ
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
                {/* Date */}
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
                {/* Phản ánh dịch vụ - HIỂN THỊ TÌNH TRẠNG PHẢN HỒI Ở DƯỚI */}
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
                {/* Action hoặc Checkbox Delete Mode */}
                <div className="col-span-1 flex justify-end items-center">
                  {!isDeleteMode ? (
                    // <button className="text-blue-500 font-bold text-xs underline hover:text-blue-700 transition whitespace-nowrap">
                    //   Xem thêm chi tiết
                    // </button>
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
                {/* Confirm Delete Modal */}
                {showConfirmModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
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

                {/* Success Modal */}
                {showSuccessModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
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
                        Xóa dịch vụ thành công!
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

                {/* Error Modal */}
                {showErrorModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
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
                        Xóa dịch vụ không thành công!
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ServicesPage;
