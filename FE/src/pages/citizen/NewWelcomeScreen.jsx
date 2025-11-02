import React, { useState } from "react";
import { FaHome, FaUserShield, FaCalculator, FaUserLock } from "react-icons/fa";
import bgImage from "../../images/new_welcome_background.jpg";

const NewWelcomeScreen = () => {
  const [selectedRole, setSelectedRole] = useState("Cư dân");

  const handleRoleClick = (role) => {
    setSelectedRole(role);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Logging in as:", selectedRole);
  };

  const roles = [
    { name: "Cư dân", icon: <FaHome size={24} /> },
    { name: "Ban quản trị", icon: <FaUserShield size={24} /> },
    { name: "Kế toán", icon: <FaCalculator size={24} /> },
    { name: "Công an", icon: <FaUserLock size={24} /> },
  ];

  return (
    <div
      className="w-screen h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="bg-white p-8 rounded-xl shadow-lg w-11/12 max-w-lg">
        <h1 className="text-xl font-bold text-center text-gray-800 whitespace-nowrap">
          PHẦN MỀM QUẢN LÝ CHUNG CƯ BLUE MOON
        </h1>
        <p className="text-center text-gray-600 mt-2 mb-6">
          ĐĂNG NHẬP DƯỚI VAI TRÒ
        </p>

        <div className="flex justify-around mb-6">
          {roles.map((role) => (
            <div
              key={role.name}
              onClick={() => handleRoleClick(role.name)}
              className={`flex flex-col items-center cursor-pointer p-2 ${
                selectedRole === role.name
                  ? "text-blue-600 font-semibold"
                  : "text-gray-500"
              }`}
            >
              {role.icon}
              <span
                className={`px-3 py-1 rounded-md text-sm mt-1 ${
                  selectedRole === role.name
                    ? "bg-blue-600 text-white"
                    : "text-gray-700"
                }`}
              >
                {role.name}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Tên tài khoản
            </label>
            <input
              type="text"
              id="username"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-2"
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewWelcomeScreen;
