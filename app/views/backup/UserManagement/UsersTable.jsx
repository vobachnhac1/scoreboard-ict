import React, { useState } from 'react';

import { Button, Dropdown } from 'antd';
import { BellOutlined, EditOutlined, EllipsisOutlined, FileTextOutlined, UserAddOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import CheckInModal from './CheckInModal';
import NotificationModal from './NotificationModal';
import AddStudentModal from './EditInfoModal';
import MonthView from './MonthView';

const UsersTable = () => {
  const { t } = useTranslation();
  const [isCheckinModal, setIsheckinModal] = useState(false);
  const [userSelected, setUserSelected] = useState({});
  const [isNotifModal, setIsNotifModal] = useState(false);

  const [isAddStudentModal, setIsAddStudentModal] = useState(false);
  const [isOpenMonth, setIsOpenMonth] = useState(false);

  const showModal = (person) => {
    setUserSelected(person);
    setIsheckinModal(true);
  };

  const handleOk = () => {
    setIsheckinModal(false);
  };

  const handleCancel = () => {
    setIsheckinModal(false);
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
              {t('subject')}
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              {t('school')}
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              {t('status')}
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              {t('class_type')}
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
                          <Button
                            type="text"
                            className="w-full text-start flex items-center"
                            onClick={() => setIsAddStudentModal(true)}
                          >
                            <UserAddOutlined />
                            {t('add_student')}
                          </Button>
                        )
                      },
                      {
                        key: '2',
                        label: (
                          <Button
                            type="text"
                            className=" w-full text-start flex items-center"
                            onClick={() => showModal(person)}
                          >
                            <EditOutlined />
                            {t('check_in')}
                          </Button>
                        )
                      },
                      {
                        key: '3',
                        label: (
                          <Button
                            type="text"
                            className=" w-full text-start flex items-center"
                            onClick={() => {
                              setIsOpenMonth(true);
                            }}
                          >
                            <FileTextOutlined />
                            {t('report')}
                          </Button>
                        )
                      },
                      {
                        key: '4',
                        label: (
                          <Button
                            type="text"
                            className=" w-full text-start flex items-center"
                            onClick={() => {
                              setIsNotifModal(true);
                              setUserSelected(person);
                            }}
                          >
                            <BellOutlined />
                            {t('notification')}
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

      <CheckInModal isCheckinModal={isCheckinModal} handleCancel={handleCancel} people={people} />
      <NotificationModal isNotifModal={isNotifModal} setIsNotifModal={setIsNotifModal} userSelected={userSelected} />
      <AddStudentModal
        isAddStudentModal={isAddStudentModal}
        setIsAddStudentModal={setIsAddStudentModal}
        userInfo={userSelected}
      />
      <MonthView isOpenMonth={isOpenMonth} setIsOpenMonth={setIsOpenMonth} />
    </>
  );
};

export default UsersTable;
