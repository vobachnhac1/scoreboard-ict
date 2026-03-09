import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import OperationFlowchart from "./components/OperationFlowchart";

export default function UserGuide() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSection, setExpandedSection] = useState(null);

  const tabs = [
    {
      id: "overview",
      name: t("user_guide.tabs.overview"),
      icon: (
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      id: "setup",
      name: t("user_guide.tabs.setup"),
      icon: (
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
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      id: "competition",
      name: t("user_guide.tabs.competition"),
      icon: (
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
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      ),
    },
    {
      id: "scoring",
      name: t("user_guide.tabs.scoring"),
      icon: (
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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      id: "connection",
      name: t("user_guide.tabs.connection"),
      icon: (
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
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      id: "reports",
      name: t("user_guide.tabs.reports"),
      icon: (
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
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      id: "troubleshooting",
      name: t("user_guide.tabs.troubleshooting"),
      icon: (
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
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];


  const guides = t("user_guide.guides", { returnObjects: true }) || {};
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] transition-colors duration-500 relative">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-600/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 dark:bg-emerald-600/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/")}
              className="p-3 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 transition-all hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {t("user_guide.title")}
                </h1>
              </div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-2">
                {t("user_guide.description")}
              </p>
            </div>
          </div>
        </div>
        {/* Bottom Section */}
        <div className="px-8 pb-2">
          <OperationFlowchart />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Sidebar - Tabs */}
          <div className="lg:col-span-1 sticky top-8">
            <div className="bg-white dark:bg-gray-800 rounded p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 px-4">
                {t("user_guide.table_of_contents")}
              </h3>
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setExpandedSection(null);
                    }}
                    className={`w-full text-left px-4 py-3 rounded text-xs font-bold transition-all duration-300 flex items-center gap-3 ${activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 translate-x-2"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-blue-600 dark:hover:text-blue-400"
                      }`}
                  >
                    {tab.icon}
                    <span className="uppercase tracking-wider">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded p-8 shadow-2xl border border-slate-200 dark:border-slate-700">
              {guides[activeTab] && (
                <div>
                  {/* Title */}
                  <div className="mb-10">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
                      {guides[activeTab].title}
                    </h2>
                    <div className="h-1.5 w-16 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full"></div>
                  </div>

                  {/* Sections */}
                  <div className="space-y-6">
                    {guides[activeTab].sections.map((section, index) => (
                      <div
                        key={index}
                        className={`border rounded transition-all duration-300 ${expandedSection === index
                          ? "border-blue-500/50 shadow-lg shadow-blue-500/10 bg-white dark:bg-gray-800"
                          : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:border-blue-500/30"
                          }`}
                      >
                        {/* Section Header */}
                        <button
                          onClick={() =>
                            setExpandedSection(
                              expandedSection === index ? null : index,
                            )
                          }
                          className="w-full px-6 py-4 flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-colors ${expandedSection === index
                              ? "bg-blue-600 text-white"
                              : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white"
                              }`}>
                              {index + 1}
                            </div>
                            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight text-left">
                              {section.title}
                            </h3>
                          </div>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${expandedSection === index
                            ? "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                            : "text-slate-400 group-hover:text-blue-600"
                            }`}>
                            <svg
                              className={`w-5 h-5 transition-transform duration-300 ${expandedSection === index ? "rotate-180" : ""
                                }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>

                        {/* Section Content */}
                        <div
                          className={`overflow-hidden transition-all duration-300 ${expandedSection === index ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                            }`}
                        >
                          <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-700/50 mt-2">
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                              {section.content}
                            </p>

                            {section.steps && (
                              <div className="space-y-4">
                                {section.steps.map((step, stepIndex) => (
                                  <div
                                    key={stepIndex}
                                    className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800"
                                  >
                                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-[10px] font-black mt-0.5">
                                      {stepIndex + 1}
                                    </div>
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex-1 leading-relaxed">
                                      {step}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {section.image && (
                              <div className="mt-8 rounded overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm flex justify-center p-2 bg-slate-50 dark:bg-slate-900">
                                <img
                                  src={section.image}
                                  alt={section.title}
                                  className="max-w-full h-auto rounded"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
