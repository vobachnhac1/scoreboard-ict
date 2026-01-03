import React, { Fragment } from "react";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const Sidebar = ({ navigation, collapsed = false }) => {
  const location = useLocation();

  const isActive = (href) => location.pathname === href || location.pathname.startsWith(href + "/");

  // Get gradient for item based on index or name
  const getGradient = (index) => {
    const gradients = [
      'from-blue-500 to-blue-600',
      // 'from-purple-500 to-purple-600',
      // 'from-green-500 to-green-600',
      // 'from-orange-500 to-orange-600',
      // 'from-pink-500 to-pink-600',
      // 'from-indigo-500 to-indigo-600',
      // 'from-red-500 to-red-600',
      // 'from-teal-500 to-teal-600',
    ];
    return gradients[index % gradients.length];
  };

  const renderNavItem = (item, index) => (
    <li key={item.name}>
      {item.disabled ? (
        <div
          className="flex items-center py-3 px-3 space-x-3 rounded-xl cursor-not-allowed opacity-50 bg-gray-100 relative group"
          title="Disabled"
        >
          <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
            {item.icon && <item.icon className="h-5 w-5 text-gray-400" />}
          </div>
          {!collapsed && (
            <span className="font-semibold text-gray-400">{item.name.replace(/_/g, " ")}</span>
          )}

          {/* Tooltip khi collapsed */}
          {collapsed && (
            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
              {item.name.replace(/_/g, " ")}
            </div>
          )}
        </div>
      ) : (
        <Link
          to={item.href}
          className={`group flex items-center py-3 px-3 space-x-3 rounded-xl cursor-pointer transition-all duration-200 relative overflow-hidden
          ${isActive(item.href)
            ? `bg-gradient-to-r ${getGradient(index)} text-white shadow-lg scale-105`
            : "text-gray-700 hover:bg-gray-100 hover:scale-102"
          }`}
        >
          {/* Gradient overlay on hover */}
          {!isActive(item.href) && (
            <div className={`absolute inset-0 bg-gradient-to-r ${getGradient(index)} opacity-0 group-hover:opacity-10 transition-opacity duration-200`}></div>
          )}

          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 relative z-10
            ${isActive(item.href)
              ? 'bg-white/20 text-white'
              : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
            }`}
          >
            {item.icon && <item.icon className="h-5 w-5" />}
          </div>

          {!collapsed && (
            <span className={`font-semibold relative z-10 ${isActive(item.href) ? 'text-white' : 'text-gray-900'}`}>
              {item.name.replace(/_/g, " ")}
            </span>
          )}

          {/* Active indicator */}
          {!collapsed && isActive(item.href) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          )}

          {/* Tooltip khi collapsed */}
          {collapsed && (
            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
              {item.name.replace(/_/g, " ")}
            </div>
          )}
        </Link>
      )}
    </li>
  );

  return (
    <div className={`text-gray-900 h-screen px-3 fixed bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 shadow-xl transition-all duration-300 ${collapsed ? 'w-16' : 'w-16 md:w-72'}`}>
      {/* Logo & Brand */}
      <div className="flex h-20 items-center justify-center border-b border-gray-200 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            {!collapsed && (
              <div className="text-left">
                <h1 className="text-xl font-black text-gray-900 tracking-tight">SCOREBOARD</h1>
                <p className="text-xs text-gray-500 font-semibold">Quản lý thi đấu</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ul className="flex flex-col text-base space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
        {navigation.map((item, index) =>
          item.children ? (
            <Disclosure key={item.name} as="li" defaultOpen={!collapsed && (item.children.some((child) => isActive(child.href)) || isActive(item.href))} className="text-base">
              {({ open }) => {
                const hasActiveChild = item.children.some((child) => isActive(child.href)) || isActive(item.href);
                const gradient = getGradient(index);

                return (
                  <Fragment>
                    <DisclosureButton
                      disabled={collapsed}
                      className={`group w-full flex items-center py-1 px-3 space-x-3 rounded-xl cursor-pointer transition-all duration-200 relative overflow-hidden
                        ${hasActiveChild
                          ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
                          : "text-gray-700 hover:bg-gray-100"
                        }`}
                      aria-expanded={open}
                      aria-controls={`panel-${item.name}`}
                    >
                      {/* Gradient overlay on hover */}
                      {!hasActiveChild && (
                        <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-200`}></div>
                      )}

                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 relative z-10
                        ${hasActiveChild
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                        }`}
                      >
                        {item.icon && <item.icon className="h-5 w-5" />}
                      </div>

                      {!collapsed && (
                        <>
                          <span className={`font-semibold flex-1 text-left relative z-10 ${hasActiveChild ? 'text-white' : 'text-gray-900'}`}>
                            {item.name.replace(/_/g, " ")}
                          </span>

                          <ChevronDownIcon
                            className={`h-5 w-5 transition-transform duration-200 relative z-10 ${open ? 'rotate-180' : ''} ${hasActiveChild ? 'text-white' : 'text-gray-600'}`}
                          />
                        </>
                      )}

                      {/* Tooltip khi collapsed */}
                      {collapsed && (
                        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                          {item.name.replace(/_/g, " ")}
                        </div>
                      )}
                    </DisclosureButton>

                    {!collapsed && (
                      <DisclosurePanel as="ul" className="pl-3 md:pl-5 mt-2 flex flex-col space-y-1 text-base w-full" id={`panel-${item.name}`}>
                        {item.children.map((child, childIndex) => (
                          <li key={child.name}>
                            <Link
                              to={child.href}
                              className={`group flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative overflow-hidden
                                ${isActive(child.href)
                                  ? `bg-gradient-to-r ${gradient} text-white shadow-md`
                                  : "hover:bg-gray-100 text-gray-700"
                                }`}
                            >
                              {/* Gradient overlay on hover */}
                              {!isActive(child.href) && (
                                <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-200`}></div>
                              )}

                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 relative z-10
                                ${isActive(child.href)
                                  ? 'bg-white/20 text-white'
                                  : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                                }`}
                              >
                                {child.icon && <child.icon className="h-4 w-4" />}
                              </div>

                              <span className={`font-medium relative z-10 ${isActive(child.href) ? 'text-white' : 'text-gray-900'}`}>
                                {child.name}
                              </span>

                              {/* Active indicator */}
                              {isActive(child.href) && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                </div>
                              )}
                            </Link>
                          </li>
                        ))}
                      </DisclosurePanel>
                    )}
                  </Fragment>
                );
              }}
            </Disclosure>
          ) : (
            renderNavItem(item, index)
          )
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
