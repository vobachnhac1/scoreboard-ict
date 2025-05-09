import React from "react";

export const InputField = ({ id, label, placeholder, register, errors, readOnly }) => (
  <div className="grid grid-cols-3 gap-1 items-center mb-2">
    <label htmlFor={id} className="text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      id={id}
      readOnly={readOnly}
      {...register(id, { required: `${label} là bắt buộc` })}
      type="text"
      className="form-input col-span-2 w-full px-3 py-2 border rounded-md text-sm"
      placeholder={placeholder}
    />
    {errors[id] && <p className="text-red-500 text-sm col-span-2 col-start-2">{errors[id].message}</p>}
  </div>
);
