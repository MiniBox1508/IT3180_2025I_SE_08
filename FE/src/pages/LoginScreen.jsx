import React, { useState } from "react";
import passwordIcon from "../images/password_icon.svg";
import loginBtn from "../images/login_btn.svg";
import username from "../images/username_field.svg";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const Box = () => {
  const [usernameValue, setUsernameValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // file: src/pages/LoginScreen.jsx

  const handleLogin = async (e) => { // 1. Thêm 'async'
    e.preventDefault();
    setErrorMessage(""); // Xóa lỗi cũ

    if (!usernameValue || !passwordValue) {
      setErrorMessage("Vui lòng nhập cả Username và Password!");
      return;
    }

    try {
      // 2. Gọi API bằng proxy (bắt đầu bằng '/api')
      const response = await fetch('${API_BASE_URL}/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: usernameValue, // Đây sẽ là email
          password: passwordValue,
        }),
      });

      const data = await response.json();

      // 3. Xử lý kết quả
      if (!response.ok) {
        // Lỗi từ server (ví dụ: 401 - sai pass)
        setErrorMessage(data.error || "MẬT KHẨU HOẶC TÊN NGƯỜI DÙNG ĐIỀN SAI!");
      } else {
        // Đăng nhập thành công
        console.log("Đăng nhập thành công:", data.user);
        // (Tại đây, bạn sẽ chuyển hướng người dùng hoặc lưu token)
        // ví dụ: window.location.href = '/dashboard';
      }

    } catch (error) {
      // Lỗi mạng (server BE chưa chạy?)
      console.error("Lỗi khi gọi API login:", error);
      setErrorMessage("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    }
  };

  const handleForgotPassword = () => {
    console.log("Forgot password clicked");
  };

  return (
    <div className="w-full h-full min-h-screen absolute inset-0 flex items-center justify-center">
      <div className="w-full max-w-[651px] h-auto flex flex-col items-center">
        <div className="relative w-full max-w-[643.73px] h-auto aspect-[643.73/83.52]">
          <img
            className="absolute w-full h-full object-contain pointer-events-none"
            alt=""
            src={username}
            aria-hidden="true"
          />
          <label htmlFor="username-input" className="sr-only">
            Username
          </label>
          <input
            id="username-input"
            type="text"
            value={usernameValue}
            onChange={(e) => {
              setUsernameValue(e.target.value);
              setErrorMessage("");
            }}
            className="absolute inset-0 w-full h-full bg-transparent text-white [font-family:'Montserrat-Medium',Helvetica] font-medium text-lg"
            style={{
              paddingLeft: "clamp(4.5rem, 5vw, 5rem)",
              paddingRight: "clamp(2rem, 2.5vw, 2.5rem)",
              paddingTop: "clamp(0.5rem, 1vw, 1rem)",
              paddingBottom: "clamp(0.5rem, 1vw, 1rem)",
            }}
            placeholder="Username"
            aria-label="Username"
          />
        </div>

        <div className="w-full max-w-[98.3%] h-auto aspect-[643.73/83.52] mt-[5%] rounded border border-solid border-white relative">
          <label htmlFor="password-input" className="sr-only">
            Password
          </label>
          <input
            id="password-input"
            type="password"
            value={passwordValue}
            onChange={(e) => {
              setPasswordValue(e.target.value);
              setErrorMessage("");
            }}
            className="absolute inset-0 w-full h-full bg-transparent text-white [font-family:'Montserrat-Medium',Helvetica] font-medium text-lg"
            style={{
              paddingLeft: "clamp(4.5rem, 5vw, 5rem)",
              paddingRight: "clamp(1rem, 2vw, 2rem)",
              paddingTop: "clamp(0.5rem, 1vw, 1rem)",
              paddingBottom: "clamp(0.5rem, 1vw, 1rem)",
            }}
            placeholder="Password"
            aria-label="Password"
          />
          <div className="absolute w-[9.27%] h-[69.75%] top-[15.56%] left-[2.33%] pointer-events-none">
            <img
              className="absolute w-full h-full top-[0%] left-[-8%]"
              alt=""
              src={passwordIcon}
              aria-hidden="true"
            />
          </div>
        </div>

        <button
          onClick={handleLogin}
          className="w-[49%] max-w-[319.48px] h-auto aspect-[319.48/81.7] mt-[5%] cursor-pointer"
          aria-label="Login"
        >
          <img
            className="w-full h-full object-contain pointer-events-none"
            alt="Login"
            src={loginBtn}
          />
        </button>

        {errorMessage && (
          <div
            role="alert"
            className="fixed z-50 max-w-[720px] border border-red-400 rounded-lg p-6 text-center text-red-600 bg-white/80 uppercase tracking-wide shadow-lg"
            style={{
              left: "50%",
              top: "calc(55% + 180px)",
              transform: "translate(-50%, 0)",
              pointerEvents: "none",
            }}
          >
            {errorMessage}
          </div>
        )}
        <div className="w-full flex justify-end">
          <button
            onClick={handleForgotPassword}
            className="w-[29%] max-w-[188.97px] h-auto aspect-[188.97/29.48] mt-[5%] [font-family:'Montserrat-Medium',Helvetica] font-medium text-white text-xl text-center tracking-[0] leading-[normal] cursor-pointer hover:opacity-80 transition-opacity"
          >
            Forgot password?
          </button>
        </div>
      </div>
    </div>
  );
};
