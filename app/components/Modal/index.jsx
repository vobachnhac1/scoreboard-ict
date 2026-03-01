import React, { Fragment } from "react";
import {
  Dialog,
  Transition,
  DialogPanel,
  DialogTitle,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";

const STATUS_STYLE = {
  success: "bg-gradient-to-r from-green-500 to-green-600 text-white",
  warning: "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white",
  danger: "bg-gradient-to-r from-red-500 to-red-600 text-white",
  primary: "bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-800 dark:via-blue-700 dark:to-indigo-800 text-white",
};

const Modal = ({
  isOpen,
  onClose,
  title,
  status = "primary",
  headerClass = null,
  width,
  height,
  size = "default",
  children,
}) => {
  const customHeaderClass = headerClass
    ? headerClass
    : STATUS_STYLE[status] || STATUS_STYLE.primary;

  // Define size presets
  const sizePresets = {
    small: { maxWidth: "max-w-sm", padding: "p-5" },
    default: { maxWidth: "max-w-md", padding: "p-5" },
    large: { maxWidth: "max-w-2xl", padding: "p-6" },
    xl: { maxWidth: "max-w-4xl", padding: "p-6" },
    full: { maxWidth: "max-w-7xl w-full h-full", padding: "p-4" },
  };

  // Tạo style cho width và height
  const modalStyle = {};
  if (width) {
    modalStyle.width = typeof width === "number" ? `${width}px` : width;
    modalStyle.maxWidth = typeof width === "number" ? `${width}px` : width;
  }
  if (height) {
    modalStyle.height = typeof height === "number" ? `${height}px` : height;
    modalStyle.maxHeight = typeof height === "number" ? `${height}px` : height;
  }

  // Determine panel class based on size or custom width
  const sizeConfig = sizePresets[size] || sizePresets.default;
  const panelClass = width
    ? "w-full rounded bg-white dark:bg-gray-900 shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col"
    : `w-full ${sizeConfig.maxWidth} rounded bg-white dark:bg-gray-900 shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col`;

  // Container class for full size
  const containerClass =
    size === "full"
      ? "fixed inset-0 flex items-center justify-center p-4 z-50"
      : "fixed inset-0 flex items-center justify-center p-4 z-50";

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        onClose={(event) => {
          // @ts-ignore
          if (event?.target?.dataset?.dialog !== "panel") return;
          onClose();
        }}
        className="relative z-50"
      >
        {/* Overlay */}
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

        {/* Modal container */}
        <div className={containerClass}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel className={panelClass} style={modalStyle}>
              {/* Header */}
              <div
                className={`flex items-center justify-between px-6 py-4 shadow-md z-10 ${customHeaderClass}`}
              >
                <DialogTitle className="text-lg font-bold flex items-center gap-2 m-0">
                  {title}
                </DialogTitle>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200 transition-colors focus:outline-none p-1 rounded-full hover:bg-white/20"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Body */}
              <div
                className={`${sizeConfig.padding} flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-900 ${size === "full" ? "h-full" : ""}`}
                style={{
                  maxHeight: height
                    ? `calc(${typeof height === "number" ? height + "px" : height} - 68px)`
                    : size === "full"
                      ? "calc(100vh - 100px)"
                      : "85vh",
                }}
              >
                {children}
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
