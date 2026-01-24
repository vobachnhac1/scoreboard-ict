import React, { Fragment, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import CheckActive from "./CheckActive";
import {
  ArrowTurnDownRightIcon,
  HomeIcon,
  Cog6ToothIcon,
  TrophyIcon,
  ServerStackIcon,
  LinkIcon,
  ChartBarIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import Breadcrumb from "../Breadcrumb";

const AdminLayout = ({ children }) => {
  const [isActive, setIsActive] = React.useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const checkActive = (key) => {
    // Simulate an API call to check the license key
    setTimeout(() => {
      setIsActive(true);
    }, 0);
  };

  const navigation = [
    {
      name: "Trang chủ",
      href: "/",
      icon: HomeIcon
    },
    {
      name: "Quản lý kết nối",
      href: "/management/connect",
      icon: LinkIcon
    },
    {
      name: "Quản lý Thi đấu",
      href: "/management/general-setting/competition-management",
      icon: TrophyIcon
    },
    {
      name: "Quản lý cài đặt",
      href: "/management/general-setting/config-system",
      icon: ServerStackIcon
    },
    // {
    //   name: "Quản lý cài đặt chung",
    //   icon: Cog6ToothIcon,
    //   href: "/management/general-setting",
    //   children: [
    //     {
    //       name: "Quản lý Thi đấu",
    //       href: "/management/general-setting/competition-management",
    //       icon: TrophyIcon
    //     },
    //     {
    //       name: "Quản lý cài đặt",
    //       href: "/management/general-setting/config-system",
    //       icon: ServerStackIcon
    //     }
    //   ],
    // },
    // {
    //   name: "Bảng điểm",
    //   icon: ChartBarIcon,
    //   href: "/scoreboard",
    //   children: [
    //     {
    //       name: "Vovinam",
    //       href: "/scoreboard/vovinam",
    //       icon: ClipboardDocumentListIcon
    //     },
    //     {
    //       name: "Chấm điểm",
    //       href: "/scoreboard/vovinam-score",
    //       icon: DocumentTextIcon
    //     },
    //   ],
    // },
    // {
    //   name: "Test Error",
    //   href: "/test-error",
    //   icon: ExclamationTriangleIcon
    // },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {isActive ? (
        <Fragment>
          <div className="flex flex-1 overflow-hidden relative">
            <Sidebar
              navigation={navigation}
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            <div
              className={`flex-1 bg-gray-100 p-4 overflow-auto transition-all duration-300
                ${sidebarCollapsed ? 'ml-20' : 'ml-72'}`}
            >
              <Breadcrumb navigation={navigation} />
              {children}
            </div>
          </div>
        </Fragment>
      ) : (
        <CheckActive checkActive={checkActive} />
      )}
    </div>
  );
};

export default AdminLayout;
