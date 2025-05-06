import React from "react";
import { Fragment } from "react";
import { Dialog, Transition, DialogPanel, DialogTitle, TransitionChild } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";

const STATUS_STYLE = {
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
};

const Modal = ({ isOpen, onClose, title, status = "info", children }) => {
  const statusClass = STATUS_STYLE[status] || STATUS_STYLE.info;

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
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
            <DialogPanel className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden">
              {/* Header */}
              <div className={`px-6 py-3 text-lg font-semibold text-center ${statusClass}`}>
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
