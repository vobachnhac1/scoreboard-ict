import React from 'react';

import { Checkbox, DatePicker, Modal } from 'antd';
import { useTranslation } from 'react-i18next';

const CheckInModal = ({ isCheckinModal, handleCancel, people }) => {
  const { t } = useTranslation();
  return (
    <Modal open={isCheckinModal} footer={false} onCancel={handleCancel} width={1200}>
      <div className="flex justify-center font-semibold text-xl py-4">{t('common_check_in')}</div>
      <div className="flex justify-end items-center gap-4">
        <span className="text-lg font-semibold">Chọn ngày:</span>
        <DatePicker
          className="block p-2 h-full w-64 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm "
          onChange={(date, dateString) => {
            console.log(date, dateString);
          }}
        />
      </div>
      <table className="min-w-full divide-y divide-gray-300 mt-4">
        <thead>
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
              {t('fullname')}
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              {t('gender')}
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              {t('birth_year')}
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              {t('check_in')}
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              {t('check_out')}
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              {t('note')}
            </th>
            <th scope="col" className="px-3 py-3.5  text-sm font-semibold text-gray-900 text-center">
              {t('common_check_in')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {people.map((person, index) => (
            <tr key={`${person.email}_${index}`}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                {person.name}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.title}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.email}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">Thoi gian check in</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">Thoi gian check out</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.role}</td>
              <td className="text-center">
                <Checkbox />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  );
};

export default CheckInModal;
