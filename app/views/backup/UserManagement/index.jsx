import React, { useState } from 'react';
import UsersTable from './UsersTable';
import { useTranslation } from 'react-i18next';
import SearchUser from './SearchUser';
import AddStudentModal from './EditInfoModal';

const UserManagement = () => {
  const { t } = useTranslation();
  const [isAddStudentModal, setIsAddStudentModal] = useState(false);
  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center w-full justify-between items-center">
          <div className=" font-semibold text-xl">{t('user_management')}</div>

          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none juse">
            <button
              type="button"
              className="block rounded-md bg-sky-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => setIsAddStudentModal(true)}
            >
              {t('add_user')}
            </button>
          </div>
        </div>
        {/* Search & filter */}
        <SearchUser />
        {/* User table */}
        <div className="mt-8 flow-root">
          <div className="-my-2 overflow-x-auto shadow-md">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8 bg-white">
              <UsersTable />
            </div>
          </div>
        </div>
      </div>

      <AddStudentModal isAddStudentModal={isAddStudentModal} setIsAddStudentModal={setIsAddStudentModal} />
    </>
  );
};

export default UserManagement;
