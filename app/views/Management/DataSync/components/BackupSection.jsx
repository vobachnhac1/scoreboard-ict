import React from 'react';

const BackupSection = ({
  t,
  ftpBackups,
  isLoadingFtp,
  handleFtpBackup,
  handleFtpRestore,
  handleTestFtpConnection,
  refreshFtpBackups,
  showConfirm,
  showError,
  showSuccess
}) => {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">

      {/* Top Actions Grid */}
      <div className="grid grid-cols-1 gap-8">

        {/* LOCAL BACKUP CARD - Temporarily hidden as requested */}
        {/* <div className="relative group p-8 bg-white dark:bg-gray-800 rounded border border-emerald-50 dark:border-emerald-900/30 shadow-xl shadow-emerald-500/5 transition-all hover:shadow-emerald-500/10">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 rounded flex items-center justify-center text-emerald-500 border border-emerald-100 dark:border-emerald-800">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
              </div>
              <div>
                <h3 className="text-xl font-black text-emerald-950 dark:text-emerald-50 tracking-tight">{t("data_sync.local_backup", "Sao lưu Tĩnh")}</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{t("data_sync.manual_storage", "Lưu trữ thủ công")}</p>
              </div>
            </div>
          </div>
          
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            {t("data_sync.local_backup_desc", "Tải tệp về máy hoặc khôi phục từ tệp có sẵn. An toàn tuyệt đối cho lưu trữ ngoại tuyến.")}
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => window.open('http://localhost:6789/api/sync/backup')}
              className="flex-1 min-w-[140px] px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-3 3m0 0l-3-3m3 3V4" /></svg>
              {t("data_sync.download_file", "Tải file")}
            </button>
            
            <label className="flex-1 min-w-[140px] cursor-pointer px-6 py-4 bg-white dark:bg-gray-800 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg transition-all active:scale-95 flex items-center justify-center gap-3">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-3-3m0 0L8 8m4-4v12" /></svg>
              {t("data_sync.restore_local", "Khôi phục tĩnh")}
              <input type="file" accept=".sqlite" className="hidden" onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const confirm = await showConfirm(t("data_sync.confirm_reset_app", "CẢNH BÁO: Ghi đè dữ liệu & Reset ứng dụng?"));
                  if (!confirm) { e.target.value = null; return; }
                  const formData = new FormData();
                  formData.append("db_file", file);
                  try {
                    const res = await fetch("http://localhost:6789/api/sync/restore", { method: "POST", body: formData });
                    const data = await res.json();
                    if(data.success) { 
                      showSuccess(data.message); 
                      // window.location.reload(); 
                    }
                    else { showError(t("common.error", "Lỗi") + ": " + data.message); }
                  } catch (err) { showError(t("common.error", "Lỗi") + ": " + err.message); }
                  e.target.value = null;
                }} 
              />
            </label>
          </div>
        </div> */}

        {/* SFTP SERVER BACKUP CARD - Premium Redesign */}
        <div className="relative group overflow-hidden">
          {/* Performance Glow Aura */}
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded blur-xl opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>

          <div className="relative p-10 bg-white dark:bg-gray-800 rounded border border-amber-100/50 dark:border-amber-900/30 shadow-2xl shadow-amber-500/5 transition-all duration-500 group-hover:shadow-amber-500/10 group-hover:-translate-y-1">
            {/* Corner Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full -mr-16 -mt-16 opacity-50"></div>

            <div className="flex items-start justify-between mb-10 relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded flex items-center justify-center text-white shadow-lg shadow-amber-500/30 border border-amber-400/30 transform group-hover:rotate-3 transition-transform duration-500">
                  <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t("data_sync.server_backup", "Sao lưu Server")}</h3>
                    <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-[9px] font-black text-amber-600 dark:text-amber-400 rounded-full uppercase tracking-tighter border border-amber-200 dark:border-amber-800">
                      Enterprise
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-amber-600/60 dark:text-amber-400/40 uppercase tracking-[0.2em]">{t("data_sync.sftp_infrastructure", "Hạ tầng DigiSports")}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleTestFtpConnection}
                  disabled={isLoadingFtp}
                  title={t("data_sync.test_connection", "Kiểm tra kết nối")}
                  className="p-3.5 bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 rounded border border-amber-100 dark:border-amber-600 shadow-sm hover:shadow-md hover:bg-amber-50 transition-all active:scale-90"
                >
                  <svg className={`w-5 h-5 ${isLoadingFtp ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </button>
                <button
                  onClick={refreshFtpBackups}
                  disabled={isLoadingFtp}
                  title={t("data_sync.refresh_list", "Làm mới danh sách")}
                  className="p-3.5 bg-white dark:bg-gray-700 text-gray-400 rounded border border-gray-100 dark:border-gray-600 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all active:scale-90"
                >
                  <svg className={`w-5 h-5 ${isLoadingFtp ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
              </div>
            </div>

            <div className="relative p-6 bg-amber-50/30 dark:bg-amber-900/10 rounded border border-amber-100/50 dark:border-amber-800/20 mb-10 overflow-hidden">
              {/* Background Cloud Icon */}
              <svg className="absolute -right-4 -bottom-4 w-24 h-24 text-amber-500/5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.5,19c-3.037,0-5.5-2.463-5.5-5.5c0-0.106,0.003-0.211,0.009-0.316C10.978,13.067,9.75,13,8.5,13C5.462,13,3,15.462,3,18.5S5.462,24,8.5,24h9c2.485,0,4.5-2.015,4.5-4.5S19.985,15,17.5,15c-0.106,0-0.211,0.003-0.316,0.009C17.067,14.022,17,12.794,17,11.5c0-3.037,2.463-5.5,5.5-5.5c0.106,0,0.211,0.003,0.316,0.009C22.933,5.022,23,3.794,23,2.5C23,1.119,21.881,0,20.5,0c-1.381,0-2.5,1.119-2.5,2.5c0,0.106,0.003,0.211,0.009,0.316C16.978,2.772,15.75,2.5,14.5,2.5c-3.037,0-5.5,2.463-5.5,5.5c0,0.106,0.003,0.211,0.009,0.316C7.978,8.272,6.75,8,5.5,8C2.462,8,0,10.462,0,13.5S2.462,19,5.5,19h12H17.5z" /></svg>

              <p className="relative z-10 text-sm font-bold text-gray-500 dark:text-gray-400 leading-relaxed italic">
                "{t("data_sync.server_backup_desc", "Lưu trữ dữ liệu lên đám mây bảo mật của chúng tôi. Cho phép khôi phục tức thì từ bất kỳ đâu.")}"
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleFtpBackup}
                disabled={isLoadingFtp}
                className="group/btn relative overflow-hidden px-8 py-3.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                {/* Shine effect */}
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover/btn:animate-shine" />

                <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {t("data_sync.create_cloud_backup", "Tạo bản sao lưu Cloud")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* LIST OF SERVER BACKUPS - Premium Redesign */}
      <div className="relative mt-8">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/50 to-amber-50/20 dark:via-gray-900/10 dark:to-amber-900/5 rounded -z-10"></div>

        <div className="p-10 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-500/5">
          <div className="flex items-center justify-between mb-10">
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-4">
                <div className="w-2.5 h-2.5 bg-amber-500 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.5)]"></div>
                {t("data_sync.backup_history", "Lịch sử sao lưu")}
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-6 opacity-70">Cloud Archive Management</p>
            </div>
            <div className="px-5 py-2.5 bg-gray-50 dark:bg-gray-900 rounded border border-gray-100 dark:border-gray-800 flex items-center gap-3 group/total">
              <svg className="w-3.5 h-3.5 text-amber-500 group-hover/total:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" strokeWidth={2.5} /></svg>
              <span className="text-[11px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest">
                {t("data_sync.total_records", { count: ftpBackups.length })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {ftpBackups.length > 0 ? (
              ftpBackups.map((file) => (
                <div key={file.id} className="group flex items-center justify-between p-6 bg-white dark:bg-gray-900/50 hover:bg-amber-50/40 dark:hover:bg-amber-900/10 rounded border border-gray-100 dark:border-gray-800 hover:border-amber-200 dark:hover:border-amber-800/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded shadow-sm flex items-center justify-center text-amber-500 border border-gray-100 dark:border-gray-700 group-hover:scale-110 group-hover:bg-white dark:group-hover:bg-gray-700 group-hover:rotate-2 transition-all duration-500">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="space-y-1.5 focus:outline-none">
                      <h4 className="font-black text-gray-950 dark:text-gray-50 text-base tracking-tight mb-1 truncate max-w-[300px]" title={file.name}>
                        {t("data_sync.backup_display_name", "Bản sao lưu")} - {new Date(file.createdTime).toLocaleString()}
                      </h4>
                      <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 dark:text-gray-500">
                        <span className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/80 px-2 py-1 rounded border border-gray-100 dark:border-gray-800">
                          <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2.5} /></svg>
                          {new Date(file.createdTime).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded border border-amber-100/50 dark:border-amber-800/30 text-amber-600 dark:text-amber-400">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7" strokeWidth={2.5} /></svg>
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleFtpRestore(file.id)}
                      disabled={isLoadingFtp}
                      className="px-6 py-4 bg-gray-950 dark:bg-amber-600 text-white hover:bg-black dark:hover:bg-amber-700 rounded text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-gray-950/20 dark:shadow-amber-500/20 transition-all active:scale-[0.98] flex items-center gap-3 overflow-hidden relative group/btn-restore"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-transparent -translate-x-full group-hover/btn-restore:translate-x-full transition-transform duration-700"></div>
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
                      <span className="relative z-10">{t("data_sync.restore_action", "Khôi phục")}</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-24 flex flex-col items-center justify-center text-gray-300 dark:text-gray-700 bg-gray-50/30 dark:bg-gray-900/20 rounded border-2 border-dashed border-gray-100 dark:border-gray-800">
                <div className="p-8 bg-white dark:bg-gray-800 rounded-full mb-8 shadow-inner shadow-gray-500/5">
                  <svg className="w-20 h-20 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <p className="font-black text-xs uppercase tracking-[0.4em] opacity-50">{t("data_sync.no_backups_found", "Hệ thống chưa ghi nhận bản sao lưu nào")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupSection;
