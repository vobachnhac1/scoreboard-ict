import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SchoolTable from './SchoolTable';
import { Button, Modal } from 'antd';
import InputWithLabel from '../../components/InputWithLabel';
import { useForm } from 'react-hook-form';

const SystemManagement = () => {
  const { t } = useTranslation();

  const { handleSubmit, register } = useForm();

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [subjects, setSubjects] = useState([
    {
      id: 1,
      name: 'Bơi lội',
      level: 'Trung cấp',
      school: 'UIT',
      area: 'Quận 1'
    },
    {
      id: 2,
      name: 'Taekwondo',
      level: 'Quốc gia',
      school: 'UIT',
      area: 'Quận 1'
    },
    {
      id: 3,
      name: 'Bóng rổ',
      level: 'Quốc gia',
      school: 'HCMUT',
      area: 'Quận 10'
    },
    { id: 4, name: 'Tennis', level: 'Quốc gia', school: 'HCMUT', area: 'Quận 10' }
  ]); // [1, 2, 3, 4

  const onSubmit = (data) => {
    const tempSubjects = [...subjects];
    if (Object.values(data)?.every((item) => item !== '')) {
      console.log(data);
      tempSubjects.push({
        id: subjects.length + 1,
        ...data
      });

      setSubjects(tempSubjects);
    }
  };

  const newSubjects = [
    {
      label: 'Tên môn học',
      fieldKey: 'name'
    },
    {
      label: 'Tên trường',
      fieldKey: 'school'
    },
    {
      label: 'Khu vực',
      fieldKey: 'area'
    },
    {
      label: 'Cấp bậc',
      fieldKey: 'level'
    },
    {
      label: 'Tên quản lý',
      fieldKey: 'managerName'
    },
    {
      label: 'Số điện thoại quản lý',
      fieldKey: 'managerPhone'
    }
  ];

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center w-full justify-between items-center">
          <div className=" font-semibold text-xl">{t('subjects_management')}</div>

          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none juse">
            <button
              type="button"
              onClick={() => setIsOpenModal(true)}
              className="block rounded-md bg-sky-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {t('add_subject')}
            </button>
          </div>
        </div>
        {/* Search & filter */}
        {/* <SearchUser /> */}
        {/* User table */}
        <div className="mt-8 flow-root">
          <div className="-my-2 overflow-x-auto shadow-md">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8 bg-white">
              <SchoolTable subjects={subjects} />
            </div>
          </div>
        </div>
      </div>

      <Modal open={isOpenModal} onCancel={() => setIsOpenModal(false)} width={800} footer={false}>
        <div className="p-4">
          <div className="w-full text-center text-xl font-semibold">Thêm mới thông tin môn học</div>

          <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
            {newSubjects.map((item) => (
              <InputWithLabel key={item.fieldKey} label={item.label} register={register} fieldKey={item.fieldKey} />
            ))}

            <div className="w-full flex justify-end gap-2 items-center">
              <button type="button" className="px-6 py-3 text-lg bg-red-500 text-white rounded-lg">
                Hủy
              </button>
              <button type="submit" className="px-6 py-3 text-lg bg-sky-500 text-white rounded-lg">
                Lưu
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default SystemManagement;
