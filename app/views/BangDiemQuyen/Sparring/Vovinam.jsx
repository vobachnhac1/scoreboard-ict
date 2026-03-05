import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import useConfirmModal from "../../../hooks/useConfirmModal";
import ConfirmModal from "../../../components/ConfirmModal";

export default function Vovinam() {
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy dữ liệu từ state
  const matchData = location.state?.matchData || {};
  const returnUrl = location.state?.returnUrl || "/management/competition-data";

  // Modal hook
  const { modalProps, showConfirm } = useConfirmModal();

  // Debug log
  useEffect(() => {
    console.log("🔍 Vovinam - location.state:", location.state);
    console.log("🔍 Vovinam - matchData:", matchData);
  }, []);

  // State cho điểm số và thời gian
  const [redScore, setRedScore] = useState(0);
  const [blueScore, setBlueScore] = useState(0);
  const [time, setTime] = useState("03:00");
  const [round, setRound] = useState("HIỆP 1");

  const renderGDScores = (colors) => (
    <div className="grid grid-cols-5 gap-1 mt-2 w-full text-black text-center text-sm font-bold">
      {colors.map((colorRow, rowIndex) =>
        colorRow.map((gd, i) => (
          <div
            key={`${rowIndex}-${i}`}
            className={`py-1 px-2 ${rowIndex === 0 ? "bg-yellow-200" : rowIndex === 1 ? "bg-green-200" : "bg-rose-200"}`}
          >
            {gd}
          </div>
        )),
      )}
    </div>
  );

  const gdData = [
    ["GD1", "GD2", "GD3", "GD4", "GD5"],
    ["GD1", "GD2", "GD3", "GD4", "GD5"],
    ["GD1", "GD2", "GD3", "GD4", "GD5"],
  ];

  // Hàm quay lại
  const handleGoBack = async () => {
    const confirmExit = await showConfirm(
      t("quyen.confirm_exit_message"),
      {
        title: t("quyen.confirm_exit_title"),
        confirmText: t("quyen.confirm_exit_yes"),
        cancelText: t("quyen.confirm_exit_no"),
      },
    );
    if (confirmExit) {
      navigate(returnUrl);
    }
  };

  return (
    <div className="bg-black min-h-screen text-white p-6 flex flex-col items-center relative">
      {/* Nút quay lại */}
      <button
        onClick={handleGoBack}
        className="absolute top-4 left-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors z-10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Quay lại
      </button>

      {/* Header */}
      <Header
        title={matchData.competition_name || "GIẢI VÔ ĐỊCH VOVINAM"}
        desc="TOÀN QUỐC LẦN THỨ 20 NĂM 2023"
      />
      {/* Scoreboard */}
      <div className="flex w-full max-w-6xl justify-between items-start mt-4">
        {/* Đỏ */}
        <div className="w-1/3">
          <div className="bg-red-100 text-black  p-4 rounded-lg flex flex-col items-center">
            <div className="text-[150px] font-bold">{redScore}</div>
            <div className="flex justify-between items-center">
              <div className="h-14 w-14 bg-slate-400 mr-2 flex justify-center items-center text-xs">
                LOGO
              </div>
              <div className="font-semibold text-sm mt-2">
                <p>{matchData.red?.name || "VĐV ĐỎ"}</p>
                <p>{matchData.red?.unit || ""}</p>
              </div>
            </div>
          </div>
          {renderGDScores(gdData)}
        </div>

        {/* Giữa */}
        <div className="flex flex-col items-center justify-center space-y-3 px-2">
          <p className="font-semibold">TRẬN SỐ {matchData.match_no || "---"}</p>
          <p>VÒNG LOẠI</p>
          <p>HẠNG CÂN {matchData.weight_class || "---"}</p>
          <div className="bg-white text-black font-bold text-xl px-4 py-1 rounded">
            {round}
          </div>
          <div className="bg-white text-black font-bold text-3xl px-6 py-2 rounded">
            {time}
          </div>

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

          {/* Nhắc nhớ, cảnh cáo */}
          <div className="grid grid-cols-3 gap-2 mt-2 text-black text-sm">
            <div className="bg-white px-2 py-1">10</div>
            <div className="bg-white px-2 py-1">NHẮC NHỞ</div>
            <div className="bg-white px-2 py-1">10</div>

            <div className="bg-white px-2 py-1">10</div>
            <div className="bg-white px-2 py-1">CẢNH CÁO</div>
            <div className="bg-white px-2 py-1">10</div>
          </div>
        </div>

        {/* Xanh */}
        <div className="w-1/3">
          <div className="bg-sky-200 text-black p-4 rounded-lg flex flex-col items-center">
            <div className="text-[150px] font-bold">{blueScore}</div>
            <div className="flex justify-between items-center">
              <div className="font-semibold text-sm mt-2">
                <p>{matchData.blue?.name || "VĐV XANH"}</p>
                <p>{matchData.blue?.unit || ""}</p>
              </div>
              <div className="h-14 w-14 bg-slate-400 ml-2 flex justify-center items-center text-xs">
                LOGO
              </div>
            </div>
          </div>
          {renderGDScores(gdData)}
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal {...modalProps} />
    </div>
  );
}
