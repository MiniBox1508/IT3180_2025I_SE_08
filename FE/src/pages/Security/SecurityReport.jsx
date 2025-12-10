import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Pie } from "react-chartjs-2";

// Đăng ký các component của Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, Title);

// --- API CONFIG ---
const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

// --- COMPONENT CON: THẺ BÁO CÁO ---
const ReportCard = ({ title, stats, chartData }) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between min-h-[250px]">
      {/* Phần Text thông tin */}
      <div className="w-full md:w-1/2 pr-4 space-y-4">
        <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">
          {title}
        </h3>
        <div className="space-y-3">
          {stats.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">{item.label}:</span>
              <span className="text-gray-900 font-bold text-lg">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Phần Biểu đồ */}
      <div className="w-full md:w-1/2 flex justify-center items-center h-64 relative">
        <div className="w-full h-full max-w-[250px] max-h-[250px]">
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
                    font: { size: 10 }
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
export const SecurityReport = () => {
    // Hàm lấy JWT token từ localStorage
    const getToken = () => {
      return localStorage.getItem("token");
    };
  const [residents, setResidents] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        const [resResidents, resServices] = await Promise.all([
          axios.get(`${API_BASE_URL}/residents`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get(`${API_BASE_URL}/services`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);
        setResidents(resResidents.data);
        setServices(resServices.data);
      } catch (error) {
        console.error("Lỗi tải dữ liệu báo cáo:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- TÍNH TOÁN SỐ LIỆU ---
  const statistics = useMemo(() => {
    // 1. Thống kê Cư dân
    const residentStats = {
      cuDan: 0,
      tamTru: 0,
      keToan: 0,
      congAn: 0
    };

    residents.forEach(r => {
      // Chuẩn hóa role và status
      const role = r.role ? r.role.toLowerCase() : "";
      const status = r.residency_status ? r.residency_status.toLowerCase() : "";

      if (role === "cư dân") residentStats.cuDan++;
      if (status === "khách tạm trú") residentStats.tamTru++;
      if (role === "kế toán") residentStats.keToan++;
      if (role === "công an" || role === "bảo vệ") residentStats.congAn++;
    });

    // 2. Thống kê Dịch vụ (Theo content)
    const serviceStats = {
      theXe: 0,
      suaChua: 0,
      vanChuyen: 0,
      donDep: 0
    };

    // 3. Thống kê Khiếu nại
    const complaintStats = {
      taiSanChung: 0,
      matTaiSan: 0
    };

    services.forEach(s => {
      const content = s.content ? s.content.toLowerCase() : "";
      const type = s.service_type;

      // Đếm dịch vụ chung cư
      if (content.includes("làm thẻ xe")) serviceStats.theXe++;
      else if (content.includes("sửa chữa")) serviceStats.suaChua++;
      else if (content.includes("vận chuyển")) serviceStats.vanChuyen++;
      else if (content.includes("dọn dẹp")) serviceStats.donDep++;

      // Đếm khiếu nại (Chỉ tính nếu loại là Khiếu nại hoặc nội dung liên quan)
      if (type === "Khiếu nại" || type === "Khiếu nại") {
         if (content.includes("tài sản chung")) complaintStats.taiSanChung++;
         if (content.includes("mất tài sản")) complaintStats.matTaiSan++;
      }
    });

    return { residentStats, serviceStats, complaintStats };
  }, [residents, services]);

  // --- CẤU HÌNH DỮ LIỆU BIỂU ĐỒ ---
  
  // 1. Chart Cư dân
  const residentChartData = {
    labels: ['Cư dân', 'Tạm trú', 'Kế toán', 'Công an'],
    datasets: [
      {
        data: [
          statistics.residentStats.cuDan,
          statistics.residentStats.tamTru,
          statistics.residentStats.keToan,
          statistics.residentStats.congAn
        ],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'], // Blue, Green, Yellow, Red
        borderWidth: 1,
      },
    ],
  };

  // 2. Chart Dịch vụ
  const serviceChartData = {
    labels: ['Thẻ xe', 'Sửa chữa', 'Vận chuyển', 'Dọn dẹp'],
    datasets: [
      {
        data: [
          statistics.serviceStats.theXe,
          statistics.serviceStats.suaChua,
          statistics.serviceStats.vanChuyen,
          statistics.serviceStats.donDep
        ],
        backgroundColor: ['#6366F1', '#8B5CF6', '#EC4899', '#14B8A6'], // Indigo, Violet, Pink, Teal
        borderWidth: 1,
      },
    ],
  };

  // 3. Chart Khiếu nại
  const complaintChartData = {
    labels: ['Mất tài sản', 'Tài sản chung'],
    datasets: [
      {
        data: [
          statistics.complaintStats.matTaiSan,
          statistics.complaintStats.taiSanChung
        ],
        backgroundColor: ['#EF4444', '#F97316'], // Red, Orange
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
        <h1 className="text-3xl font-bold text-white mb-2">Quản lý báo cáo chung cư</h1>
        <p className="text-blue-200">Tổng hợp số liệu thời gian thực</p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-8 max-w-6xl mx-auto">
        
        {/* 1. Báo cáo Cư dân */}
        <ReportCard 
          title="Chi tiết cư dân trong tòa nhà"
          stats={[
            { label: "Tổng số người dân đang cư trú", value: statistics.residentStats.cuDan },
            { label: "Tổng số người dân tạm trú", value: statistics.residentStats.tamTru },
            { label: "Tổng số lượng kế toán", value: statistics.residentStats.keToan },
            { label: "Tổng số lượng công an", value: statistics.residentStats.congAn },
          ]}
          chartData={residentChartData}
        />

        {/* 2. Báo cáo Dịch vụ */}
        <ReportCard 
          title="Chi tiết các dịch vụ chung cư"
          stats={[
            { label: "Số lượng dịch vụ làm thẻ xe", value: statistics.serviceStats.theXe },
            { label: "Số lượng dịch vụ sửa chữa căn hộ", value: statistics.serviceStats.suaChua },
            { label: "Số lượng dịch vụ vận chuyển đồ", value: statistics.serviceStats.vanChuyen },
            { label: "Số lượng dịch vụ dọn dẹp căn hộ", value: statistics.serviceStats.donDep },
          ]}
          chartData={serviceChartData}
        />

        {/* 3. Báo cáo Khiếu nại */}
        <ReportCard 
          title="Chi tiết về khiếu nại"
          stats={[
            { label: "Số lượng làm mất tài sản", value: statistics.complaintStats.matTaiSan },
            { label: "Số lượng mất tài sản chung", value: statistics.complaintStats.taiSanChung },
          ]}
          chartData={complaintChartData}
        />

      </div>
    </div>
  );
};