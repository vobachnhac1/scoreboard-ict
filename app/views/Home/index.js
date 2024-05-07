import './index.scss';

import React, { useRef, useState } from 'react';
import QrFormHeader from '../../components/QrFormHeader';
import { Button } from 'antd';

import TableDisplay from './TableDisplay';
import ReadExcel from './ReadExcel';

import writeXlsxFile from 'write-excel-file';

import { exportSchema } from '../../shared/qrDataSchema';

const Home = () => {
  const template = ['index', 'fullname', 'birthdate', 'sex', 'level', 'desc', 'unit', 'cardCode', 'cardDate', 'note'];

  const [tableData, setTableData] = useState(
    Array(10)
      .fill(null)
      .map((_, index) => ({ key: index, title: template[index] }))
  );

  const [inputData, setInputData] = useState('');
  const [indexAdd, setIndexAdd] = useState(0);

  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(0);

  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [dataTable, setDataTable] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const inputRef = useRef();

  const dragItem = useRef(0);
  const draggedOverItem = useRef(0);

  function handleSort() {
    const dataClone = [...tableData];
    const tempLabel = dataClone[dragItem.current].label;
    dataClone[dragItem.current].label = dataClone[draggedOverItem.current].label;
    dataClone[draggedOverItem.current].label = tempLabel;

    setTableData(dataClone);
    setIsDragging(false);
  }

  const handleDelete = (key) => {
    let temp = [...tableData];

    temp = temp.filter((item) => item.key !== key);

    for (let i = key; i < temp.length; i++) {
      temp[i].key = temp[i].key - 1;
    }
    setTableData(temp);

    temp.push({
      key: '',
      label: ''
    });

    let indexDelete = indexAdd - 1;
    setIndexAdd(indexDelete);
  };

  const enableEdit = (item) => {
    setIsEdit(true);
    setEditId(item.key);
    setInputData(item.label);
    inputRef.current.focus();
  };

  const handleExportExcel = async () => {
    if (!tableData[tableData.length - 1].label) {
      console.error('Chưa nhập đủ thông tin');
      return;
    }
    const newData = {};

    tableData.forEach((obj) => {
      const key = obj.title;
      newData[key] = obj.label;
    });

    await writeXlsxFile([newData], {
      schema: exportSchema,
      fileName: 'file.xlsx'
    });
  };

  const refreshData = () => {
    setIsLoading(true);
    const template = ['index', 'fullname', 'birthdate', 'sex', 'level', 'desc', 'unit', 'cardCode', 'cardDate', 'note'];

    setTableData(
      Array(10)
        .fill(null)
        .map((_, index) => ({ key: index, title: template[index] }))
    );
    setDataTable([]);
    setIsEdit(false);
    setIndexAdd(0);
    setIsLoading(false);
    setSelectedFile(null);
  };

  return (
    <div className="qr__generator bg-gray-400">
      <div className="qr__generator-form bg-white">
        <div className="form-section form-header">
          <QrFormHeader
            tableData={tableData}
            setTableData={setTableData}
            setIndexAdd={setIndexAdd}
            indexAdd={indexAdd}
            isEdit={isEdit}
            setIsEdit={setIsEdit}
            editId={editId}
            setEditId={setEditId}
            inputRef={inputRef}
            inputData={inputData}
            setInputData={setInputData}
            refreshData={refreshData}
            isLoading={isLoading}
          />
        </div>
        <div className="form-section form-display">
          <div className="flex justify-end w-full mb-4">
            <button onClick={() => handleExportExcel()} className="custom-file-upload">
              Xuất excel
            </button>
          </div>
          <TableDisplay
            tableData={tableData}
            dragItem={dragItem}
            draggedOverItem={draggedOverItem}
            handleSort={handleSort}
            enableEdit={enableEdit}
            handleDelete={handleDelete}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
          />
        </div>
        <div className="form-section form-input-file">
          <ReadExcel
            dataTable={dataTable}
            setDataTable={setDataTable}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
