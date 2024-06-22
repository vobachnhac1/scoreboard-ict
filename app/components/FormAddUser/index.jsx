import React from 'react';
import InputWithLabel from '../../components/InputWithLabel';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const FormAddUser = () => {
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
    }
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
          <h2 className="text-4xl">{t('user_info')}</h2>
        </div>
        {/* Avatar */}
        <div>
          <img
            className="h-40 w-40 object-cover object-[center_top] rounded-full border-2 border-slate-50"
            src="https://tailwindui.com/img/logos/mark.svg?color=blue&shade=600"
            alt="Player"
          />{' '}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {Object.keys(userInfo).map((key) => {
            if (key !== 'additionalInfo') {
              return <InputWithLabel key={key} label={t(key)} fieldKey={key} register={register} />;
            }
            return null;
          })}
        </div>
      </div>

      {/* Player Additional Information */}
      <div className="bg-white border-dotted border-2 border-slate-400 p-5 rounded-md mt-3">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl">Additional Information</h2>
        </div>
        {/* Player Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {Object.keys(userInfo.additionalInfo).map((k, index) => {
            return <InputWithLabel key={index} label={t(k)} fieldKey={k} register={register} />;
          })}
        </div>
      </div>
    </form>
  );
};

export default FormAddUser;
