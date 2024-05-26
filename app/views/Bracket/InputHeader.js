import React from 'react';
import InputWithLabel from '../../components/InputWithLabel';

const InputHeader = ({ handleChange }) => {
  return (
    <div className="bg-white shadow-xl rounded-xl w-full">
      <div className="p-8">
        <div className="mb-4 font-semibold">Nhập thông tin: </div>

        <div className="flex gap-8">
          <InputWithLabel label={'Họ tên'} />
          <InputWithLabel label={'Đơn vị'} />
          {/* <InputWithLabel label={''} /> */}
        </div>

        <div className="text-end mt-4">
          <label htmlFor="playerListUpload" className="custom-file-upload bg-indigo-500">
            <input id="playerListUpload" type="file" onChange={handleChange} className="hidden" />
            Tải file lên
          </label>
        </div>
      </div>
    </div>
  );
};

export default InputHeader;
