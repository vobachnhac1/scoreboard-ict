import React from 'react';

const SelectNavite = ({ labels, options }) => {
  return (
    <div>
      <label htmlFor="select" className="block text-sm font-medium leading-6 text-gray-900">
        {labels}
      </label>
      <select
        name="select"
        className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
        defaultValue="Canada"
      >
        {options.map((option, index) => (
          <option key={index}>{option}</option>
        ))}
      </select>
    </div>
  );
};

export default SelectNavite;
