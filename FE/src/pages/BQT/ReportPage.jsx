import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { Pie } from "react-chartjs-2";
import dayjs from "dayjs"; 

// --- IMPORTS CHO PDF ---
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  const [isExporting, setIsExporting] = useState(false);

  // --- 1. FETCH DATA ---
  const getToken = () => localStorage.getItem("token");
  
  const getCurrentUserEmail = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.email || "admin@bluemoon.com";
      } catch (e) {
        return "admin@bluemoon.com";
      }
    }
    return "admin@bluemoon.com";
  };

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
      cuDan: 0, 
      tamTru: 0, 
      keToan: 0, 
      congAn: 0, 
      total: 0, 
    };

    residents.forEach((r) => {
      if (r.state === "inactive") return;
      residentStats.total++; 
      const role = r.role ? r.role.toLowerCase() : "";
      const status = r.residency_status ? r.residency_status.toLowerCase() : "";

      if (role === "kế toán") {
        residentStats.keToan++;
      } else if (role === "công an" || role === "bảo vệ") {
        residentStats.congAn++;
      } else if (status.includes("tạm trú") || status === "khách tạm trú") {
        residentStats.tamTru++;
      } else {
        residentStats.cuDan++;
      }
    });

    // B. Thống kê Dịch vụ & Phản ánh
    const serviceStats = {
      dichVu: 0, 
      phanAnh: 0, 
    };

    services.forEach((s) => {
      const type = s.service_type;
      if (type === "Khiếu nại") {
        serviceStats.phanAnh++;
      } else {
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

  // --- 3. CHỨC NĂNG XUẤT PDF (SỬ DỤNG FONT ROBOTO ĐỂ KHÔNG LỖI VIETNAMESE) ---
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();

      // --- A. Tải Font Roboto ---
      const fontUrl = "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf";
      const fontResponse = await fetch(fontUrl);
      const fontBlob = await fontResponse.blob();
      const reader = new FileReader();

      reader.readAsDataURL(fontBlob);
      reader.onloadend = () => {
        const base64data = reader.result.split(",")[1];
        
        // Thêm font vào VFS của jsPDF
        doc.addFileToVFS("Roboto-Regular.ttf", base64data);
        doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
        doc.setFont("Roboto", "normal");

        // --- B. Header PDF ---
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text("BÁO CÁO TỔNG QUAN HỆ THỐNG", 105, 20, { align: "center" });

        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        const today = dayjs().format("DD/MM/YYYY HH:mm");
        doc.text(`Ngày xuất báo cáo: ${today}`, 14, 30);
        doc.text(`Người thực hiện: ${getCurrentUserEmail()}`, 196, 30, { align: "right" });

        doc.setLineWidth(0.5);
        doc.setDrawColor(200, 200, 200);
        doc.line(14, 35, 196, 35);

        // --- C. Phần 1: Thống kê Cư dân ---
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("1. Thống kê Cư dân & Nhân sự", 14, 45);

        autoTable(doc, {
            startY: 50,
            head: [["Phân loại", "Số lượng (Người)"]],
            body: [
                ["Cư dân thường trú", statistics.residentStats.cuDan],
                ["Cư dân tạm trú", statistics.residentStats.tamTru],
                ["Nhân viên Kế toán", statistics.residentStats.keToan],
                ["Công an / Bảo vệ", statistics.residentStats.congAn],
                [
                    { content: "Tổng cộng", styles: { fillColor: [240, 240, 240] } },
                    { content: statistics.residentStats.total, styles: { fillColor: [240, 240, 240] } }
                ]
            ],
            // Cấu hình font để tránh lỗi
            styles: { font: "Roboto", fontStyle: "normal", fontSize: 11 },
            headStyles: { fillColor: [59, 130, 246], font: "Roboto", fontStyle: "normal" },
            theme: 'grid'
        });

        // --- D. Phần 2: Thống kê Dịch vụ ---
        const finalY1 = doc.lastAutoTable.finalY || 50;
        doc.text("2. Thống kê Dịch vụ & Phản ánh", 14, finalY1 + 15);

        autoTable(doc, {
            startY: finalY1 + 20,
            head: [["Loại yêu cầu", "Số lượng"]],
            body: [
                ["Yêu cầu dịch vụ (Thẻ xe, Sửa chữa...)", statistics.serviceStats.dichVu],
                ["Phản ánh / Khiếu nại", statistics.serviceStats.phanAnh],
                [
                    { content: "Tổng yêu cầu", styles: { fillColor: [240, 240, 240] } },
                    { content: statistics.serviceStats.dichVu + statistics.serviceStats.phanAnh, styles: { fillColor: [240, 240, 240] } }
                ]
            ],
            styles: { font: "Roboto", fontStyle: "normal", fontSize: 11 },
            headStyles: { fillColor: [99, 102, 241], font: "Roboto", fontStyle: "normal" },
            theme: 'grid'
        });

        // --- E. Phần 3: Thống kê Tài chính ---
        const finalY2 = doc.lastAutoTable.finalY;
        doc.text("3. Tình hình Tài chính & Thanh toán", 14, finalY2 + 15);

        autoTable(doc, {
            startY: finalY2 + 20,
            head: [["Hạng mục", "Giá trị"]],
            body: [
                ["Tổng số hóa đơn phát hành", statistics.paymentStats.totalCount],
                ["Hóa đơn đã thanh toán", statistics.paymentStats.paidCount],
                ["Hóa đơn chưa thanh toán", statistics.paymentStats.unpaidCount],
                [
                    { content: "Tổng doanh thu ghi nhận", styles: { fillColor: [240, 240, 240], textColor: [0, 0, 255] } },
                    { content: formatCurrency(statistics.paymentStats.totalAmount), styles: { fillColor: [240, 240, 240], textColor: [0, 0, 255] } }
                ]
            ],
            styles: { font: "Roboto", fontStyle: "normal", fontSize: 11 },
            headStyles: { fillColor: [34, 197, 94], font: "Roboto", fontStyle: "normal" },
            theme: 'grid'
        });

        // --- F. Footer ---
        const finalY3 = doc.lastAutoTable.finalY;
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        doc.text("Hệ thống quản lý chung cư Blue Moon - Admin Report", 105, finalY3 + 20, { align: "center" });

        // Lưu file
        doc.save(`Bao_Cao_Tong_Quan_${dayjs().format("DDMMYYYY_HHmm")}.pdf`);
        setIsExporting(false);
      }
    } catch (error) {
        console.error("Lỗi xuất PDF:", error);
        alert("Có lỗi xảy ra khi xuất báo cáo!");
        setIsExporting(false);
    }
  };

  // --- 4. CẤU HÌNH BIỂU ĐỒ (CHARTS) ---
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
        backgroundColor: ["#3B82F6", "#F59E0B", "#10B981", "#EF4444"],
        borderWidth: 1,
      },
    ],
  };

  const serviceChartData = {
    labels: ["Yêu cầu Dịch vụ", "Phản ánh/Khiếu nại"],
    datasets: [
      {
        data: [statistics.serviceStats.dichVu, statistics.serviceStats.phanAnh],
        backgroundColor: ["#6366F1", "#EC4899"],
        borderWidth: 1,
      },
    ],
  };

  const paymentChartData = {
    labels: ["Đã thanh toán", "Chưa thanh toán"],
    datasets: [
      {
        data: [
          statistics.paymentStats.paidCount,
          statistics.paymentStats.unpaidCount,
        ],
        backgroundColor: ["#22C55E", "#F97316"],
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
      <div className="mb-8 flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">Báo cáo tổng quan</h1>
            <p className="text-blue-200">Thống kê số liệu cư dân, dịch vụ và tài chính</p>
        </div>
        
        {/* Nút Xuất Báo Cáo - Gọi thẳng hàm export, không qua modal */}
        <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className={`bg-white text-blue-700 hover:bg-blue-50 font-bold py-2 px-6 rounded-lg shadow-lg flex items-center transition-all ${isExporting ? "opacity-70 cursor-wait" : ""}`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {isExporting ? "Đang xuất..." : "Xuất báo cáo"}
        </button>
      </div>

      {/* Grid Layout chứa 3 Card */}
      <div className="grid grid-cols-1 gap-8 max-w-6xl mx-auto">
        <ReportCard
          title="Chi tiết về số lượng cư dân"
          stats={[
            { label: "Tổng số người dân đang cư trú", value: statistics.residentStats.cuDan },
            { label: "Tổng số người dân tạm trú", value: statistics.residentStats.tamTru },
            { label: "Tổng số lượng kế toán", value: statistics.residentStats.keToan },
            { label: "Tổng số lượng công an", value: statistics.residentStats.congAn },
            { label: "Tổng số người trong tòa nhà", value: statistics.residentStats.total, color: "text-blue-600" },
          ]}
          chartData={residentChartData}
        />

        <ReportCard
          title="Chi tiết về dịch vụ & Phản ánh"
          stats={[
            { label: "Số lượng dịch vụ (Thẻ xe, Sửa chữa...)", value: statistics.serviceStats.dichVu },
            { label: "Số lượng phản ánh (Khiếu nại)", value: statistics.serviceStats.phanAnh },
            { label: "Tổng yêu cầu xử lý", value: statistics.serviceStats.dichVu + statistics.serviceStats.phanAnh, color: "text-indigo-600" },
          ]}
          chartData={serviceChartData}
        />

        <ReportCard
          title="Chi tiết thanh toán"
          stats={[
            { label: "Tổng số hóa đơn tất cả", value: statistics.paymentStats.totalCount },
            { label: "Số lượng chưa thanh toán", value: statistics.paymentStats.unpaidCount, color: "text-orange-500" },
            { label: "Số lượng đã thanh toán", value: statistics.paymentStats.paidCount, color: "text-green-600" },
            { label: "Tổng doanh thu", value: formatCurrency(statistics.paymentStats.totalAmount), color: "text-blue-700 text-xl" },
          ]}
          chartData={paymentChartData}
        />
      </div>
      {/* Đã xóa Modal chọn ngày tháng */}
    </div>
  );
};