import { Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { readSheetNames } from 'read-excel-file';
import RoundeOne from './RoundOne';

const History = () => {
  const { t } = useTranslation();

  const [listImages, setListImages] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [items, setItems] = useState([]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [sheetOptions, setSheetOptions] = useState([]);

  const onChangeRightExcel = (event) => {
    const file = event.target.files[0];
    console.log(file);
    setSelectedFile(file);
  };

  useEffect(() => {
    if (selectedFile !== null) {
      readSheetNames(selectedFile).then((sheetNames) => {
        setSheetOptions(sheetNames);
      });
    } else {
      setSheetOptions([]);
    }
  }, [selectedFile]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setListImages(imageUrls);

    if (imageUrls.length >= 2) setUploadSuccess(true);
  };

  useEffect(() => {
    setItems([
      {
        key: '1',
        label: t('round_1'),
        children: <RoundeOne />
      },
      {
        key: '2',
        label: t('round_2'),
        children: <RoundeOne />
      },
      {
        key: '3',
        label: t('round_3'),
        children: <RoundeOne />
      }
    ]);
  }, [listImages, sheetOptions]);

  const onChange = (key) => {
    console.log(key);
  };

  return (
    <div className="p-16 pb-0 min-h-screen flex flex-col">
      <div className="flex justify-center p-8 border-black border">
        <h3>LỊCH SỬ GHI NHẬN TRONG TRẬN</h3>
      </div>

      <div className="mt-12 flex-1" id="custom-tabs">
        <Tabs defaultActiveKey="1" type="card" size={'middle'} items={items} onChange={onChange} className="h-full" />
      </div>
    </div>
  );
};

export default History;
