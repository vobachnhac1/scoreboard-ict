import React from "react";
import { useTranslation } from "react-i18next";

/**
 * Section: Cấu hình Giao diện Bảng điểm
 * Cho phép tùy chỉnh Theme, Layout và Màu sắc hiển thị
 */
const UIConfigSection = ({ matchInfo, setMatchInfo }) => {
    const { t } = useTranslation();

    const handleConfigChange = (key, value) => {
        setMatchInfo((prev) => ({
            ...prev,
            config_system: {
                ...(prev.config_system || {}),
                [key]: value,
            },
        }));
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-800/80 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-1.5 rounded">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 00-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                        </svg>
                    </div>
                    <span>{t("scoreboard.doikhang.ui_config_title", "Cấu hình Giao diện")}</span>
                </h3>
            </div>

            <div className="p-4 bg-white dark:bg-gray-900 flex flex-col gap-4">
                {/* Hàng 1: Theme và Layout */}
                <div className="grid grid-cols-2 gap-4">
                    {/* UI Theme Selection */}
                    <div className="flex flex-col gap-2">
                        <label className="text-gray-500 dark:text-gray-400 text-[11px] font-semibold uppercase tracking-wider">
                            {t("scoreboard.doikhang.ui_theme_label", "Giao diện Bảng điểm")}
                        </label>
                        <select
                            value={matchInfo.config_system?.ui_theme || "default"}
                            onChange={(e) => handleConfigChange("ui_theme", e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm font-medium"
                        >
                            <option value="default">{t("scoreboard.doikhang.ui_theme_default", "Mặc định")}</option>
                            <option value="custom1">{t("scoreboard.doikhang.ui_theme_custom1", "Custom 1 (High-Tech)")}</option>
                        </select>
                    </div>

                    {/* Score Layout Selection */}
                    <div className="flex flex-col gap-2">
                        <label className="text-gray-500 dark:text-gray-400 text-[11px] font-semibold uppercase tracking-wider">
                            {t("scoreboard.doikhang.score_layout_label", "Bố cục cột điểm")}
                        </label>
                        <select
                            value={matchInfo.config_system?.gd_display_mode || "vertical"}
                            onChange={(e) => handleConfigChange("gd_display_mode", e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm font-medium"
                        >
                            <option value="vertical">{t("scoreboard.doikhang.score_layout_vertical", "Dọc hai bên")}</option>
                            <option value="horizontal">{t("scoreboard.doikhang.score_layout_horizontal", "Ngang (Dưới tên VĐV)")}</option>
                        </select>
                    </div>
                </div>

                {/* Hàng 2: Màu sắc Header */}
                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                    {/* Header Title Color */}
                    <div className="flex flex-col gap-2">
                        <label className="text-gray-500 dark:text-gray-400 text-[11px] font-semibold uppercase tracking-wider">
                            {t("scoreboard.doikhang.header_title_color", "Màu tiêu đề giải đấu")}
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={matchInfo.config_system?.header_title_color_doikhang || "#FBBF24"}
                                onChange={(e) => handleConfigChange("header_title_color_doikhang", e.target.value)}
                                className="h-9 w-16 bg-transparent border-none cursor-pointer"
                            />
                            <input
                                type="text"
                                value={matchInfo.config_system?.header_title_color_doikhang || "#FBBF24"}
                                onChange={(e) => handleConfigChange("header_title_color_doikhang", e.target.value)}
                                className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            />
                        </div>
                    </div>

                    {/* Header Desc Color */}
                    <div className="flex flex-col gap-2">
                        <label className="text-gray-500 dark:text-gray-400 text-[11px] font-semibold uppercase tracking-wider">
                            {t("scoreboard.doikhang.header_desc_color", "Màu tên môn thi")}
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={matchInfo.config_system?.header_desc_color_doikhang || "#D1D5DB"}
                                onChange={(e) => handleConfigChange("header_desc_color_doikhang", e.target.value)}
                                className="h-9 w-16 bg-transparent border-none cursor-pointer"
                            />
                            <input
                                type="text"
                                value={matchInfo.config_system?.header_desc_color_doikhang || "#D1D5DB"}
                                onChange={(e) => handleConfigChange("header_desc_color_doikhang", e.target.value)}
                                className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            />
                        </div>
                    </div>
                </div>

                {/* Hàng 3: Cấu hình Nền (Background) */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                    <label className="text-gray-500 dark:text-gray-400 text-[11px] font-semibold uppercase tracking-wider mb-3 block">
                        {t("scoreboard.doikhang.background_config", "Cấu hình hình nền")}
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Type Selection */}
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={(matchInfo.config_system?.bg_doikhang_type || "color") === "color"}
                                        onChange={() => handleConfigChange("bg_doikhang_type", "color")}
                                        className="text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="text-sm dark:text-gray-300">{t("scoreboard.doikhang.bg_color", "Màu sắc")}</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={matchInfo.config_system?.bg_doikhang_type === "image"}
                                        onChange={() => handleConfigChange("bg_doikhang_type", "image")}
                                        className="text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="text-sm dark:text-gray-300">{t("scoreboard.doikhang.bg_image", "Hình ảnh")}</span>
                                </label>
                            </div>
                        </div>

                        {/* Color Picker or Image URL */}
                        <div className="flex flex-col gap-2">
                            {(matchInfo.config_system?.bg_doikhang_type || "color") === "color" ? (
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={matchInfo.config_system?.bg_doikhang_color || "#1e3a8a"}
                                        onChange={(e) => handleConfigChange("bg_doikhang_color", e.target.value)}
                                        className="h-9 w-16 bg-transparent border-none cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={matchInfo.config_system?.bg_doikhang_color || "#1e3a8a"}
                                        onChange={(e) => handleConfigChange("bg_doikhang_color", e.target.value)}
                                        className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={matchInfo.config_system?.bg_doikhang_image || ""}
                                        onChange={(e) => handleConfigChange("bg_doikhang_image", e.target.value)}
                                        placeholder="/assets/background.jpg"
                                        className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Opacity Slider */}
                    <div className="flex flex-col gap-2 mt-4">
                        <div className="flex justify-between items-center">
                            <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                {t("scoreboard.doikhang.bg_opacity", "Độ rõ lớp phủ (Overlay Opacity)")}
                            </label>
                            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{matchInfo.config_system?.bg_doikhang_opacity ?? 100}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={matchInfo.config_system?.bg_doikhang_opacity ?? 100}
                            onChange={(e) => handleConfigChange("bg_doikhang_opacity", parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UIConfigSection;
