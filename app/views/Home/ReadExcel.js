import React, { useEffect, useState } from 'react';
import readXlsxFile, { readSheetNames } from 'read-excel-file';

import { Button } from 'antd';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import QRCode from 'qrcode';

const ReadExcel = ({ dataTable, setDataTable, selectedFile, setSelectedFile }) => {
  const [headers, setHeaders] = useState([]);

  const [sheetOptions, setSheetOptions] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(0);

  const [inputKey, setInputKey] = useState(Date.now());

  useEffect(() => {
    if (selectedFile !== null) {
      readSheetNames(selectedFile).then((sheetNames) => {
        setSheetOptions(sheetNames);
      });
    } else {
      setSheetOptions([]);
      setSelectedSheet(NaN);
    }
  }, [selectedFile]);

  useEffect(() => {
    if (selectedSheet !== 0 && selectedFile !== null) {
      readXlsxFile(selectedFile, { sheet: selectedSheet }).then((rows) => {
        setHeaders(rows[0]);
        setDataTable(rows.slice(1));
      });
    }
  }, [selectedSheet]);

  const handleChange = (e) => {
    if (!e.target.files[0]) return;
    setSelectedFile(e.target.files[0]);
    setInputKey(Date.now());
  };

  const handleDownloadQr = async (item, index) => {
    let templateString = '';

    for (let i = 0; i < headers.length; i++) {
      templateString += `${headers[i]}: ${item[i]} \n`;
    }

    templateString += '///////  DHT-NHACVB ///////';

    const qrCodeURL = await QRCode.toDataURL(templateString, { errorCorrectionLevel: 'H' });

    let aEl = document.createElement('a');
    aEl.href = qrCodeURL;
    aEl.download = `${index + 1}.png`;
    document.body.appendChild(aEl);
    aEl.click();
    document.body.removeChild(aEl);
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();

    for (let i = 0; i < dataTable.length; i++) {
      const item = dataTable[i];
      let templateString = '';

      for (let j = 0; j < headers.length; j++) {
        templateString += `${headers[j]}: ${item[j]} \n`;
      }

      templateString += '///////  DHT-NHACVB ///////';

      const qrDataURL = await QRCode.toDataURL(templateString, { errorCorrectionLevel: 'H' });
      zip.file(`${i + 1}.png`, qrDataURL.split('base64,')[1], { base64: true });
    }

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'danh_sach_qrcodes.zip');
  };

  return (
    <div className="mt-4">
      <div className="mb-2 font-semibold">Xem thông tin: </div>
      <div className="flex justify-between items-center">
        <div>
          <label className="custom-file-upload bg-blue-500">
            <input type="file" onChange={handleChange} className="hidden" key={inputKey} />
            Tải file lên
          </label>
          {selectedFile &&
            sheetOptions.length > 0 &&
            sheetOptions.map((sheet, index) => (
              <button
                key={`${sheet}_${index}`}
                onClick={() => {
                  setSelectedSheet(index + 1);
                  setSheetOptions([]);
                }}
                className="custom-file-upload bg-green-500 ml-4"
              >
                {sheet}
              </button>
            ))}
        </div>

        {dataTable.length ? (
          <div className="custom-file-upload bg-blue-500" onClick={handleDownloadAll}>
            Tải hết QR Code
          </div>
        ) : (
          <div></div>
        )}
      </div>
      <div className="table-wrapper">
        {dataTable.length ? (
          <table className="mt-4 border border-black table_show_data">
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
                <th className="font-semibold">QR Code</th>
              </tr>
            </thead>
            <tbody>
              {dataTable.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                  <td>
                    <Button type="" onClick={() => handleDownloadQr(row, rowIndex)}>
                      Download QR
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="mt-4 border border-gray-400 table_no_data">
            <tbody>
              <tr>
                <td className="text-center">Chưa có file được chọn</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ReadExcel;
