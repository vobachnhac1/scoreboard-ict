import React from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../../../config/redux/store";

export default function QuyenReportForm({ row, onCancel, referrers, soGiamDinh }) {
  const { t } = useTranslation();

  const configSystem = useAppSelector((state) => state.configSystem);

  const getMatchTypeName = (type) => {
    const types = {
      DOL: t('competition_data_other.type_doi_luyen'),
      SOL: t('competition_data_other.type_song_luyen'),
      TUV: t('competition_data_other.type_tu_ve'),
      DAL: t('competition_data_other.type_da_luyen'),
    };
    return types[type] || type;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white text-black p-0 sm:p-2 min-h-0 print:p-0 print:bg-white print:text-black font-serif">
      {/* Container A4 Style - 210mm x 297mm approx */}
      <div className="max-w-[210mm] mx-auto bg-white border border-gray-100 p-[10mm] sm:p-[20mm] print:border-0 print:max-w-none print:p-[15mm] print:min-h-0">

        {/* Official Header */}
        <div className="flex justify-between items-start mb-12">
          <div className="text-center w-5/12">
            <h4 className="font-bold text-[11pt] uppercase tracking-wider">{configSystem.data?.don_vi_to_chuc || t('competition_data_other.organizing_committee')}</h4>
            <p className="text-[8pt] italic font-medium -mt-1">{t('competition_data_other.organizing_committee_en')}</p>
            <div className="h-[1.5px] bg-black w-20 mx-auto mt-2"></div>
          </div>
          <div className="text-center w-8/12">
            <h4 className="font-bold text-[11pt] uppercase tracking-wide">{t('competition_data_other.socialist_republic')}</h4>
            <p className="text-[8pt] -mt-1">{t('competition_data_other.socialist_republic_en')}</p>
            <h5 className="font-bold text-[10pt] mt-1">{t('competition_data_other.independence_freedom')}</h5>
            <p className="text-[8pt] italic -mt-1">{t('competition_data_other.independence_freedom_en')}</p>
            <div className="h-[1.5px] bg-black w-28 mx-auto mt-2"></div>
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center mb-10">
          <h1 className="text-[20pt] font-black uppercase tracking-[0.1em] leading-tight">{t('competition_data_other.report_title')}</h1>
          <h2 className="text-[12pt] font-bold text-gray-500 uppercase tracking-widest -mt-1 italic">{t('competition_data_other.report_title_en')}</h2>

          <div className="mt-6 flex flex-col items-center gap-2">
            <p className="text-[14pt] font-black text-gray-900 border-b-2 border-gray-100 pb-1 px-8">
              {configSystem.data?.ten_giai_dau || "—"}
            </p>
            <div className="flex gap-6 text-[10pt] font-bold text-gray-600">
              <div className="flex flex-col items-center">
                <span>{t('competition_data_other.venue')}: {configSystem.data?.dia_diem || "—"}</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex flex-col items-center">
                <span>{t('competition_data_other.date')}: {new Date().toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid - Minimalist */}
        <div className="grid grid-cols-3 border-2 border-black divide-x-2 divide-black mb-8 bg-gray-50/50 uppercase font-black text-[9pt]">
          <div className="p-3 text-center">
            <span className="text-gray-400 block text-[7pt] mb-1">{t('competition_data_other.match_no_label')}</span>
            <span className="text-lg">{row.match_no}</span>
          </div>
          <div className="p-3 text-center flex flex-col justify-center">
            <span className="text-gray-400 block text-[7pt] mb-1">{t('competition_data_other.category_label')}</span>
            <span className="truncate">{row.match_name || "—"}</span>
          </div>
          <div className="p-3 text-center flex flex-col justify-center">
            <span className="text-gray-400 block text-[7pt] mb-1">{t('competition_data_other.type_label')}</span>
            <span className="truncate">{getMatchTypeName(row.match_type)}</span>
          </div>
        </div>

        {/* Team Info */}
        <div className="border-2 border-black p-6 mb-8 bg-gray-50/30">
          <div className="text-center mb-4">
            <span className="text-[7pt] font-black text-black uppercase tracking-widest border-b border-black pb-0.5">{t('competition_data_other.team_label')}</span>
            <h3 className="text-[14pt] font-black text-center text-black uppercase leading-none mt-2">{row.team_name || "—"}</h3>
          </div>

          {/* Athletes List */}
          {row.athletes && row.athletes.length > 0 && (
            <div className="mt-4">
              <p className="text-[8pt] font-black uppercase text-gray-500 mb-2">{t('competition_data_other.athletes_label')}:</p>
              <div className="grid grid-cols-2 gap-2">
                {row.athletes.map((athlete, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-white border border-gray-200">
                    <span className="w-6 h-6 bg-black text-white flex items-center justify-center text-[8pt] font-black">{idx + 1}</span>
                    <span className="text-[9pt] font-bold text-black">{athlete.athlete_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Table - Scores from Judges */}
        <table className="w-full border-collapse border-t-2 border-black mb-8 text-[9pt]">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-black">
              <th className="p-3 text-center border-r border-black">
                <p className="font-black uppercase">{t('competition_data_other.judge_header')}</p>
                <p className="text-[7pt] text-gray-400 uppercase font-black -mt-1 italic">Judge</p>
              </th>
              {Array.from({ length: soGiamDinh }).map((_, i) => (
                <th key={i} className="p-3 text-center border-r border-black bg-gray-50">
                  <p className="font-black text-black uppercase">{t('competition_data_other.form_judge_short')} {i + 1}</p>
                </th>
              ))}
              <th className="p-3 text-center bg-black text-white">
                <p className="font-black uppercase">{t('competition_data_other.total_score')}</p>
                <p className="text-[7pt] uppercase font-black -mt-1 italic">Total</p>
              </th>
            </tr>
          </thead>
          <tbody className="border-b-2 border-black">
            <tr className="h-16">
              <td className="p-3 text-center font-black text-lg border-r border-black bg-gray-50">{t('competition_data_other.score_label')}</td>
              {Array.from({ length: soGiamDinh }).map((_, i) => (
                <td key={i} className="p-3 text-center font-black text-2xl text-black border-r border-black">
                  {row.scores?.[`judge${i + 1}`] ?? "—"}
                </td>
              ))}
              <td className="p-3 text-center font-black text-3xl text-white bg-black">
                {row.scores?.total ?? "—"}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Referrers Section - Hội đồng giám định */}
        {referrers && referrers.length > 0 && (
          <div className="border-2 border-black p-6 mb-12 bg-gray-50/30">
            <h3 className="text-[10pt] font-black uppercase text-center mb-4 border-b border-black pb-2">
              {t('competition_data_other.judging_panel')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {referrers.map((ref, idx) => {
                let roleLabel = ref.role;
                if (ref.role.startsWith("r")) {
                  const num = ref.role.substring(1);
                  roleLabel = `${t('competition_data_other.judge_role')} ${num} / ${t('competition_data_other.judge_role_en', 'Judge')} ${num}`;
                } else if (ref.role === "machine") {
                  roleLabel = `${t('competition_data_other.machine_referee')} / ${t('competition_data_other.machine_referee_en', 'Machine Referee')}`;
                } else if (ref.role === "court") {
                  roleLabel = `${t('competition_data_other.court_referee')} / ${t('competition_data_other.court_referee_en', 'Court Referee')}`;
                }

                return (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-gray-200">
                    <div className="w-8 h-8 bg-black text-white flex items-center justify-center text-[9pt] font-black">
                      {ref.role.startsWith("r") ? ref.role.substring(1) : ref.role === "machine" ? "M" : "S"}
                    </div>
                    <div className="flex-1">
                      <p className="text-[7pt] font-black text-gray-400 uppercase">{roleLabel}</p>
                      <p className="text-[9pt] font-bold text-black">{ref.full_name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Signature Box */}
        <div className="grid grid-cols-3 gap-10 mt-16 text-center">
          <div className="flex flex-col items-center">
            <span className="text-[9pt] font-black uppercase">{t('competition_data_other.match_secretary')}</span>
            <span className="text-[7pt] italic font-bold text-gray-400 -mt-1 uppercase">Match Secretary</span>
            <div className="h-28"></div>
            <div className="w-40 border-t border-black/10"></div>
          </div>
          <div className="flex flex-col items-center border-x border-gray-100">
            <span className="text-[9pt] font-black uppercase">{t('competition_data_other.chief_referee')}</span>
            <span className="text-[7pt] italic font-bold text-gray-400 -mt-1 uppercase">Chief Referee</span>
            <div className="h-28"></div>
            <div className="w-40 border-t border-black/10"></div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9pt] font-black uppercase">{t('competition_data_other.judging_committee')}</span>
            <span className="text-[7pt] italic font-bold text-gray-400 -mt-1 uppercase">Judging Committee</span>
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
