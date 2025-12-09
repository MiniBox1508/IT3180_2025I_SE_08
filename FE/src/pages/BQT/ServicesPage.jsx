import React, { useState } from "react";

// Mock data for services
const services = [
  {
    id: 1,
    content: "Làm thẻ xe",
    apartment_id: "A101",
    status: "Đã xử lý",
    handle_date: "2025-12-01",
  },
  {
    id: 2,
    content: "Sửa chữa căn hộ",
    apartment_id: "B202",
    status: "Chưa xử lý",
    handle_date: "2025-12-03",
  },
  {
    id: 3,
    content: "Vận chuyển đồ",
    apartment_id: "C303",
    status: "Đang chờ",
    handle_date: "2025-12-05",
  },
  {
    id: 4,
    content: "Dọn dẹp căn hộ",
    apartment_id: "D404",
    status: "Đã xử lý",
    handle_date: "2025-12-07",
  },
];

const statusColor = {
  "Đã xử lý": "text-green-600 font-bold",
  "Chưa xử lý": "text-red-500 font-bold",
  "Đang chờ": "text-yellow-500 font-bold",
};

const ServicesPage = () => {
  const [search, setSearch] = useState("");

  // Filtered list (for demo, just filter by content or id)
  const filteredServices = services.filter(
    (item) =>
      item.content.toLowerCase().includes(search.toLowerCase()) ||
      String(item.id).includes(search)
  );

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
          <div className="absolute top-1/20 left-1/10">
            <div className="relative w-2/3 max-w-2xl">
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
            <div className="flex gap-3">
              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-bold shadow">
                Phản hồi
              </button>
              <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-bold shadow">
                Xóa dịch vụ
              </button>
            </div>
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
              <div className="flex-1 grid grid-cols-12 items-center p-4 bg-white rounded-r-2xl">
                {/* ID */}
                <div className="col-span-1">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Dịch vụ ID
                  </div>
                  <div className="text-2xl font-bold text-gray-900 leading-none">
                    {item.id}
                  </div>
                </div>
                {/* Content */}
                <div className="col-span-3">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Nội dung
                  </div>
                  <div className="text-sm font-bold text-gray-900">
                    {item.content}
                  </div>
                </div>
                {/* Apartment */}
                <div className="col-span-2">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Số căn hộ
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {item.apartment_id}
                  </div>
                </div>
                {/* Status */}
                <div className="col-span-2">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Trạng thái
                  </div>
                  <div
                    className={
                      statusColor[item.status] || "text-gray-800 font-bold"
                    }
                  >
                    {item.status}
                  </div>
                </div>
                {/* Date */}
                <div className="col-span-2">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase mb-1">
                    Ngày xử lý
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {item.handle_date}
                  </div>
                </div>
                {/* Action */}
                <div className="col-span-2 flex justify-end items-center">
                  <button className="text-blue-500 font-bold text-xs underline hover:text-blue-700 transition">
                    Xem thêm chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ServicesPage;
