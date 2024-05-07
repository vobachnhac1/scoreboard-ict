import React, { useEffect, useState } from 'react';
import readXlsxFile from 'read-excel-file';

import { qrDataSchema } from '../../shared/qrDataSchema';
import { Button } from 'antd';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import QRCode from 'qrcode';

const ReadExcel = ({ dataTable, setDataTable, selectedFile, setSelectedFile }) => {
  const [headers, setHeaders] = useState([]);

  console.log(dataTable);

  useEffect(() => {
    if (selectedFile !== null) {
      readXlsxFile(selectedFile, {
        schema: qrDataSchema
      }).then(({ rows, errors }) => {
        const keysArray = Object.entries(qrDataSchema).map(([label, { prop }]) => ({ label, key: prop }));

        setHeaders(keysArray);
        setDataTable(rows);
      });
    }
  }, [selectedFile]);

  const handleChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleDownloadQr = async (item) => {
    let templateString = '';

    for (let i = 0; i < headers.length; i++) {
      templateString += `${headers[i].label}: ${item[headers[i].key]} \n`;
    }

    templateString += '///////  DHT-NHACVB ///////';

    const qrCodeURL = await QRCode.toDataURL(templateString, { errorCorrectionLevel: 'H' });

    let aEl = document.createElement('a');
    aEl.href = qrCodeURL;
    aEl.download = `${item.index}_${item.fullname}.png`;
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
        templateString += `${headers[j].label}: ${item[headers[j].key]} \n`;
      }

      templateString += '///////  DHT-NHACVB ///////';

      const qrDataURL = await QRCode.toDataURL(templateString, { errorCorrectionLevel: 'H' });
      zip.file(`${dataTable[i].index}_${dataTable[i].fullname}.png`, qrDataURL.split('base64,')[1], { base64: true });
    }

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'qrcodes.zip');
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <label htmlFor="file-upload" className="custom-file-upload">
            <input id="file-upload" type="file" onChange={handleChange} className="hidden" />
            Upload File
          </label>
        </div>
        {dataTable.length ? (
          <div className="custom-file-upload" onClick={handleDownloadAll}>
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
                {headers.map((item, index) => (
                  <td key={item.key} className="font-semibold">
                    {item.label}
                  </td>
                ))}
                <td className="font-semibold">QR Code</td>
              </tr>
            </thead>
            <tbody>
              {dataTable.map((item, index) => (
                <tr key={index} className="border">
                  <td>{item.index}</td>
                  <td>{item.fullname}</td>
                  <td>{item.birthdate}</td>
                  <td>{item.sex}</td>
                  <td>{item.level}</td>
                  <td>{item.desc}</td>
                  <td>{item.unit}</td>
                  <td>{item.cardCode}</td>
                  <td>{item.cardDate}</td>
                  <td>{item.note}</td>
                  <td>
                    <Button type="" onClick={() => handleDownloadQr(item)}>
                      Download QR
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
};

export default ReadExcel;
