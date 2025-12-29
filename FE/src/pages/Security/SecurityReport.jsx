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

// --- IMPORT CÁC THƯ VIỆN ĐỂ XUẤT PDF ---
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs"; // Dùng để format ngày tháng
import { FiPrinter } from "react-icons/fi"; // Icon in

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

  const [residents, setResidents] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

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

  // --- CHỨC NĂNG XUẤT PDF (ĐÃ SỬA LỖI FONT) ---
  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();

      // 1. Tải Font Roboto (Hỗ trợ tiếng Việt)
      const fontUrl =
        "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf";
      const fontResponse = await fetch(fontUrl);
      const fontBlob = await fontResponse.blob();
      const reader = new FileReader();

      reader.readAsDataURL(fontBlob);
      reader.onloadend = () => {
        const base64data = reader.result.split(",")[1];
        // Thêm font vào VFS của jsPDF
        doc.addFileToVFS("Roboto-Regular.ttf", base64data);
        doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
        
        // Set font mặc định cho toàn document
        doc.setFont("Roboto", "normal"); 

        // 2. Header PDF
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text("BÁO CÁO TỔNG HỢP AN NINH", 105, 20, { align: "center" });

        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        const today = dayjs().format("DD/MM/YYYY HH:mm");
        const userEmail = getCurrentUserEmail();
        doc.text(`Ngày xuất báo cáo: ${today}`, 14, 30);
        doc.text(`Người thực hiện: ${userEmail}`, 196, 30, { align: "right" });

        // Vẽ đường kẻ ngang
        doc.setLineWidth(0.5);
        doc.setDrawColor(200, 200, 200);
        doc.line(14, 35, 196, 35);

        // 3. Phần 1: Thống kê Cư dân
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0); 
        doc.text("1. Thống kê Cư dân & Nhân sự", 14, 45);

        autoTable(doc, {
          startY: 50,
          head: [["Loại hình", "Số lượng (Người)"]],
          body: [
            ["Cư dân đang sinh sống", statistics.residentStats.cuDan],
            ["Khách tạm trú", statistics.residentStats.tamTru],
            ["Nhân viên Kế toán", statistics.residentStats.keToan],
            ["Công an / Bảo vệ", statistics.residentStats.congAn],
            [
              { 
                content: "Tổng cộng", 
                styles: { fillColor: [240, 240, 240] } // Bỏ fontStyle bold để tránh lỗi
              },
              {
                 content: statistics.residentStats.cuDan + statistics.residentStats.tamTru + statistics.residentStats.keToan + statistics.residentStats.congAn,
                 styles: { fillColor: [240, 240, 240] }
              }
            ]
          ],
          // --- CẤU HÌNH QUAN TRỌNG ĐỂ KHÔNG LỖI FONT ---
          styles: { 
            font: "Roboto", 
            fontStyle: "normal", // Bắt buộc dùng normal vì chỉ nạp font Regular
            fontSize: 11 
          },
          headStyles: { 
            fillColor: [59, 130, 246],
            font: "Roboto", // Khai báo lại font cho header
            fontStyle: "normal" // QUAN TRỌNG: Header mặc định là bold, phải chuyển về normal
          },
          theme: 'grid'
        });

        // 4. Phần 2: Thống kê Dịch vụ
        const finalY1 = doc.lastAutoTable.finalY || 50;
        doc.text("2. Thống kê Sử dụng Dịch vụ", 14, finalY1 + 15);

        autoTable(doc, {
          startY: finalY1 + 20,
          head: [["Loại dịch vụ", "Số lượng yêu cầu"]],
          body: [
            ["Làm thẻ xe", statistics.serviceStats.theXe],
            ["Sửa chữa căn hộ", statistics.serviceStats.suaChua],
            ["Vận chuyển đồ", statistics.serviceStats.vanChuyen],
            ["Dọn dẹp vệ sinh", statistics.serviceStats.donDep],
          ],
          styles: { 
            font: "Roboto", 
            fontStyle: "normal",
            fontSize: 11 
          },
          headStyles: { 
            fillColor: [139, 92, 246],
            font: "Roboto",
            fontStyle: "normal" // QUAN TRỌNG
          },
          theme: 'grid'
        });

        // 5. Phần 3: Thống kê Khiếu nại
        const finalY2 = doc.lastAutoTable.finalY;
        doc.text("3. Thống kê Tình hình An ninh & Khiếu nại", 14, finalY2 + 15);

        autoTable(doc, {
          startY: finalY2 + 20,
          head: [["Vấn đề an ninh", "Số vụ việc ghi nhận"]],
          body: [
            ["Mất tài sản cá nhân", statistics.complaintStats.matTaiSan],
            ["Hư hại tài sản chung", statistics.complaintStats.taiSanChung],
          ],
          styles: { 
            font: "Roboto", 
            fontStyle: "normal",
            fontSize: 11 
          },
          headStyles: { 
            fillColor: [239, 68, 68],
            font: "Roboto",
            fontStyle: "normal" // QUAN TRỌNG
          },
          theme: 'grid'
        });

        // 6. Footer
        const finalY3 = doc.lastAutoTable.finalY;
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text(
          "Hệ thống quản lý chung cư Blue Moon - Security Report",
          105,
          finalY3 + 20,
          { align: "center" }
        );

        // Lưu file
        doc.save(`Bao_Cao_An_Ninh_${dayjs().format("DDMMYYYY_HHmm")}.pdf`);
        setIsExporting(false);
      };
    } catch (error) {
      console.error("Lỗi xuất PDF:", error);
      alert("Có lỗi xảy ra khi xuất báo cáo!");
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return <div className="text-white text-center mt-10 text-xl">Đang tổng hợp báo cáo...</div>;
  }

  return (
    <div className="w-full min-h-screen bg-blue-700 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Quản lý báo cáo chung cư</h1>
          <p className="text-blue-200">Tổng hợp số liệu thời gian thực</p>
        </div>
        
        {/* Nút Xuất Báo Cáo */}
        <button
          onClick={handleExportReport}
          disabled={isExporting}
          className={`flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-transform transform hover:scale-105 ${
            isExporting ? "opacity-70 cursor-wait" : ""
          }`}
        >
          <FiPrinter size={20} />
          {isExporting ? "Đang xuất..." : "Xuất báo cáo PDF"}
        </button>
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