import React from "react";
import { useNavigate } from "react-router-dom";
import { LinkIcon } from "@heroicons/react/24/outline";
import logoVoHienDai from "../../assets/logo_vohiendai.jpg";
export default function Dashboard() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Quản lý giải đấu",
      description: "Tạo và quản lý các giải đấu, trận đấu, đội thi đấu",
      icon: "🏆",
      href: "/management/general-setting/competition-management",
      gradient: "from-blue-500 to-blue-600",
      stats: { label: "Giải đấu", value: "0" },
    },
    {
      title: "Quản lý cài đặt",
      description: "Thiết lập thông tin giải đấu, logo, số giám định",
      icon: "⚙️",
      href: "/management/general-setting/config-system",
      gradient: "from-blue-500 to-blue-600",
      stats: { label: "Cấu hình", value: "0" },
    },
    // {
    //   title: 'Bảng điểm',
    //   description: 'Xem và quản lý kết quả thi đấu theo thời gian thực',
    //   icon: '📊',
    //   href: '/scoreboard',
    //   gradient: 'from-orange-500 to-orange-600',
    //   stats: { label: 'Trận đấu', value: '48' }
    // },
    {
      title: "Quản lý kết nối",
      description: "Quản lý cấp quyền những thiết bị đang kết nối",
      icon: <LinkIcon className="w-8 h-8 text-white" />,
      href: "/management/connect",
      gradient: "from-blue-500 to-blue-600",
      stats: { label: "Kết nối", value: "0" },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-blue-600/10 to-blue-600/10 dark:from-blue-500/5 dark:via-blue-500/5 dark:to-blue-500/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center mb-6">
              <img
                src={logoVoHienDai}
                alt="Logo Võ Hiện Đại"
                className="w-20 h-20 object-contain rounded-2xl shadow-2xl hover:scale-110 transition-transform duration-300"
              />
            </div>
            <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
              PHẦN MỀM QUẢN LÝ THI ĐẤU
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
              Giải pháp toàn diện cho việc tổ chức và quản lý các giải đấu thể
              thao chuyên nghiệp
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() =>
                  navigate("/management/general-setting/competition-management")
                }
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                Bắt đầu ngay
              </button>
              <button
                onClick={() =>
                  navigate("/management/general-setting/config-system")
                }
                className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 border-2 border-gray-200 dark:border-gray-700"
              >
                Cấu hình
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
            Tính năng nổi bật
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Khám phá các tính năng mạnh mẽ của hệ thống
          </p>
        </div>

        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${features?.length} gap-6`}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              onClick={() => navigate(feature.href)}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:scale-105"
            >
              {/* Gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              ></div>

              <div className="relative p-6">
                {/* Icon */}
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {feature.description}
                </p>

                {/* Stats */}
                <div
                  className={`flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700`}
                >
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                    {feature?.stats?.label}
                  </span>
                  <span
                    className={`text-2xl font-black bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}
                  >
                    {feature?.stats?.value}
                  </span>
                </div>

                {/* Arrow icon */}
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
