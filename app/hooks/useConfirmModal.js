import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { message } from 'antd';

/**
 * Custom hook để sử dụng ConfirmModal
 * @returns {Object} { modalProps, showConfirm, showAlert, showWarning, showError, showSuccess }
 */
const useConfirmModal = () => {
  const { t } = useTranslation();

  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm',
    confirmText: 'OK',
    cancelText: 'Hủy',
    showCancel: true,
    onConfirm: () => { },
    onCancel: () => { }
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
        title: options.title || t('common.confirm'),
        message,
        type: 'confirm',
        confirmText: options.confirmText || t('common.ok'),
        cancelText: options.cancelText || t('common.cancel'),
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
        title: options.title || t('common.notification'),
        message,
        type: 'alert',
        confirmText: options.confirmText || t('common.ok'),
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
  const showWarning = (msg, options = {}) => {
    return new Promise((resolve) => {
      message.warning({
        content: msg,
        duration: options.duration || 4,
      });
      resolve(true); // Always resolve to true since there's no "Cancel" button in a toast
    });
  };

  /**
   * Hiển thị modal error
   * @param {string} message - Nội dung thông báo
   * @param {Object} options - Tùy chọn
   * @returns {Promise<void>}
   */
  const showError = (msg, options = {}) => {
    return new Promise((resolve) => {
      message.error({
        content: msg,
        duration: options.duration || 5,
      });
      resolve();
    });
  };

  /**
   * Hiển thị modal success
   * @param {string} message - Nội dung thông báo
   * @param {Object} options - Tùy chọn
   * @returns {Promise<void>}
   */
  const showSuccess = (msg, options = {}) => {
    return new Promise((resolve) => {
      message.success({
        content: msg,
        duration: options.duration || 3,
        className: 'custom-toast-success'
      });
      resolve();
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

