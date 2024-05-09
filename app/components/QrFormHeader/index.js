import { Button, Spin } from 'antd';
import InputWithLabel from '../InputWithLabel';
import './index.scss';
import React, { useEffect, useRef, useState } from 'react';
import Refresh from '../Icons/Refresh';
import { LoadingOutlined } from '@ant-design/icons';

const QrFormHeader = ({
  inputRef,
  tableData,
  setTableData,
  indexAdd,
  setIndexAdd,
  isEdit,
  setIsEdit,
  editId,
  inputData,
  setInputData,
  refreshData,
  isLoading
}) => {
  const handleEnter = (e) => {
    e.preventDefault();

    if (!inputData.trim()) return;

    let temp = [...tableData];

    if (temp.length >= 10 && temp[temp.length - 1].label) {
      console.error('Đã đủ trường cần nhập');
      setInputData('');
      return;
    }

    const newData = {
      key: indexAdd,
      label: inputData
    };

    temp[indexAdd] = {
      ...temp[indexAdd],
      ...newData
    };

    setTableData(temp);

    setInputData('');
    setIndexAdd(indexAdd + 1);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();

    if (!inputData.trim()) return;

    let temp = [...tableData];
    temp[editId]['label'] = inputData;

    setTableData(temp);

    setInputData('');
    setIsEdit(false);
  };

  const handleCancelEdit = () => {
    setIsEdit(false);
    setInputData('');
  };

  return (
    <form onSubmit={() => (isEdit ? handleEdit : handleEnter)} className="flex justify-between items-center">
      <InputWithLabel
        inputRef={inputRef}
        inputData={inputData}
        setInputData={setInputData}
        label={'Tên cột'}
        name={'column'}
        placeholder={'Nhập thông tin'}
      />
      <div className="flex w-1/5 items-center gap-1">
        <button
          onClick={isEdit ? handleEdit : handleEnter}
          className="ml-4 py-1.5 px-4 bg-blue-500 rounded text-white focus:outline-none whitespace-nowrap"
        >
          {isEdit ? 'Cập nhật' : 'Thêm'}
        </button>
        {isEdit && (
          <button
            onClick={handleCancelEdit}
            className="py-1.5 px-4 bg-red-500 rounded text-white focus:outline-none whitespace-nowrap"
          >
            Hủy
          </button>
        )}
        <button
          type="button"
          onClick={() => !isLoading && refreshData()}
          className="ml-4 py-1 px-4 bg-transparent border border-gray-400 rounded text-white focus:outline-none whitespace-nowrap"
        >
          {isLoading ? (
            <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: 'black' }} spin />} />
          ) : (
            <Refresh className="w-5 h-7" />
          )}
        </button>
      </div>
    </form>
  );
};

export default QrFormHeader;
