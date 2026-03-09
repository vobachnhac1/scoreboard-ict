import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import logoDigiSports from "../../assets/logo_nhacvb_light.png";
import { activateLicense, clearErrors } from "../../config/redux/controller/licenseSlice";

export default function Dashboard() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const socket = useSelector((state) => state.socket);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [inputLicenseKey, setInputLicenseKey] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const {
    valid,
    revoked,
    daysRemaining,
    expirationDate,
    packageName,
    licenseKey: currentLicenseKey,
    activating,
    activationError,
  } = useSelector((state) => state.license);

  const isActivated = valid && !revoked;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleActivate = async () => {
    if (!inputLicenseKey.trim()) return;
    dispatch(clearErrors());
    const result = await dispatch(activateLicense(inputLicenseKey));

    if (result.type === "license/activate/fulfilled") {
      setSuccessMsg(true);
      setInputLicenseKey("");
      setTimeout(() => {
        setSuccessMsg(false);
        setShowForm(false);
      }, 3000);
    }
  };

  const featureGroups = [
    {
      groupTitle: t("dashboard.groups.arena_operations"),
      features: [
        {
          title: t("dashboard.features.doikhang_board.title"),
          description: t("dashboard.features.doikhang_board.desc"),
          tasks: [
            t("dashboard.features.doikhang_board.task1"),
            t("dashboard.features.doikhang_board.task2"),
            t("dashboard.features.doikhang_board.task3"),
            t("dashboard.features.doikhang_board.task4")
          ],
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
          gradient: "from-rose-500 to-red-600",
        },
        {
          title: t("dashboard.features.quyen_board.title"),
          description: t("dashboard.features.quyen_board.desc"),
          tasks: [
            t("dashboard.features.quyen_board.task1"),
            t("dashboard.features.quyen_board.task2"),
            t("dashboard.features.quyen_board.task3"),
            t("dashboard.features.quyen_board.task4")
          ],
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          ),
          gradient: "from-amber-500 to-orange-600",
        },
        {
          title: t("dashboard.features.vonhac_board.title"),
          description: t("dashboard.features.vonhac_board.desc"),
          tasks: [
            t("dashboard.features.vonhac_board.task1"),
            t("dashboard.features.vonhac_board.task2"),
            t("dashboard.features.vonhac_board.task3")
          ],
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          ),
          gradient: "from-purple-500 to-indigo-600",
        },
        {
          title: t("dashboard.features.secondary_display.title"),
          description: t("dashboard.features.secondary_display.desc"),
          tasks: [
            t("dashboard.features.secondary_display.task1"),
            t("dashboard.features.secondary_display.task2"),
            t("dashboard.features.secondary_display.task3"),
            t("dashboard.features.secondary_display.task4")
          ],
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ),
          gradient: "from-emerald-500 to-teal-600",
        },
      ]
    },
    {
      groupTitle: t("dashboard.groups.core_management"),
      features: [
        {
          title: t("dashboard.features.tournament_management.title"),
          description: t("dashboard.features.tournament_management.desc"),
          tasks: [
            t("dashboard.features.tournament_management.task1"),
            t("dashboard.features.tournament_management.task2"),
            t("dashboard.features.tournament_management.task3"),
            t("dashboard.features.tournament_management.task4"),
            t("dashboard.features.tournament_management.task5")
          ],
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          ),
          gradient: "from-blue-600 to-blue-700",
        },
        {
          title: t("dashboard.features.system_config.title"),
          description: t("dashboard.features.system_config.desc"),
          tasks: [
            t("dashboard.features.system_config.task1"),
            t("dashboard.features.system_config.task2"),
            t("dashboard.features.system_config.task3")
          ],
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
          ),
          gradient: "from-blue-500 to-blue-600",
        },
        {
          title: t("dashboard.features.connection_management.title"),
          description: t("dashboard.features.connection_management.desc"),
          tasks: [
            t("dashboard.features.connection_management.task1"),
            t("dashboard.features.connection_management.task2"),
            t("dashboard.features.connection_management.task3")
          ],
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          ),
          gradient: "from-cyan-500 to-blue-600",
        },
        {
          title: t("dashboard.features.lan_sync.title"),
          description: t("dashboard.features.lan_sync.desc"),
          tasks: [
            t("dashboard.features.lan_sync.task1"),
            t("dashboard.features.lan_sync.task2"),
            t("dashboard.features.lan_sync.task3")
          ],
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          ),
          gradient: "from-blue-600 to-indigo-700",
        },
        {
          title: t("dashboard.features.data_safety.title"),
          description: t("dashboard.features.data_safety.desc"),
          tasks: [
            t("dashboard.features.data_safety.task1"),
            t("dashboard.features.data_safety.task2"),
            t("dashboard.features.data_safety.task3")
          ],
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          ),
          gradient: "from-indigo-500 to-violet-600",
        },
      ]
    },
    {
      groupTitle: t("dashboard.groups.support_about_us"),
      features: [
        {
          title: t("dashboard.features.dev_team.title"),
          description: t("dashboard.features.dev_team.desc"),
          tasks: [
            t("dashboard.features.dev_team.task1"),
            t("dashboard.features.dev_team.task2")
          ],
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ),
          gradient: "from-slate-600 to-slate-700",
        },
        {
          title: t("dashboard.features.support_channel.title"),
          description: t("dashboard.features.support_channel.desc"),
          tasks: [
            t("dashboard.features.support_channel.task1"),
            t("dashboard.features.support_channel.task2"),
            t("dashboard.features.support_channel.task3"),
            t("dashboard.features.support_channel.task4")
          ],
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ),
          gradient: "from-emerald-600 to-teal-700",
        },
        {
          title: t("dashboard.features.about_digisports.title"),
          description: t("dashboard.features.about_digisports.desc"),
          tasks: [
            t("dashboard.features.about_digisports.task1"),
            t("dashboard.features.about_digisports.task2"),
            t("dashboard.features.about_digisports.task3"),
            t("dashboard.features.about_digisports.task4")
          ],
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ),
          gradient: "from-blue-600 to-indigo-700",
        },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] transition-colors duration-500">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-600/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-600/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-block p-4 bg-white dark:bg-gray-800 rounded shadow-2xl mb-8 border border-slate-100 dark:border-gray-700">
            <img src={logoDigiSports} alt="Logo" className="w-24 h-auto" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
            {t("dashboard.feature_introduction")} <span className="text-blue-600">{t("dashboard.brand_name")}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold max-w-2xl mx-auto">
            {t("dashboard.dashboard_description")}
          </p>

          {/* License Status Bar & Inline Activation Form */}
          <div className="mt-10 max-w-3xl mx-auto">
            {isActivated && !showForm ? (
              <div className="flex flex-wrap items-center justify-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">{t("dashboard.system_activated")}</span>
                </div>
                <div className="h-4 w-px bg-emerald-200 dark:bg-emerald-800 hidden sm:block"></div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t("dashboard.package")}: <span className="text-blue-600 dark:text-blue-400 uppercase">{packageName || "Professional"}</span>
                </div>
                {expirationDate && (
                  <>
                    <div className="h-4 w-px bg-emerald-200 dark:bg-emerald-800 hidden sm:block"></div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t("dashboard.expired_on")}: <span className="text-rose-600 dark:text-rose-400">{new Date(expirationDate).toLocaleDateString('vi-VN')}</span>
                      <span className="ml-1 text-[10px] opacity-70">{t("dashboard.days_remaining_info", { days: daysRemaining })}</span>
                    </div>
                  </>
                )}
                <div className="h-4 w-px bg-emerald-200 dark:bg-emerald-800 hidden sm:block"></div>
                <button
                  onClick={() => setShowForm(true)}
                  className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {t("dashboard.change_key")}
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded p-8 shadow-2xl border border-slate-200 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isActivated ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      {isActivated ? t("dashboard.change_activation_code") : t("dashboard.activate_license")}
                    </h4>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 italic">
                      {isActivated ? t("dashboard.update_package_desc") : t("dashboard.unlock_features_desc")}
                    </p>
                  </div>
                </div>

                {successMsg && (
                  <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    {t("dashboard.activation_success_msg")}
                  </div>
                )}

                {activationError && (
                  <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {activationError}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={inputLicenseKey}
                    onChange={(e) => setInputLicenseKey(e.target.value)}
                    placeholder={t("dashboard.enter_activation_code_placeholder")}
                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs font-bold focus:ring-2 focus:ring-blue-500 dark:text-white transition-all ring-offset-2 ring-offset-white dark:ring-offset-gray-800"
                    disabled={activating}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleActivate}
                      disabled={activating || !inputLicenseKey.trim()}
                      className="whitespace-nowrap px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center min-w-[140px]"
                    >
                      {activating ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        t("dashboard.activate_button")
                      )}
                    </button>
                    {isActivated && (
                      <button
                        onClick={() => setShowForm(false)}
                        className="px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-xs font-black uppercase tracking-widest"
                      >
                        {t("dashboard.cancel_button")}
                      </button>
                    )}
                  </div>
                </div>

                {!isActivated && (
                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {t("dashboard.no_code_contact_support")}<span className="text-blue-600">0815 192 759</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Feature Groups */}
        <div className="space-y-16">
          {featureGroups.map((group, groupIdx) => {
            // Check if this group should be hidden when not activated
            const isFunctionalGroup = group.groupTitle.includes("Arena") || group.groupTitle.includes("Core");

            // if (isFunctionalGroup) return null;
            // if (!isActivated && isFunctionalGroup) return null;

            return (
              <div key={groupIdx}>
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-[14px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] whitespace-nowrap pl-2">
                    {group.groupTitle}
                  </h2>
                  <div className="h-px w-full bg-slate-200 dark:bg-slate-800"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {group.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-800/80 rounded p-6 shadow-sm border border-slate-200 dark:border-gray-700 hover:border-blue-500/30 transition-all duration-300"
                    >
                      <div className={`inline-flex p-2.5 bg-gradient-to-br ${feature.gradient} rounded text-white mb-4`}>
                        {feature.icon}
                      </div>

                      <h3 className="text-base font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight underline decoration-blue-500/30 decoration-2 underline-offset-4">
                        {feature.title}
                      </h3>

                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed mb-6 italic">
                        {feature.description}
                      </p>

                      <div className="space-y-2.5">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                          <span className="w-1 h-3 bg-blue-500 rounded-full"></span>
                          {t("dashboard.main_tasks")}
                        </p>
                        {feature.tasks.map((task, taskIdx) => (
                          <div key={taskIdx} className="flex items-start gap-2.5 group">
                            <div className="mt-1">
                              <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {task}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* System Health / Footer */}
        <div className="mt-20 pt-10 border-t border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t("dashboard.system_health.system_time")}</p>
              <p className="text-sm font-bold text-slate-800 dark:text-white">{currentTime.toLocaleString('vi-VN')}</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t("dashboard.system_health.server_connection_status")}</p>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                <div className={`w-2 h-2 rounded-full ${socket.connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                  {socket.connected ? t("dashboard.system_health.online_stable") : t("dashboard.system_health.offline_stopped")}
                </span>
              </div>
            </div>
            <div className="md:text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">&copy; 2026 DIGISPORTS ICT TEAM</p>
              <p className="text-xs font-bold text-blue-600">PROFESSIONAL DIGISPORTS PROJECT</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
