import { EllipsisOutlined } from '@ant-design/icons';
import { Button, Dropdown, Empty } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

const SchoolTable = ({ subjects }) => {
  const { t } = useTranslation();
  return (
    <table className="min-w-full divide-y divide-gray-300">
      <thead>
        <tr>
          <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">{t('index')}</th>
          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
            {t('subject')}
          </th>
          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-2/6">
            {t('school')}
          </th>
          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
            {t('area')}
          </th>
          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
            {t('level')}
          </th>
          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-1/12">
            {t('actions')}
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {subjects ? (
          subjects.map((subject, index) => (
            <tr key={`${subject.id}_${index}`}>
              <td>{index + 1}</td>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                {subject.name}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{subject.school}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{subject.area}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{subject.level}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <Dropdown
                  menu={{
                    items: []
                  }}
                  placement="bottom"
                  arrow
                >
                  <Button type="text">
                    <EllipsisOutlined style={{ fontSize: '20px' }} />
                  </Button>
                </Dropdown>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <th colSpan={5}>
              <Empty />
            </th>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default SchoolTable;
