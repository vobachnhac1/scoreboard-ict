import React from "react";
import { useTranslation } from "react-i18next";

export default function ActionConfirm({ message, onConfirm, onCancel }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center text-center space-y-8">
      {/* Icon */}
      <div className="relative group">
        <div className="relative w-24 h-24 bg-blue-50 dark:bg-blue-950 rounded flex items-center justify-center border border-blue-100 dark:border-blue-800">
          <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t("competition_data_other.confirm_action")}</h3>
        <div className="max-w-xs mx-auto">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-4 w-full">
        <button
          onClick={onCancel}
          className="flex-1 py-4 px-6 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95 uppercase tracking-widest text-[11px]"
        >
          {t("competition_data_other.cancel")}
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-4 px-6 rounded bg-blue-600 text-white font-bold transition-all active:scale-95 uppercase tracking-widest text-[11px]"
        >
          {t("competition_data_other.continue")}
        </button>
      </div>
    </div>
  );
}
