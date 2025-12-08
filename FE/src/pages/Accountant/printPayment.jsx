import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import dayjs from "dayjs";

// Helper format tiền tệ
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const PrintPayments = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [groupedInvoices, setGroupedInvoices] = useState([]); // State lưu danh sách đã gộp
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (location.state && location.state.data) {
      const receivedData = location.state.data;
      const rawList = Array.isArray(receivedData) ? receivedData : [receivedData];

      // --- LOGIC GỘP HÓA ĐƠN THEO CĂN HỘ ---
      const groups = {};

      rawList.forEach((item) => {
        const aptId = item.apartment_id || "UNKNOWN";

        if (!groups[aptId]) {
          // Nếu chưa có nhóm này, tạo mới
          groups[aptId] = {
            ...item, // Lấy thông tin chung (tên, địa chỉ...) từ item đầu tiên
            items: [], // Mảng chứa các khoản phí chi tiết
            totalAmount: 0, // Tổng tiền của nhóm
            ids: [] // Danh sách các ID hóa đơn con
          };
        }

        // Thêm item vào nhóm
        groups[aptId].items.push(item);
        groups[aptId].ids.push(item.id);
        groups[aptId].totalAmount += Number(item.amount);
      });

      // Chuyển object groups thành array để render
      setGroupedInvoices(Object.values(groups));
    } else {
      navigate(-1);
    }
  }, [location, navigate]);

  // --- HÀM IN ---
  const handlePrint = async () => {
    if (groupedInvoices.length === 0) return;
    setIsPrinting(true);

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();

      // Duyệt qua từng NHÓM hóa đơn (Mỗi nhóm là 1 trang PDF)
      for (let i = 0; i < groupedInvoices.length; i++) {
        const input = document.getElementById(`invoice-content-${i}`);
        
        if (input) {
          const dataUrl = await toPng(input, { cacheBust: true, pixelRatio: 2 });
          const imgProps = pdf.getImageProperties(dataUrl);
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

          if (i > 0) {
            pdf.addPage();
          }

          pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
        }
      }

      pdf.save(`Hoa_don_tong_hop_${dayjs().format("DDMMYYYY")}.pdf`);
    } catch (err) {
      console.error("Lỗi khi in hóa đơn:", err);
      alert("Không thể tạo file PDF. Vui lòng thử lại.");
    } finally {
      setIsPrinting(false);
    }
  };

  if (groupedInvoices.length === 0) return null;

  return (
    <div className="w-full min-h-screen bg-blue-700 flex flex-col items-center p-8 overflow-y-auto">
      
      {/* NÚT ĐIỀU KHIỂN */}
      <div className="flex space-x-4 mb-6 sticky top-0 z-50 bg-blue-700 w-full justify-center py-2">
        <button 
          onClick={() => navigate(-1)}
          className="bg-transparent hover:bg-white/10 text-white font-bold py-2 px-6 rounded-lg border border-white transition-colors"
        >
          Quay lại
        </button>
        <button 
          onClick={handlePrint}
          disabled={isPrinting}
          className={`${isPrinting ? "bg-gray-400 cursor-wait" : "bg-green-500 hover:bg-green-600"} text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-colors`}
        >
          {isPrinting ? "Đang xử lý..." : `In ${groupedInvoices.length} hóa đơn`}
        </button>
      </div>

      {/* --- DANH SÁCH HÓA ĐƠN (RENDER THEO NHÓM) --- */}
      <div className="w-full max-w-4xl space-y-8 pb-10">
        {groupedInvoices.map((group, index) => (
          
          <div 
            key={index}
            id={`invoice-content-${index}`} 
            className="bg-white rounded-3xl p-8 shadow-2xl text-gray-800"
            style={{ backgroundColor: '#ffffff', minHeight: '600px' }} 
          >
            {/* --- HEADER --- */}
            <div className="flex justify-between mb-8">
              <div className="w-2/3">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Chung cư Blue Moon</h2>
                <p className="text-sm text-gray-600 mb-1">Đơn vị bán hàng: Ban Quản Trị Chung Cư Blue Moon</p>
                <p className="text-sm text-gray-600 mb-1">Địa chỉ: 23 Đường X, Phường A, Quận B, TP. Hà Nội</p>
                <p className="text-sm text-gray-600">Điện thoại: 034 456 8976</p>
              </div>
              <div className="w-1/3 text-right">
                <p className="text-xs text-gray-500">Ký hiệu: BE/34E</p>
                {/* Hiển thị danh sách ID đã gộp */}
                <p className="text-xs text-gray-500 mb-2">Số: {group.ids.join(", ")}</p>
                <h1 className="text-2xl font-bold text-gray-800 uppercase mb-1">Hóa đơn dịch vụ</h1>
                <p className="text-sm text-gray-500">
                    Ngày {dayjs().format("DD")} tháng {dayjs().format("MM")} năm {dayjs().format("YYYY")}
                </p>
              </div>
            </div>

            {/* --- THÔNG TIN KHÁCH HÀNG (Dùng chung cho cả nhóm) --- */}
            <div className="mb-8 text-sm text-gray-700 space-y-1">
                <p><span className="font-semibold">Họ tên khách hàng:</span> {group.resident_name || "Cư dân"}</p>
                <p><span className="font-semibold">Mã căn hộ:</span> {group.apartment_id}</p>
                <p><span className="font-semibold">Địa chỉ:</span> Căn hộ {group.apartment_id}, Chung cư Blue Moon</p>
                <p><span className="font-semibold">Hình thức thanh toán:</span> {group.payment_form || "Tổng hợp"}</p>
            </div>

            {/* --- BẢNG CHI TIẾT (LẶP QUA CÁC ITEMS CỦA NHÓM) --- */}
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
                        {group.items.map((item, idx) => (
                          <tr key={idx}>
                              <td className="py-4 px-4 text-center">{idx + 1}</td>
                              <td className="py-4 px-4 font-medium">
                                {item.feetype} 
                                <br/>
                                <span className="text-xs text-gray-500">
                                  (Ngày TT: {dayjs(item.payment_date).format("DD/MM/YYYY")})
                                </span>
                              </td>
                              <td className="py-4 px-4">Lần</td>
                              <td className="py-4 px-4">1</td>
                              <td className="py-4 px-4 text-right">{formatCurrency(item.amount)}</td>
                              <td className="py-4 px-4 text-right">{formatCurrency(item.amount)}</td>
                          </tr>
                        ))}
                        
                        {/* Dòng trống tạo khoảng cách thẩm mỹ */}
                        <tr><td colSpan="6" className="py-4"></td></tr>
                    </tbody>
                </table>
            </div>

            {/* --- TỔNG TIỀN (CỦA CẢ NHÓM) --- */}
            <div className="flex justify-end">
                <div className="w-1/2 bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex justify-between mb-2">
                        <span className="font-bold text-gray-700">Cộng tiền hàng:</span>
                        <span className="font-bold text-gray-900">{formatCurrency(group.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-lg">
                        <span className="font-bold text-gray-700">Tổng cộng tiền thanh toán:</span>
                        <span className="font-bold text-blue-600">{formatCurrency(group.totalAmount)}</span>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};