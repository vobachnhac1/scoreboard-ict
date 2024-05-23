import React, { useRef, useState, useEffect } from 'react';
import readXlsxFile from 'read-excel-file';
import { Bracket } from 'react-brackets';
import InputHeader from './InputHeader';
import PlayerList from './PlayerList';

const BracketTest = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [playerList, setPlayerList] = useState([]);
  const [seeds, setSeeds] = useState([
    {
      id: 1,
      teams: []
    },
    {
      id: 2,
      teams: []
    },
    {
      id: 3,
      teams: []
    },
    {
      id: 4,
      teams: []
    },
    {
      id: 5,
      teams: []
    },
    {
      id: 6,
      teams: []
    },
    {
      id: 7,
      teams: []
    },
    {
      id: 8,
      teams: []
    }
  ]);

  useEffect(() => {
    if (selectedFile !== null) {
      readXlsxFile(selectedFile).then((rows) => {
        const filteredData = rows.filter((row) => row.some((item) => item !== null));
        setPlayerList(filteredData);
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

        // setSeeds(transformedData);

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
    }
  }, [selectedFile]);

  const handleChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const rounds = [
    {
      title: 'Vòng loại',
      seeds: seeds
    },
    {
      title: 'Tứ kết',
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
      title: 'Bán kết',
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
      title: 'Chung kết',
      seeds: [
        {
          id: 15,
          teams: []
        }
      ]
    }
  ];

  return (
    <div className="w-full h-full">
      <div className="min-h-screen bg-gradient-to-r from-blue-600 to-violet-600">
        <div className="flex flex-col justify-center items-center p-16 px-28 gap-8">
          <InputHeader handleChange={handleChange} />
          <div className="w-full flex gap-4 min-h-[600px]">
            <div className="w-1/3 bg-white shadow-xl rounded-xl">
              <PlayerList playerList={playerList} />
            </div>
            <div className="w-2/3 bg-white shadow-xl rounded-xl p-4">
              <Bracket rounds={rounds} bracketClassName="w-full justify-between" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BracketTest;
