import React from 'react';
import { useTranslation } from 'react-i18next';
import { TabPanel } from "@headlessui/react";

export default function RefereeManagementPanel(props) {
  const { t } = useTranslation();
  const { referees, loadingReferees, refSearch, setRefSearch, fetchReferees, handleOpenRefModal, handleUpdateReferee, handleDeleteReferee, handleDeleteAllReferees, handleToggleField } = props;
  return (
    <>
      <TabPanel>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-xl font-black text-blue-900 dark:text-blue-100 uppercase tracking-tight">
              {t("competition_management.referee_list")}
            </h2>
            <p className="text-xs text-blue-500 dark:text-blue-400 mt-1 font-bold italic">
              {t("competition_management.referee_list_desc")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <input
                type="text"
                placeholder={t("competition.search_referee") + "..."}
                className="pl-12 pr-4 py-3 bg-white dark:bg-blue-900/10 border border-blue-100  rounded text-xs font-bold text-blue-900 dark:text-blue-100 focus:ring-2 focus:ring-blue-500 outline-none w-72 shadow-lg shadow-blue-500/5 transition-all"
                value={refSearch}
                onChange={(e) => {
                  setRefSearch(e.target.value);
                  fetchReferees(e.target.value);
                }}
              />
              <svg
                className="absolute left-4 top-3.5 w-5 h-5 text-blue-400 group-hover:text-blue-600 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <button
              onClick={() => handleOpenRefModal("add")}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded shadow-lg  transition-all duration-300 active:scale-95  "
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              {t("competition_management.add_referee")}
            </button>

            {referees.length > 0 && (
              <button
                onClick={handleDeleteAllReferees}
                className="flex items-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white text-[10px] font-black uppercase tracking-widest rounded border border-red-200 hover:border-red-600 transition-all duration-300 active:scale-95"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                {t("competition_management.delete_all")}
              </button>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded border border-blue-50 dark:border-blue-900/30 overflow-hidden shadow-2xl shadow-blue-500/5">
          {loadingReferees ? (
            <div className="text-center py-24">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent shadow-lg "></div>
              <p className="mt-6 text-blue-600 font-black uppercase tracking-widest text-xs">
                {t("competition_management.loading_referees")}
              </p>
            </div>
          ) : referees.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-blue-100 dark:">
                <svg
                  className="w-12 h-12 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-black text-blue-900 dark:text-blue-100 uppercase tracking-tight mb-2">
                {t("competition_management.no_referees")}
              </h3>
              <p className="text-blue-500 text-xs font-bold italic">
                {t("competition_management.no_referees_desc")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-blue-50/50 dark:bg-blue-900/30 border-b border-blue-100 ">
                    <th className="px-6 py-5 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                      #
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                      {t("competition_management.referee_name")}
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                      {t("competition_management.unit")}
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                      {t("competition_management.country")}
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                      {t("competition_management.ref_machine")}
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                      {t("competition_management.ref_court")}
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-blue-400 uppercase tracking-widest text-right">
                      {t("competition_management.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50 dark:divide-blue-900/20">
                  {referees.map((ref, idx) => (
                    <tr
                      key={ref.id}
                      className="hover:bg-blue-50/30 dark:hover:bg-blue-950/30 transition-all duration-200"
                    >
                      <td className="px-6 py-4 text-xs font-black text-blue-400 font-mono">
                        {(idx + 1).toString().padStart(2, "0")}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-black text-blue-900 dark:text-blue-100 uppercase leading-none mb-1">
                            {ref.full_name}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">
                              {ref.country ||
                                t(
                                  "competition_management.internal_unit",
                                  "Nội bộ",
                                )}
                            </span>
                            {ref.country && (
                              <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
                            )}
                            <span className="text-[10px] font-bold text-blue-400">
                              #{ref.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-tighter bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded border border-blue-100 ">
                          {ref.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-tighter bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded border border-blue-100 ">
                          {ref.country}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5">
                          {[
                            ref.r1,
                            ref.r2,
                            ref.r3,
                            ref.r4,
                            ref.r5,
                            ref.r6,
                            ref.r7,
                          ].map((r, rIdx) => (
                            <button
                              key={rIdx}
                              onClick={() =>
                                handleToggleField(ref, `r${rIdx + 1}`)
                              }
                              className={`w-7 h-7 flex items-center justify-center text-[10px] font-black rounded shadow-sm border transition-all duration-300 hover:scale-110 active:scale-90 ${r
                                ? "bg-blue-600 text-white border-blue-700 "
                                : "bg-white dark:bg-blue-900/20 text-blue-300 border-blue-100 dark: hover:border-blue-400"
                                }`}
                              title={`${t("competition_management.round_label", "Round")} ${rIdx + 1} - ${t("competition_management.click_to_change", "Click để thay đổi")}`}
                            >
                              {rIdx + 1}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleToggleField(ref, "is_ref_machine")
                            }
                            className={`px-3 py-1.5 text-[9px] font-black rounded border transition-all duration-300 active:scale-90 shadow-sm ${ref.is_ref_machine
                              ? "bg-blue-600 text-white border-blue-800 shadow-blue-500/20"
                              : "bg-white dark:bg-blue-900/20 text-blue-300 border-blue-100 dark: hover:border-blue-400"
                              }`}
                            title={t(
                              "competition_management.click_assign_ref_machine",
                            )}
                          >
                            {t("competition_management.ref_machine")}
                          </button>
                          <button
                            onClick={() =>
                              handleToggleField(ref, "is_ref_court")
                            }
                            className={`px-3 py-1.5 text-[9px] font-black rounded border transition-all duration-300 active:scale-90 shadow-sm ${ref.is_ref_court
                              ? "bg-amber-600 text-white border-amber-800 shadow-amber-500/20"
                              : "bg-white dark:bg-blue-900/20 text-blue-300 border-blue-100 dark: hover:border-amber-400"
                              }`}
                            title={t(
                              "competition_management.click_assign_ref_court",
                            )}
                          >
                            {t("competition_management.ref_court")}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenRefModal("edit", ref)}
                            className="w-9 h-9 flex items-center justify-center text-blue-500 hover:text-white bg-white dark:bg-blue-900/20 border border-blue-100 dark: hover:bg-blue-600 hover:border-blue-600 rounded shadow-sm transition-all duration-300"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteReferee(ref.id)}
                            className="w-9 h-9 flex items-center justify-center text-red-400 hover:text-white bg-white dark:bg-blue-900/20 border border-blue-100 dark: hover:bg-red-600 hover:border-red-600 rounded shadow-sm transition-all duration-300"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </TabPanel>
    </>
  );
}
