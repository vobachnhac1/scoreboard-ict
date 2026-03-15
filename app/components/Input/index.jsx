import React from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { ArrowPathIcon } from "@heroicons/react/24/outline"; // loading icon

const Input = ({
  loading = false,
  disabled = false,
  error = false,
  success = false,
  className = "",
  ...props
}) => {
  const baseStyle =
    "w-full px-4 py-2 border rounded transition-all outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10";
  const disabledStyle = disabled
    ? "bg-gray-100 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed"
    : "";
  const errorStyle = error
    ? "border-red-500 focus:ring-red-300 dark:focus:ring-red-500"
    : "";
  const successStyle = success
    ? "border-green-500 focus:ring-green-300 dark:focus:ring-green-500"
    : "";
  const defaultStyle =
    !error && !success
      ? "border-gray-300 dark:border-gray-600 focus:ring-blue-300 dark:focus:ring-blue-500"
      : "";

  return (
    <div className="relative">
      <input
        type="text"
        disabled={disabled || loading}
        className={`${baseStyle} ${disabledStyle} ${errorStyle} ${successStyle} ${defaultStyle} ${className}`}
        {...props}
      />
      {loading && (
        <ArrowPathIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-gray-500 dark:text-gray-400" />
      )}
      {success && !loading && (
        <CheckCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500 dark:text-green-400" />
      )}
      {error && !loading && (
        <XCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500 dark:text-red-400" />
      )}
    </div>
  );
};

export default Input;
