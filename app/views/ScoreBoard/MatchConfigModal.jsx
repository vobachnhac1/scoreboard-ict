import React from "react";
import MatchInfoSection from "./MatchConfigModal/MatchInfoSection";
import MatchControlSection from "./MatchConfigModal/MatchControlSection";
import TimeConfigSection from "./MatchConfigModal/TimeConfigSection";
import ButtonPermissionsSection from "./MatchConfigModal/ButtonPermissionsSection";

/**
 * Modal Cấu hình trận đấu - Redesigned
 * Component riêng để quản lý modal cấu hình
 */
const MatchConfigModal = ({
  showConfigModal,
  setShowConfigModal,
  matchInfo,
  setMatchInfo,
  buttonPermissions,
  setButtonPermissions,
  disableRedButtons,
  setDisableRedButtons,
  disableBlueButtons,
  setDisableBlueButtons,
  saveButtonPermissions,
  currentRound,
  setCurrentRound,
  timeLeft,
  setTimeLeft,
  totalRounds,
  roundDuration,
}) => {
  if (!showConfigModal) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header - Modern Design */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-700 px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  Cấu hình trận đấu
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  Điều chỉnh thông số và quyền hiển thị
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowConfigModal(false)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-2 rounded transition-all hover:rotate-90 duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          {/* Decorative gradient line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
        </div>

        {/* Content - Scrollable */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)] bg-gradient-to-br from-gray-50 to-white">
          <div className="space-y-8">
            {/* Section: Thông tin trận đấu */}
            <MatchInfoSection matchInfo={matchInfo} />

            {/* Section: Điều khiển trận đấu */}
            <MatchControlSection
              currentRound={currentRound}
              setCurrentRound={setCurrentRound}
              timeLeft={timeLeft}
              setTimeLeft={setTimeLeft}
              totalRounds={totalRounds}
              roundDuration={roundDuration}
            />

            {/* Section: Cấu hình thời gian */}
            <TimeConfigSection
              matchInfo={matchInfo}
              setMatchInfo={setMatchInfo}
            />

            {/* Section: Quyền hiển thị buttons */}
            <ButtonPermissionsSection
              buttonPermissions={buttonPermissions}
              setButtonPermissions={setButtonPermissions}
              disableRedButtons={disableRedButtons}
              setDisableRedButtons={setDisableRedButtons}
              disableBlueButtons={disableBlueButtons}
              setDisableBlueButtons={setDisableBlueButtons}
            />
          </div>
        </div>

        {/* Footer - Redesigned */}
        <div className="bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 px-8 py-5 pb-8 flex justify-end gap-4 border-t-2 border-gray-300">
          <button
            onClick={() => setShowConfigModal(false)}
            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-3 rounded font-bold transition-all shadow-md hover:shadow-lg hover:scale-105 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Hủy
          </button>
          <button
            onClick={async () => {
              // Lưu button permissions về server
              const saved = await saveButtonPermissions();
              if (saved) {
                setShowConfigModal(false);
              }
            }}
            className="bg-gradient-to-r from-green-600 via-green-700 to-green-700 hover:from-green-700 hover:via-green-800 hover:to-green-800 text-white px-8 py-3 rounded font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchConfigModal;
