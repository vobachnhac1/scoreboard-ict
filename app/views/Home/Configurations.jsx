// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { readSheetNames } from 'read-excel-file';

const FormField = ({ label, value, onClick = () => {} }) => (
  <div className="border border-gray-300 p-2 h-full" onClick={onClick}>
    <div className="text-sm font-semibold">{label}</div>
    <div className="mt-1">{value}</div>
  </div>
);

const CustomSelect = ({ label, options, onChange = () => {}, defaultValue }) => (
  <div className="border border-gray-300 p-2">
    <div className="pl-3">{label}</div>
    <select
      defaultValue={defaultValue}
      onChange={onChange}
      className="w-full border-0 focus:outline-none focus:border-0 focus:!ring-0"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const Configurations = ({ onChangeImageList, uploadSuccess, onChangeRightExcel, selectedFile }) => {
  const inputImagesRef = useRef(null);
  const inputExcelRef = useRef(null);
  const inputLinkRef = useRef(null);
  const dispatch = useDispatch();

  const handleChangeFolder = () => {
    inputLinkRef.current.click();
  };

  const [folderPath, setFolderPath] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFolderSelection = async () => {
    try {
      setLoading(true);
      // Gọi đến main process để mở dialog chọn folder
      const selectedPath = await window.electron.openFolder();
      if (selectedPath) {
        setFolderPath(selectedPath);
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
    } finally {
      setLoading(false);
    }
  };

  const configData = useSelector((state) => state?.config);

  const handleClickImages = () => {
    if (inputImagesRef && inputImagesRef.current) {
      inputImagesRef.current.click();
    }
  };

  const handleClickExcel = () => {
    if (inputExcelRef && inputExcelRef.current) {
      inputExcelRef.current.click();
    }
  };

  const onChangeConfig = (e, configName) => {
    dispatch({
      type: 'UPDATE_CONFIG_FIELD',
      payload: {
        field: configName,
        value: e.target.value
      }
    });
  };

  return (
    <div className="p-6 bg-white border border-gray-500">
      <div>
        <h2 className="text-2xl font-bold text-center mb-6">
          GIẢI VÔ ĐỊCH VOVINAM
          <br />
          TOÀN QUỐC LẦN THỨ 20 NĂM 2023
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* <FormField label="SỐ HIỆP" value={configData.rounds} /> */}
        <CustomSelect
          label="SỐ HIỆP"
          defaultValue={configData.rounds}
          options={[
            {
              value: 1,
              label: '1 HIỆP'
            },
            {
              value: 3,
              label: '3 HIỆP'
            },
            {
              value: 5,
              label: '5 HIỆP'
            }
          ]}
          onChange={(e) => onChangeConfig(e, 'rounds')}
        />
        <CustomSelect
          label="TG TÍNH ĐIỂM"
          defaultValue={configData.scoreTime}
          options={[
            {
              value: 1000,
              label: '1000'
            },
            {
              value: 2000,
              label: '2000'
            },
            {
              value: 3000,
              label: '3000'
            }
          ]}
          onChange={(e) => onChangeConfig(e, 'scoreTime')}
        />
        <CustomSelect
          label="MÔN"
          defaultValue={configData.discipline}
          options={[
            {
              value: 'VOVINAM',
              label: 'VOVINAM'
            },
            {
              value: 'PENCAK SILAT',
              label: 'PENCAK SILAT'
            },
            {
              value: 'ARNIST',
              label: 'ARNIST'
            },
            {
              value: 'Kickboxing',
              label: 'Kickboxing'
            }
          ]}
          onChange={(e) => onChangeConfig(e, 'discipline')}
        />

        {/* <FormField label="TG THI ĐẤU" value={configData.matchTime} /> */}

        <CustomSelect
          label="TG THI ĐẤU"
          defaultValue={configData.matchTime}
          options={[
            {
              value: 90,
              label: '90'
            },
            {
              value: 120,
              label: '120'
            },
            {
              value: 3,
              label: '150'
            }
          ]}
          onChange={(e) => onChangeConfig(e, 'matchTime')}
        />

        <CustomSelect
          label="HỆ ĐIỂM 1"
          defaultValue={configData.scoreSystem1}
          options={[
            {
              value: true,
              label: 'True'
            },
            {
              value: false,
              label: 'False'
            }
          ]}
        />

        <div className={`relative ${uploadSuccess && 'bg-green-500'} min-h-20`}>
          <FormField label="DANH SÁCH ĐỐI KHÁNG" value={configData.resistanceList} onClick={handleClickImages} />

          <input
            type="file"
            ref={inputImagesRef}
            style={{ display: 'none', zIndex: 50 }}
            onChange={onChangeImageList}
            accept="image/png, image/gif, image/jpeg"
            multiple
          />
        </div>

        <CustomSelect
          label="TG NGHỈ"
          defaultValue={configData.breakTime}
          options={[
            {
              value: 90,
              label: '90'
            },
            {
              value: 120,
              label: '120'
            },
            {
              value: 3,
              label: '150'
            }
          ]}
          onChange={(e) => onChangeConfig(e, 'breakTime')}
        />

        <CustomSelect
          label="HỆ ĐIỂM 2"
          defaultValue={configData.scoreSystem2}
          options={[
            {
              value: true,
              label: 'True'
            },
            {
              value: false,
              label: 'False'
            }
          ]}
        />
        <div className={`${selectedFile && 'bg-green-500'}`}>
          <FormField label="DANH SÁCH QUYỀN" value={configData.rightList} onClick={handleClickExcel} />

          <input
            type="file"
            ref={inputExcelRef}
            style={{ display: 'none', zIndex: 50 }}
            onChange={onChangeRightExcel}
            accept=".xlsx"
          />
        </div>

        <CustomSelect
          label="SỐ HIỆP PHỤ"
          defaultValue={configData.extraRounds}
          options={[
            {
              value: 1,
              label: '1'
            },
            {
              value: 2,
              label: '2'
            },
            {
              value: 3,
              label: '3'
            }
          ]}
        />
        <CustomSelect
          label="HỆ ĐIỂM 3"
          defaultValue={configData.scoreSystem3}
          options={[
            {
              value: true,
              label: 'True'
            },
            {
              value: false,
              label: 'False'
            }
          ]}
        />

        <FormField label="DANH SÁCH TRỌNG TÀI" value={configData.refereeList} />

        <CustomSelect
          label="TG THI HIỆP PHỤ"
          defaultValue={configData.extraMatchTime}
          options={[
            {
              value: 90,
              label: '90'
            },
            {
              value: 120,
              label: '120'
            },
            {
              value: 150,
              label: '150'
            }
          ]}
        />
        <FormField label="THI QUYỀN" value={configData.rightMatch} />
        <FormField label="FILE MẪU ĐK" value={configData.registerForm} />

        <CustomSelect
          label="SỐ GD ĐỐI KHÁNG"
          defaultValue={configData.resistanceCount}
          options={[
            {
              value: 1,
              label: '1'
            },
            {
              value: 3,
              label: '3'
            },
            {
              value: 5,
              label: '5'
            }
          ]}
        />
        {/* <div className="relative" onClick={handleChangeFolder}> */}
        {/* {loading ? 'Đang xử lý...' : 'Chọn Folder'} */}
        <FormField label="ĐƯỜNG DẪN LƯU BIÊN BẢN" value={configData.reportPath} onClick={handleFolderSelection} />
        {/* </div> */}
        <FormField label="FILE MẪU QUYỀN" value={configData.rightCount} />

        <CustomSelect
          label="SỐ GD QUYỀN"
          defaultValue={configData.rightCount}
          options={[
            {
              value: 1,
              label: '1'
            },
            {
              value: 3,
              label: '3'
            },
            {
              value: 5,
              label: '5'
            }
          ]}
        />
        <FormField label="HÌNH ẢNH LOGO GIẢI" value={configData.logo} />
      </div>
    </div>
  );
};

export default Configurations;
