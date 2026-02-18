import React, { useEffect, useRef, useState } from "react";

const Input = ({ label, value }) => {
  return (
    <div className="py-3 px-2">
      <label className="text-slate-400">{label}</label>
      <div className="font-semibold">{value}</div>
    </div>
  );
};

export default Input;
