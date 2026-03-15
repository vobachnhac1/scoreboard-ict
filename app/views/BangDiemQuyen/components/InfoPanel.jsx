import React from "react";

const InfoPanel = ({ content, unit, athletes }) => (
  <div className="">
    <div className="bg-white text-black px-4 py-2 rounded">
      <strong>NỘI DUNG:</strong> {content}
    </div>
    <div className="mt-2 bg-white text-black px-4 py-2 rounded">
      <strong>ĐƠN VỊ:</strong> {unit}
    </div>
    <div className="mt-2 bg-white text-black px-4 py-2 rounded">
      <p>
        <strong>THÔNG TIN VĐV:</strong>
      </p>
      <ul className="list-disc ml-4">
        {athletes.map((name, index) => (
          <li key={index}>{name}</li>
        ))}
      </ul>
    </div>
  </div>
);

export default InfoPanel;
