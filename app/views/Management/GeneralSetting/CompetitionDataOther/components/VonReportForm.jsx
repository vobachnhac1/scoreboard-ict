import React from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../../../config/redux/store";

export default function VonReportForm({ row, onCancel, referrers, soGiamDinh }) {
  const { t } = useTranslation();

  const configSystem = useAppSelector((state) => state.configSystem);

  const handlePrint = () => {
    window.print();
  };

  // Tính điểm VON
  const calculateVonScore = () => {
    if (!row.scores) return { cm: 0, nt: 0, th: 0, ttt: 0, total: 0 };

    const judge1 = Number(row.scores.judge1 || 0);
    const judge2 = Number(row.scores.judge2 || 0);
    const judge3 = Number(row.scores.judge3 || 0);
    const judge4 = Number(row.scores.judge4 || 0);
    const judge5 = Number(row.scores.judge5 || 0);
    const judge6 = Number(row.scores.judge6 || 0);
    const judge7 = Number(row.scores.judge7 || 0);

    const cm = (judge1 + judge2) / 2;
    const nt = (judge3 + judge4) / 2;
    const th = (judge5 + judge6) / 2;
    const ttt = judge7;
    const total = cm * 0.3 + nt * 0.3 + th * 0.3 + ttt * 0.1;

    return { cm, nt, th, ttt, total };
  };

  const vonScores = calculateVonScore();

  return (
    <div className="bg-white text-black p-0 sm:p-2 min-h-0 print:p-0 print:bg-white print:text-black font-serif">
      {/* Container A4 Style - 210mm x 297mm approx */}
      <div className="max-w-[210mm] mx-auto bg-white border border-gray-100 p-[10mm] sm:p-[20mm] print:border-0 print:max-w-none print:p-[15mm] print:min-h-0">

        {/* Official Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-black">
          <div className="text-left flex-1">
            <p className="text-[9pt] font-bold uppercase leading-tight">{configSystem?.data?.don_vi_to_chuc || t('competition_data_other.organizing_committee')}</p>
            <p className="text-[8pt] font-semibold mt-1 leading-tight">{configSystem?.data?.ten_giai_dau}</p>
          </div>
          <div className="text-right flex-1">
            <p className="text-[9pt] font-bold uppercase leading-tight">{t('competition_data_other.socialist_republic')}</p>
            <p className="text-[9pt] font-bold border-b-2 border-black inline-block pb-1 mt-1">{t('competition_data_other.independence_freedom')}</p>
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-[16pt] font-black uppercase tracking-wide mb-1">{t('competition_data_other.report_title')}</h1>
          <h2 className="text-[11pt] font-bold uppercase tracking-wider text-gray-700 mb-1">{t('competition_data_other.musical_performance')}</h2>
          <p className="text-[9pt] font-semibold italic">{t('competition_data_other.report_title_en')} - {t('competition_data_other.musical_performance_en')}</p>
          <div className="mt-4 text-[9pt]">
            <p className="font-semibold">{configSystem?.data?.ten_giai_dau || ""}</p>
            <p className="text-[8pt] text-gray-600 mt-1">
              {t('competition_data_other.venue')}: {configSystem?.data?.dia_diem || "_______________"} |
              {t('competition_data_other.date')}: {new Date().toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>

        {/* Info Grid - Match No, Category, Type */}
        <div className="grid grid-cols-3 gap-4 mb-8 border-2 border-black p-4">
          <div className="text-center border-r border-gray-300">
            <p className="text-[8pt] font-bold text-gray-600 uppercase mb-1">{t('competition_data_other.match_no_label')}</p>
            <p className="text-[14pt] font-black">{row.match_no || "-"}</p>
          </div>
          <div className="text-center border-r border-gray-300">
            <p className="text-[8pt] font-bold text-gray-600 uppercase mb-1">{t('competition_data_other.category_label')}</p>
            <p className="text-[11pt] font-bold">{row.match_name || "-"}</p>
          </div>
          <div className="text-center">
            <p className="text-[8pt] font-bold text-gray-600 uppercase mb-1">{t('competition_data_other.type_label')}</p>
            <p className="text-[11pt] font-bold">{t('competition_data_other.musical_performance')}</p>
          </div>
        </div>

        {/* Team Info with Athletes */}
        <div className="mb-8 border-2 border-black p-6">
          <div className="mb-4">
            <p className="text-[9pt] font-bold uppercase mb-2 border-b border-gray-400 pb-1">
              {t('competition_data_other.team_label')}: <span className="font-black ml-2">{row.team_name || "-"}</span>
            </p>
          </div>
          <div>
            <p className="text-[9pt] font-bold uppercase mb-3">{t('competition_data_other.athletes_label')}:</p>
            <div className="grid grid-cols-1 gap-2">
              {row.athletes && row.athletes.length > 0 ? (
                row.athletes.map((athlete, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-2 border-b border-gray-200">
                    <div className="w-7 h-7 bg-black text-white flex items-center justify-center font-bold text-[10pt] rounded">
                      {idx + 1}
                    </div>
                    <p className="text-[10pt] font-semibold flex-1">{athlete.athlete_name}</p>
                  </div>
                ))
              ) : (
                <p className="text-[9pt] text-gray-500 italic">{t('competition_data_other.no_info')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Results Table - VON Scoring */}
        <div className="mb-8">
          <h3 className="text-[10pt] font-black uppercase text-center mb-4 border-b-2 border-black pb-2">
            {t('competition_data_other.musical_performance_score_table')}
          </h3>

          {/* Detailed Scores Table */}
          <table className="w-full border-2 border-black mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-[9pt] font-bold">{t('competition_data_other.criteria_label')}<br /><span className="text-[7pt] font-normal">{t('competition_data_other.criteria_en')}</span></th>
                <th className="border border-black p-2 text-[9pt] font-bold">{t('competition_data_other.form_judge_short')} 1</th>
                <th className="border border-black p-2 text-[9pt] font-bold">{t('competition_data_other.form_judge_short')} 2</th>
                <th className="border border-black p-2 text-[9pt] font-bold">{t('competition_data_other.form_judge_short')} 3</th>
                <th className="border border-black p-2 text-[9pt] font-bold">{t('competition_data_other.form_judge_short')} 4</th>
                <th className="border border-black p-2 text-[9pt] font-bold">{t('competition_data_other.form_judge_short')} 5</th>
                <th className="border border-black p-2 text-[9pt] font-bold">{t('competition_data_other.form_judge_short')} 6</th>
                <th className="border border-black p-2 text-[9pt] font-bold">{t('competition_data_other.form_judge_short')} 7</th>
                <th className="border border-black p-2 text-[9pt] font-bold bg-gray-200">{t('competition_data_other.average_title')}<br /><span className="text-[7pt] font-normal">{t('competition_data_other.average_en')}</span></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2 text-[9pt] font-bold bg-blue-50">
                  {t('competition_data_other.von_standard')} (30%)<br /><span className="text-[7pt] font-normal">{t('competition_data_other.standard_en')}</span>
                </td>
                <td className="border border-black p-2 text-center text-[10pt] font-bold">{row.scores?.judge1 ?? "-"}</td>
                <td className="border border-black p-2 text-center text-[10pt] font-bold">{row.scores?.judge2 ?? "-"}</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-[11pt] font-black bg-blue-100">{vonScores.cm.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-[9pt] font-bold bg-green-50">
                  {t('competition_data_other.von_proficiency')} (30%)<br /><span className="text-[7pt] font-normal">{t('competition_data_other.proficiency_en')}</span>
                </td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-[10pt] font-bold">{row.scores?.judge3 ?? "-"}</td>
                <td className="border border-black p-2 text-center text-[10pt] font-bold">{row.scores?.judge4 ?? "-"}</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-[11pt] font-black bg-green-100">{vonScores.nt.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-[9pt] font-bold bg-orange-50">
                  {t('competition_data_other.von_expression')} (30%)<br /><span className="text-[7pt] font-normal">{t('competition_data_other.expression_en')}</span>
                </td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-[10pt] font-bold">{row.scores?.judge5 ?? "-"}</td>
                <td className="border border-black p-2 text-center text-[10pt] font-bold">{row.scores?.judge6 ?? "-"}</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-[11pt] font-black bg-orange-100">{vonScores.th.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 text-[9pt] font-bold bg-purple-50">
                  {t('competition_data_other.von_overall')} (10%)<br /><span className="text-[7pt] font-normal">{t('competition_data_other.overall_en')}</span>
                </td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-gray-300">-</td>
                <td className="border border-black p-2 text-center text-[10pt] font-bold">{row.scores?.judge7 ?? "-"}</td>
                <td className="border border-black p-2 text-center text-[11pt] font-black bg-purple-100">{vonScores.ttt.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          {/* Final Score */}
          <div className="border-4 border-black p-6 bg-gray-50 text-center">
            <p className="text-[9pt] font-bold uppercase mb-2">{t('competition_data_other.final_score_label')}</p>
            <p className="text-[8pt] text-gray-600 mb-3">CM×0.3 + NT×0.3 + TH×0.3 + TTT×0.1</p>
            <p className="text-[28pt] font-black">{vonScores.total.toFixed(2)}</p>
          </div>
        </div>

        {/* Referrers Section */}
        {referrers && referrers.length > 0 && (
          <div className="border-2 border-black p-6 mb-12 bg-gray-50/30">
            <h3 className="text-[10pt] font-black uppercase text-center mb-4 border-b border-black pb-2">
              {t('competition_data_other.judging_panel')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {referrers.map((ref, idx) => {
                let roleLabel = ref.role;
                let roleEn = ref.role;

                if (ref.role.startsWith("r")) {
                  const num = ref.role.substring(1);
                  roleLabel = `${t('competition_data_other.judge_role')} ${num}`;
                  roleEn = `${t('competition_data_other.judge_role_en', 'Judge')} ${num}`;
                } else if (ref.role === "machine") {
                  roleLabel = t('competition_data_other.machine_referee');
                  roleEn = t('competition_data_other.machine_referee_en', 'Machine Referee');
                } else if (ref.role === "court") {
                  roleLabel = t('competition_data_other.court_referee');
                  roleEn = t('competition_data_other.court_referee_en', 'Court Referee');
                }

                return (
                  <div key={idx} className="flex items-center gap-3 py-2 border-b border-gray-300">
                    <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold text-[10pt] rounded">
                      {ref.role.startsWith("r") ? ref.role.substring(1) : ref.role === "machine" ? "M" : "S"}
                    </div>
                    <div className="flex-1">
                      <p className="text-[8pt] font-bold text-gray-600 uppercase">{roleLabel} / {roleEn}</p>
                      <p className="text-[10pt] font-bold">{ref.full_name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Signature Box */}
        <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t-2 border-black">
          <div className="text-center">
            <p className="text-[9pt] font-bold uppercase mb-1">{t('competition_data_other.match_secretary')}</p>
            <p className="text-[8pt] italic text-gray-600 mb-12">{t('competition_data_other.match_secretary_en')}</p>
            <p className="text-[9pt] font-semibold border-t border-black inline-block px-8 pt-1">{t('competition_data_other.signature')}</p>
          </div>
          <div className="text-center">
            <p className="text-[9pt] font-bold uppercase mb-1">{t('competition_data_other.chief_referee')}</p>
            <p className="text-[8pt] italic text-gray-600 mb-12">{t('competition_data_other.chief_referee_en')}</p>
            <p className="text-[9pt] font-semibold border-t border-black inline-block px-8 pt-1">{t('competition_data_other.signature')}</p>
          </div>
          <div className="text-center">
            <p className="text-[9pt] font-bold uppercase mb-1">{t('competition_data_other.judging_committee')}</p>
            <p className="text-[8pt] italic text-gray-600 mb-12">{t('competition_data_other.judging_committee_en')}</p>
            <p className="text-[9pt] font-semibold border-t border-black inline-block px-8 pt-1">{t('competition_data_other.signature')}</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            margin: 0;
            padding: 0;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}} />
    </div>
  );
}
