import React, { Fragment } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import CheckActive from "./CheckActive";
import { ArrowTurnDownRightIcon, FolderIcon } from "@heroicons/react/24/outline";
import Breadcrumb from "../Breadcrumb";

const AdminLayout = ({ children }) => {
  const [isActive, setIsActive] = React.useState(true);
  const checkActive = (key) => {
    // Simulate an API call to check the license key
    setTimeout(() => {
      setIsActive(true);
    }, 0);
  };

  const navigation = [
    { name: "Quản lý kết nối", href: "/management/connect", icon: FolderIcon },
    { name: "Quản lý VĐV Đối kháng", href: "/", icon: FolderIcon, disabled: true },
    { name: "Quản lý VĐV Quyền", href: "/", icon: FolderIcon, disabled: true },
    { name: "Quản lý Lịch sử Giải đấu", href: "/", icon: FolderIcon, disabled: true },
    {
      name: "Quản lý cài đặt chung",
      icon: FolderIcon,
      href: "/management/general-setting",
      children: [
        { name: "Giải đấu", href: "/management/general-setting/champion", icon: ArrowTurnDownRightIcon },
        // { name: "Nhóm thi", href: "/management/general-setting/champion-grp", icon: ArrowTurnDownRightIcon },
        { name: "Hình thức thi", href: "/management/general-setting/champion-category", icon: ArrowTurnDownRightIcon },
        { name: "Nội dung thi", href: "/management/general-setting/champion-event", icon: ArrowTurnDownRightIcon },
        { name: "Máy chủ", href: "/management/general-setting/config-system", icon: ArrowTurnDownRightIcon },
      ],
    },
  ];

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="mt-14" />
      {isActive ? (
        <Fragment>
          <div className="flex flex-1 overflow-hidden">
            <Sidebar navigation={navigation} />
            <div className="flex-1 bg-gray-100 p-4 overflow-auto ml-16 md:ml-64">
              <Breadcrumb navigation={navigation} /> {/* Thêm dòng này */}
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
