import React, { useEffect, useState } from 'react';
import readXlsxFile from 'read-excel-file';
import { playerListSchema } from '../../shared/qrDataSchema';

const PlayerList = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [headers, setHeaders] = useState({});

  const [playerList, setPlayerList] = useState([]);
  useEffect(() => {
    if (selectedFile !== null) {
      readXlsxFile(selectedFile, {
        schema: playerListSchema,
        transformData(data) {
          // Add a missing header row.
          return [
            ['ID', 'TT', 'HỌ TÊN', 'ĐƠN VỊ', 'NĂM SINH', 'GIỚI TÍNH', 'CÂN NẶNG', 'GHI CHÚ', 'KẾT QUẢ BỐC THĂM']
          ].concat(data);
        }
      }).then(({ rows }) => {
        setHeaders(rows[0]);
        let content = rows.slice(1);

        const result = content.reduce((acc, item) => {
          if (item.id) {
            acc.push({
              id: item.id,
              tenNoiDung: item.stt,
              danhSach: []
            });
          } else {
            const lastCategory = acc[acc.length - 1];
            lastCategory.danhSach.push({
              hoten: item.hoten,
              donvi: item.donvi,
              namsinh: item.namsinh,
              cannang: item.cannang,
              ghichu: item.ghichu,
              ketquaboctham: item.ketquaboctham
            });
          }
          return acc;
        }, []);

        setPlayerList(result);
      });
    }
  }, [selectedFile]);

  console.log(playerList);

  const handleChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };
  return (
    <div className="bg-gray-400 w-full h-full">
      <label htmlFor="playerListUpload" className="custom-file-upload bg-indigo-500">
        <input id="playerListUpload" type="file" onChange={handleChange} className="hidden" />
        Tải file lên
      </label>
    </div>
  );
};

export default PlayerList;
