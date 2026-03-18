import React from 'react';

const ControlDashboard = ({
    showCompetitionBoard,
    setShowCompetitionBoard,
    controlBoardPosition,
    dashboardScale,
    handleMouseDownControl,
    redScore,
    blueScore,
    handleScoreChange,
    handleMedical,
    handleWinner,
    handleRemind,
    handleWarn,
    handleKick,
    handleBien,
    handleNga,
    disableRedButtons,
    disableBlueButtons,
    buttonPermissions,
    t
}) => {
    if (!showCompetitionBoard) return null;

    return (
        <div
            className="fixed bottom-[60px] left-1/2 -translate-x-1/2 w-full max-w-[1300px] select-none z-[55] px-6"
            style={{
                transform: `translate(calc(-50% + ${controlBoardPosition.x}px), ${controlBoardPosition.y}px) scale(${dashboardScale})`,
                transformOrigin: 'bottom center',
            }}
        >
            <div className="bg-gray-900/60 backdrop-blur-3xl rounded border border-white/10 overflow-hidden flex flex-row">
                {/* Body Content */}
                <div className="flex-1 p-2 px-4 grid grid-cols-2 gap-4 max-h-[50vh] overflow-hidden">
                    {/* Cột ĐỎ */}
                    <div className="w-[480px] h-[220px] bg-red-950/40 backdrop-blur-md rounded p-4 border border-red-500/30 flex flex-col justify-between shadow-2xl relative overflow-hidden shrink-0">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>

                        <div className="flex items-start gap-4">
                            <div className="w-24 h-24 bg-black/40 rounded border border-red-500/20 flex flex-col items-center justify-center shadow-inner relative group shrink-0">
                                <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors"></div>
                                <span className="text-[9px] font-black text-red-500/60 uppercase tracking-[0.2em] mb-1 z-10">{t("scoreboard.doikhang.red_team")}</span>
                                <div className="text-5xl font-black text-white leading-none drop-shadow-[0_0_15px_rgba(239,68,68,0.6)] z-10">
                                    {redScore}
                                </div>
                            </div>

                            <div className="flex-1 grid grid-cols-5 gap-1.5">
                                {[1, 2, 3, 5, 10].map(val => (
                                    buttonPermissions[`hien_thi_button_diem_${val}`] && (
                                        <div key={val} className="flex flex-col gap-1">
                                            <button onClick={() => handleScoreChange("red", val)} disabled={disableRedButtons} className="bg-red-600 hover:bg-red-500 text-white py-2.5 rounded text-lg font-black transition-all active:scale-90 flex items-center justify-center">+{val}</button>
                                            <button onClick={() => handleScoreChange("red", -val)} disabled={disableRedButtons} className="bg-red-900/40 hover:bg-red-900/60 text-red-300 py-1 rounded text-[10px] font-bold border border-red-500/10 active:scale-95 transition-colors">-{val}</button>
                                        </div>
                                    )
                                ))}
                            </div>

                            <div className="flex flex-col gap-1.5 shrink-0">
                                {buttonPermissions.hien_thi_button_y_te && (
                                    <button onClick={() => handleMedical("red")} disabled={disableRedButtons} className="bg-red-700 hover:bg-red-600 text-white p-2.5 rounded active:scale-90 border-b-2 border-red-900 transition-all shadow-lg"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2v2h2v-2h2V9H9V7H7v2z" clipRule="evenodd" /></svg></button>
                                )}
                                {buttonPermissions.hien_thi_button_thang && (
                                    <button onClick={() => handleWinner("red")} disabled={disableRedButtons} className="bg-yellow-500 hover:bg-yellow-400 text-red-950 p-2.5 rounded active:scale-90 border-b-2 border-yellow-700 transition-all shadow-lg"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg></button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                            <div className="flex-1 grid grid-cols-3 gap-2">
                                {buttonPermissions.hien_thi_button_nhac_nho && (
                                    <div className="flex flex-col gap-1">
                                        <button onClick={() => handleRemind("red", 1)} disabled={disableRedButtons} className="bg-amber-600/80 hover:bg-amber-600 text-white py-2 rounded text-[10px] font-black border-b-2 border-amber-900 transition-all">NHẮC NHỞ</button>
                                        <button onClick={() => handleRemind("red", -1)} disabled={disableRedButtons} className="bg-amber-950/40 text-amber-200/60 py-1 rounded text-[9px] font-bold border border-amber-500/10 active:scale-95 leading-none">-1</button>
                                    </div>
                                )}
                                {buttonPermissions.hien_thi_button_canh_cao && (
                                    <div className="flex flex-col gap-1">
                                        <button onClick={() => handleWarn("red", 1)} disabled={disableRedButtons} className="bg-orange-600/80 hover:bg-orange-600 text-white py-2 rounded text-[10px] font-black border-b-2 border-orange-900 transition-all">CẢNH CÁO</button>
                                        <button onClick={() => handleWarn("red", -1)} disabled={disableRedButtons} className="bg-orange-950/40 text-orange-200/60 py-1 rounded text-[9px] font-bold border border-orange-500/10 active:scale-95 leading-none">-1</button>
                                    </div>
                                )}
                                {buttonPermissions.hien_thi_button_don_chan && (
                                    <div className="flex flex-col gap-1">
                                        <button onClick={() => handleKick("red", 1)} disabled={disableRedButtons} className="bg-cyan-600/80 hover:bg-cyan-600 text-white py-2 rounded text-[10px] font-black border-b-2 border-cyan-900 transition-all">ĐÒN CHÂN</button>
                                        <button onClick={() => handleKick("red", -1)} disabled={disableRedButtons} className="bg-cyan-950/40 text-cyan-200/60 py-1 rounded text-[9px] font-bold border border-cyan-500/20 active:scale-95 leading-none">-1</button>
                                    </div>
                                )}
                            </div>
                            <div className="w-24 flex flex-col gap-1 shrink-0">
                                {buttonPermissions.hien_thi_button_bien && <button onClick={() => handleBien("red")} disabled={disableRedButtons} className="bg-slate-700 hover:bg-slate-600 text-white py-1.5 rounded text-[10px] font-black border border-slate-500/20">BIÊN</button>}
                                {buttonPermissions.hien_thi_button_nga && <button onClick={() => handleNga("red")} disabled={disableRedButtons} className="bg-slate-800 hover:bg-slate-700 text-white py-1.5 rounded text-[10px] font-black border border-slate-500/20">NGÃ</button>}
                            </div>
                        </div>
                    </div>

                    {/* Cột XANH */}
                    <div className="w-[480px] h-[220px] bg-blue-950/40 backdrop-blur-md rounded p-4 border border-blue-500/30 flex flex-col justify-between text-right shadow-2xl relative overflow-hidden shrink-0">
                        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

                        <div className="flex items-start gap-4 flex-row-reverse">
                            <div className="w-24 h-24 bg-black/40 rounded border border-blue-500/20 flex flex-col items-center justify-center shadow-inner relative group shrink-0">
                                <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
                                <span className="text-[9px] font-black text-blue-500/60 uppercase tracking-[0.2em] mb-1 z-10">{t("scoreboard.doikhang.blue_team")}</span>
                                <div className="text-5xl font-black text-white leading-none drop-shadow-[0_0_15px_rgba(59,130,246,0.6)] z-10">
                                    {blueScore}
                                </div>
                            </div>

                            <div className="flex-1 grid grid-cols-5 gap-1.5 flex-row-reverse">
                                {[1, 2, 3, 5, 10].map(val => (
                                    buttonPermissions[`hien_thi_button_diem_${val}`] && (
                                        <div key={val} className="flex flex-col gap-1">
                                            <button onClick={() => handleScoreChange("blue", val)} disabled={disableBlueButtons} className="bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded text-lg font-black transition-all active:scale-90 flex items-center justify-center">+{val}</button>
                                            <button onClick={() => handleScoreChange("blue", -val)} disabled={disableBlueButtons} className="bg-blue-900/40 hover:bg-blue-900/60 text-blue-300 py-1 rounded text-[10px] font-bold border border-blue-500/10 active:scale-95 transition-colors">-{val}</button>
                                        </div>
                                    )
                                ))}
                            </div>

                            <div className="flex flex-col gap-1.5 shrink-0 flex-row-reverse">
                                {buttonPermissions.hien_thi_button_y_te && (
                                    <button onClick={() => handleMedical("blue")} disabled={disableBlueButtons} className="bg-blue-700 hover:bg-blue-600 text-white p-2.5 rounded active:scale-90 border-b-2 border-blue-900 transition-all shadow-lg"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2v2h2v-2h2V9H9V7H7v2z" clipRule="evenodd" /></svg></button>
                                )}
                                {buttonPermissions.hien_thi_button_thang && (
                                    <button onClick={() => handleWinner("blue")} disabled={disableBlueButtons} className="bg-yellow-500 hover:bg-yellow-400 text-red-950 p-2.5 rounded active:scale-90 border-b-2 border-yellow-700 transition-all shadow-lg"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg></button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-3 border-t border-white/10 flex-row-reverse">
                            <div className="flex-1 grid grid-cols-3 gap-2 flex-row-reverse">
                                {buttonPermissions.hien_thi_button_nhac_nho && (
                                    <div className="flex flex-col gap-1">
                                        <button onClick={() => handleRemind("blue", 1)} disabled={disableBlueButtons} className="bg-amber-600/80 hover:bg-amber-600 text-white py-2 rounded text-[10px] font-black border-b-2 border-amber-900 transition-all">NHẮC NHỞ</button>
                                        <button onClick={() => handleRemind("blue", -1)} disabled={disableBlueButtons} className="bg-amber-950/40 text-amber-200/60 py-1 rounded text-[9px] font-bold border border-amber-500/10 active:scale-95 leading-none">-1</button>
                                    </div>
                                )}
                                {buttonPermissions.hien_thi_button_canh_cao && (
                                    <div className="flex flex-col gap-1">
                                        <button onClick={() => handleWarn("blue", 1)} disabled={disableBlueButtons} className="bg-orange-600/80 hover:bg-orange-600 text-white py-2 rounded text-[10px] font-black border-b-2 border-orange-900 transition-all">CẢNH CÁO</button>
                                        <button onClick={() => handleWarn("blue", -1)} disabled={disableBlueButtons} className="bg-orange-950/40 text-orange-200/60 py-1 rounded text-[9px] font-bold border border-orange-500/10 active:scale-95 leading-none">-1</button>
                                    </div>
                                )}
                                {buttonPermissions.hien_thi_button_don_chan && (
                                    <div className="flex flex-col gap-1">
                                        <button onClick={() => handleKick("blue", 1)} disabled={disableBlueButtons} className="bg-cyan-600/80 hover:bg-cyan-600 text-white py-2 rounded text-[10px] font-black border-b-2 border-cyan-900 transition-all">ĐÒN CHÂN</button>
                                        <button onClick={() => handleKick("blue", -1)} disabled={disableBlueButtons} className="bg-cyan-950/40 text-cyan-200/60 py-1 rounded text-[9px] font-bold border border-cyan-500/20 active:scale-95 leading-none">-1</button>
                                    </div>
                                )}
                            </div>
                            <div className="w-24 flex flex-col gap-1 shrink-0 flex-row-reverse">
                                {buttonPermissions.hien_thi_button_bien && <button onClick={() => handleBien("blue")} disabled={disableBlueButtons} className="bg-slate-700 text-white flex-1 py-1.5 rounded text-[10px] font-black border border-slate-900">BIÊN</button>}
                                {buttonPermissions.hien_thi_button_nga && <button onClick={() => handleNga("blue")} disabled={disableBlueButtons} className="bg-slate-800 text-white flex-1 py-1.5 rounded text-[10px] font-black border border-slate-900">NGÃ</button>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Drag Handle & Close Sidebar */}
                <div
                    onMouseDown={handleMouseDownControl}
                    className="w-10 bg-gray-800/90 border-l border-white/5 flex flex-col items-center justify-between py-8 cursor-move active:cursor-grabbing hover:bg-gray-700/90 transition-all shrink-0 group/rail"
                >
                    <div className="flex flex-col items-center gap-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/20 group-hover/rail:text-white/40 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </div>

                    <button
                        onClick={() => setShowCompetitionBoard(false)}
                        className="bg-white/5 hover:bg-white/10 p-2.5 rounded transition-all group/btn shadow-[0_4px_15px_rgba(0,0,0,0.3)] active:scale-90"
                        title="CLOSE"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/40 group-hover/btn:text-white/80 group-hover/btn:scale-110 transition-all" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ControlDashboard;
