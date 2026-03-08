import React from "react";
import { useTranslation } from "react-i18next";
import Button from "../../../../../components/Button";

export default function ActionConfirm({ message, onConfirm, onCancel }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6 p-4 rounded">
      {/* Icon xác nhận */}
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-blue-600 dark:text-blue-400"
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
      </div>

      {/* Nội dung */}
      <div className="text-center">
        {/* <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">Xác nhận</p> */}
        <p className="text-base text-gray-700 dark:text-gray-300">{message}</p>
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
          variant="primary"
          onClick={onConfirm}
          className="px-6 py-2.5 min-w-[120px] font-semibold shadow-md hover:shadow-lg transition-all"
        >
          {t("competition_detail.buttons.confirm")}
        </Button>
      </div>
    </div>
  );
}
