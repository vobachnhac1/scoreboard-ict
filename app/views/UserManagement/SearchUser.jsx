import React from 'react';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const SearchUser = () => {
  return (
    <div className="flex justify-between my-4 items-center">
      <div className="w-1/3">
        <form className="relative flex flex-1" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <MagnifyingGlassIcon
            className="pointer-events-none absolute inset-y-0 left-2 h-full w-5 text-gray-400"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="block p-4 pl-8 h-full w-full border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm "
            placeholder="Tìm kiếm môn học"
            type="search"
            name="search"
          />
        </form>
      </div>

      <div className="flex gap-4">
        <div>
          <label htmlFor="select_school" className="block text-sm font-medium leading-6 text-gray-900">
            Trường
          </label>
          <select
            id="select_school"
            name="school"
            className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            defaultValue="Canada"
          >
            <option>United States</option>
            <option>Canada</option>
            <option>Mexico</option>
          </select>
        </div>

        <div>
          <label htmlFor="class_type" className="block text-sm font-medium leading-6 text-gray-900">
            Dạng lớp
          </label>
          <select
            id="class_type"
            name="class_type"
            className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            defaultValue="Canada"
          >
            <option>United States</option>
            <option>Canada</option>
            <option>Mexico</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchUser;
