import React, { Fragment } from "react";
import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";

export default function NotePopover({ listActions = [] }) {
  return (
    <Popover className="relative ml-1">
      {({ open }) => (
        <>
          <PopoverButton
            className={`
                ${
                  open ? "font-bold" : ""
                } text-black group inline-flex items-center justify-center rounded-full bg-white h-5 w-5 text-base font-medium hover:font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75`}
          >
            ?
          </PopoverButton>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <PopoverPanel className="absolute left-0 z-10 mt-3 min-w-80 max-w-sm -translate-x-1/2 transform px-4 sm:px-0 lg:max-w-3xl">
              <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5 -mt-1">
                {listActions.map((action) => (
                  <div className="flex items-center bg-gray-50 px-4 py-2 cursor-pointer text-gray-700 hover:bg-gray-100" key={action.key}>
                    <div className={`${action.color} !rounded-none !p-2 min-w-12 text-center mr-2`}>{action.key}</div>
                    <div>{action.description}</div>
                  </div>
                ))}
              </div>
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
