import { useState } from 'react';

/**
 * Custom hook để sử dụng ConfirmModal
 * @returns {Object} { modalProps, showConfirm, showAlert, showWarning, showError, showSuccess }
 */
const useConfirmModal = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm',
    confirmText: 'OK',
    cancelText: 'Hủy',
    showCancel: true,
    onConfirm: () => {},
    onCancel: () => {}
  });

  /**
   * Đóng modal
   */
  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  /**
   * Hiển thị modal confirm
   * @param {string} message - Nội dung thông báo
   * @param {Object} options - Tùy chọn
   * @returns {Promise<boolean>} - true nếu user click OK, false nếu click Cancel
   */
  const showConfirm = (message, options = {}) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title: options.title || 'Xác nhận',
        message,
        type: 'confirm',
        confirmText: options.confirmText || 'OK',
        cancelText: options.cancelText || 'Hủy',
        showCancel: true,
        onConfirm: () => {
          closeModal();
          resolve(true);
        },
        onCancel: () => {
          closeModal();
          resolve(false);
        }
      });
    });
  };

  /**
   * Hiển thị modal alert
   * @param {string} message - Nội dung thông báo
   * @param {Object} options - Tùy chọn
   * @returns {Promise<void>}
   */
  const showAlert = (message, options = {}) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title: options.title || 'Thông báo',
        message,
        type: 'alert',
        confirmText: options.confirmText || 'OK',
        cancelText: '',
        showCancel: false,
        onConfirm: () => {
          closeModal();
          resolve();
        },
        onCancel: () => {
          closeModal();
          resolve();
        }
      });
    });
  };

  /**
   * Hiển thị modal warning
   * @param {string} message - Nội dung thông báo
   * @param {Object} options - Tùy chọn
   * @returns {Promise<boolean>}
   */
  const showWarning = (message, options = {}) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title: options.title || '⚠️ Cảnh báo',
        message,
        type: 'warning',
        confirmText: options.confirmText || 'Tiếp tục',
        cancelText: options.cancelText || 'Hủy',
        showCancel: options.showCancel !== false,
        onConfirm: () => {
          closeModal();
          resolve(true);
        },
        onCancel: () => {
          closeModal();
          resolve(false);
        }
      });
    });
  };

  /**
   * Hiển thị modal error
   * @param {string} message - Nội dung thông báo
   * @param {Object} options - Tùy chọn
   * @returns {Promise<void>}
   */
  const showError = (message, options = {}) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title: options.title || '❌ Lỗi',
        message,
        type: 'error',
        confirmText: options.confirmText || 'Đóng',
        cancelText: '',
        showCancel: false,
        onConfirm: () => {
          closeModal();
          resolve();
        },
        onCancel: () => {
          closeModal();
          resolve();
        }
      });
    });
  };

  /**
   * Hiển thị modal success
   * @param {string} message - Nội dung thông báo
   * @param {Object} options - Tùy chọn
   * @returns {Promise<void>}
   */
  const showSuccess = (message, options = {}) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title: options.title || '✅ Thành công',
        message,
        type: 'success',
        confirmText: options.confirmText || 'OK',
        cancelText: '',
        showCancel: false,
        onConfirm: () => {
          closeModal();
          resolve();
        },
        onCancel: () => {
          closeModal();
          resolve();
        }
      });
    });
  };

  return {
    modalProps: modalState,
    showConfirm,
    showAlert,
    showWarning,
    showError,
    showSuccess,
    closeModal
  };
};

export default useConfirmModal;

