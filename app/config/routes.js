import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

// Config Socket.IO
import socketClient from './socket/SocketClient';
import { useHotkeys } from 'react-hotkeys-hook';
import { Empty } from 'antd';
import AdminLayout from '../components/Layout/AdminLayout';
import {
  Connect, ConfigSystem, CompetitionManagement,
  CompetitionDataDetail, CompetitionDataOther,
  DataSync
} from '../views/Management';
import BangDiemQuyen from '../views/BangDiemQuyen';
import BangDiemVoNhac from '../views/BangDiemVoNhac';
import BangDiemDoiKhang from '../views/BangDiemDoiKhang';
import SecondaryDisplay from '../views/SecondaryDisplay';

// Import Dashboard and Error pages
import Dashboard from '../views/Dashboard';
import UserGuide from '../views/UserGuide';
import AboutUs from '../views/AboutUs';
import UpdateManager from '../views/UpdateManager';
import NotFound from '../views/Error/NotFound';
import TestError from '../views/TestError';

// Import Error Boundary
import ErrorBoundary from '../components/ErrorBoundary';

// Import Report
import Reports from '../views/Reports';
import TemplateManager from '../views/Reports/TemplateManager';
import DoiKhangResultReport from '../views/Reports/DoiKhangResultReport';
import QuyenResultReport from '../views/Reports/QuyenResultReport';

// Import License
import LicenseActivation from '../views/LicenseActivation';
import FeatureLock, { PACKAGE_TIERS } from '../components/FeatureLock';

// Export socketClient singleton để sử dụng ở các component khác
export { socketClient };

// Tạo component App
const Routers = () => {
  const routes = [
    // License Activation - Không cần AdminLayout
    { path: '/license-activation', element: <LicenseActivation />, sidebar: false },

    // Secondary Display - Màn hình phụ (Electron BrowserWindow riêng)
    { path: '/secondary-display', element: <SecondaryDisplay />, sidebar: false, requiredTier: PACKAGE_TIERS.ADVANCED },

    { path: '/', element: <AdminLayout><Dashboard /></AdminLayout> },
    { path: '/user-guide', element: <AdminLayout><UserGuide /></AdminLayout> },
    // { path: '/user-guide', element: <UserGuide /> },
    { path: '/about-us', element: <AboutUs /> },
    { path: '/update-manager', element: <AdminLayout><UpdateManager /></AdminLayout> },
    // { path: '/test-error', element: <AdminLayout><TestError /></AdminLayout> },
    { path: '/management/connect', element: <AdminLayout><Connect /></AdminLayout> },
    { path: '/management/general-setting', element: <AdminLayout><div>QUẢN LÝ CÀI ĐẶT CHUNG</div></AdminLayout> },
    { path: '/management/general-setting/config-system', element: <AdminLayout><ConfigSystem /></AdminLayout> },
    { path: '/management/general-setting/competition-management', element: <AdminLayout><CompetitionManagement /></AdminLayout> },
    { path: '/management/data-sync', element: <AdminLayout><DataSync /></AdminLayout>, requiredTier: PACKAGE_TIERS.ENTERPRISE },
    // Quản lý thông tin
    { path: '/management/competition-data/:id', element: <AdminLayout><CompetitionDataDetail /></AdminLayout> },
    { path: '/management/competition-data-other/:id', element: <AdminLayout><CompetitionDataOther /></AdminLayout> },
    // Bảng điểm
    { path: '/bang-diem/doi-khang', element: <BangDiemDoiKhang /> },
    { path: '/bang-diem/quyen', element: <BangDiemQuyen /> },
    { path: '/bang-diem/vo-nhac', element: <BangDiemVoNhac />, requiredTier: PACKAGE_TIERS.ADVANCED },
    // Báo cáo
    // { path: '/reports', element: <AdminLayout><Reports /></AdminLayout> },
    // { path: '/reports/template-editor', element: <AdminLayout><TemplateManager /></AdminLayout> },
    // { path: '/reports/template-editor/doikhang', element: <AdminLayout><DoiKhangResultReport /></AdminLayout> },
    // { path: '/reports/template-editor/quyen', element: <AdminLayout><QuyenResultReport /></AdminLayout> },
  ];

  const renderElement = (route) => {
    // Các trang không cần lock (Dashboard, hướng dẫn, giới thiệu, kích hoạt)
    const publicRoutes = ['/', '/license-activation', '/user-guide', '/about-us'];

    if (publicRoutes.includes(route.path)) {
      return route.element;
    }

    if (route.sidebar === false && !route.requiredTier) {
      return route.element;
    }

    // Wrap tất cả routes khác với FeatureLock
    return <FeatureLock requiredTier={route.requiredTier} feature={route.path}>{route.element}</FeatureLock>;
  };

  return (
    <ErrorBoundary>
      <Routes>
        {routes.map((route, index) => (
          <Route path={route.path} key={index} element={renderElement(route)} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default Routers;
