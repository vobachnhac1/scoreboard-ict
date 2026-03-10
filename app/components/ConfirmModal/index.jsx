import React, { Fragment } from "react";
import {
  Dialog,
  Transition,
  DialogPanel,
  DialogTitle,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon, QuestionMarkCircleIcon, InformationCircleIcon } from "@heroicons/react/24/solid";

const STATUS_STYLE = {
  success: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white",
  warning: "bg-gradient-to-r from-amber-500 to-amber-600 text-white",
  error: "bg-gradient-to-r from-rose-500 to-rose-600 text-white",
  confirm: "bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-800 dark:via-blue-700 dark:to-indigo-800 text-white",
};

const ConfirmModal = ({
  isOpen,
  title,
  message,
  type = "confirm",
  confirmText = "OK",
  cancelText = "Hủy",
  onConfirm,
  onCancel,
  showCancel = type === "confirm",
}) => {
  const currentStatus = type === "error" ? "error" : type;
  const headerClass = STATUS_STYLE[currentStatus] || STATUS_STYLE.confirm;

  const getIcon = () => {
    switch (type) {
      case "warning": return <ExclamationTriangleIcon className="w-12 h-12 text-amber-500" />;
      case "error": return <XCircleIcon className="w-12 h-12 text-rose-500" />;
      case "success": return <CheckCircleIcon className="w-12 h-12 text-emerald-500" />;
      case "confirm": return <QuestionMarkCircleIcon className="w-12 h-12 text-blue-500" />;
      default: return <InformationCircleIcon className="w-12 h-12 text-gray-500" />;
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case "warning": return "bg-amber-500 hover:bg-amber-600";
      case "error": return "bg-rose-600 hover:bg-rose-700";
      case "success": return "bg-emerald-600 hover:bg-emerald-700";
      default: return "bg-blue-600 hover:bg-blue-700";
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onCancel} className="relative z-[9999]">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95 translate-y-4"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-4"
          >
            <DialogPanel className="w-full max-w-sm rounded-3xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col">
              {/* Header */}
              <div className={`flex items-center justify-between px-6 py-4 ${headerClass}`}>
                <DialogTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2 m-0">
                  {title || "Thông báo"}
                </DialogTitle>
                <button
                  onClick={onCancel}
                  className="text-white/80 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/20"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-8 flex flex-col items-center text-center">
                <div className="mb-6 transform transition-transform hover:scale-110 duration-300">
                  {getIcon()}
                </div>
                <div className="text-sm font-bold text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {message}
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 pb-8 pt-0 flex gap-3">
                {showCancel && (
                  <button
                    onClick={onCancel}
                    className="flex-1 px-4 py-3.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                  >
                    {cancelText}
                  </button>
                )}
                <button
                  onClick={onConfirm}
                  className={`flex-1 px-4 py-3.5 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${getConfirmButtonClass()}`}
                >
                  {confirmText}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ConfirmModal;
