// src/layouts/ConfirmationModal.jsx
import React from "react";

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full relative transform transition-all duration-300 scale-100 opacity-100">
        {title && (
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            {title}
          </h2>
        )}
        <p className="text-gray-700 mb-6 text-center">{message}</p>
        <div className="flex justify-center space-x-4">
          {/* === KIỂM TRA NÚT NÀY === */}
          <button
            onClick={onClose} // <<<< Đảm bảo nút Hoãn tác gọi onClose
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-md transition-colors duration-200"
          >
            Hoàn tác
          </button>
          {/* ===================== */}
          <button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-200"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};
