import React, { useState } from "react";
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions, ComboboxButton } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export default function CustomCombobox({ data, selectedData, onChange, placeholder, keyShow }) {
  const [query, setQuery] = useState("");

  const filteredDatas = query === "" ? data : data.filter((data) => data[keyShow].toLowerCase().includes(query.toLowerCase()));

  return (
    <Combobox value={selectedData} onChange={onChange}>
      <div className="relative select-none">
        <div className="relative w-full">
          <ComboboxInput
            className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
            displayValue={(data) => (data ? data[keyShow] : "")}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder || "Vui lòng chọn"}
          />
          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </ComboboxButton>
        </div>

        <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {filteredDatas.length === 0 && query !== "" ? (
            <div className="cursor-default select-none px-4 py-2 text-gray-700">Không tìm thấy</div>
          ) : (
            filteredDatas.map((data) => (
              <ComboboxOption
                key={data.id}
                className={({ active }) => `relative cursor-pointer select-none px-4 py-2 ${active ? "bg-primary/10 text-primary" : "text-gray-900"}`}
                value={data}
              >
                {data[keyShow]}
              </ComboboxOption>
            ))
          )}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}
