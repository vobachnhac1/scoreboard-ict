import React from "react";
import { useNavigate } from "react-router-dom";
import { LinkIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import logoDigiSports from "../../assets/logo_nhacvb_light.png";
import backgroundLogo from "../../assets/background_logo.png";

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    {
      title: t("dashboard.competition_management"),
      description: t("dashboard.competition_management_desc"),
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      ),
      href: "/management/general-setting/competition-management",
      gradient: "from-blue-500 to-blue-600",
      bgGradient:
        "from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/20",
      iconBg: "from-blue-500 to-blue-600",
      stats: { label: t("competition.title"), value: "0" },
    },
    {
      title: t("dashboard.config_management"),
      description: t("dashboard.config_management_desc"),
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      href: "/management/general-setting/config-system",
      gradient: "from-blue-500 to-blue-600",
      bgGradient:
        "from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/20",
      iconBg: "from-blue-500 to-blue-600",
      stats: { label: t("common.config"), value: "0" },
    },
    {
      title: t("dashboard.connection_management"),
      description: t("dashboard.connection_management_desc"),
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      ),
      href: "/management/connect",
      gradient: "from-emerald-500 to-teal-600",
      bgGradient:
        "from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20",
      iconBg: "from-emerald-500 to-teal-600",
      stats: { label: t("common.connection"), value: "0" },
    },
    {
      title: t("dashboard.user_guide"),
      description: t("dashboard.user_guide_desc"),
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      href: "/user-guide",
      gradient: "from-orange-500 to-red-600",
      bgGradient:
        "from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20",
      iconBg: "from-orange-500 to-red-600",
      stats: { label: t("common.documents"), value: "7" },
    },
    {
      title: t("dashboard.about_us"),
      description: t("dashboard.about_us_desc"),
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      href: "/about-us",
      gradient: "from-purple-500 to-pink-600",
      bgGradient:
        "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
      iconBg: "from-purple-500 to-pink-600",
      stats: { label: t("common.contact"), value: "3" },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative">
      {/* Hero Section */}
      <div className="relative overflow-hidden z-10">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-blue-600/5 to-blue-600/5 dark:from-blue-500/10 dark:via-blue-500/10 dark:to-blue-500/10"></div>

        {/* Background Logo - Large watermark with effects */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Animated glow effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-[600px] h-[600px] bg-gradient-to-r from-blue-500/10 via-blue-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"
                style={{ animationDuration: "4s" }}
              ></div>
            </div>

            {/* Main logo watermark */}
            {/* <div className="relative">
              <img
                src={backgroundLogo}
                alt="Background Logo"
                className="w-[full] h-auto opacity-[0.3] dark:opacity-[0.12] object-contain"
                style={{
                  filter: "blur(0.5px) brightness(1.2)",
                }}
              />
            </div> */}
          </div>
        </div>

        {/* Decorative gradient orbs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-400/5 via-blue-400/5 to-blue-400/5 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Logo with animated ring */}
            <div className="inline-flex items-center justify-center mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-blue-500 to-blue-500 rounded blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-2xl ring-4 ring-blue-500/20 dark:ring-blue-400/20">
                <img
                  src={logoDigiSports}
                  alt={t("dashboard.logo_alt")}
                  className="w-24 h-24 object-contain hover:scale-110 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Title with gradient */}
            <h1 className="text-6xl md:text-7xl font-black mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-600 dark:from-blue-400 dark:via-blue-400 dark:to-blue-400 bg-clip-text text-transparent">
                {t("dashboard.brand_name")}
              </span>
            </h1>

            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
              {t("dashboard.professional_software")}
            </p>

            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
              {t("dashboard.software_description")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() =>
                  navigate("/management/general-setting/competition-management")
                }
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-600 text-white font-bold rounded   shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  {t("dashboard.get_started")}
                </span>
              </button>

              <button
                onClick={() =>
                  navigate("/management/general-setting/config-system")
                }
                className="group px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded   shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400"
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                  </svg>
                  {t("dashboard.system_config")}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative max-w-7xl mx-auto px-4 py-10 z-10">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
            {t("dashboard.featured_features")}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t("dashboard.explore_features")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              onClick={() => navigate(feature.href)}
              className="group relative cursor-pointer"
            >
              {/* Card */}
              <div className="relative h-full bg-white dark:bg-gray-800 rounded   shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-transparent">
                {/* Gradient background on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 transition-opacity duration-500`}
                ></div>

                {/* Animated gradient border */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-500 blur-xl`}
                ></div>

                <div className="relative p-8 h-full flex flex-col">
                  {/* Icon container */}
                  <div className="mb-6">
                    <div
                      className={`inline-flex p-4 bg-gradient-to-br ${feature.iconBg} rounded   shadow-lg transition-all duration-500 text-white`}
                    >
                      {feature.icon}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 transition-all duration-500">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Stats & Arrow */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">
                        {feature?.stats?.label}
                      </p>
                      <p
                        className={`text-3xl font-black bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}
                      >
                        {feature?.stats?.value}
                      </p>
                    </div>

                    {/* Arrow icon */}
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center transition-all duration-500">
                      <svg
                        className="w-6 h-6 text-gray-400 transition-all duration-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover effect - floating animation */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/20 via-blue-500/20 to-blue-500/20 rounded   blur-2xl opacity-0  transition-opacity duration-500 transform "></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/20 rounded-full border border-blue-200 dark:border-blue-800">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {t("dashboard.system_running")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
