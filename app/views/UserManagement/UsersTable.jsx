import React, { useState } from 'react';

import { Button, Dropdown, Modal } from 'antd';
import { DeleteOutlined, EditOutlined, EllipsisOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const UsersTable = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userSelected, setUserSelected] = useState({});

  const showModal = (person) => {
    setUserSelected(person);
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const people = [
    { name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member' },
    { name: 'Courtney Henry', title: 'Designer', email: '', role: 'Member' },
    { name: 'Tanya Fox', title: 'Designer', email: '', role: 'Member' },
    { name: 'Jenny Wilson', title: 'Designer', email: '', role: 'Member' },
    { name: 'Kristin Watson', title: 'Designer', email: '', role: 'Member' }
    // { name: 'Emily Wallace', title: 'Designer', email: '', role: 'Member' },
    // { name: 'Jenny Wilson', title: 'Designer', email: '', role: 'Member' },
    // { name: 'Kristin Watson', title: 'Designer', email: '', role: 'Member' },
    // { name: 'Emily Wallace', title: 'Designer', email: '', role: 'Member' },
    // { name: 'Jenny Wilson', title: 'Designer', email: '', role: 'Member' },
    // { name: 'Kristin Watson', title: 'Designer', email: '', role: 'Member' },
    // { name: 'Emily Wallace', title: 'Designer', email: '', role: 'Member' }
  ];

  return (
    <>
      <table className="min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
              {t('fullname')}
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              {t('unit')}
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              {t('area')}
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              {t('school')}
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              {t('actions')}
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
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.role}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: '1',
                        label: (
                          <Button type="text" className="w-full text-start" onClick={() => showModal(person)}>
                            {t('detail')}
                          </Button>
                        )
                      },
                      {
                        key: '2',
                        label: (
                          <Button type="text" className="w-full text-start">
                            <EditOutlined />
                            {t('common_edit')}
                          </Button>
                        )
                      },
                      {
                        key: '3',
                        label: (
                          <Button type="text" className="text-red-500 w-full text-start">
                            <DeleteOutlined />
                            {t('common_delete')}
                          </Button>
                        )
                      }
                    ]
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
          ))}
        </tbody>
      </table>

      <Modal title="Basic Modal" open={isModalOpen} footer={false} onCancel={handleCancel}>
        <p>{userSelected.name}</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal>
    </>
  );
};

export default UsersTable;
