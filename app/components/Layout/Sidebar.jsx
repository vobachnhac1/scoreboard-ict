import React, { Fragment } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import logoVoHienDai from "../../assets/logo_nhacvb_light.png";
import ThemeToggle from "../ThemeToggle";
import LanguageSwitcher from "../LanguageSwitcher";

const Sidebar = ({ navigation, collapsed = false, onToggle }) => {
  const { t } = useTranslation();
  const location = useLocation();

  const isActive = (href) =>
    location.pathname === href || location.pathname.startsWith(href + "/");

  // Get gradient for item based on index or name
  const getGradient = (index) => {
    const gradients = [
      "from-blue-500 to-blue-600",
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
            <span className="font-semibold text-gray-400">
              {item.name.replace(/_/g, " ")}
            </span>
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
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-102"
            }`}
        >
          {/* Gradient overlay on hover */}
          {!isActive(item.href) && (
            <div
              className={`absolute inset-0 bg-gradient-to-r ${getGradient(index)} opacity-0 group-hover:opacity-10 transition-opacity duration-200`}
            ></div>
          )}

          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 relative z-10
            ${isActive(item.href)
                ? "bg-white/20 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-gray-200 dark:group-hover:bg-gray-600"
              }`}
          >
            {item.icon && <item.icon className="h-5 w-5" />}
          </div>

          {!collapsed && (
            <span
              className={`font-semibold relative z-10 ${isActive(item.href) ? "text-white" : "text-gray-900 dark:text-gray-100"}`}
            >
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
    <div
      className={`text-gray-900 dark:text-gray-100 h-screen px-3 fixed top-0 left-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-xl transition-all duration-300 flex flex-col overflow-x-hidden ${collapsed ? "w-20" : "w-72"}`}
    >
      {/* Logo & Brand */}
      <div className="flex h-20 items-center justify-center border-b border-gray-200 dark:border-gray-700 mb-4 flex-shrink-0">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="inline-flex items-start justify-start rounded-2xl flex-shrink-0">
              <img
                src={logoVoHienDai}
                alt="Logo Võ Hiện Đại"
                className="w-12 h-12 object-contain"
              />
            </div>
            {!collapsed && (
              <div className="text-left overflow-hidden">
                <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight whitespace-nowrap">
                  DIGISPORTS
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold whitespace-nowrap">
                  {t("dashboard.competition_management")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <ul
        className="flex flex-col text-base space-y-2 overflow-y-auto overflow-x-hidden flex-1 pb-2"
        style={{ scrollbarWidth: "thin" }}
      >
        {navigation.map((item, index) =>
          item.children ? (
            <Disclosure
              key={item.name}
              as="li"
              defaultOpen={
                !collapsed &&
                (item.children.some((child) => isActive(child.href)) ||
                  isActive(item.href))
              }
              className="text-base"
            >
              {({ open }) => {
                const hasActiveChild =
                  item.children.some((child) => isActive(child.href)) ||
                  isActive(item.href);
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
                        <div
                          className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-200`}
                        ></div>
                      )}

                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 relative z-10
                        ${hasActiveChild
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                          }`}
                      >
                        {item.icon && <item.icon className="h-5 w-5" />}
                      </div>

                      {!collapsed && (
                        <>
                          <span
                            className={`font-semibold flex-1 text-left relative z-10 ${hasActiveChild ? "text-white" : "text-gray-900"}`}
                          >
                            {item.name.replace(/_/g, " ")}
                          </span>

                          <ChevronDownIcon
                            className={`h-5 w-5 transition-transform duration-200 relative z-10 ${open ? "rotate-180" : ""} ${hasActiveChild ? "text-white" : "text-gray-600"}`}
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
                      <DisclosurePanel
                        as="ul"
                        className="pl-5 mt-2 flex flex-col space-y-1 text-base w-full"
                        id={`panel-${item.name}`}
                      >
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
                                <div
                                  className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-200`}
                                ></div>
                              )}

                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 relative z-10
                                ${isActive(child.href)
                                    ? "bg-white/20 text-white"
                                    : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                                  }`}
                              >
                                {child.icon && (
                                  <child.icon className="h-4 w-4" />
                                )}
                              </div>

                              <span
                                className={`font-medium relative z-10 ${isActive(child.href) ? "text-white" : "text-gray-900"}`}
                              >
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
          ),
        )}
      </ul>

      {/* Footer Actions */}
      <div className="flex-shrink-0 py-4 border-t border-slate-200 dark:border-slate-700">
        <div className={`flex flex-col gap-2 bg-slate-100/80 dark:bg-slate-800/80 p-2 rounded-2xl border border-slate-200/50 dark:border-slate-700/50`}>
          <div className={`flex ${collapsed ? 'flex-col items-center gap-2' : 'justify-center items-center gap-2'}`}>
            <ThemeToggle compact={collapsed} className={collapsed ? '' : 'flex-1'} />
            <LanguageSwitcher compact={collapsed} />
          </div>

          {onToggle && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggle();
              }}
              className={`group flex items-center justify-center p-2.5 w-full rounded-xl bg-white/50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-600 text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-all shadow-sm relative`}
              title={collapsed ? t("common.expand", "Mở rộng") : t("common.collapse", "Thu gọn")}
              type="button"
            >
              <svg
                className={`w-5 h-5 transition-transform duration-300 flex-shrink-0 ${collapsed ? "rotate-0" : "rotate-180"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>

              {!collapsed && (
                <span className="ml-2 font-bold text-sm tracking-tight text-slate-600 group-hover:text-blue-600 dark:text-slate-300 dark:group-hover:text-blue-400">
                  {t("common.collapse_sidebar", "Thu gọn Sidebar")}
                </span>
              )}

              {collapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl">
                  {t("common.expand", "Mở rộng")}
                </div>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
