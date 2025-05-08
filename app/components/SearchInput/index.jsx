import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function SearchInput({ value, onChange, onSearch, placeholder = "Tìm kiếm..." }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch?.(value);
    }
  };

  const handleSearchClick = (e) => {
    e.preventDefault();
    onSearch?.(value);
  };

  return (
    <div className="relative w-full max-w-sm">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full pr-10 pl-3 py-2 border rounded-lg text-sm"
      />
      <button
        type="button"
        onClick={handleSearchClick}
        className="absolute h-full w-20 bg-primary right-0 top-1/2 -translate-y-1/2 rounded-r-lg hover:bg-primary/85"
      >
        <span className="text-white text-sm">Tìm kiếm</span>
      </button>
    </div>
  );
}
