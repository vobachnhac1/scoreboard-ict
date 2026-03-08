import React from "react";
import { useTranslation } from "react-i18next";

export default function DeleteConfirm({ onConfirm, onCancel }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center text-center space-y-8">
      {/* Icon */}
      <div className="relative group">
        <div className="relative w-24 h-24 bg-rose-50 dark:bg-rose-950 rounded-3xl flex items-center justify-center border border-rose-100 dark:border-rose-800">
          <svg className="w-12 h-12 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t('competition_data_other.system_warning')}</h3>
        <div className="max-w-xs mx-auto">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">
            {t('competition_data_other.delete_warning_message_1')} <span className="text-rose-600 font-bold">{t('competition_data_other.delete_permanently')}</span> {t('competition_data_other.delete_warning_message_2')}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-4 w-full">
        <button
          onClick={onCancel}
          className="flex-1 py-4 px-6 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95 uppercase tracking-widest text-[11px]"
        >
          {t('competition_data_other.keep_record')}
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-4 px-6 rounded-2xl bg-rose-600 text-white font-bold transition-all active:scale-95 uppercase tracking-widest text-[11px]"
        >
          {t('competition_data_other.confirm_delete')}
        </button>
      </div>
    </div>
  );
}
