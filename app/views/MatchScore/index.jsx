import React, { useState } from "react";
import VovinamScore from "./VovinamScore";
import PencakSilat from "./PencakSilat";
import Button from "../../components/Button";

export default function MatchScore() {
  const [activePage, setActivePage] = useState("");

  return (
    <div>
      <div className="flex justify-center items-center space-x-4 m-2 gap-2">
        <h2 className="font-bold">Demo UI:</h2>
        <Button onClick={() => setActivePage("vovinam")}>Vovinam</Button>
        <Button onClick={() => setActivePage("pencak")}>Pencak Silat</Button>
      </div>

      <div>
        {activePage === "vovinam" && <VovinamScore />}
        {activePage === "pencak" && <PencakSilat />}
      </div>
    </div>
  );
}
