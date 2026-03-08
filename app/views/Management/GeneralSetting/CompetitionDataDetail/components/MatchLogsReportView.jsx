import React from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../../../config/redux/store";

export default function MatchLogsReportView({ row }) {
  const [loading, setLoading] = React.useState(true);
  const [logs, setLogs] = React.useState([]);
  const configSystem = useAppSelector(state => state.configSystem);
  const { t } = useTranslation();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (row.match_id) {
          const res = await axios.get(`http://localhost:6789/api/competition-match/${row.match_id}/history`);
          if (res?.data?.success) {
            const history = res.data.data;
            const latestHistory = history[history.length - 1];
            setLogs(latestHistory?.logs || []);
          }
        }
      } catch (error) {
        console.error("Fetch logs error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [row.match_id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-black rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-bold uppercase text-[7pt] tracking-widest">Đang tải chi tiết diễn biến...</p>
      </div>
    );
  }

  const redAthlete = { name: row.data[3] || "—", unit: row.data[4] || "—" };
  const blueAthlete = { name: row.data[6] || "—", unit: row.data[7] || "—" };

  return (
    <div className="bg-white text-black min-h-0 font-serif p-0 print:p-0">
      <div className="max-w-[210mm] mx-auto bg-white p-[10mm] sm:p-[20mm] print:p-[15mm]">
        {/* Header */}
        <div className="flex justify-between items-start mb-10 border-b border-black pb-8">
          <div className="text-center w-5/12">
            <h4 className="font-bold text-[9pt] uppercase">{configSystem.data?.don_vi_to_chuc || "BAN TỔ CHỨC GIẢI"}</h4>
            <p className="text-[7pt] italic font-medium -mt-1">Organizing Committee</p>
          </div>
          <div className="text-center w-6/12">
            <h4 className="font-bold text-[9pt] uppercase leading-tight">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h4>
            <h5 className="font-bold text-[8pt]">Độc lập - Tự do - Hạnh phúc</h5>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-[18pt] font-black uppercase leading-none">{t("competition_detail.modals.match_logs_title")}</h1>
          <h2 className="text-[10pt] font-bold text-gray-400 uppercase italic mt-1 tracking-widest">{t("competition_detail.modals.chronological_logs")}</h2>
          <p className="mt-4 text-[11pt] font-black uppercase underline decoration-1 underline-offset-4">{configSystem.data?.ten_giai_dau || "—"}</p>
        </div>

        <div className="grid grid-cols-3 border-2 border-black divide-x-2 divide-black mb-8 bg-gray-50 uppercase font-black text-[8pt]">
          <div className="p-3 text-center flex flex-col items-center">
            <span className="text-[12pt] font-black">{redAthlete.name}</span>
            <span className="text-gray-400">ĐỎ (RED)</span>
          </div>
          <div className="p-3 text-center flex flex-col items-center justify-center">
            <span className="text-lg">#{row.data[0]}</span>
            <span className="text-gray-400">{t("competition_detail.modals.match_label")}</span>
          </div>
          <div className="p-3 text-center flex flex-col items-center">
            <span className="text-[12pt] font-black">{blueAthlete.name}</span>
            <span className="text-gray-400">XANH (BLUE)</span>
          </div>
        </div>

        <table className="w-full border-collapse border-b-2 border-black text-[8.5pt]">
          <thead>
            <tr className="bg-black text-white text-center font-black uppercase">
              <th className="p-2 w-12 border-r border-white/20">{t("competition_detail.round_history.round")}</th>
              <th className="p-2 w-20 border-r border-white/20">{t("competition_detail.round_history.time")}</th>
              <th className="p-2 w-24 border-r border-white/20">{t("competition_detail.round_history.team")}</th>
              <th className="p-2 border-r border-white/20 text-left pl-4">{t("competition_detail.round_history.description")}</th>
              <th className="p-2 w-24">{t("competition_detail.modals.score_column") || "Tỷ số"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {logs.map((log, idx) => (
              <tr key={idx} className="h-10 text-center font-medium">
                <td className="p-2 border-r border-gray-200 font-black italic">H{log.round}</td>
                <td className="p-2 border-r border-gray-200 font-mono text-[8pt]">
                  {Math.floor((log.current_time || 0) / 60)}:{((log.current_time || 0) % 60).toString().padStart(2, '0')}
                </td>
                <td className="p-2 border-r border-gray-200">
                  <span className={`inline-block border border-black px-2 py-0.5 rounded-sm font-black text-[6pt] uppercase ${log.side?.toUpperCase() === 'RED' ? 'bg-black text-white' : log.side?.toUpperCase() === 'BLUE' ? 'bg-gray-200 text-black' : 'bg-white text-gray-400'}`}>
                    {log.side || 'SYS'}
                  </span>
                </td>
                <td className="p-2 text-left pl-4 border-r border-gray-200 italic text-[8pt]">
                  {log.description || '—'}
                </td>
                <td className="p-2 font-black tabular-nums border-r border-black">
                  {log.redScore || 0} - {log.blueScore || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@media print { @page { size: A4; margin: 0; } body { -webkit-print-color-adjust: exact; } }` }} />
    </div>
  );
}
