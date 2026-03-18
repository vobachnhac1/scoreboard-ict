import React from 'react';

const ManagementBar = ({
    showControlBar,
    isMedicalTime,
    handleStopMedical,
    btnGoBack,
    resetTimer,
    setShowHistoryModal,
    setShowConfigModal,
    btnFinishMatch,
    btnPreviousMatch,
    btnNextMatch,
    btnExtraRound,
    isSoundEnabled,
    setIsSoundEnabled,
    stopAllAudios,
    buttonPermissions,
    t
}) => {
    if (!showControlBar) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 w-full backdrop-blur-sm z-50">
            <div className="max-w-[1920px] mx-auto px-2 p-3 mb-16 ">
                <div className="flex items-center justify-center gap-3 flex-wrap">
                    {/* Nút kết thúc thời gian y tế */}
                    {isMedicalTime && (
                        <button
                            onClick={handleStopMedical}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center font-bold text-sm gap-2 transition-colors animate-pulse"
                        >
                            {t("scoreboard.doikhang.stop_medical")}
                        </button>
                    )}

                    {/* Nút Thoát */}
                    <button
                        onClick={btnGoBack}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-all text-sm hover:shadow-xl"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                        </svg>
                        {t("scoreboard.doikhang.control_exit")}
                    </button>

                    {/* Nút Reset */}
                    <button
                        onClick={resetTimer}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-all text-sm hover:shadow-xl"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        {t("scoreboard.doikhang.control_reset")}
                    </button>

                    {/* Nút Lịch sử */}
                    <button
                        onClick={() => setShowHistoryModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-all text-sm hover:shadow-xl"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {t("scoreboard.doikhang.control_history")}
                    </button>

                    {/* Nút Cấu hình */}
                    <button
                        onClick={() => setShowConfigModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-all text-sm hover:shadow-xl"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                        {t("scoreboard.doikhang.control_config")}
                    </button>

                    {/* Nút Kết thúc */}
                    {buttonPermissions.hien_thi_button_ket_thuc && (
                        <button
                            onClick={btnFinishMatch}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-all text-sm hover:shadow-xl"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {t("scoreboard.doikhang.control_finish")}
                        </button>
                    )}

                    {buttonPermissions.hien_thi_button_tran_truoc && (
                        <button
                            onClick={btnPreviousMatch}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-all text-sm hover:shadow-xl"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {t("scoreboard.doikhang.control_prev_match")}
                        </button>
                    )}

                    {/* Nút Trận sau */}
                    {buttonPermissions.hien_thi_button_tran_tiep_theo && (
                        <button
                            onClick={btnNextMatch}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-all text-sm hover:shadow-xl"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            {t("scoreboard.doikhang.control_next_match")}
                        </button>
                    )}

                    {/* Nút Hiệp phụ */}
                    {buttonPermissions.hien_thi_button_hiep_phu && (
                        <button
                            onClick={btnExtraRound}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-all text-sm hover:shadow-xl"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            {t("scoreboard.doikhang.control_extra_round")}
                        </button>
                    )}

                    {/* Nút Tắt/Bật âm thanh */}
                    <button
                        onClick={() => {
                            stopAllAudios();
                            setIsSoundEnabled(!isSoundEnabled);
                        }}
                        className={`${isSoundEnabled ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"} text-white px-4 py-2 rounded flex items-center gap-2 transition-all text-sm hover:shadow-xl`}
                    >
                        {isSoundEnabled ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        )}
                        {isSoundEnabled ? t("scoreboard.doikhang.sound_on") : t("scoreboard.doikhang.sound_off")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManagementBar;
