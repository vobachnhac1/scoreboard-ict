import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = "Tìm kiếm...",
}) {
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
        className="w-full pr-10 pl-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
      <button
        type="button"
        onClick={handleSearchClick}
        className="absolute h-full w-20 bg-primary dark:bg-blue-500 right-0 top-1/2 -translate-y-1/2 rounded-r hover:bg-primary/85 dark:hover:bg-blue-600"
      >
        <span className="text-white text-sm">Tìm kiếm</span>
      </button>
    </div>
  );
}
