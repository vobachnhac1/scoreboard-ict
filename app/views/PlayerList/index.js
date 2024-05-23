import React, { useEffect, useState } from 'react';
import readXlsxFile from 'read-excel-file';
import { playerListSchema } from '../../shared/qrDataSchema';
import { Bracket, RoundProps } from 'react-brackets';
import axios from 'axios';
import { tempData } from '../../shared/tempData';

const PlayerList = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [headers, setHeaders] = useState({});
  const [seeds, setSeeds] = useState([]);

  const [playerList, setPlayerList] = useState([]);
  useEffect(() => {
    if (selectedFile !== null) {
      readXlsxFile(selectedFile, {
        schema: playerListSchema,
        transformData(data) {
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

  console.log({ seeds });

  const rounds = [
    {
      title: 'Round one',
      seeds: seeds
    },
    {
      title: 'Round two',
      seeds: [
        {
          id: 9,
          teams: []
        },
        {
          id: 10,
          teams: []
        },
        {
          id: 11,
          teams: []
        },
        {
          id: 12,
          teams: []
        }
      ]
    },
    {
      title: 'Round three',
      seeds: [
        {
          id: 13,
          teams: []
        },
        {
          id: 14,
          teams: []
        }
      ]
    },
    {
      title: 'Round final',
      seeds: [
        {
          id: 15,
          teams: []
        }
      ]
    }
  ];

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    await axios
      .post('http://localhost:7778/api/boctham-mau', tempData, {
        headers: {
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
      })
      .then((res) => {
        // const url = window.URL.createObjectURL(new Blob([res.data]));
        // const link = document.createElement('a');
        // link.href = url;
        // link.setAttribute('download', 'file.xlsx'); // or any other extension
        // document.body.appendChild(link);
        // link.click();

        readXlsxFile(res.data).then((rows) => {
          const filteredData = rows.filter((row) => row.some((item) => item !== null));
          // const transformData = (data) => {
          //   const result = [];
          //   const mapping = {
          //     1: [0],
          //     2: [1, 2],
          //     3: [3, 4],
          //     4: [5],
          //     5: [6],
          //     6: [7, 8],
          //     7: [9, 10],
          //     8: [11]
          //   };

          //   for (const [id, indices] of Object.entries(mapping)) {
          //     const teams = indices.map((index) => {
          //       const name = data[index][1].replace("'", '') + (index === 11 ? '' : ' - ' + data[index][2]);
          //       return { name };
          //     });
          //     result.push({ id: parseInt(id), teams });
          //   }

          //   return result;
          // };
          // const transformedData = transformData(filteredData);

          const result = filteredData.reduce((acc, curr, index) => {
            const id = Math.floor(index / 2) + 1;
            const team = { name: `${curr[1]} - ${curr[2]}` };

            const existingTeam = acc.find((item) => item.id === id);

            if (existingTeam) {
              existingTeam.teams.push(team);
            } else {
              acc.push({ id, teams: [team] });
            }

            return acc;
          }, []);

          setSeeds(result);
        });
      });
  };

  console.log(seeds);

  const handleChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };
  return (
    // <div className="bg-gray-400 w-full h-full">
    //   <label htmlFor="playerListUpload" className="custom-file-upload bg-indigo-500">
    //     <input id="playerListUpload" type="file" onChange={handleChange} className="hidden" />
    //     Tải file lên
    //   </label>
    // </div>
    <Bracket rounds={rounds} />
  );
};

export default PlayerList;
