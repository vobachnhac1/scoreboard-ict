import React from "react";
import { FolderIcon } from "@heroicons/react/24/outline";
import { Disclosure, DisclosurePanel, DisclosureButton } from "@headlessui/react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const navigation = [
    { name: "Quản lý kết nối", href: "/management/connect", icon: FolderIcon },
    { name: "Quản lý VĐV Đối kháng", href: "/feed", icon: FolderIcon, disabled: true },
    { name: "Quản lý VĐV Quyền", href: "/qr-views", icon: FolderIcon, disabled: true },
    { name: "Quản lý Lịch sử Giải đấu", href: "/qr-views", icon: FolderIcon, disabled: true },
    {
      name: "Quản lý cài đặt chung",
      icon: FolderIcon,
      children: [
        { name: "Giải đấu", href: "/management/connect" },
        { name: "Đối kháng", href: "/management/general-setting" },
        { name: "Thi quyền", href: "/management/general-setting2" },
      ],
    },
  ];

  const isActive = (href) => location.pathname === href || location.pathname.startsWith(href + "/");

  return (
    <div className="text-gray-900 h-screen px-2 fixed w-16 md:w-64 border-r border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white">
      {/* <h1 className="text-2xl font-bold hidden md:block mt-4 text-center italic">LOGO</h1> */}
      <ul className="flex flex-col mt-5 text-base space-y-1">
        {navigation.map((item) =>
          item.children ? (
            <Disclosure key={item.name} as="li" defaultOpen={item.children.some((child) => isActive(child.href))} className="text-base">
              {({ open }) => (
                <>
                  <DisclosureButton
                    className={`w-full flex items-center py-2 px-2 space-x-4 rounded cursor-pointer
                      ${item.children.some((child) => isActive(child.href)) ? "bg-blue-600 text-white" : "hover:bg-blue-600 hover:text-white"}`}
                  >
                    {item.icon && <item.icon className="h-5 w-5" />}
                    <span className="hidden md:inline capitalize">{item.name.replace(/_/g, " ")}</span>
                  </DisclosureButton>
                  <DisclosurePanel as="ul" className="pl-4 mt-1 flex flex-col space-y-1 text-base w-full md:pl-10">
                    {item.children.map((child) => (
                      <li key={child.name}>
                        <Link
                          to={child.href}
                          className={`block px-2 py-2 rounded transition-colors
                            ${
                              isActive(child.href)
                                ? "bg-blue-600 text-white"
                                : "hover:bg-gray-200 hover:text-blue-500 dark:hover:text-blue-400 dark:text-gray-300"
                            }`}
                        >
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </DisclosurePanel>
                </>
              )}
            </Disclosure>
          ) : (
            <li key={item.name}>
              {item.disabled ? (
                <div className="flex items-center py-2 px-2 space-x-4 rounded cursor-not-allowed opacity-50" title="Disabled">
                  {item.icon && <item.icon className="h-5 w-5" />}
                  <span className="hidden md:inline capitalize">{item.name.replace(/_/g, " ")}</span>
                </div>
              ) : (
                <Link
                  to={item.href}
                  className={`flex items-center py-2 px-2 space-x-4 rounded cursor-pointer
      ${isActive(item.href) ? "bg-blue-600 text-white" : "hover:bg-blue-600 hover:text-white"}`}
                >
                  {item.icon && <item.icon className="h-5 w-5" />}
                  <span className="hidden md:inline capitalize">{item.name.replace(/_/g, " ")}</span>
                </Link>
              )}
            </li>
          )
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
