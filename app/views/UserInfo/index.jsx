import React from 'react';
import InputWithLabel from '../../components/InputWithLabel';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const UserInfo = () => {
  const { t } = useTranslation();
  const userInfo = {
    userName: 'Hien',
    bornYear: '2001',
    hvPhoneNum: '00000000',
    parentPhoneNum: 'Smith',
    address: 28,
    email: 'emily.johnson@x.dummyjson.com',
    social: 'emily.johnson@x.dummyjson.com',
    additionalInfo: {
      phone: '+81 965-431-3024',
      height: 193.24,
      weight: 63.16,
      school: 'Green'
      //   parentInfo: {
      //     parentName: "Brown",
      //     phoneNum: "+81 965-431-3024",
      //   },
    },
    subjects: [
      { name: 'Bóng rổ', school: 'UIT', email: 'lindsay.walton@example.com', role: 'Member' },
      { name: 'Bóng đá', school: 'HCMUT', email: '', role: 'Member' },
      { name: 'TBắn bi', school: 'UIT', email: '', role: 'Member' },
      { name: 'Bóng chuyền', school: 'HCMUT', email: '', role: 'Member' }
    ]
  };

  const { handleSubmit, register } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="">
      {/* Player Information */}
      <div className="bg-white border-dotted border-2 border-slate-400 p-5 rounded-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-2xl font-semibold">{t('user_info')}</h2>
          <button className="p-3 border-2 rounded-md">{t('edit_info')}</button>
        </div>
        {/* Avatar */}
        <div>
          <img
            className="h-40 w-40 object-cover object-[center_top] rounded-full border-2 border-slate-50"
            src="https://tailwindui.com/img/logos/mark.svg?color=blue&shade=600"
            alt="Player"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {Object.keys(userInfo).map((key) => {
            if (key !== 'additionalInfo' && key !== 'subjects') {
              return (
                <InputWithLabel
                  key={key}
                  label={t(key)}
                  fieldKey={key}
                  register={register}
                  defaultValue={userInfo[key]}
                />
              );
            }
            return null;
          })}
        </div>
      </div>

      {/* Player Additional Information */}
      <div className="bg-white border-dotted border-2 border-slate-400 p-5 rounded-md mt-3">
        <h2 className="text-2xl mb-2 font-semibold">{t('subjects_info')}</h2>

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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {userInfo.subjects.map((subject, index) => (
              <tr key={`${subject.email}_${index}`}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                  {subject.name}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{subject.school}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{subject.email}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{subject.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </form>
  );
};

export default UserInfo;
