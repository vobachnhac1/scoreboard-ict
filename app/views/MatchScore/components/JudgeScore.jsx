import React from "react";

export default function JudgeScore({ judge, score }) {
  return (
    <div className="bg-sky-200 rounded-lg w-32 h-32 flex flex-col items-center justify-center text-black">
      <p className="font-bold">GIÁM ĐỊNH {judge}</p>
      <p className="text-4xl font-bold">{score}</p>
    </div>
  );
}
