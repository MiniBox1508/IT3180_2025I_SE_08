import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import dayjs from "dayjs";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Pie } from "react-chartjs-2";

// Đăng ký các thành phần của Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, Title);

// --- API CONFIG ---
const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

// --- HELPER: Format Tiền tệ ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
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
            <div key={index} className="flex justify-between items-center text-sm border-b border-dashed border-gray-200 pb-1 last:border-0">
              <span className="text-gray-600 font-medium">{item.label}:</span>
              <span className={`font-bold text-lg ${item.color || "text-gray-900"}`}>
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
                  position: 'bottom',
                  labels: {
                    boxWidth: 12,
                    padding: 15,
                    font: { size: 11 }
                  }
                }
              }
            }} 
          />
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH ---
export const AccountReport = () => {
  const [residents, setResidents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [resResidents, resPayments] = await Promise.all([
          axios.get(`${API_BASE_URL}/residents`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get(`${API_BASE_URL}/payments`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);
        setResidents(resResidents.data);
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
    // A. Thống kê Cư dân & Căn hộ
    const residentStats = {
      totalApartments: 0, // Tổng số căn hộ (đếm unique apartment_id)
      cuTru: 0,           // Dân thường trú (Chủ hộ, thành viên)
      tamTru: 0,          // Dân tạm trú (Khách thuê, khách tạm trú)
    };

    const apartmentSet = new Set();

    residents.forEach(r => {
      if (r.state === 'inactive') return; // Bỏ qua người đã xóa

      // Đếm căn hộ
      if (r.apartment_id) {
        apartmentSet.add(r.apartment_id.trim().toLowerCase());
      }

      // Phân loại cư dân
      const status = r.residency_status ? r.residency_status.toLowerCase() : "";
      
      if (status.includes("tạm trú") || status === "khách tạm trú" || status === "người thuê") {
        residentStats.tamTru++;
      } else {
        // Mặc định còn lại là cư trú lâu dài (Chủ hộ, thành viên gia đình)
        residentStats.cuTru++;
      }
    });

    residentStats.totalApartments = apartmentSet.size;

    // B. Thống kê Thanh toán & Công nợ
    const paymentStats = {
      totalCount: 0,
      paidCount: 0,
      unpaidCount: 0,
      overdueCount: 0,
      totalAmount: 0
    };

    payments.forEach(p => {
      paymentStats.totalCount++;
      paymentStats.totalAmount += Number(p.amount || 0);

      const isPaid = p.state === 1;
      
      if (isPaid) {
        paymentStats.paidCount++;
      } else {
        paymentStats.unpaidCount++;
        
        // Logic Quá hạn: Chưa thanh toán VÀ ngày tạo > 30 ngày so với hiện tại
        const createdDate = dayjs(p.created_at);
        const now = dayjs();
        if (now.diff(createdDate, 'day') > 30) {
          paymentStats.overdueCount++;
        }
      }
    });

    return { residentStats, paymentStats };
  }, [residents, payments]);

  // --- 3. CẤU HÌNH BIỂU ĐỒ (CHARTS) ---

  // Chart 1: Tỉ lệ Cư dân (Cư trú vs Tạm trú)
  const residentChartData = {
    labels: ['Dân cư trú', 'Dân tạm trú'],
    datasets: [
      {
        data: [statistics.residentStats.cuTru, statistics.residentStats.tamTru],
        backgroundColor: ['#3B82F6', '#F59E0B'], // Blue, Orange
        borderWidth: 1,
      },
    ],
  };

  // Chart 2: Tình trạng Thanh toán (Đã TT, Trong hạn, Quá hạn)
  // Lưu ý: Để biểu đồ tròn hiển thị đúng tỉ lệ, ta tách "Chưa thanh toán" thành "Trong hạn" và "Quá hạn"
  const unpaidInTerm = statistics.paymentStats.unpaidCount - statistics.paymentStats.overdueCount;
  
  const paymentChartData = {
    labels: ['Đã thanh toán', 'Chưa TT (Trong hạn)', 'Chưa TT (Quá hạn)'],
    datasets: [
      {
        data: [
          statistics.paymentStats.paidCount, 
          unpaidInTerm > 0 ? unpaidInTerm : 0, 
          statistics.paymentStats.overdueCount
        ],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'], // Green, Orange, Red
        borderWidth: 1,
      },
    ],
  };

  if (isLoading) {
    return <div className="text-white text-center mt-10 text-xl">Đang tổng hợp báo cáo...</div>;
  }

  return (
    <div className="w-full min-h-screen bg-blue-700 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Báo cáo Kế toán</h1>
        <p className="text-blue-200">Tổng hợp số liệu về Cư dân và Tình hình tài chính</p>
      </div>

      {/* Grid Layout chứa 2 Card lớn */}
      <div className="grid grid-cols-1 gap-8 max-w-6xl mx-auto">
        
        {/* CARD 1: Chi tiết số lượng cư dân */}
        <ReportCard 
          title="Chi tiết về số lượng cư dân"
          stats={[
            { label: "Tổng số căn hộ đang quản lý", value: statistics.residentStats.totalApartments, color: "text-blue-600" },
            { label: "Số lượng dân cư trú (Thường trú)", value: statistics.residentStats.cuTru },
            { label: "Số lượng dân tạm trú", value: statistics.residentStats.tamTru },
          ]}
          chartData={residentChartData}
        />

        {/* CARD 2: Chi tiết thanh toán */}
        <ReportCard 
          title="Chi tiết thanh toán & Công nợ"
          stats={[
            { label: "Số lượng hóa đơn tất cả", value: statistics.paymentStats.totalCount },
            { label: "Số lượng chưa thanh toán", value: statistics.paymentStats.unpaidCount, color: "text-orange-500" },
            { label: "Số lượng đã thanh toán", value: statistics.paymentStats.paidCount, color: "text-green-600" },
            { label: "Số lượng hóa đơn quá hạn", value: statistics.paymentStats.overdueCount, color: "text-red-600" },
            { label: "Tổng doanh thu dự kiến", value: formatCurrency(statistics.paymentStats.totalAmount), color: "text-blue-700 text-xl" },
          ]}
          chartData={paymentChartData}
        />

      </div>
    </div>
  );
};