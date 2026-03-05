import React from "react";
import { useTranslation } from "react-i18next";

const TableSelection = ({
  availableTables,
  selectedTables,
  handleTableToggle,
}) => {
  const { t } = useTranslation();

  const handleSelectAll = () => {
    availableTables.forEach((table) => handleTableToggle(table.name, true));
  };

  const handleDeselectAll = () => {
    availableTables.forEach((table) => handleTableToggle(table.name, false));
  };

  return (
    <div className="mb-8 space-y-6">
      {/* ===== HEADER SECTION - Premium Typography ===== */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">{t("data_sync.sync_config")}</h3>
          </div>
          <h4 className="text-xl font-black text-blue-950 dark:text-blue-100 uppercase tracking-tight">{t("data_sync.select_sync_tables")}</h4>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSelectAll}
            className="px-5 py-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 border-blue-100 dark:border-blue-800 hover:bg-blue-600 hover:text-white transition-all active:scale-95 flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            {t("data_sync.select_all")}
          </button>
          <button
            onClick={handleDeselectAll}
            className="px-5 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 border-gray-100 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95 flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            {t("data_sync.deselect_all")}
          </button>
        </div>
      </div>

      {/* ===== SELECTION GRID - Modern Cards ===== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {availableTables.map((table) => {
          const isSelected = selectedTables.includes(table.name);
          return (
            <label
              key={table.name}
              className={`group flex items-center gap-4 p-5 rounded-[1.5rem] border-2 cursor-pointer transition-all duration-300 relative overflow-hidden ${isSelected
                ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-400  ring-4 ring-blue-500/5 translate-y-[-2px]"
                : "bg-white dark:bg-gray-900 border-blue-50/50 dark:border-blue-900/20 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50/20 dark:hover:bg-blue-900/10"
                }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 w-12 h-12 bg-blue-600 text-white flex items-center justify-center rounded-bl-[1.5rem]  animate-in fade-in slide-in-from-top-4 duration-300">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
              )}

              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => handleTableToggle(table.name, e.target.checked)}
                  className="w-5 h-5 rounded-lg border-2 border-blue-200 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 transition-all opacity-0 absolute"
                />
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 text-white' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-200 group-hover:text-blue-400'}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                </div>
              </div>

              <div className="flex-1 space-y-1">
                <div className={`text-[11px] font-black uppercase tracking-tight transition-colors ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-600 dark:text-gray-400 group-hover:text-blue-500'}`}>
                  {table.label}
                </div>
                <div className={`text-[10px] font-black transition-colors ${isSelected ? 'text-blue-500 dark:text-blue-300' : 'text-gray-400 group-hover:text-blue-400/70'}`}>
                  {table.count} <span className="text-[8px] opacity-50 uppercase tracking-widest">{t("data_sync.records")}</span>
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {/* ===== STATISTICS BAR - Sophisticated Display ===== */}
      <div className="flex items-center gap-4 pt-4 border-t border-blue-50 dark:border-blue-900/20">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800 ">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          {t("data_sync.selected_tables_count", { selected: selectedTables.length, total: availableTables.length })}
        </div>
      </div>
    </div>
  );
};

export default TableSelection;

