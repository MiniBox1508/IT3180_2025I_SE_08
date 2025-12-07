import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { toPng } from "html-to-image"; // <--- DÙNG THƯ VIỆN MỚI
import dayjs from "dayjs";

// Helper format tiền tệ
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const PrintPayments = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState(null);

  useEffect(() => {
    if (location.state && location.state.data) {
      setInvoiceData(location.state.data);
    } else {
      navigate(-1);
    }
  }, [location, navigate]);

  // --- HÀM IN MỚI SỬ DỤNG HTML-TO-IMAGE ---
  const handlePrint = async () => {
    const input = document.getElementById("invoice-content");

    if (!input) return;

    try {
      // Dùng toPng thay vì html2canvas
      // pixelRatio: 2 giúp ảnh nét hơn khi in
      const dataUrl = await toPng(input, { cacheBust: true, pixelRatio: 2 });
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      // Lấy kích thước thật của ảnh để tính tỷ lệ
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Hoa_don_${invoiceData?.id || "DV"}.pdf`);
    } catch (err) {
      console.error("Lỗi khi in hóa đơn:", err);
      alert("Không thể tạo file PDF. Vui lòng thử lại.");
    }
  };

  if (!invoiceData) return null;

  return (
    <div className="w-full min-h-screen bg-blue-700 flex flex-col items-center justify-center p-8">
      
      {/* --- PHẦN NỘI DUNG HÓA ĐƠN (MÀU TRẮNG) --- */}
      {/* Thêm style backgroundColor trực tiếp để đảm bảo an toàn tối đa */}
      <div 
        id="invoice-content" 
        className="bg-white rounded-3xl p-8 w-full max-w-4xl shadow-2xl mb-8 text-gray-800"
        style={{ backgroundColor: '#ffffff' }} 
      >
        {/* Header Hóa Đơn */}
        <div className="flex justify-between mb-8">
          <div className="w-2/3">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Chung cư Blue Moon</h2>
            <p className="text-sm text-gray-600 mb-1">Đơn vị bán hàng: Ban Quản Trị Chung Cư Blue Moon</p>
            <p className="text-sm text-gray-600 mb-1">Địa chỉ: 23 Đường X, Phường A, Quận B, TP. Hà Nội</p>
            <p className="text-sm text-gray-600 mb-1">Mã số thuế: 012567894</p>
            <p className="text-sm text-gray-600">Điện thoại: 034 456 8976</p>
          </div>
          <div className="w-1/3 text-right">
            <p className="text-xs text-gray-500">Mẫu số: 01GTKT0/001</p>
            <p className="text-xs text-gray-500">Ký hiệu: BE/34E</p>
            <p className="text-xs text-gray-500 mb-2">Số: {String(invoiceData.id).padStart(7, '0')}</p>
            <h1 className="text-2xl font-bold text-gray-800 uppercase mb-1">Hóa đơn dịch vụ</h1>
            <p className="text-sm text-gray-500">
                Ngày {dayjs(invoiceData.payment_date || new Date()).format("DD")} tháng {dayjs(invoiceData.payment_date || new Date()).format("MM")} năm {dayjs(invoiceData.payment_date || new Date()).format("YYYY")}
            </p>
          </div>
        </div>

        {/* Thông tin khách hàng */}
        <div className="mb-8 text-sm text-gray-700 space-y-1">
            <p><span className="font-semibold">Họ tên khách hàng:</span> {invoiceData.resident_name || "Cư dân"}</p>
            <p><span className="font-semibold">Mã căn hộ:</span> {invoiceData.apartment_id}</p>
            <p><span className="font-semibold">Mã cư dân:</span> {invoiceData.resident_id}</p>
            <p><span className="font-semibold">Địa chỉ:</span> Căn hộ {invoiceData.apartment_id}, Chung cư Blue Moon</p>
            <p><span className="font-semibold">Hình thức thanh toán:</span> {invoiceData.payment_form || "Chuyển khoản/Tiền mặt"}</p>
        </div>

        {/* Bảng chi tiết */}
        <div className="border border-gray-300 rounded-lg overflow-hidden mb-6">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-900 font-bold border-b border-gray-300">
                    <tr>
                        <th className="py-3 px-4 w-16 text-center">STT</th>
                        <th className="py-3 px-4">Tên hàng hóa/dịch vụ</th>
                        <th className="py-3 px-4 w-24">Đơn vị tính</th>
                        <th className="py-3 px-4 w-24">Số lượng</th>
                        <th className="py-3 px-4 w-32 text-right">Đơn giá</th>
                        <th className="py-3 px-4 w-32 text-right">Thành tiền</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    <tr>
                        <td className="py-4 px-4 text-center">1</td>
                        <td className="py-4 px-4 font-medium">{invoiceData.feetype}</td>
                        <td className="py-4 px-4">Tháng</td>
                        <td className="py-4 px-4">1</td>
                        <td className="py-4 px-4 text-right">{formatCurrency(invoiceData.amount)}</td>
                        <td className="py-4 px-4 text-right">{formatCurrency(invoiceData.amount)}</td>
                    </tr>
                    <tr><td colSpan="6" className="py-4"></td></tr>
                    <tr><td colSpan="6" className="py-4"></td></tr>
                </tbody>
            </table>
        </div>

        {/* Tổng tiền */}
        <div className="flex justify-end">
            <div className="w-1/2 bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex justify-between mb-2">
                    <span className="font-bold text-gray-700">Cộng tiền hàng:</span>
                    <span className="font-bold text-gray-900">{formatCurrency(invoiceData.amount)}</span>
                </div>
                <div className="flex justify-between text-lg">
                    <span className="font-bold text-gray-700">Tổng cộng tiền thanh toán:</span>
                    <span className="font-bold text-blue-600">{formatCurrency(invoiceData.amount)}</span>
                </div>
            </div>
        </div>
      </div>

      {/* --- BUTTONS --- */}
      <div className="flex space-x-4">
        <button 
          onClick={() => navigate(-1)}
          className="bg-transparent hover:bg-white/10 text-white font-bold py-3 px-8 rounded-lg border border-white transition-colors"
        >
          Quay lại
        </button>
        <button 
          onClick={handlePrint}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-colors"
        >
          In hóa đơn
        </button>
      </div>

    </div>
  );
};