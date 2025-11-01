import React from "react";
import { useNavigate } from "react-router-dom";

export const TitleLabel = () => {
  return (
    <div className="w-full h-[10vh] flex flex-col justify-center items-center">
      <p
        className="text-white text-[4vw] text-center tracking-[0] leading-5 [font-family:'Montserrat-SemiBold',Helvetica] font-semibold
      px-[2vw] py-[1vh] mt-[-10vh] mb-[5vh]"
      >
        PHẦN MỀM QUẢN LÝ CHUNG CƯ
      </p>
      <p
        className="text-white text-[4vw] text-center tracking-[0] leading-5 [font-family:'Montserrat-SemiBold',Helvetica] font-semibold
      px-[2vw] py-[1vh] mt-[0vh] mb-[10vh]"
      >
        BLUE MOON
      </p>
    </div>
  );
};

export const RoleLabel = () => {
  return (
    <div className="w-full h-[2vh] flex justify-center items-center mt-[2vh]">
      <div className="border border-white rounded px-[1vw] py-[3vh]">
        <h1 className="text-white text-[2.8vw] text-center tracking-[0] leading-5 whitespace-nowrap [font-family:'Montserrat-SemiBold',Helvetica] font-semibold">
          ĐĂNG NHẬP VỚI VAI TRÒ
        </h1>
      </div>
    </div>
  );
};

export const ResidentBox = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/resident_dashboard");
  };

  return (
    <div className="relative w-[25vw] h-[8vh] mt-[10vh] mx-auto">
      <div
        className="absolute top-0 left-0 w-full h-full bg-white rounded shadow-[0px_4px_4px_#0000004c] cursor-pointer"
        onClick={handleClick}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 [font-family:'Montserrat-SemiBold',Helvetica] font-semibold text-[#2148c0] text-[1.5vw] text-center tracking-[0] leading-5 whitespace-nowrap">
          DÂN CƯ
        </div>
      </div>
    </div>
  );
};

export const OrLabel = () => {
  return (
    <div className="w-full h-[2vh] flex justify-center items-center mt-[5vh]">
      <div className="text-white text-[2.5vw] text-center tracking-[0] leading-5 whitespace-nowrap [font-family:'Montserrat-SemiBold',Helvetica] font-semibold">
        OR AS
      </div>
    </div>
  );
};

export const AdminBox = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/dashboard");
  };

  return (
    <div className="relative w-[25vw] h-[8vh] mt-[5vh] mx-auto">
      <div
        className="absolute top-0 left-0 w-full h-full bg-white rounded shadow-[0px_4px_4px_#0000004c] cursor-pointer"
        onClick={handleClick}
      >
        <h1 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[70%] [font-family:'Montserrat-SemiBold',Helvetica] font-semibold text-[#2148c0] text-[1.5vw] text-center tracking-[0] leading-5 whitespace-nowrap">
          BAN QUẢN TRỊ
        </h1>
      </div>
    </div>
  );
};

export const WelcomeScreen = () => {
  return (
    <div className="w-full h-full min-h-screen absolute inset-0 flex flex-col justify-center items-center">
      <TitleLabel />
      <RoleLabel />
      <ResidentBox />
      <OrLabel />
      <AdminBox />
    </div>
  );
};
