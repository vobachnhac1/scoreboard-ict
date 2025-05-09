import React, { Fragment } from "react";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ navigation }) => {
  const location = useLocation();

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
