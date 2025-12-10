import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { Pie } from "react-chartjs-2";

// Đăng ký các thành phần của Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, Title);

// --- API CONFIG ---
const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

// --- HELPER: Format Tiền tệ ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// --- COMPONENT CON: THẺ BÁO CÁO (Card) ---
const ReportCard = ({ title, stats, chartData }) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between min-h-[280px]">
      {/* Phần Text thông tin */}
      <div className="w-full md:w-1/2 pr-4 space-y-4">
        <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">
          {title}
        </h3>
        <div className="space-y-3">
          {stats.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center text-sm border-b border-dashed border-gray-200 pb-1 last:border-0"
            >
              <span className="text-gray-600 font-medium">{item.label}:</span>
              <span
                className={`font-bold text-lg ${item.color || "text-gray-900"}`}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Phần Biểu đồ */}
      <div className="w-full md:w-1/2 flex justify-center items-center h-64 relative mt-4 md:mt-0">
        <div className="w-full h-full max-w-[220px] max-h-[220px]">
          <Pie
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "bottom",
                  labels: {
                    boxWidth: 12,
                    padding: 15,
                    font: { size: 11 },
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH: REPORT PAGE ---
export const Report = () => {
  const [residents, setResidents] = useState([]);
  const [services, setServices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. FETCH DATA ---
  // Hàm lấy token từ localStorage
  const getToken = () => localStorage.getItem("token");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${getToken()}` };
        const [resResidents, resServices, resPayments] = await Promise.all([
          axios.get(`${API_BASE_URL}/residents`, { headers }),
          axios.get(`${API_BASE_URL}/services`, { headers }),
          axios.get(`${API_BASE_URL}/payments`, { headers }),
        ]);
        setResidents(resResidents.data);
        setServices(resServices.data);
        setPayments(resPayments.data);
      } catch (error) {
        console.error("Lỗi tải dữ liệu báo cáo:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- 2. TÍNH TOÁN SỐ LIỆU (STATISTICS) ---
  const statistics = useMemo(() => {
    // A. Thống kê Cư dân
    const residentStats = {
      cuDan: 0, // Người dân đang cư trú (Thường trú)
      tamTru: 0, // Người dân tạm trú
      keToan: 0, // Kế toán
      congAn: 0, // Công an
      total: 0, // Tổng số người trong tòa nhà
    };

    residents.forEach((r) => {
      // Chỉ tính user đang active (nếu có trường state)
      if (r.state === "inactive") return;

      residentStats.total++; // Tổng cộng tất cả

      const role = r.role ? r.role.toLowerCase() : "";
      const status = r.residency_status ? r.residency_status.toLowerCase() : "";

      if (role === "kế toán") {
        residentStats.keToan++;
      } else if (role === "công an" || role === "bảo vệ") {
        residentStats.congAn++;
      } else if (status.includes("tạm trú") || status === "khách tạm trú") {
        residentStats.tamTru++;
      } else {
        // Còn lại coi là cư dân thường trú
        residentStats.cuDan++;
      }
    });

    // B. Thống kê Dịch vụ & Phản ánh
    const serviceStats = {
      dichVu: 0, // Dịch vụ chung cư + Khai báo
      phanAnh: 0, // Khiếu nại
    };

    services.forEach((s) => {
      const type = s.service_type;
      if (type === "Khiếu nại") {
        serviceStats.phanAnh++;
      } else {
        // Bao gồm "Dịch vụ trung cư", "Khai báo tạm trú"
        serviceStats.dichVu++;
      }
    });

    // C. Thống kê Thanh toán
    const paymentStats = {
      totalCount: 0,
      unpaidCount: 0,
      paidCount: 0,
      totalAmount: 0,
    };

    payments.forEach((p) => {
      paymentStats.totalCount++;
      paymentStats.totalAmount += Number(p.amount || 0);

      if (p.state === 1) {
        paymentStats.paidCount++;
      } else {
        paymentStats.unpaidCount++;
      }
    });

    return { residentStats, serviceStats, paymentStats };
  }, [residents, services, payments]);

  // --- 3. CẤU HÌNH BIỂU ĐỒ (CHARTS) ---

  // Chart 1: Phân bố Cư dân
  const residentChartData = {
    labels: ["Thường trú", "Tạm trú", "Kế toán", "Công an"],
    datasets: [
      {
        data: [
          statistics.residentStats.cuDan,
          statistics.residentStats.tamTru,
          statistics.residentStats.keToan,
          statistics.residentStats.congAn,
        ],
        backgroundColor: ["#3B82F6", "#F59E0B", "#10B981", "#EF4444"], // Blue, Yellow, Green, Red
        borderWidth: 1,
      },
    ],
  };

  // Chart 2: Dịch vụ vs Phản ánh
  const serviceChartData = {
    labels: ["Yêu cầu Dịch vụ", "Phản ánh/Khiếu nại"],
    datasets: [
      {
        data: [statistics.serviceStats.dichVu, statistics.serviceStats.phanAnh],
        backgroundColor: ["#6366F1", "#EC4899"], // Indigo, Pink
        borderWidth: 1,
      },
    ],
  };

  // Chart 3: Tình trạng Thanh toán (Số lượng hóa đơn)
  const paymentChartData = {
    labels: ["Đã thanh toán", "Chưa thanh toán"],
    datasets: [
      {
        data: [
          statistics.paymentStats.paidCount,
          statistics.paymentStats.unpaidCount,
        ],
        backgroundColor: ["#22C55E", "#F97316"], // Green, Orange
        borderWidth: 1,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="text-white text-center mt-10 text-xl">
        Đang tổng hợp báo cáo...
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-blue-700 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Báo cáo tổng quan
        </h1>
        <p className="text-blue-200">
          Thống kê số liệu cư dân, dịch vụ và tài chính
        </p>
      </div>

      {/* Grid Layout chứa 3 Card */}
      <div className="grid grid-cols-1 gap-8 max-w-6xl mx-auto">
        {/* CARD 1: Chi tiết Cư dân */}
        <ReportCard
          title="Chi tiết về số lượng cư dân"
          stats={[
            {
              label: "Tổng số người dân đang cư trú",
              value: statistics.residentStats.cuDan,
            },
            {
              label: "Tổng số người dân tạm trú",
              value: statistics.residentStats.tamTru,
            },
            {
              label: "Tổng số lượng kế toán",
              value: statistics.residentStats.keToan,
            },
            {
              label: "Tổng số lượng công an",
              value: statistics.residentStats.congAn,
            },
            {
              label: "Tổng số người trong tòa nhà",
              value: statistics.residentStats.total,
              color: "text-blue-600",
            },
          ]}
          chartData={residentChartData}
        />

        {/* CARD 2: Chi tiết Dịch vụ */}
        <ReportCard
          title="Chi tiết về dịch vụ & Phản ánh"
          stats={[
            {
              label: "Số lượng dịch vụ (Thẻ xe, Sửa chữa...)",
              value: statistics.serviceStats.dichVu,
            },
            {
              label: "Số lượng phản ánh (Khiếu nại)",
              value: statistics.serviceStats.phanAnh,
            },
            {
              label: "Tổng yêu cầu xử lý",
              value:
                statistics.serviceStats.dichVu +
                statistics.serviceStats.phanAnh,
              color: "text-indigo-600",
            },
          ]}
          chartData={serviceChartData}
        />

        {/* CARD 3: Chi tiết Thanh toán */}
        <ReportCard
          title="Chi tiết thanh toán"
          stats={[
            {
              label: "Tổng số hóa đơn tất cả",
              value: statistics.paymentStats.totalCount,
            },
            {
              label: "Số lượng chưa thanh toán",
              value: statistics.paymentStats.unpaidCount,
              color: "text-orange-500",
            },
            {
              label: "Số lượng đã thanh toán",
              value: statistics.paymentStats.paidCount,
              color: "text-green-600",
            },
            {
              label: "Tổng doanh thu",
              value: formatCurrency(statistics.paymentStats.totalAmount),
              color: "text-blue-700 text-xl",
            },
          ]}
          chartData={paymentChartData}
        />
      </div>
    </div>
  );
};
