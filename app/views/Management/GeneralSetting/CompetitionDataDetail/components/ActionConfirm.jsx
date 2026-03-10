import React from "react";
import { useTranslation } from "react-i18next";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/solid";

export default function ActionConfirm({ message, onConfirm, onCancel }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center max-w-sm mx-auto py-4">
      {/* Icon Area */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full scale-125 animate-pulse"></div>
        <div className="relative w-20 h-20 bg-blue-50 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-xl">
          <QuestionMarkCircleIcon className="w-12 h-12 text-blue-600 dark:text-blue-400 drop-shadow-md" />
        </div>
      </div>

      {/* Content Area */}
      <div className="text-center mb-8 space-y-2 px-4">
        <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
          {t("competition_detail.confirm.action_title", "Xác nhận")}
        </h4>
        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 leading-relaxed max-w-[280px] mx-auto">
          {message}
        </p>
      </div>

      {/* Buttons Area */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center mt-4">
        <button
          onClick={onCancel}
          className="flex-1 px-8 py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600"
        >
          {t("competition_detail.buttons.cancel")}
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 group"
        >
          {t("competition_detail.buttons.confirm")}
          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
