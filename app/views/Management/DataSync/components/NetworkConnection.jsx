import React from "react";
import { useTranslation } from "react-i18next";
import IpMasker from "../../../../common/IpMasker";
import useConfirmModal from "../../../../hooks/useConfirmModal";

const NetworkConnection = ({
  localIP,
  iplocalRef,
  manualServerIP,
  setManualServerIP,
  isManualConnected,
  manualServerInfo,
  isScanning,
  scannedServers,
  scanDone,
  loading,
  handleManualConnect,
  handleManualDisconnect,
  handleScanNetwork,
  handleConnectScanned,
  showAlert
}) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ===== MY CONNECTION CODE - Gradient Card ===== */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-blue-600 rounded-[1rem] opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-900/30 rounded-[1rem] p-8  overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-blue-600/5 dark:bg-blue-600/10 rounded-full"></div>

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-blue-600 rounded flex items-center justify-center text-white rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <div>
                <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2 opacity-70">
                  {t("data_sync.your_machine_id")}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-black text-blue-950 dark:text-blue-100  tracking-tighter">
                    {IpMasker?.mask(localIP, "hash", null, "sync")?.display ?? "........"}
                  </span>
                  {localIP && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(iplocalRef.current);
                        showAlert(t("data_sync.copied_connection_code"));
                      }}
                      className="p-2.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-600 hover:text-white transition-all  active:scale-90"
                      title={t("data_sync.copy_code")}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center lg:items-end gap-2 bg-blue-50/50 dark:bg-blue-950/20 px-6 py-4 rounded border border-blue-100 dark:border-blue-900/30">
              <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest opacity-60">{t("data_sync.real_ip_address")}</div>
              <div className="text-lg font-black  text-blue-900 dark:text-blue-100 tracking-tight">{localIP || "N/A"}</div>
            </div>
          </div>

          <div className="mt-8 flex gap-4 p-4 bg-amber-50/50 dark:bg-amber-900/10 border-2 border-dashed border-amber-200 dark:border-amber-800 rounded items-center">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[11px] font-bold text-amber-800 dark:text-amber-400 italic leading-relaxed" dangerouslySetInnerHTML={{ __html: t("data_sync.connection_guide") }}></p>
          </div>
        </div>
      </div>

      {/* ===== CONNECTION STATUS - Pulse Indicator ===== */}
      {isManualConnected && manualServerInfo && (
        <div className="bg-white dark:bg-gray-800 border-2 border-emerald-100 dark:border-emerald-900/30 rounded p-6  group">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative flex h-12 w-12">
                <span className="animate-ping absolute inline-flex h-full w-full rounded bg-emerald-400 opacity-20"></span>
                <div className="relative inline-flex rounded h-12 w-12 bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                  </svg>
                </div>
              </div>
              <div>
                <div className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-1">
                  {t("data_sync.establishing_connection")}
                </div>
                <div className="text-xl font-black text-blue-950 dark:text-blue-100  tracking-tight">
                  {t("data_sync.connected_to_host", { ip: manualServerInfo.ip })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleQuickSyncAll}
                disabled={syncing}
                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2"
              >
                {syncing ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
                {t("data_sync.quick_sync_all", { defaultValue: "ĐỒNG BỘ NHANH (ALL)" })}
              </button>
              
              <button
                onClick={handleManualDisconnect}
                className="px-8 py-3.5 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white border-2 border-rose-100 dark:border-rose-900/30 rounded text-[10px] font-black uppercase tracking-widest transition-all  active:scale-95"
              >
                {t("data_sync.disconnect")}
              </button>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800">
               <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                 VAI TRÒ THIẾT BỊ NÀY
               </div>
               <p className="text-[11px] font-bold text-blue-900 dark:text-blue-200 uppercase tracking-tight">
                 MÁY TRẠM (CLIENT) - Gửi dữ liệu đi
               </p>
            </div>
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/20 rounded border border-indigo-100 dark:border-indigo-800">
               <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                 VAI TRÒ MÁY ĐỐI TÁC
               </div>
               <p className="text-[11px] font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-tight">
                 MÁY CHỦ (SERVER) - Nhận & Duyệt dữ liệu
               </p>
            </div>
          </div>
        </div>
      )}

      {/* ===== MANUAL CONNECT FORM - Premium Inputs ===== */}
      {!isManualConnected && (
        <div className="bg-white dark:bg-gray-800 border border-blue-50 dark:border-blue-900/30 rounded p-8  ">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 flex items-center justify-center rounded text-blue-600 dark:text-blue-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className="text-sm font-black text-blue-900 dark:text-blue-100 uppercase tracking-widest">
              {t("data_sync.setup_server_connection")}
            </h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] px-1">
                {t("data_sync.enter_hash_or_ip")}
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={manualServerIP}
                    onChange={(e) => setManualServerIP(e.target.value)}
                    placeholder={t("data_sync.paste_hash_or_ip_placeholder")}
                    disabled={loading}
                    className="w-full px-4 py-2 italic bg-blue-50/50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-800 focus:border-blue-500 outline-none rounded text-sm text-blue-950 dark:text-blue-100 transition-all "
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 dark:text-blue-700 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                </div>
                <button
                  onClick={handleManualConnect}
                  disabled={loading || !manualServerIP.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-[10px] font-black uppercase tracking-widest transition-all  active:scale-95  whitespace-nowrap min-w-[150px]"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{t("data_sync.connecting")}</span>
                    </div>
                  ) : t("data_sync.join_connection")}
                </button>
              </div>
            </div>

            {/* Scanned Servers - List view UI refinement */}
            {scanDone && (
              <div className="pt-6 border-t border-blue-50 dark:border-blue-900/30">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 px-1">{t("data_sync.servers_found_in_network")}</p>
                {scannedServers.length === 0 ? (
                  <div className="p-10 bg-blue-50/30 dark:bg-blue-950/10 rounded border-2 border-dashed border-blue-100 dark:border-blue-900/30 text-center">
                    <p className="text-[11px] font-black text-blue-400/60 uppercase tracking-widest">{t("data_sync.no_online_machines")}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {scannedServers.map((server, idx) => (
                      <div
                        key={idx}
                        className="p-5 bg-white dark:bg-gray-800 border-2 border-blue-50 dark:border-blue-900/30 rounded flex flex-col gap-4  hover: hover:border-blue-300 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900 rounded flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className=" text-sm font-black text-blue-950 dark:text-blue-100 truncate">
                              {server.ip}
                            </div>
                            {/* <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest opacity-60">
                              {t("data_sync.port", { port: server.port })}
                            </div> */}
                          </div>
                        </div>
                        <button
                          onClick={() => handleConnectScanned(server)}
                          className="w-full py-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                        >
                          {t("data_sync.connect_now")}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkConnection;

