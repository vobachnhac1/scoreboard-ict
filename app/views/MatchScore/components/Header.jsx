import React from "react";

export default function Header({ title, desc }) {
  return (
    <div className="text-center text-white mb-6">
      <div className="flex justify-center space-x-2 mb-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-6 h-6 bg-white" />
        ))}
      </div>
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="text-lg font-semibold">{desc}</p>
    </div>
  );
}
