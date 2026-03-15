import React from "react";
import "./index.scss";

const InputWithLabel = ({
  label,
  type = "text",
  name,
  placeholder = "",
  inputRef,
  readOnly = false,
  flex = false,
  className,
  fieldKey,
  register = (_) => {
    return;
  },
  ...props
}) => {
  return (
    <div
      className={`${flex ? "flex" : ""} w-full input_label_group items-center`}
    >
      <label
        htmlFor={name}
        className="whitespace-nowrap block leading-6 text-gray-900 dark:text-gray-100"
      >
        {label}:
      </label>
      <div className="w-full">
        <input
          type={type}
          name={name}
          className={`input_with_label custom_input bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 ${className}`}
          placeholder={placeholder}
          ref={inputRef}
          readOnly={readOnly}
          {...register(fieldKey)}
          {...props}
        />
      </div>
    </div>
  );
};

export default InputWithLabel;
