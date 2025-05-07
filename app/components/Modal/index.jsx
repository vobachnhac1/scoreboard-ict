import React from "react";
import { Fragment } from "react";
import { Dialog, Transition, DialogPanel, DialogTitle, TransitionChild } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";

const STATUS_STYLE = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  primary: "bg-primary/10 text-primary",
};

const Modal = ({ isOpen, onClose, title, status = "primary", headerClass, children }) => {
  const customHeaderClass = headerClass ? headerClass : STATUS_STYLE[status] || STATUS_STYLE.primary;

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        onClose={(event) => {
          // Ngăn đóng modal nếu click outside
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
          <div className="fixed inset-0 bg-black/40" />
        </TransitionChild>

        {/* Modal container */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden">
              {/* Header */}
              <div className={`px-6 py-3 text-lg font-semibold text-center ${customHeaderClass}`}>
                <DialogTitle>{title}</DialogTitle>
              </div>

              {/* Close button */}
              <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black">
                <XMarkIcon className="w-5 h-5" />
              </button>

              {/* Body */}
              <div className="p-6">{children}</div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
