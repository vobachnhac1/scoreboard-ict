import React from "react";
import { useTranslation } from "react-i18next";

/**
 * Section: Thông tin trận đấu
 * Hiển thị thông tin cơ bản về trận đấu (Hệ điểm, Số giám định, Tổng số hiệp)
 */
const MatchInfoSection = ({ matchInfo, setMatchInfo }) => {
    const { t } = useTranslation();

    return (
        <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-800/80 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-1.5 rounded">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <span>{t("scoreboard.doikhang.match_info_title")}</span>
                </h3>
            </div>

            <div className="p-4 bg-white dark:bg-gray-900 grid grid-cols-3 gap-3">
                {/* Hệ điểm */}
                <div className="group bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-3 rounded hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="text-blue-500 dark:text-blue-400">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path
                                    fillRule="evenodd"
                                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <label className="text-gray-500 dark:text-gray-400 text-[11px] font-semibold uppercase tracking-wider">
                            {t("scoreboard.doikhang.match_info_score_system")}
                        </label>
                    </div>
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {t("scoreboard.doikhang.match_info_score_system")} {matchInfo.he_diem || "2"}
                    </div>
                    <p className="text-gray-400 dark:text-gray-500 text-[10px] mt-0.5">
                        {t("scoreboard.doikhang.match_info_from_config")}
                    </p>
                </div>

                {/* Số giám định */}
                <div className="group bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-3 rounded hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="text-indigo-500 dark:text-indigo-400">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                        </div>
                        <label className="text-gray-500 dark:text-gray-400 text-[11px] font-semibold uppercase tracking-wider">
                            {t("scoreboard.doikhang.match_info_referees")}
                        </label>
                    </div>
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {matchInfo.so_giam_dinh || "3"} {t("scoreboard.doikhang.match_info_referees_short")}
                    </div>
                    <p className="text-gray-400 dark:text-gray-500 text-[10px] mt-0.5">
                        {t("scoreboard.doikhang.match_info_from_config")}
                    </p>
                </div>

                {/* Tổng số hiệp */}
                <div className="group bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-3 rounded hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="text-blue-500 dark:text-blue-400">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <label className="text-gray-500 dark:text-gray-400 text-[11px] font-semibold uppercase tracking-wider">
                            {t("scoreboard.doikhang.match_info_total_rounds")}
                        </label>
                    </div>
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {(matchInfo.so_hiep || 3) + (matchInfo.so_hiep_phu || 0)} {t("scoreboard.doikhang.match_info_rounds")}
                    </div>
                    <p className="text-gray-400 dark:text-gray-500 text-[10px] mt-0.5">
                        {matchInfo.so_hiep || 3} {t("scoreboard.doikhang.match_info_main_rounds")} + {matchInfo.so_hiep_phu || 0} {t("scoreboard.doikhang.match_info_extra_rounds")}
                    </p>
                </div>

            </div>
        </div>
    );
};

export default MatchInfoSection;
