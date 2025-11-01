import React from "react";
import ellipse1 from "../images/ellipse_1.svg";
import ellipse3 from "../images/ellipse_3.svg";
import vector from "../images/vector.svg";

export const AuthLayout = () => {
  return (
    <main className="bg-[#2148c0] overflow-hidden w-full min-h-screen flex relative">
      <div className="absolute top-[40%] left-[-0%] w-[30%] h-auto max-w-[546px] max-h-[588px]">
        <img
          className="w-full h-full object-contain"
          alt="Decorative ellipse background element"
          src={ellipse3}
        />
      </div>

      <div className="absolute top-[47%] left-[3%] w-[24%] h-auto aspect-[436/410] max-w-[436px] max-h-[410px] bg-[#234bc5] rounded-[50%]" />

      <div className="absolute top-[51%] left-[5%] w-[20%] h-auto max-w-[317px] max-h-[289px]">
        <img
          className="w-full h-full object-contain"
          alt="Decorative ellipse overlay element"
          src={ellipse1}
        />
      </div>

      <div className="absolute top-[0%] right-[0%] w-[45%] h-auto max-w-[850px] max-h-[722px]">
        <img
          className="w-full h-full object-contain"
          alt="Decorative vector graphic"
          src={vector}
        />
      </div>
    </main>
  );
};
