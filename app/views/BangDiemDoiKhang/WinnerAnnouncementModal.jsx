import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const WinnerAnnouncementModal = ({
  showWinnerAnnouncementModal,
  announcedWinner,
  btnReturnWinner,
  btnConfirmWinner,
}) => {
  const { t } = useTranslation();
  const [winReason, setWinReason] = useState(t("scoreboard.doikhang.win_by_points"));

  useEffect(() => {
    if (showWinnerAnnouncementModal) {
      setWinReason(t("scoreboard.doikhang.win_by_points"));
    }
  }, [showWinnerAnnouncementModal, t]);

  if (!showWinnerAnnouncementModal || !announcedWinner) return null;

  const reasons = [
    { id: "win_by_points", label: t("scoreboard.doikhang.win_by_points") },
    { id: "win_absolute", label: t("scoreboard.doikhang.win_absolute") },
    { id: "win_forfeit", label: t("scoreboard.doikhang.win_forfeit") },
    { id: "win_draw", label: t("scoreboard.doikhang.win_draw") },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 transition-all duration-300">
      <div className="relative bg-gray-900 rounded p-10 max-w-2xl w-full mx-4 shadow-[0_0_60px_rgba(234,179,8,0.4)] border border-yellow-500/30 transform transition-all">
        {/* Glow effect behind the modal */}
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 via-yellow-300 to-yellow-500 rounded blur opacity-20 animate-pulse"></div>

        <div className="relative z-10">
          {/* Header với icon trophy */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full p-5 mb-5 shadow-[0_0_30px_rgba(234,179,8,0.5)] transform hover:scale-110 transition-transform duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-20 w-20 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 uppercase tracking-wider drop-shadow-md">
              {t("scoreboard.doikhang.winner_announcement_title")}
            </h2>
          </div>

          {/* Thông tin vận động viên */}
          <div
            className={`p-8 rounded mb-8 border border-white/10 shadow-2xl ${announcedWinner.team === "red"
              ? "bg-gradient-to-br from-red-600/90 to-red-900/90 shadow-red-500/30"
              : "bg-gradient-to-br from-blue-600/90 to-blue-900/90 shadow-blue-500/30"
              }`}
          >
            <div className="text-center space-y-6">
              {/* Tên vận động viên */}
              <div>
                <div className="text-sm font-semibold text-white/70 uppercase tracking-widest mb-2">
                  {t("scoreboard.doikhang.winner_announcement_athlete_name")}
                </div>
                <div className="text-5xl font-black text-white drop-shadow-lg leading-tight uppercase">
                  {announcedWinner.name}
                </div>
              </div>

              {/* Đội */}
              <div>
                <div className="text-sm font-semibold text-white/70 uppercase tracking-widest mb-2">
                  {t("scoreboard.doikhang.winner_announcement_team")}
                </div>
                <div
                  className={`inline-block px-8 py-3 rounded text-3xl font-bold text-white shadow-inner border border-white/20 uppercase ${announcedWinner.team === "red"
                    ? "bg-red-500/50"
                    : "bg-blue-500/50"
                    }`}
                >
                  {announcedWinner.matchTeamName || announcedWinner.teamName}
                </div>
              </div>
            </div>
          </div>

          {/* Lý do Thắng */}
          <div className="mb-8">
            <div className="text-center text-sm font-semibold text-white/70 uppercase tracking-widest mb-4">
              {t("scoreboard.doikhang.winner_announcement_reason")}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {reasons.map((r) => (
                <label
                  key={r.id}
                  className={`cursor-pointer group relative px-4 py-3 rounded font-bold text-center transition-all border ${winReason === r.id
                    ? "bg-yellow-500/20 text-yellow-500 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                    : "bg-gray-800/50 text-gray-400 border-white/10 hover:border-white/30 hover:bg-gray-800"
                    }`}
                >
                  <input
                    type="radio"
                    name="winReason"
                    value={r.id}
                    checked={winReason === r.id}
                    onChange={(e) => setWinReason(e.target.value)}
                    className="hidden"
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-6 mt-10">
            <button
              onClick={btnReturnWinner}
              className="group relative px-6 py-4 rounded font-bold text-lg text-white bg-gray-700 hover:bg-gray-600 transition-all shadow-lg overflow-hidden border border-gray-500/50"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                <span>{t("scoreboard.doikhang.winner_announcement_back")}</span>
              </div>
            </button>
            <button
              onClick={() => btnConfirmWinner(winReason)}
              className="group relative px-6 py-4 rounded font-bold text-lg text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 transition-all shadow-lg shadow-green-500/30 overflow-hidden border border-green-400/50"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                <span>{t("scoreboard.doikhang.winner_announcement_confirm")}</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WinnerAnnouncementModal;
