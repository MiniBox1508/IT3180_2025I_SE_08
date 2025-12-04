import React from "react";

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-5">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm mx-4 p-6 flex flex-col items-center">
        {/* Red warning icon */}
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <svg
            className="w-10 h-10 text-red-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
            />
          </svg>
        </div>
        {/* Centered text */}
        <h2 className="text-lg font-semibold text-gray-900 mb-2 text-center">
          Bạn muốn đăng xuất?
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Hành động này sẽ kết thúc phiên làm việc hiện tại.
        </p>
        {/* Buttons */}
        <div className="flex w-full space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
          >
            Hoàn tác
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
