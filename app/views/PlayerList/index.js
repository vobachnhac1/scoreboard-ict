import React, { useEffect, useState } from 'react';
import readXlsxFile from 'read-excel-file';
import { playerListSchema } from '../../shared/qrDataSchema';
import axios from 'axios';
import { tempData } from '../../shared/tempData';
import { SingleEliminationBracket, Match, SVGViewer } from 'react-tournament-brackets';
import {
  generateNextMatchIds,
  makeMatchesEven,
  sortMatchesAndUpdateIds,
  splitParticipants
} from '../../helpers/matches';

const PlayerListTemp = () => {
  const [matches, setMatches] = useState([]);

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
          console.log({ filteredData });

          const tempMatches = splitParticipants(filteredData);

          const sortedMatches = sortMatchesAndUpdateIds(tempMatches);

          const insertedMatches = makeMatchesEven(sortedMatches);

          const allMatchesIds = generateNextMatchIds(insertedMatches);
          setMatches(allMatchesIds);
        });
      });
  };
  return (
    matches.length > 0 && (
      <SingleEliminationBracket
        matches={matches}
        matchComponent={Match}
        options={{
          style: {
            roundHeader: 'none'
          }
        }}
      />
    )
  );
};
export default PlayerListTemp;
