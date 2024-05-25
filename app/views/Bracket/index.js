import React, { useState, useEffect } from 'react';
import PlayerList from './PlayerList';
import InputHeader from './InputHeader';
import readXlsxFile from 'read-excel-file';

import axios from 'axios';
import { tempData } from '../../shared/tempData';
import { SingleEliminationBracket, Match, createTheme } from 'react-tournament-brackets';
import {
  generateNextMatchIds,
  makeMatchesEven,
  sortMatchesAndUpdateIds,
  splitParticipants,
  updateWalkOverStatus
} from '../../helpers/matches';

const WhiteTheme = createTheme({
  textColor: { main: '#000000', highlighted: '#07090D', dark: '#3E414D' },
  matchBackground: { wonColor: '#daebf9', lostColor: '#96c6da' },
  score: {
    background: { wonColor: '#87b2c4', lostColor: '#87b2c4' },
    text: { highlightedWonColor: '#7BF59D', highlightedLostColor: '#FB7E94' }
  },
  border: {
    color: '#CED1F2',
    highlightedColor: '#da96c6'
  },
  roundHeader: { backgroundColor: '#da96c6', fontColor: '#fff' },
  connectorColor: '#CED1F2',
  connectorColorHighlight: '#da96c6',
  svgBackground: '#FAFAFA'
});

const BracketTest = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [playerList, setPlayerList] = useState([]);

  const [matches, setMatches] = useState([]);

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (selectedFile !== null) {
      readXlsxFile(selectedFile).then((rows) => {
        const filteredData = rows.filter((row) => row.some((item) => item !== null));
        setPlayerList(filteredData);
      });
    }
  }, [selectedFile]);

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

          const tempMatches = splitParticipants(filteredData);

          const sortedMatches = sortMatchesAndUpdateIds(tempMatches);

          const insertedMatches = makeMatchesEven(sortedMatches);

          const walkOverMatches = updateWalkOverStatus(insertedMatches);

          const allMatchesIds = generateNextMatchIds(walkOverMatches);
          setMatches(allMatchesIds);
        });
      });
  };

  useEffect(() => {
    if (selectedFile !== null) {
      readXlsxFile(selectedFile).then((rows) => {
        const filteredData = rows.filter((row) => row.some((item) => item !== null));
        setPlayerList(filteredData);
        // const tempMatches = splitParticipants(filteredData);
        // const sortedMatches = sortMatchesAndUpdateIds(tempMatches);
        // const insertedMatches = makeMatchesEven(sortedMatches);
        // const allMatchesIds = generateNextMatchIds(insertedMatches);
        // setMatches(allMatchesIds);
      });
    }
  }, []);

  const handleChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  return (
    <div className="w-full h-full">
      <div className="min-h-screen bg-gradient-to-r from-blue-600 to-violet-600">
        <div className="flex flex-col justify-center items-center p-16 gap-8">
          <InputHeader handleChange={handleChange} />
          <div className={`w-full min-h-[600px] ${matches.length <= 18 ? 'flex gap-4' : ''}`}>
            <div className={`bg-white shadow-xl rounded-xl ${matches.length <= 18 ? 'w-1/5' : 'w-full'}`}>
              {<PlayerList playerList={playerList} isFull={matches.length} />}
            </div>
            <div className={`${matches.length <= 18 ? 'w-4/5' : 'w-full mt-4'} bg-white shadow-xl rounded-xl p-4 py-0`}>
              {/* <PlayerListTemp /> */}
              {matches.length > 0 && (
                <SingleEliminationBracket
                  matches={matches}
                  matchComponent={Match}
                  theme={WhiteTheme}
                  options={{
                    style: {
                      roundHeader: {
                        backgroundColor: WhiteTheme.roundHeader.backgroundColor,
                        fontColor: WhiteTheme.roundHeader.fontColor
                      },
                      connectorColor: WhiteTheme.connectorColor,
                      connectorColorHighlight: WhiteTheme.connectorColorHighlight
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BracketTest;
