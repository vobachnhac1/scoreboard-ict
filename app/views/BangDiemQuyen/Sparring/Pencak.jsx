import React from "react";
import Header from "../components/Header";
import SquareBox from "../components/SquareBox";

export default function Pencak() {
  const renderGDScores = (colors, isReverse) => (
    <div className={`flex ${isReverse ? "flex-row-reverse" : "flex-row"} text-black text-center text-sm font-bold gap-0.5 items-center mx-0.5`}>
      {colors.map((colorRow, rowIndex) => (
        <div key={rowIndex} className="">
          {colorRow.map((gd, i) => (
            <div key={`${rowIndex}-${i}`} className={`p-0.5 mb-0.5 ${rowIndex === 0 ? "bg-yellow-200" : rowIndex === 1 ? "bg-green-200" : "bg-rose-200"}`}>
              {gd}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  const gdData = [
    ["GD1", "GD2", "GD3", "GD4", "GD5"],
    ["GD1", "GD2", "GD3", "GD4", "GD5"],
    ["GD1", "GD2", "GD3", "GD4", "GD5"],
  ];

  return (
    <div className="bg-black min-h-screen p-6 flex flex-col items-center">
      {/* Header */}
      <Header title="GIẢI VÔ ĐỊCH PENCAK SILAT" desc="TOÀN QUỐC LẦN THỨ 20 NĂM 2023" />
      {/* Scoreboard */}
      <div className="flex w-full justify-center items-start mt-4">
        {/* Đỏ */}
        <div className="w-1/3">
          <div className="flex">
            {renderGDScores(gdData, true)}
            <div className="bg-red-100 text-black  p-4 rounded-lg flex flex-col items-center w-full">
              <div className="text-[150px] font-bold">10</div>
              <div className="flex justify-between items-center mt-5">
                <div className="h-14 w-14 bg-slate-400 mr-2 flex justify-center items-center">LOGO</div>
                <div className="font-semibold text-sm mt-2">
                  <p className="py-2">DƯƠNG TRƯƠNG TUẤN HƯƠNG</p>
                  <p className="py-2">DƯƠNG TRƯƠNG TUẤN HƯƠNG</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Giữa */}
        <div className="flex flex-col items-center justify-center space-y-1 px-2">
          <p className="font-semibold text-white">TRẬN SỐ 200</p>
          <p className="text-white">VÒNG LOẠI</p>
          <p className="text-white">HẠNG CÂN</p>
          <div className="bg-white text-black font-bold text-xl px-4 py-1 rounded">HIỆP PHỤ</div>
          <div className="bg-white text-black font-bold text-3xl px-6 py-2 rounded">03:30</div>

          {/* Bảng điểm nhỏ */}
          <div className="grid grid-cols-3 gap-1 text-black text-xs mt-2">
            <div className="bg-white px-3 py-1">10</div>
            <div className="bg-white px-3 py-1">H1</div>
            <div className="bg-white px-3 py-1">10</div>

            <div className="bg-white px-3 py-1">10</div>
            <div className="bg-white px-3 py-1">H2</div>
            <div className="bg-white px-3 py-1">10</div>

            <div className="bg-white px-3 py-1">10</div>
            <div className="bg-white px-3 py-1">H3</div>
            <div className="bg-white px-3 py-1">10</div>
          </div>

          {/* Nhắc nhớ, cảnh cáo */}
          <SquareBox left={10} center={"Nhắc nhở nhẹ"} right={10} />
          <SquareBox left={10} center={"Nhắc nhở nhẹ"} right={10} />
          <SquareBox left={10} center={"Nhắc nhở nhẹ"} right={10} />
        </div>

        {/* Xanh */}
        <div className="w-1/3">
          <div className="flex">
            <div className="bg-blue-100 text-black  p-4 rounded-lg flex flex-col items-center w-full">
              <div className="text-[150px] font-bold">10</div>
              <div className="flex justify-between items-center mt-5">
                <div className="h-14 w-14 bg-slate-400 mr-2 flex justify-center items-center">LOGO</div>
                <div className="font-semibold text-sm mt-2">
                  <p className="py-2">DƯƠNG TRƯƠNG TUẤN HƯƠNG</p>
                  <p className="py-2">DƯƠNG TRƯƠNG TUẤN HƯƠNG</p>
                </div>
              </div>
            </div>
            {renderGDScores(gdData)}
          </div>
        </div>
      </div>
    </div>
  );
}
