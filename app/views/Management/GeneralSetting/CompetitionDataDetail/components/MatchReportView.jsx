import React from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../../../config/redux/store";

export default function MatchReportView({ row, onClose }) {
  const [loading, setLoading] = React.useState(true);
  const [matchData, setMatchData] = React.useState(null);
  const [matchHistory, setMatchHistory] = React.useState(null);
  const configSystem = useAppSelector((state) => state.configSystem);
  const { t } = useTranslation();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (row.match_id) {
          // Lấy thông tin trận đấu
          const matchRes = await axios.get(`http://localhost:6789/api/competition-match/${row.match_id}`);
          if (matchRes?.data?.success) {
            setMatchData(matchRes.data.data);
          }

          // Lấy lịch sử trận đấu (chốt kết quả)
          const historyRes = await axios.get(`http://localhost:6789/api/competition-match/${row.match_id}/history`);
          if (historyRes?.data?.success) {
            const history = historyRes.data.data;
            // Lấy event history cuối cùng (là kết quả chốt)
            setMatchHistory(history.length > 0 ? history[history.length - 1] : null);
          }
        }
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [row.match_id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-blue-600/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-gray-500 font-bold uppercase tracking-widest text-xs animate-pulse">{t("competition_detail.modals.preparing_report")}</p>
      </div>
    );
  }

  const redAthlete = {
    name: row.data[3] || "—",
    unit: row.data[4] || "—",
    country: row.data[5] || ""
  };
  const blueAthlete = {
    name: row.data[6] || "—",
    unit: row.data[7] || "—",
    country: row.data[8] || ""
  };

  const winner = matchHistory?.winner || matchData?.winner;
  const isRedWinner = winner?.toUpperCase() === "RED";
  const isBlueWinner = winner?.toUpperCase() === "BLUE";

  return (
    <div className="bg-white text-black p-0 sm:p-2 min-h-0 print:p-0 print:bg-white print:text-black font-serif">
      {/* Container A4 Style - 210mm x 297mm approx */}
      <div className="max-w-[210mm] mx-auto bg-white border border-gray-100 shadow-xl p-[10mm] sm:p-[20mm] print:border-0 print:shadow-none print:max-w-none print:p-[15mm] print:min-h-0">

        {/* Official Header */}
        <div className="flex justify-between items-start mb-12">
          <div className="text-center w-5/12">
            <h4 className="font-bold text-[11pt] uppercase tracking-wider">{configSystem.data?.don_vi_to_chuc || t("competition_detail.modals.organizing_committee")}</h4>
            <p className="text-[8pt] italic font-medium -mt-1">{t("competition_detail.modals.organizing_committee_en")}</p>
            <div className="h-[1.5px] bg-black w-20 mx-auto mt-2"></div>
          </div>
          <div className="text-center w-8/12">
            <h4 className="font-bold text-[11pt] uppercase tracking-wide">{t("competition_detail.modals.socialist_republic")}</h4>
            <p className="text-[8pt] -mt-1">{t("competition_detail.modals.socialist_republic_en")}</p>
            <h5 className="font-bold text-[10pt] mt-1">{t("competition_detail.modals.independence_freedom")}</h5>
            <p className="text-[8pt] italic -mt-1">{t("competition_detail.modals.independence_freedom_en")}</p>
            <div className="h-[1.5px] bg-black w-28 mx-auto mt-2"></div>
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center mb-10">
          <h1 className="text-[20pt] font-black uppercase tracking-[0.1em] leading-tight">{t("competition_detail.modals.official_record_title")}</h1>
          <h2 className="text-[12pt] font-bold text-gray-500 uppercase tracking-widest -mt-1 italic">{t("competition_detail.modals.official_record_subtitle")}</h2>

          <div className="mt-6 flex flex-col items-center gap-2">
            <p className="text-[14pt] font-black text-gray-900 border-b-2 border-gray-100 pb-1 px-8">
              {configSystem.data?.ten_giai_dau || "—"}
            </p>
            <div className="flex gap-6 text-[10pt] font-bold text-gray-600">
              <div className="flex flex-col items-center">
                <span>{t("competition_detail.modals.venue")} / Venue: {configSystem.data?.dia_diem || "—"}</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex flex-col items-center">
                <span>{t("competition_detail.modals.date")} / Date: {new Date().toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid - Minimalist */}
        <div className="grid grid-cols-3 border-2 border-black divide-x-2 divide-black mb-8 bg-gray-50/50 uppercase font-black text-[9pt]">
          <div className="p-3 text-center">
            <span className="text-gray-400 block text-[7pt] mb-1">{t("competition_detail.modals.match_no")} / Match No.</span>
            <span className="text-lg">{row.data[0]}</span>
          </div>
          <div className="p-3 text-center flex flex-col justify-center">
            <span className="text-gray-400 block text-[7pt] mb-1">{t("competition_detail.modals.category")} / Category</span>
            <span className="truncate">{row.data[2]}</span>
          </div>
          <div className="p-3 text-center flex flex-col justify-center">
            <span className="text-gray-400 block text-[7pt] mb-1">{t("competition_detail.modals.weight")} / Weight</span>
            <span className="truncate">{row.data[1]}</span>
          </div>
        </div>

        {/* Athlete Contrast - Black & White Professionalism */}
        <div className="grid grid-cols-2 gap-0 border-2 border-black divide-x-2 divide-black rounded overflow-hidden mb-8">
          {/* Red athlete (now as neutral) */}
          <div className={`p-6 flex flex-col items-center justify-center relative ${isRedWinner ? 'bg-gray-100' : 'bg-white'}`}>
            {isRedWinner && <div className="absolute top-2 right-2 text-[7pt] font-black bg-black text-white px-2 py-0.5 rounded shadow-sm">{t("competition_detail.modals.winner_label")}</div>}
            <span className="text-[7pt] font-black text-black uppercase mb-2 tracking-widest border-b border-black pb-0.5">{t("competition_detail.modals.red_corner")} / RED CORNER</span>
            <h3 className="text-[16pt] font-black text-center text-black uppercase leading-none mt-2">{redAthlete.name}</h3>
            <p className="text-[9pt] font-bold text-gray-500 mt-2 uppercase">{redAthlete.unit}</p>
          </div>
          {/* Blue athlete (now as neutral) */}
          <div className={`p-6 flex flex-col items-center justify-center relative ${isBlueWinner ? 'bg-gray-200' : 'bg-white'}`}>
            {isBlueWinner && <div className="absolute top-2 left-2 text-[7pt] font-black bg-black text-white px-2 py-0.5 rounded shadow-sm">{t("competition_detail.modals.winner_label")}</div>}
            <span className="text-[7pt] font-black text-black uppercase mb-2 tracking-widest border-b border-black pb-0.5">{t("competition_detail.modals.blue_corner")} / BLUE CORNER</span>
            <h3 className="text-[16pt] font-black text-center text-black uppercase leading-none mt-2">{blueAthlete.name}</h3>
            <p className="text-[9pt] font-bold text-gray-500 mt-2 uppercase">{blueAthlete.unit}</p>
          </div>
        </div>

        {/* Results Table - Concise & Black/White */}
        <table className="w-full border-collapse border-t-2 border-black mb-8 text-[9pt]">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-black">
              <th className="p-3 text-left w-20 border-r border-black">
                <p className="font-black uppercase">{t("competition_detail.round_history.round")}</p>
                <p className="text-[7pt] text-gray-400 uppercase font-black -mt-1 italic">Round</p>
              </th>
              <th className="p-3 text-left border-r border-black">
                <p className="font-black uppercase">{t("competition_detail.modals.technical_analysis")}</p>
                <p className="text-[7pt] text-gray-400 uppercase font-black -mt-1 italic">Technical Analysis</p>
              </th>
              <th className="p-3 text-center w-24 border-r border-black bg-gray-50">
                <p className="font-black text-black uppercase">{t("competition_detail.round_history.red")} (Red)</p>
              </th>
              <th className="p-3 text-center w-24 border-r border-black bg-gray-100">
                <p className="font-black text-black uppercase">{t("competition_detail.round_history.blue")} (Blue)</p>
              </th>
              <th className="p-3 text-center w-32">
                <p className="font-black uppercase">{t("competition_detail.modals.result")}</p>
                <p className="text-[7pt] text-gray-400 uppercase font-black -mt-1 italic">Result</p>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black border-b-2 border-black">
            {matchHistory?.round_history?.map((round, idx) => (
              <tr key={idx} className="h-16 group hover:bg-gray-50 transition-colors">
                <td className="p-3 text-center font-black text-lg italic border-r border-black">{round.round}</td>
                <td className="p-3 border-r border-black">
                  <div className="flex flex-col gap-1.5 text-[8pt] font-bold uppercase tracking-tight text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 border border-black bg-black rounded-sm"></span>
                      <span>{t("competition_detail.round_history.red")} / Red: <b className="text-black">{t("competition_detail.modals.fall")}: {round.red?.match?.fall || 0} | {t("competition_detail.modals.penalty_short")}: {round.red?.match?.penalty || 0}</b></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 border border-black bg-gray-300 rounded-sm"></span>
                      <span>{t("competition_detail.round_history.blue")} / Blue: <b className="text-black">{t("competition_detail.modals.fall")}: {round.blue?.match?.fall || 0} | {t("competition_detail.modals.penalty_short")}: {round.blue?.match?.penalty || 0}</b></span>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-center font-black text-2xl text-black border-r border-black bg-gray-50">{round.red?.match?.score || 0}</td>
                <td className="p-3 text-center font-black text-2xl text-black border-r border-black bg-gray-100">{round.blue?.match?.score || 0}</td>
                <td className="p-3 text-center font-black uppercase italic text-[9pt]">
                  {round.red?.match?.win > round.blue?.match?.win ? t("competition_detail.modals.red_wins_round") : round.blue?.match?.win > round.red?.match?.win ? t("competition_detail.modals.blue_wins_round") : t("competition_detail.modals.draw")}
                </td>
              </tr>
            ))}
            <tr className="bg-black text-white h-12">
              <td colSpan={2} className="p-3 text-right font-black uppercase text-[10pt] tracking-widest italic pr-6 border-r border-white/20">
                {t("competition_detail.modals.final_total_score")} / FINAL TOTAL SCORE
              </td>
              <td className="p-3 text-center font-black text-2xl text-white border-r border-white/20">{matchHistory?.red_score || 0}</td>
              <td className="p-3 text-center font-black text-2xl text-white border-r border-white/20">{matchHistory?.blue_score || 0}</td>
              <td className="bg-gray-800 border-none"></td>
            </tr>
          </tbody>
        </table>

        {/* Official Declaration - Monochromatic */}
        <div className="p-4 border-2 border-black bg-gray-50 flex items-center justify-center gap-8 mb-12 shadow-sm">
          <div className="flex flex-col items-center">
            <p className="text-[8pt] font-black uppercase text-gray-500 tracking-widest mb-1 italic">Declaration of Victory</p>
            <h4 className="text-[11pt] font-black uppercase">{t("competition_detail.modals.winner_title")} / WINNER</h4>
          </div>
          <div className={`px-12 py-3 border-4 border-black text-[18pt] font-black uppercase tracking-tighter transform -rotate-1 shadow-sm ${isRedWinner || isBlueWinner ? 'bg-black text-white' : 'bg-white text-gray-400'}`}>
            {isRedWinner ? redAthlete.name : isBlueWinner ? blueAthlete.name : t("competition_detail.modals.not_determined")}
          </div>
        </div>

        {/* Signature Box */}
        <div className="grid grid-cols-3 gap-10 mt-16 text-center">
          <div className="flex flex-col items-center">
            <span className="text-[9pt] font-black uppercase">{t("competition_detail.modals.match_secretary")}</span>
            <span className="text-[7pt] italic font-bold text-gray-400 -mt-1 uppercase">Match Secretary</span>
            <div className="h-28"></div>
            <div className="w-40 border-t border-black/10"></div>
          </div>
          <div className="flex flex-col items-center border-x border-gray-100">
            <span className="text-[9pt] font-black uppercase">{t("competition_detail.modals.referee")}</span>
            <span className="text-[7pt] italic font-bold text-gray-400 -mt-1 uppercase">Referee</span>
            <div className="h-28"></div>
            <div className="w-40 border-t border-black/10"></div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9pt] font-black uppercase">{t("competition_detail.modals.chief_referee")}</span>
            <span className="text-[7pt] italic font-bold text-gray-400 -mt-1 uppercase">Chief Referee</span>
            <div className="h-28"></div>
            <div className="w-40 border-t border-black/10"></div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body { -webkit-print-color-adjust: exact; margin: 0; }
          .print\\:bg-white { background-color: white !important; }
          .print\\:text-black { color: black !important; }
          @page { size: A4; margin: 0; }
        }
      `}} />
    </div>
  );
}
