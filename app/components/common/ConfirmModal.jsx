import React from 'react';

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
  type = 'confirm',
  confirmText = 'OK',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
  showCancel = type === 'confirm'
}) => {
  if (!isOpen) return null;

  // Icon theo type
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return (
          <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'success':
        return (
          <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'confirm':
        return (
          <svg className="w-16 h-16 text-blue-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  // Button color theo type
  const getConfirmButtonClass = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-scale-in">
        {/* Icon */}
        {getIcon()}
        
        {/* Title */}
        {title && (
          <h3 className="text-2xl font-bold text-gray-800 text-center mb-3">
            {title}
          </h3>
        )}
        
        {/* Message */}
        <div className="text-gray-600 text-center mb-6 whitespace-pre-line">
          {message}
        </div>
        
        {/* Buttons */}
        <div className={`flex gap-3 ${showCancel ? 'justify-between' : 'justify-center'}`}>
          {showCancel && (
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`flex-1 px-6 py-3 text-white rounded-lg font-semibold transition-colors ${getConfirmButtonClass()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
      
      {/* Animation CSS */}
      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ConfirmModal;

