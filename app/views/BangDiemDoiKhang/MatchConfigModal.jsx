import React from "react";
import { useTranslation } from "react-i18next";
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
  keyboardMode,
}) => {
  const { t } = useTranslation();
  if (!showConfigModal) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-[100] p-4 sm:p-6">
      <div className="bg-white dark:bg-gray-800 rounded shadow-xl max-w-6xl w-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header - Professional Minimalist */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700/80 bg-white dark:bg-gray-800 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t("scoreboard.doikhang.match_config")}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {t("scoreboard.doikhang.setup_parameters")}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowConfigModal(false)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700/50 rounded transition-colors border border-transparent focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 outline-none"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Content - Graceful Scroll on Small Screens */}
        <div className="p-4 sm:p-5 bg-gray-50/30 dark:bg-gray-900/20 flex-1 relative overflow-y-auto min-h-0">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 h-full">
            {/* Lệ Trái: Thông tin, Thời gian, Điều khiển */}
            <div className="xl:col-span-5 flex flex-col gap-4">
              {/* Section: Thông tin trận đấu */}
              <MatchInfoSection matchInfo={matchInfo} />

              {/* Section: Cấu hình thời gian */}
              <TimeConfigSection
                matchInfo={matchInfo}
                setMatchInfo={setMatchInfo}
              />

              {/* Section: Điều khiển trận đấu */}
              <MatchControlSection
                currentRound={currentRound}
                setCurrentRound={setCurrentRound}
                timeLeft={timeLeft}
                setTimeLeft={setTimeLeft}
                totalRounds={totalRounds}
                roundDuration={roundDuration}
              />
            </div>

            {/* Lệ Phải: Quyền hiển thị */}
            <div className="xl:col-span-7 flex flex-col gap-4">
              {/* Section: Quyền hiển thị buttons */}
              <ButtonPermissionsSection
                buttonPermissions={buttonPermissions}
                setButtonPermissions={setButtonPermissions}
                disableRedButtons={disableRedButtons}
                setDisableRedButtons={setDisableRedButtons}
                disableBlueButtons={disableBlueButtons}
                setDisableBlueButtons={setDisableBlueButtons}
                keyboardMode={keyboardMode}
              />
            </div>
          </div>
        </div>


        {/* Footer - Professional Action Bar */}
        <div className="bg-white dark:bg-gray-800 px-6 py-4 flex justify-end gap-3 items-center border-t border-gray-100 dark:border-gray-700/80">
          <button
            onClick={() => setShowConfigModal(false)}
            className="px-5 py-2 rounded text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 outline-none"
          >
            {t("scoreboard.doikhang.modal_cancel")}
          </button>
          <button
            onClick={async () => {
              const saved = await saveButtonPermissions();
              if (saved) setShowConfigModal(false);
            }}
            className="px-5 py-2 rounded text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 border border-transparent transition-colors focus:ring-2 focus:ring-indigo-500/50 outline-none shadow-sm flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {t("scoreboard.doikhang.modal_save_changes")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchConfigModal;
