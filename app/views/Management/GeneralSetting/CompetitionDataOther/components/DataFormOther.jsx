import React from "react";
import { useTranslation } from "react-i18next";

export default function DataFormOther({
  headers,
  row = null,
  onSubmit,
  onCancel,
  isCreate = false,
  sheetData,
  showAlert,
  soGiamDinh = 5,
  referrers = [],
  availableReferees = [],
}) {
  const { t } = useTranslation();

  // match_type
  const match_type = sheetData?.data[0][0] || "DOL";

  // Xác định số VĐV từ row hiện tại hoặc match_type
  const getNumAthletesByType = (type) => {
    if (type === "DOL") return 1;
    if (type === "SOL" || type === "TUV") return 2;
    if (type === "DAL") return 4;
    return 1;
  };

  const initialMatchType = row?.match_type ?? match_type ?? "DOL";
  const initialNumAthletes =
    row?.athletes?.length ?? getNumAthletesByType(initialMatchType);

  const [numAthletes, setNumAthletes] = React.useState(initialNumAthletes);
  const [formData, setFormData] = React.useState({
    match_no: row?.match_no ?? sheetData.match_no ?? "",
    match_name: row?.match_name ?? sheetData.match_name ?? "",
    match_type: initialMatchType,
    match_status: row?.match_status || "WAI",
    team_name: row?.team_name ?? sheetData.match_no ?? "",
    scores: row?.scores || {},
    athletes:
      row?.athletes ||
      Array(initialNumAthletes)
        .fill(null)
        .map(() => ({ athlete_name: "", athlete_unit: "" })),
  });

  // Cập nhật số VĐV khi thay đổi loại nội dung
  const handleMatchTypeChange = (type) => {
    const num = getNumAthletesByType(type);
    setNumAthletes(num);
    const newAthletes = Array(num)
      .fill(null)
      .map((_, idx) => formData.athletes[idx] || { athlete_name: "", athlete_unit: "" });
    setFormData({ ...formData, match_type: type, athletes: newAthletes });
  };

  const handleAthleteChange = (index, field, value) => {
    const newAthletes = [...formData.athletes];
    newAthletes[index] = { ...newAthletes[index], [field]: value };
    setFormData({ ...formData, athletes: newAthletes });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation
    if (!formData.match_no) {
      showAlert(t("competition_data_other.please_enter_match_no"));
      return;
    }

    // Kiểm tra ít nhất 1 VĐV có tên
    const hasAthlete = formData.athletes.some(
      (a) => a.athlete_name && a.athlete_name.trim(),
    );
    if (!hasAthlete) {
      showAlert(t("competition_data_other.please_enter_at_least_one_athlete"));
      return;
    }

    onSubmit(formData);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "WAI":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "IN":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "FIN":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "CAN":
        return "bg-rose-500/10 text-rose-600 border-rose-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column - General Info & Score */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-4">
          <section className="relative">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
              <h3 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">{t("competition_data_other.form_match_profile")}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="md:col-span-1 space-y-1">
                <label className="block text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{t("competition_data_other.form_match_no")}</label>
                <input
                  readOnly={!isCreate}
                  type="text"
                  value={formData.match_no}
                  onChange={(e) => setFormData({ ...formData, match_no: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 rounded-lg transition-all outline-none font-bold text-gray-900 dark:text-white read-only:opacity-60"
                  placeholder={t("competition_data_other.form_match_no_placeholder")}
                />
              </div>

              <div className="md:col-span-1 space-y-1">
                <label className="block text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{t("competition_data_other.form_current_status")}</label>
                <div className="relative">
                  <select
                    value={formData.match_status}
                    onChange={(e) => setFormData({ ...formData, match_status: e.target.value })}
                    className={`w-full px-3 py-2 border-2 border-transparent focus:border-blue-500 rounded-lg transition-all outline-none font-bold appearance-none cursor-pointer ${getStatusColor(formData.match_status)}`}
                  >
                    <option value="WAI">{t("competition_data_other.form_status_waiting")}</option>
                    <option value="IN">{t("competition_data_other.form_status_in_progress")}</option>
                    <option value="FIN">{t("competition_data_other.form_status_finished")}</option>
                    <option value="CAN">{t("competition_data_other.form_status_cancelled")}</option>
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none opacity-40">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="block text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{t("competition_data_other.form_match_content")}</label>
                <input
                  readOnly={!isCreate}
                  type="text"
                  value={formData.match_name || ""}
                  onChange={(e) => setFormData({ ...formData, match_name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 rounded-lg transition-all outline-none font-bold text-gray-900 dark:text-white read-only:opacity-60"
                  placeholder={t("competition_data_other.form_match_content_placeholder")}
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="block text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{t("competition_data_other.form_unit_name")}</label>
                <input
                  type="text"
                  value={formData.team_name}
                  onChange={(e) => {
                    const newAthletes = formData.athletes.map((a) => ({ ...a, athlete_unit: e.target.value }));
                    setFormData({ ...formData, athletes: newAthletes, team_name: e.target.value });
                  }}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 rounded-lg transition-all outline-none font-bold text-gray-900 dark:text-white"
                  placeholder={t("competition_data_other.form_unit_name_placeholder")}
                />
              </div>
            </div>
          </section>

          {/* Scores Section */}
          <section className="relative">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-1 h-5 bg-amber-500 rounded-full"></span>
              <h3 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">{t("competition_data_other.form_score_system")}</h3>
            </div>

            <div className="bg-white dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.from({ length: formData.match_type === "VON" ? 7 : soGiamDinh }).map((_, i) => {
                  let judgeLabel = `${t("competition_data_other.form_judge_short")} ${i + 1}`;
                  let subLabel = t("competition_data_other.form_judge");
                  if (formData.match_type === "VON") {
                    if (i === 0 || i === 1) subLabel = "CM";
                    else if (i === 2 || i === 3) subLabel = "NT";
                    else if (i === 4 || i === 5) subLabel = "TH";
                    else if (i === 6) subLabel = "TTT";
                  }

                  return (
                    <div key={`judge-input-${i}`} className="group relative bg-gray-50 dark:bg-gray-800/50 px-2.5 py-2 rounded-lg border-2 border-transparent focus-within:border-blue-500 transition-all">
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{judgeLabel}</label>
                        <span className="text-[7px] font-black text-blue-500/60 uppercase">{subLabel}</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.scores?.[`judge${i + 1}`] ?? ""}
                        onChange={(e) => {
                          const val = e.target.value === "" ? "" : Number(e.target.value);
                          const newScores = { ...formData.scores, [`judge${i + 1}`]: val };
                          const currentTotalJudges = formData.match_type === "VON" ? 7 : soGiamDinh;
                          const judgeScores = [];
                          let hasInput = false;
                          for (let j = 1; j <= currentTotalJudges; j++) {
                            const jScore = newScores[`judge${j}`];
                            if (jScore !== undefined && jScore !== "") hasInput = true;
                            judgeScores.push(Number(jScore || 0));
                          }
                          if (hasInput) {
                            let total = 0;
                            if (formData.match_type === "VON") {
                              const cm = (judgeScores[0] + judgeScores[1]) / 2;
                              const nt = (judgeScores[2] + judgeScores[3]) / 2;
                              const th = (judgeScores[4] + judgeScores[5]) / 2;
                              total = cm * 0.3 + nt * 0.3 + th * 0.3 + judgeScores[6] * 0.1;
                            } else if (soGiamDinh === 5) {
                              total = judgeScores.reduce((a, b) => a + b, 0) - Math.min(...judgeScores) - Math.max(...judgeScores);
                            } else {
                              total = judgeScores.reduce((a, b) => a + b, 0);
                            }
                            newScores.total = Number(total.toFixed(2));
                          }
                          setFormData({ ...formData, scores: newScores });
                        }}
                        className="w-full bg-transparent font-black text-base text-gray-900 dark:text-white outline-none"
                        placeholder="0.0"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="relative group">
                  <div className="absolute inset-0 bg-blue-600/10 rounded-xl blur-lg group-focus-within:bg-blue-600/20 transition-all"></div>
                  <div className="relative bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl border-2 border-blue-100 dark:border-blue-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{t("competition_data_other.form_final_score")}</p>
                        <p className="text-[8px] text-gray-500 dark:text-gray-400 font-medium">{t("competition_data_other.form_auto_calculated")}</p>
                      </div>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.scores?.total ?? ""}
                      onChange={(e) => setFormData({ ...formData, scores: { ...formData.scores, total: e.target.value === "" ? "" : Number(e.target.value) } })}
                      className="bg-transparent text-right font-black text-2xl text-blue-600 dark:text-blue-400 outline-none w-32"
                      placeholder="0.0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column - Athletes */}
        <div className="lg:col-span-12 xl:col-span-5">
          <section className="sticky top-0 space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-1 h-5 bg-emerald-500 rounded-full"></span>
                <h3 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">{t("competition_data_other.form_competing_members")}</h3>
              </div>

              <div className="bg-white dark:bg-gray-900/40 p-1 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="max-h-[400px] overflow-y-auto p-3 custom-scrollbar space-y-2">
                  {formData.athletes.map((athlete, idx) => (
                    <div key={`athlete-item-${idx}`} className="group relative flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border-2 border-transparent hover:border-emerald-500/20 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300">
                      <div className="w-8 h-8 flex-shrink-0 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center font-black text-sm text-emerald-600 dark:text-emerald-400 border border-gray-100 dark:border-gray-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-500 transition-all">
                        {idx + 1}
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest px-1">{t("competition_data_other.form_athlete_name")}</label>
                        <input
                          type="text"
                          value={athlete.athlete_name}
                          onChange={(e) => handleAthleteChange(idx, "athlete_name", e.target.value)}
                          className="w-full bg-transparent text-sm font-bold text-gray-900 dark:text-white outline-none"
                          placeholder={t("competition_data_other.form_athlete_name_placeholder")}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Referrers Section */}
            {referrers && referrers.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-1 h-5 bg-purple-500 rounded-full"></span>
                  <h3 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-[0.3em]">{t("competition_data_other.form_referee_council")}</h3>
                </div>

                <div className="bg-white dark:bg-gray-900/40 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                  {referrers.map((ref, idx) => {
                    let roleLabel = ref.role;
                    let iconColor = "bg-purple-600";

                    if (ref.role.startsWith("r")) {
                      const num = ref.role.substring(1);
                      roleLabel = `${t('competition_data_other.judge_role')} ${num}`;
                      iconColor = "bg-blue-600";
                    } else if (ref.role === "machine") {
                      roleLabel = t('competition_data_other.machine_referee');
                      iconColor = "bg-amber-500";
                    } else if (ref.role === "court") {
                      roleLabel = t('competition_data_other.court_referee');
                      iconColor = "bg-emerald-600";
                    }

                    return (
                      <div key={`ref-${idx}`} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className={`w-7 h-7 flex-shrink-0 ${iconColor} rounded-md flex items-center justify-center text-white font-black text-[10px]`}>
                          {ref.role.startsWith("r") ? ref.role.substring(1) : ref.role === "machine" ? "M" : "S"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">{roleLabel}</p>
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{ref.full_name}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-3.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95 uppercase tracking-[0.2em] text-[11px]"
        >
          {t("competition_data_other.form_cancel_changes")}
        </button>
        <button
          type="submit"
          className="px-10 py-3.5 rounded-2xl bg-blue-600 text-white font-black transition-all active:scale-95 uppercase tracking-[0.2em] text-[11px] flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          {row ? t("competition_data_other.form_update_profile") : t("competition_data_other.form_create_match")}
        </button>
      </div>
    </form>
  );
}
