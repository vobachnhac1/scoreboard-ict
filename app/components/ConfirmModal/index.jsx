import React from "react";

/**
 * Modal thông báo chung
 * @param {Object} props
 * @param {boolean} props.isOpen - Hiển thị modal
 * @param {string} props.title - Tiêu đề modal
 * @param {string} props.message - Nội dung thông báo
 * @param {string} props.type - Loại modal: 'confirm' | 'alert' | 'warning' | 'error' | 'success'
 * @param {string} props.confirmText - Text button xác nhận (mặc định: 'OK')
 * @param {string} props.cancelText - Text button hủy (mặc định: 'Hủy')
 * @param {Function} props.onConfirm - Callback khi click OK
 * @param {Function} props.onCancel - Callback khi click Hủy
 * @param {boolean} props.showCancel - Hiển thị button Hủy (mặc định: true cho confirm, false cho alert)
 */
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
  if (!isOpen) return null;

  // Icon theo type
  const getIcon = () => {
    switch (type) {
      case "warning":
        return (
          <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center text-amber-500 mx-auto mb-6 border-2 border-amber-100 dark:border-amber-800 shadow-lg shadow-amber-500/10">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
        );
      case "error":
        return (
          <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/30 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-6 border-2 border-rose-100 dark:border-rose-800 shadow-lg shadow-rose-500/10">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        );
      case "success":
        return (
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center text-emerald-500 mx-auto mb-6 border-2 border-emerald-100 dark:border-emerald-800 shadow-lg shadow-emerald-500/10">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        );
      case "confirm":
        return (
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center text-blue-500 mx-auto mb-6 border-2 border-blue-100 dark:border-blue-800 shadow-lg shadow-blue-500/10">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        );
      default:
        return (
          <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/30 rounded-3xl flex items-center justify-center text-gray-500 mx-auto mb-6 border-2 border-gray-100 dark:border-gray-700 shadow-lg">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        );
    }
  };

  // Button style theo type
  const getConfirmButtonClass = () => {
    switch (type) {
      case "warning":
        return "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20";
      case "error":
        return "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20";
      case "success":
        return "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20";
      default:
        return "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20";
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-blue-950/40 dark:bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onCancel}
      />

      {/* Modal Card */}
      <div className="relative bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] max-w-md w-full mx-4 p-10 animate-scale-in border border-blue-50/50 dark:border-blue-900/30 overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>

        {/* Icon Area */}
        {getIcon()}

        {/* Text Content */}
        <div className="text-center mb-10">
          {title && (
            <h3 className="text-2xl font-black text-blue-950 dark:text-blue-50 tracking-tight mb-3 uppercase">
              {title}
            </h3>
          )}
          <div className="text-sm font-bold text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-line px-2">
            {message}
          </div>
        </div>

        {/* Action Toolbar */}
        <div className={`flex gap-4 ${showCancel ? "flex-row" : "flex-col items-center"}`}>
          {showCancel && (
            <button
              onClick={onCancel}
              className="flex-1 px-8 py-4 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 border-2 border-gray-100 dark:border-gray-800"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`flex-1 px-8 py-4 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${getConfirmButtonClass()}`}
          >
            {confirmText === "OK" ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            ) : null}
            {confirmText}
          </button>
        </div>
      </div>

      {/* Enhanced Animation CSS */}
      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.95) translateY(10px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
};

export default ConfirmModal;
