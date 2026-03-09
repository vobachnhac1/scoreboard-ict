import React from "react";
import { useTranslation } from "react-i18next";

export default function OperationFlowchart() {
    const { t } = useTranslation();

    const isVietnamese = t("user_guide.title") === "Hướng dẫn sử dụng";

    const steps = [
        {
            id: 1,
            name: isVietnamese ? "1. Cài đặt & Hạ tầng" : "1. Setup & Infra",
            desc: isVietnamese ? "Mở Server, thiết lập mạng LAN" : "Start Server, setup LAN",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
            ),
            color: "from-slate-500 to-slate-600",
            bg: "bg-slate-100 dark:bg-slate-800",
            text: "text-slate-600 dark:text-slate-400"
        },
        {
            id: 2,
            name: isVietnamese ? "2. Thiết lập Giải" : "2. Tournament Setup",
            desc: isVietnamese ? "Tạo giải, Import VĐV, Bốc thăm" : "Create tournament, Import athletes",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            color: "from-indigo-500 to-indigo-600",
            bg: "bg-indigo-100 dark:bg-indigo-900/40",
            text: "text-indigo-600 dark:text-indigo-400"
        },
        {
            id: 3,
            name: isVietnamese ? "3. Kết nối Giám định" : "3. Connect Devices",
            desc: isVietnamese ? "Quét QR, gán quyền Trọng tài" : "Scan QR, assign referee roles",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            ),
            color: "from-blue-500 to-blue-600",
            bg: "bg-blue-100 dark:bg-blue-900/40",
            text: "text-blue-600 dark:text-blue-400"
        },
        {
            id: 4,
            name: isVietnamese ? "4. Điều hành & Chấm điểm" : "4. Conduct & Score",
            desc: isVietnamese ? "Chấm điểm trực tiếp, cập nhật kết quả" : "Live scoring, real-time results",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            ),
            color: "from-emerald-500 to-emerald-600",
            bg: "bg-emerald-100 dark:bg-emerald-900/40",
            text: "text-emerald-600 dark:text-emerald-400"
        },
        {
            id: 5,
            name: isVietnamese ? "5. Kết xuất Báo cáo" : "5. Export Reports",
            desc: isVietnamese ? "In biên bản, xuất bảng xếp hạng" : "Print minutes, export rankings",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            color: "from-amber-500 to-amber-600",
            bg: "bg-amber-100 dark:bg-amber-900/40",
            text: "text-amber-600 dark:text-amber-400"
        }
    ];

    return (
        <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-8 pb-4">
            <div className="mb-6">
                <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {isVietnamese ? "Sơ đồ Quy trình Vận hành" : "Operational Flowchart"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {isVietnamese ? "Tổng quan các bước thực hiện trên phần mềm DIGISPORTS" : "Overview of the execution steps on the DIGISPORTS software"}
                </p>
            </div>

            <div className="relative">
                {/* Background Connecting Line (Desktop only) */}
                <div className="hidden lg:block absolute top-[2.5rem] left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700 z-0"></div>

                <div className="flex flex-col lg:flex-row justify-between items-start gap-6 lg:gap-4 relative z-10 w-full overflow-x-auto pb-4">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex flex-col items-center lg:w-1/5 shrink-0 w-full">
                            {/* Icon Circle */}
                            <div
                                className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center bg-gradient-to-br ${step.color} shadow-lg text-white mb-4 relative group hover:-translate-y-1 transition-transform duration-300`}
                            >
                                {step.icon}

                                {/* Arrow indicator (Mobile) */}
                                {index < steps.length - 1 && (
                                    <div className="lg:hidden absolute -bottom-8 text-slate-300 dark:text-slate-600">
                                        <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Text Content */}
                            <div className="text-center px-2">
                                <h4 className={`text-[13px] font-black uppercase tracking-wide mb-2 ${step.text}`}>
                                    {step.name}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[160px] mx-auto hidden lg:block">
                                    {step.desc}
                                </p>
                                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 lg:hidden">
                                    {step.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
