import React, { Fragment } from "react";
import { ArrowTurnDownRightIcon, FolderIcon } from "@heroicons/react/24/outline";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const navigation = [
    { name: "Quản lý kết nối", href: "/management/connect", icon: FolderIcon },
    { name: "Quản lý VĐV Đối kháng", href: "/", icon: FolderIcon, disabled: true },
    { name: "Quản lý VĐV Quyền", href: "/", icon: FolderIcon, disabled: true },
    { name: "Quản lý Lịch sử Giải đấu", href: "/", icon: FolderIcon, disabled: true },
    {
      name: "Quản lý cài đặt chung",
      icon: FolderIcon,
      children: [
        { name: "Giải đấu", href: "/management/general-setting/champion", icon: ArrowTurnDownRightIcon },
        { name: "Nhóm thi", href: "/management/general-setting/champion-grp", icon: ArrowTurnDownRightIcon },
        { name: "Hình thức thi", href: "/management/general-setting/champion-category", icon: ArrowTurnDownRightIcon },
        { name: "Nội dung thi", href: "/management/general-setting/champion-event", icon: ArrowTurnDownRightIcon },
        // { name: "Đối kháng", href: "/management/general-setting/sparring", icon: ArrowTurnDownRightIcon },
        // { name: "Thi quyền", href: "/management/general-setting/competition", icon: ArrowTurnDownRightIcon },
      ],
    },
  ];

  const isActive = (href) => location.pathname === href || location.pathname.startsWith(href + "/");

  const renderNavItem = (item) => (
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
          ${isActive(item.href) ? "bg-primary text-white" : "hover:bg-primary hover:text-white"}`}
        >
          {item.icon && <item.icon className="h-5 w-5" />}
          <span className="hidden md:inline capitalize">{item.name.replace(/_/g, " ")}</span>
        </Link>
      )}
    </li>
  );

  return (
    <div className="text-gray-900 h-screen px-2 fixed w-16 md:w-64 border-r border-gray-300">
      <ul className="flex flex-col mt-5 text-base space-y-1">
        {navigation.map((item) =>
          item.children ? (
            <Disclosure key={item.name} as="li" defaultOpen={item.children.some((child) => isActive(child.href))} className="text-base">
              {({ open }) => (
                <Fragment>
                  <DisclosureButton
                    className={`w-full flex items-center py-2 px-2 space-x-4 rounded cursor-pointer
                      ${item.children.some((child) => isActive(child.href)) ? "bg-primary text-white" : "hover:bg-primary hover:text-white"}`}
                    aria-expanded={open}
                    aria-controls={`panel-${item.name}`}
                  >
                    {item.icon && <item.icon className="h-5 w-5" />}
                    <span className="hidden md:inline capitalize">{item.name.replace(/_/g, " ")}</span>
                  </DisclosureButton>
                  <DisclosurePanel as="ul" className="pl-4 mt-1 flex flex-col space-y-1 text-base w-full md:pl-5" id={`panel-${item.name}`}>
                    {item.children.map((child) => (
                      <li key={child.name}>
                        <Link
                          to={child.href}
                          className={`flex items-center space-x-2 px-2 py-2 rounded transition-colors ${
                            isActive(child.href) ? "bg-primary text-white" : "hover:bg-gray-200 hover:text-primary "
                          }`}
                        >
                          {child.icon && <child.icon className="h-5 w-5" />}
                          <span>{child.name}</span>
                        </Link>
                      </li>
                    ))}
                  </DisclosurePanel>
                </Fragment>
              )}
            </Disclosure>
          ) : (
            renderNavItem(item)
          )
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
