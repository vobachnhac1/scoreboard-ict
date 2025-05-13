import React from "react";

export default function TotalScore({ total, ...props }) {
  return (
    <div className=" bg-orange-200 rounded-lg w-48 h-32 flex flex-col items-center justify-center text-black" {...props}>
      <p className="font-bold">TỔNG ĐIỂM</p>
      <p className="text-5xl font-bold">{total}</p>
    </div>
  );
}
