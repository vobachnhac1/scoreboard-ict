import React from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { ArrowPathIcon } from "@heroicons/react/24/outline"; // loading icon

const Input = ({ loading = false, disabled = false, error = false, success = false, className = "", ...props }) => {
  const baseStyle = "w-full px-4 py-2 border rounded-2xl transition-all outline-none bg-white pr-10";
  const disabledStyle = disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "";
  const errorStyle = error ? "border-red-500 focus:ring-red-300" : "";
  const successStyle = success ? "border-green-500 focus:ring-green-300" : "";
  const defaultStyle = !error && !success ? "border-gray-300 focus:ring-blue-300" : "";

  return (
    <div className="relative">
      <input
        type="text"
        disabled={disabled || loading}
        className={`${baseStyle} ${disabledStyle} ${errorStyle} ${successStyle} ${defaultStyle} ${className}`}
        {...props}
      />
      {loading && <ArrowPathIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-gray-500" />}
      {success && !loading && <CheckCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />}
      {error && !loading && <XCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />}
    </div>
  );
};

export default Input;
