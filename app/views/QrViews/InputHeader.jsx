import { Button, Spin } from 'antd';
import InputWithLabel from '../../components/InputWithLabel';
import './index.scss';
import React, { useEffect, useRef, useState } from 'react';
import Refresh from '../../components/Icons/Refresh';
import { LoadingOutlined } from '@ant-design/icons';
import { useForm } from 'react-hook-form';

const InputHeader = ({
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
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setFocus,
    formState: { errors, isSubmitting }
  } = useForm();

  useEffect(() => {
    setValue('column', inputData);
    setFocus('column');
  }, [inputData]);

  const onSubmit = (data) => {
    setInputData(data.column);
    if (isEdit) {
      if (!data.column.trim()) return;
      let temp = [...tableData];
      temp[editId]['label'] = data.column;
      setTableData(temp);
      setInputData('');
      reset();
      setIsEdit(false);
    } else {
      // handleEnter();
      if (!data.column.trim()) return;
      let temp = [...tableData];

      if (temp.length >= 10 && temp[temp.length - 1].label) {
        console.error('Đã đủ trường cần nhập', temp.length, temp);
        reset({ column: '' });
        setInputData('');
        return;
      }

      const newData = {
        key: indexAdd,
        label: data.column
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

      reset({ column: '' });
    }
  };

  const handleCancelEdit = () => {
    setIsEdit(false);
    setInputData('');
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex justify-between items-center">
      <InputWithLabel
        inputRef={inputRef}
        label={'Tên cột'}
        flex
        name={'column'}
        placeholder={'Nhập thông tin'}
        className="w-4/5"
        fieldKey={'column'}
        register={register}
      />
      <div className="flex w-1/5 items-center gap-1">
        <button
          type="submit"
          disabled={isSubmitting}
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

export default InputHeader;
