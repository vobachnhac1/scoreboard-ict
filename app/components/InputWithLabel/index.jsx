import { Select } from "antd";
import "./index.scss";
import React from "react";

const InputWithLabel = ({
  label,
  type = "text",
  name,
  placeholder = "",
  setInputData,
  inputRef,
  inputData,
  readOnly = false,
  flex = false,
  className,
}) => {
  return (
    <div
      className={`${flex ? "flex" : ""} w-full input_label_group items-center`}
    >
      <label
        htmlFor={name}
        className="whitespace-nowrap block leading-6 text-gray-900"
      >
        {label}:
      </label>
      <div className="w-full">
        <input
          type={type}
          name={name}
          className={`input_with_label custom_input ${className}`}
          placeholder={placeholder}
          onChange={(e) => setInputData(e.target.value)}
          value={inputData}
          ref={inputRef}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
};

export default InputWithLabel;
