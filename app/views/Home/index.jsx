import { Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import Configurations from './Configurations';
import { useTranslation } from 'react-i18next';
import Versus from './Versus';
import Fist from './Fist';
import Instruction from './Instruction';
import About from './About';
import { readSheetNames } from 'read-excel-file';

const Home = () => {
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
        label: t('configurations'),
        children: (
          <Configurations
            onChangeImageList={handleFileChange}
            uploadSuccess={uploadSuccess}
            onChangeRightExcel={onChangeRightExcel}
            selectedFile={selectedFile}
          />
        )
      },
      {
        key: '2',
        label: t('versus'),
        children: <Versus listImages={listImages} />
      },
      {
        key: '3',
        label: t('fist'),
        children: <Fist sheetOptions={sheetOptions} />
      },
      {
        key: '4',
        label: t('instructions'),
        children: <Instruction />
      },
      {
        key: '5',
        label: t('about'),
        children: <About />
      }
    ]);
  }, [listImages, sheetOptions]);

  const onChange = (key) => {
    console.log(key);
  };

  return (
    <div className="p-16 pb-0 min-h-screen flex flex-col">
      <div className="flex justify-center p-8 border-black border">
        <h3>CÀI ĐẶT PHẦN MỀM CHẤM ĐIỂM</h3>
      </div>

      <div className="mt-12 flex-1" id="custom-tabs">
        <Tabs defaultActiveKey="1" type="card" size={'middle'} items={items} onChange={onChange} className="h-full" />
      </div>
    </div>
  );
};

export default Home;
