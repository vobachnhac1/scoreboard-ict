import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const VARIANT_CLASSES = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const Button = ({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const isDisabled = disabled || loading;
  return (
    <button
      disabled={isDisabled}
      className={`inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition
        ${VARIANT_CLASSES[variant]}
        ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}
        ${fullWidth ? 'w-full' : ''}
        ${className}`}
      {...props}
    >
      {loading && (
        <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
      )}
      {children}
    </button>
  );
};

export default Button;
