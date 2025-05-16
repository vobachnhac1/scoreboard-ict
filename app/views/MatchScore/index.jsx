import React, { useState, useRef, useEffect } from "react";
import VovinamSparring from "./Sparring/Vovinam";
import KickBoxingSparring from "./Sparring/KickBoxing";
import PencakSparring from "./Sparring/Pencak";
import VovinamScore from "./VovinamScore";
import PencakSilat from "./PencakSilat";

export default function MatchScore() {
  const [selectedSparring, setSelectedSparring] = useState("");
  const [selectedForm, setSelectedForm] = useState("");
  const contentRef = useRef(null);
  useEffect(() => {
    if ((selectedSparring || selectedForm) && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedSparring, selectedForm]);

  const handleSelectSparring = (e) => {
    const value = e.target.value;
    setSelectedSparring(value);
    if (value !== "") {
      setSelectedForm("");
    }
  };

  const handleSelectForm = (e) => {
    const value = e.target.value;
    setSelectedForm(value);
    if (value !== "") {
      setSelectedSparring("");
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 my-4 select-none">
        <div className="min-w-52">
          <h2 className="font-bold mb-1">Đối kháng:</h2>
          <select value={selectedSparring} onChange={handleSelectSparring} className="border border-gray-300 rounded p-2 w-full max-w-sm">
            <option value="">Chọn môn đối kháng</option>
            <option value="vovinam-sparring">Vovinam</option>
            <option value="pencak-sparring">Pencak</option>
            <option value="kick-boxing-sparring">Kick Boxing</option>
          </select>
        </div>

        <div className="min-w-52">
          <h2 className="font-bold mb-1">Quyền:</h2>
          <select value={selectedForm} onChange={handleSelectForm} className="border border-gray-300 rounded p-2 w-full max-w-sm">
            <option value="">Chọn môn quyền</option>
            <option value="vovinam">Vovinam</option>
            <option value="pencak">Pencak Silat</option>
          </select>
        </div>
      </div>

      <div ref={contentRef} className="mt-4">
        {selectedSparring === "vovinam-sparring" && <VovinamSparring />}
        {selectedSparring === "kick-boxing-sparring" && <KickBoxingSparring />}
        {selectedSparring === "pencak-sparring" && <PencakSparring />}
        {selectedForm === "vovinam" && <VovinamScore />}
        {selectedForm === "pencak" && <PencakSilat />}
      </div>
    </div>
  );
}
