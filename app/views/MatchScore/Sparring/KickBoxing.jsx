import React from "react";
import Header from "../components/Header";

export default function Vovinam() {
  const renderGDScores = (colors) => (
    <div className="grid grid-cols-5 gap-1 mt-2 w-full text-black text-center text-sm font-bold">
      {colors.map((colorRow, rowIndex) =>
        colorRow.map((gd, i) => (
          <div key={`${rowIndex}-${i}`} className={`py-1 px-2 ${rowIndex === 0 ? "bg-yellow-200" : rowIndex === 1 ? "bg-green-200" : "bg-rose-200"}`}>
            {gd}
          </div>
        ))
      )}
    </div>
  );

  const gdData = [
    ["GD1", "GD2", "GD3", "GD4", "GD5"],
    ["9", "9", "9", "9", "9"],
  ];

  return (
    <div className="bg-black min-h-screen text-white p-6 flex flex-col items-center">
      {/* Header */}
      <Header title="GIẢI VÔ ĐỊCH KickBoxing" desc="TOÀN QUỐC LẦN THỨ 20 NĂM 2023" />
      {/* Scoreboard */}
      <div className="flex w-full max-w-6xl justify-around items-start mt-4">
        {/* Đỏ */}
        <div className="w-1/3">
          <div className="flex items-center gap-2">
            <div className="flex justify-center items-center gap-1">
              <div className="h-14 w-14 bg-slate-400 flex justify-center items-center">LOGO ĐV</div>
              <div className="h-14 w-14 bg-slate-400 flex justify-center items-center">Hình ảnh</div>
            </div>
            <div className="font-semibold text-sm mt-2">
              <p className="py-1">DƯƠNG TRƯƠNG TUẤN HƯƠNG</p>
              <p className="py-1">Đơn vị: abc</p>
            </div>
          </div>
          <div className="bg-red-100 text-black  p-4 rounded-lg flex flex-col items-center mt-2">
            <div className="text-[150px] font-bold">10</div>
          </div>
          {renderGDScores(gdData)}
        </div>

        {/* Giữa */}
        <div className="flex flex-col items-center justify-center space-y-3 px-2">
          <p className="font-semibold">TRẬN SỐ 200</p>
          <p>VÒNG LOẠI</p>
          <p>HẠNG CÂN</p>
          <div className="bg-white text-black font-bold text-xl px-4 py-1 rounded">HIỆP PHỤ</div>
          <div className="bg-white text-black font-bold text-3xl px-6 py-2 rounded">03:30</div>

          {/* Bảng điểm nhỏ */}
          <div className="grid grid-cols-3 gap-2 text-black text-sm mt-2">
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
        </div>

        {/* Xanh */}
        <div className="w-1/3">
          <div className="flex flex-row-reverse items-center gap-2">
            <div className="flex justify-center items-center gap-1">
              <div className="h-14 w-14 bg-slate-400 flex justify-center items-center">LOGO ĐV</div>
              <div className="h-14 w-14 bg-slate-400 flex justify-center items-center">Hình ảnh</div>
            </div>
            <div className="font-semibold text-sm mt-2">
              <p className="py-1 text-right">DƯƠNG TRƯƠNG TUẤN HƯƠNG</p>
              <p className="py-1 text-right">Đơn vị: abc</p>
            </div>
          </div>
          <div className="bg-blue-100 text-black  p-4 rounded-lg flex flex-col items-center mt-2">
            <div className="text-[150px] font-bold">10</div>
          </div>
          {renderGDScores(gdData)}
        </div>
      </div>
    </div>
  );
}
