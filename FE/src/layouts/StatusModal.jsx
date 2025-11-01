import React from "react";

export const StatusModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full relative transform transition-all duration-300 scale-100 opacity-100">
        <div className="flex justify-between items-center mb-4 pb-3">
          {title && (
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          )}
          {/* === KIỂM TRA DÒNG NÀY === */}
          <button
            type="button"
            onClick={onClose} // <<<< Đảm bảo có dòng này
            className={`text-gray-400 hover:text-gray-700 text-3xl leading-none font-semibold ${
              !title ? "ml-auto" : ""
            }`}
            aria-label="Đóng"
          >
            &times;
          </button>
          {/* ======================= */}
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};