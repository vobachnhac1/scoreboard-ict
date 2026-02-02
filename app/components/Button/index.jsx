import React from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

const VARIANT_CLASSES = {
  primary:
    "bg-primary dark:bg-blue-500 text-white hover:bg-primary/90 dark:hover:bg-blue-600",
  gray: "bg-primary dark:bg-blue-500 text-white hover:bg-gray/90",
  secondary:
    "bg-secondary dark:bg-gray-600 text-white hover:bg-secondary/90 dark:hover:bg-gray-700",
  danger:
    "bg-danger dark:bg-red-500 text-white hover:bg-danger/90 dark:hover:bg-red-600",
  warning:
    "bg-warning dark:bg-yellow-500 text-white hover:bg-warning/90 dark:hover:bg-yellow-600",
  success:
    "bg-success dark:bg-green-500 text-white hover:bg-success/90 dark:hover:bg-green-600",
  outline:
    "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200",
  none: "",
};

const Button = ({
  children,
  variant = "primary",
  loading = false,
  disabled = false,
  fullWidth = false,
  className = "",
  ...props
}) => {
  const isDisabled = disabled || loading;
  return (
    <button
      disabled={isDisabled}
      className={`inline-flex items-center justify-center px-4 py-2 rounded text-sm font-medium transition
        ${VARIANT_CLASSES[variant]}
        ${isDisabled ? "opacity-60 cursor-not-allowed" : ""}
        ${fullWidth ? "w-full" : ""}
        ${className}`}
      {...props}
    >
      {loading && <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
