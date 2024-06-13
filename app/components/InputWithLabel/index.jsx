import React from 'react';
import './index.scss';

const InputWithLabel = ({
  label,
  type = 'text',
  name,
  placeholder = '',
  inputRef,
  readOnly = false,
  flex = false,
  className,
  fieldKey,
  register = (_) => {
    return;
  }
}) => {
  return (
    <div className={`${flex ? 'flex' : ''} w-full input_label_group items-center`}>
      <label htmlFor={name} className="whitespace-nowrap block leading-6 text-gray-900">
        {label}:
      </label>
      <div className="w-full">
        <input
          type={type}
          name={name}
          className={`input_with_label custom_input ${className}`}
          placeholder={placeholder}
          ref={inputRef}
          readOnly={readOnly}
          {...register(fieldKey)}
        />
      </div>
    </div>
  );
};

export default InputWithLabel;
