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

// --- IMPORTS CHO PDF ---
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Đăng ký các thành phần của Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, Title);

// --- API CONFIG ---
const API_BASE_URL = "https://testingdeploymentbe-2.vercel.app";

// --- HELPER: Format Tiền tệ ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// --- HELPER: Xóa dấu tiếng Việt (để xuất PDF không lỗi font) ---
const removeVietnameseTones = (str) => {
    if (!str) return "";
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
    str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
    str = str.replace(/đ/g,"d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
}

// --- COMPONENT CON: THẺ BÁO CÁO (Card) ---
const ReportCard = ({ title, stats, chartData }) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between min-h-[280px]">
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

  // States cho Export PDF
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [selectedMonth, setSelectedMonth] = useState(""); // Để trống ban đầu

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [resResidents, resPayments] = await Promise.all([
          axios.get(`${API_BASE_URL}/residents`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/payments`, {
            headers: { Authorization: `Bearer ${token}` },
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
    const residentStats = {
      totalApartments: 0,
      cuTru: 0,
      tamTru: 0,
    };
    const apartmentSet = new Set();

    residents.forEach(r => {
      if (r.state === 'inactive') return;
      if (r.apartment_id) apartmentSet.add(r.apartment_id.trim().toLowerCase());

      const status = r.residency_status ? r.residency_status.toLowerCase() : "";
      if (status.includes("tạm trú") || status === "khách tạm trú" || status === "người thuê") {
        residentStats.tamTru++;
      } else {
        residentStats.cuTru++;
      }
    });
    residentStats.totalApartments = apartmentSet.size;

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
        const createdDate = dayjs(p.created_at);
        const now = dayjs();
        if (now.diff(createdDate, 'day') > 30) {
          paymentStats.overdueCount++;
        }
      }
    });

    return { residentStats, paymentStats };
  }, [residents, payments]);

  // --- 3. LẤY DANH SÁCH NĂM CÓ DỮ LIỆU ---
  const availableYears = useMemo(() => {
    const years = new Set();
    years.add(dayjs().year()); // Luôn hiện năm hiện tại
    payments.forEach(p => {
        if(p.created_at) years.add(dayjs(p.created_at).year());
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [payments]);

  // --- 4. [MỚI] LẤY DANH SÁCH THÁNG CÓ DỮ LIỆU TRONG NĂM ĐÃ CHỌN ---
  const availableMonths = useMemo(() => {
    const months = new Set();
    payments.forEach(p => {
        const date = dayjs(p.created_at);
        // Chỉ lấy tháng nếu năm khớp với năm đang chọn
        if (date.year() === parseInt(selectedYear)) {
            months.add(date.month() + 1); // dayjs month là 0-11
        }
    });
    return Array.from(months).sort((a, b) => a - b); // Sắp xếp tăng dần
  }, [payments, selectedYear]);

  // --- 5. [MỚI] TỰ ĐỘNG CHỌN THÁNG HỢP LỆ ---
  useEffect(() => {
    if (availableMonths.length > 0) {
        // Nếu tháng hiện tại không nằm trong danh sách khả dụng, chọn tháng đầu tiên có dữ liệu
        if (!availableMonths.includes(parseInt(selectedMonth))) {
            setSelectedMonth(availableMonths[availableMonths.length - 1]); // Chọn tháng mới nhất có dữ liệu
        }
    } else {
        setSelectedMonth(""); // Không có dữ liệu
    }
  }, [availableMonths, selectedMonth]);

  // --- 6. XỬ LÝ XUẤT PDF ---
  const handleExportPDF = () => {
    if (!selectedMonth) {
        alert("Không có dữ liệu trong năm này để xuất báo cáo!");
        return;
    }

    const doc = new jsPDF();

    const filteredPayments = payments.filter(p => {
        const date = dayjs(p.created_at);
        return date.month() + 1 === parseInt(selectedMonth) && date.year() === parseInt(selectedYear);
    });

    const totalRevenue = filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const paidCount = filteredPayments.filter(p => p.state === 1).length;
    const unpaidCount = filteredPayments.length - paidCount;

    doc.setFontSize(18);
    doc.text(`BAO CAO TAI CHINH - THANG ${selectedMonth}/${selectedYear}`, 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(`Ngay xuat bao cao: ${dayjs().format("DD/MM/YYYY HH:mm")}`, 105, 30, { align: "center" });

    doc.text("TONG QUAN:", 14, 45);
    doc.setFontSize(10);
    doc.text(`- Tong so hoa don: ${filteredPayments.length}`, 20, 52);
    doc.text(`- Da thanh toan: ${paidCount}`, 20, 58);
    doc.text(`- Chua thanh toan: ${unpaidCount}`, 20, 64);
    doc.text(`- Tong doanh thu du kien: ${new Intl.NumberFormat('vi-VN').format(totalRevenue)} VND`, 20, 70);

    const tableColumn = ["ID", "Can Ho", "Loai Phi", "So Tien (VND)", "Trang Thai", "Ngay Tao"];
    const tableRows = [];

    filteredPayments.forEach(p => {
      const paymentData = [
        p.id,
        p.apartment_id,
        removeVietnameseTones(p.feetype || ""),
        new Intl.NumberFormat('vi-VN').format(p.amount),
        p.state === 1 ? "Da TT" : "Chua TT",
        dayjs(p.created_at).format("DD/MM/YYYY")
      ];
      tableRows.push(paymentData);
    });

    autoTable(doc, {
        startY: 80,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`Bao_cao_thang_${selectedMonth}_${selectedYear}.pdf`);
    setIsExportModalOpen(false);
  };

  const residentChartData = {
    labels: ['Dân cư trú', 'Dân tạm trú'],
    datasets: [{
        data: [statistics.residentStats.cuTru, statistics.residentStats.tamTru],
        backgroundColor: ['#3B82F6', '#F59E0B'],
        borderWidth: 1,
    }],
  };

  const unpaidInTerm = statistics.paymentStats.unpaidCount - statistics.paymentStats.overdueCount;
  const paymentChartData = {
    labels: ['Đã thanh toán', 'Chưa TT (Trong hạn)', 'Chưa TT (Quá hạn)'],
    datasets: [{
        data: [
          statistics.paymentStats.paidCount, 
          unpaidInTerm > 0 ? unpaidInTerm : 0, 
          statistics.paymentStats.overdueCount
        ],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        borderWidth: 1,
    }],
  };

  if (isLoading) return <div className="text-white text-center mt-10 text-xl">Đang tổng hợp báo cáo...</div>;

  return (
    <div className="w-full min-h-screen bg-blue-700 p-4 md:p-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">Báo cáo Kế toán</h1>
            <p className="text-blue-200">Tổng hợp số liệu về Cư dân và Tình hình tài chính</p>
        </div>
        
        <button
            onClick={() => setIsExportModalOpen(true)}
            className="bg-white text-blue-700 hover:bg-blue-50 font-bold py-2 px-6 rounded-lg shadow-lg flex items-center transition-all"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Xuất báo cáo
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 max-w-6xl mx-auto">
        <ReportCard 
          title="Chi tiết về số lượng cư dân"
          stats={[
            { label: "Tổng số căn hộ đang quản lý", value: statistics.residentStats.totalApartments, color: "text-blue-600" },
            { label: "Số lượng dân cư trú (Thường trú)", value: statistics.residentStats.cuTru },
            { label: "Số lượng dân tạm trú", value: statistics.residentStats.tamTru },
          ]}
          chartData={residentChartData}
        />

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

      {/* --- MODAL CHỌN THÁNG/NĂM --- */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Báo cáo định kỳ</h3>
                
                <div className="space-y-4">
                    {/* Chọn Năm (Chọn trước để lọc tháng) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Năm báo cáo</label>
                        <select 
                            value={selectedYear} 
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            {availableYears.map(y => (
                                <option key={y} value={y}>Năm {y}</option>
                            ))}
                        </select>
                    </div>

                    {/* Chọn Tháng (Chỉ hiện tháng có dữ liệu) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tháng báo cáo</label>
                        <select 
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className={`w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none ${availableMonths.length === 0 ? "bg-gray-100 text-gray-400" : ""}`}
                            disabled={availableMonths.length === 0}
                        >
                            {availableMonths.length > 0 ? (
                                availableMonths.map(m => (
                                    <option key={m} value={m}>Tháng {m}</option>
                                ))
                            ) : (
                                <option>Không có dữ liệu</option>
                            )}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
                    <button 
                        onClick={() => setIsExportModalOpen(false)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                    >
                        Hủy bỏ
                    </button>
                    <button 
                        onClick={handleExportPDF}
                        disabled={!selectedMonth}
                        className={`px-4 py-2 text-white rounded-lg font-bold transition-colors shadow-md ${!selectedMonth ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};