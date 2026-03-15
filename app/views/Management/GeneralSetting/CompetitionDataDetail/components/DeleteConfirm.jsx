import React from "react";
import { useTranslation } from "react-i18next";
import Button from "../../../../../components/Button";

export default function DeleteConfirm({ onConfirm, onCancel }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6 p-4 rounded">
      {/* Icon cảnh báo */}
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-red-600 dark:text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Nội dung */}
      <div className="text-center space-y-2">
        {/* <p className="text-xl font-bold text-gray-900 dark:text-white">{t("competition_detail.confirm.delete_title")}</p> */}
        <p className="text-base text-gray-700 dark:text-gray-300">
          {t("competition_detail.confirm.delete_message")}
        </p>
        <p className="text-sm text-red-600 dark:text-red-400 font-medium">
          {t("competition_detail.confirm.delete_warning")}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-3 pt-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="px-6 py-2.5 min-w-[120px]"
        >
          {t("competition_detail.buttons.cancel")}
        </Button>
        <Button
          variant="none"
          className="bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-800 px-6 py-2.5 min-w-[120px] font-semibold shadow-md hover:shadow-lg transition-all"
          onClick={onConfirm}
        >
          {t("competition_detail.actions.delete")}
        </Button>
      </div>
    </div>
  );
}
