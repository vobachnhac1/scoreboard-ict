import { Select } from 'antd';
import './index.scss';
import React from 'react';

const InputWithLabel = ({ label, type = 'text', name, placeholder = '', setInputData, inputRef, inputData }) => {
  return (
    <div className="input_label_group flex items-center w-4/5">
      {/* <label htmlFor={name} className="whitespace-nowrap block leading-6 text-gray-900">
        {label}:
      </label> */}
      <div className="w-full">
        <input
          type={type}
          name={name}
          className="input_with_label px-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400"
          placeholder={placeholder}
          onChange={(e) => setInputData(e.target.value)}
          value={inputData}
          ref={inputRef}
        />
      </div>
    </div>
  );
};

export default InputWithLabel;
