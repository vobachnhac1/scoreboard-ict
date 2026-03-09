import React, { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import {
  HomeIcon,
  TrophyIcon,
  ServerStackIcon,
  LinkIcon,
  BookOpenIcon,
  ArrowUpCircleIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import Breadcrumb from "../Breadcrumb";
import { usePackageAccess, PACKAGE_TIERS } from "../FeatureLock";

const AdminLayout = ({ children }) => {
  const { t } = useTranslation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { valid, revoked } = useSelector((state) => state.license);
  const { hasAccess } = usePackageAccess();

  const isActivated = valid && !revoked;

  const navigation = [
    {
      name: t("dashboard.title"),
      href: "/",
      icon: HomeIcon,
    },
    {
      name: t("connection.title"),
      href: "/management/connect",
      icon: LinkIcon,
      hidden: !isActivated,
    },
    {
      name: t("competition.title"),
      href: "/management/general-setting/competition-management",
      icon: TrophyIcon,
      hidden: !isActivated,
    },
    {
      name: t("config.title"),
      href: "/management/general-setting/config-system",
      icon: ServerStackIcon,
      hidden: !isActivated,
    },
    {
      name: t("data_sync.title"),
      href: "/management/data-sync",
      icon: ArrowPathIcon,
      hidden: !isActivated || !hasAccess(PACKAGE_TIERS.ENTERPRISE, "/management/data-sync"),
    },
    {
      name: t("user_guide.title"),
      href: "/user-guide",
      icon: BookOpenIcon,
    },
    {
      name: t("dashboard.update_manager"),
      href: "/update-manager",
      icon: ArrowUpCircleIcon,
      hidden: !isActivated
    },
  ];

  // Filter out hidden items
  const filteredNavigation = navigation.filter(item => !item.hidden);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white dark:bg-gray-900">
      <Fragment>
        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar
            navigation={filteredNavigation}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />

          <div
            className={`flex-1 bg-gray-100 dark:bg-gray-900 p-4 overflow-auto transition-all duration-300
              ${sidebarCollapsed ? "ml-20" : "ml-72"}`}
          >
            {/* <Breadcrumb navigation={navigation} /> */}
            {children}
          </div>
        </div>
      </Fragment>
    </div>
  );
};

export default AdminLayout;

