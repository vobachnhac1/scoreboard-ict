import React from "react";
import { Fragment } from "react";
import {
  Dialog,
  Transition,
  DialogPanel,
  DialogTitle,
  TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";

const STATUS_STYLE = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  primary: "bg-primary/10 text-primary",
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
    small: { maxWidth: "max-w-sm", padding: "p-4" },
    default: { maxWidth: "max-w-md", padding: "p-4" },
    large: { maxWidth: "max-w-2xl", padding: "p-4" },
    full: { maxWidth: "max-w-7xl w-full h-full", padding: "p-2" },
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
    ? "w-full rounded bg-white dark:bg-gray-800 shadow-xl overflow-hidden"
    : `w-full ${sizeConfig.maxWidth} rounded bg-white dark:bg-gray-800 shadow-xl overflow-hidden`;

  // Container class for full size
  const containerClass =
    size === "full"
      ? "fixed inset-0 flex items-center justify-center p-2"
      : "fixed inset-0 flex items-center justify-center p-4";

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
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 dark:bg-black/60" />
        </TransitionChild>

        {/* Modal container */}
        <div className={containerClass}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className={panelClass} style={modalStyle}>
              {/* Header */}
              <div
                className={`px-6 py-3 text-lg font-semibold text-center ${customHeaderClass}`}
              >
                <DialogTitle>{title}</DialogTitle>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white z-10"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>

              {/* Body */}
              <div
                className={`${sizeConfig.padding} overflow-y-auto bg-white dark:bg-gray-800 ${size === "full" ? "h-full" : ""}`}
                style={{
                  maxHeight: height
                    ? `calc(${typeof height === "number" ? height + "px" : height} - 60px)`
                    : size === "full"
                      ? "calc(100vh - 120px)"
                      : "auto",
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
