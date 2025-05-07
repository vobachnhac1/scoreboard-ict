import React from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

const VARIANT_CLASSES = {
  primary: "bg-primary text-white hover:bg-primary/90",
  secondary: "bg-secondary text-white hover:bg-secondary/90",
  danger: "bg-danger text-white hover:bg-danger/90",
  warning: "bg-warning text-white hover:bg-warning/90",
  success: "bg-success text-white hover:bg-success/90",
  none: "",
};

const Button = ({ children, variant = "primary", loading = false, disabled = false, fullWidth = false, className = "", ...props }) => {
  const isDisabled = disabled || loading;
  return (
    <button
      disabled={isDisabled}
      className={`inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition
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
