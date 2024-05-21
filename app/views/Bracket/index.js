import React, { useRef, useState, useEffect } from "react";
import Match from "./Match";
import readXlsxFile from "read-excel-file";
import Player from "./Player";
import {
  Bracket,
  RoundProps,
  Seed,
  SeedItem,
  SeedTeam,
  RenderSeedProps,
} from "react-brackets";

const CustomSeed = ({ seed, breakpoint, roundIndex, seedIndex }) => {
  console.log(seed);

  return (
    <Seed>
      <SeedItem>
        <div>
          <SeedTeam style={{ color: "red" }}>{seed.teams[0]?.name}</SeedTeam>
          <SeedTeam>{seed.teams[1]?.name}</SeedTeam>
        </div>
      </SeedItem>
    </Seed>
  );
};

const BracketTest = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [headers, setHeaders] = useState({});

  const [playerList, setPlayerList] = useState([]);

  const data = [
    ["1.", "Nguyễn Văn A1'", "Quận 1"],
    ["2.", "Nguyễn Văn A2'", "Quận 1"],
    ["3.", "Nguyễn Văn A3'", "Quận 1"],
    ["4.", "Nguyễn Văn A3'", "Nguyễn Văn A3'"],
    ["5.", "Nguyễn Văn A3'", "Nguyễn Văn A3'"],
    ["6.", "Nguyễn Văn A6'", "Quận 1"],
    ["7.", "Nguyễn Văn A7'", "Quận 1"],
    ["8.", "Nguyễn Văn A3'", "Nguyễn Văn A3'"],
    ["9.", "Nguyễn Văn A3'", "Nguyễn Văn A3'"],
    ["10.", "Nguyễn Văn A3'", "Nguyễn Văn A3'"],
    ["11.", "Nguyễn Văn A3'", "Nguyễn Văn A3'"],
    ["12.", "Nguyễn Văn A12'", "Quận 1"],
  ];

  useEffect(() => {
    if (selectedFile !== null) {
      readXlsxFile(selectedFile).then((rows) => {
        const filteredData = rows.filter((row) =>
          row.some((item) => item !== null)
        );

        setPlayerList(filteredData);

        console.log(filteredData);
      });
    }
  }, [selectedFile]);

  const handleChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

//   const rounds = [
//     {
//       seeds: [
//         {
//           id: 1,
//           teams: [{ name: "Team A" }, { name: "Team B" }],
//         },
//         {
//           id: 2,
//           teams: [{ name: "Team C" }, { name: "Team D" }],
//         },
//         {
//           id: 3,
//           teams: [{ name: "Team Ah" }],
//         },
//         {
//           id: 4,
//           teams: [{ name: "Team Cq" }, { name: "Team Dq" }],
//         },
//       ],
//     },
//     {
//       seeds: [
//         {
//           id: 3,
//           teams: [{ name: "Team A" }, { name: "Team C" }],
//         },
//       ],
//     },
//   ];


const createRounds = (data) => {
    // Initialize an empty array for the rounds
    const rounds = []

    // Create a map to keep track of the seeds by their ids
    const seedsMap = {}

    // Iterate over the data array
    data.forEach((item, index) => {
        console.log(index)
        const id = index + 1;
        const name = item[1];

        // If the name is not null, add the team to the corresponding seed
        if (name) {
            if (!seedsMap[id]) {
                seedsMap[id] = { id, teams: [] };
            }
            seedsMap[id].teams.push({ name });
        }
    });

    // Convert the seeds map to an array and add it to the rounds
    rounds.push({ seeds: Object.values(seedsMap) });

    return rounds;
}

const newRounds = createRounds(data);
console.log(JSON.stringify(newRounds, null, 2));


  return (
    <>
      {/* <div className="">
        <label
          htmlFor="playerListUpload"
          className="custom-file-upload bg-indigo-500"
        >
          <input
            id="playerListUpload"
            type="file"
            onChange={handleChange}
            className="hidden"
          />
          Tải file lên
        </label>

        <div>
          {data.map((item) => (
            <div key={item[0]} className='mb-3'>
              <Player item={item} />
            </div>
          ))}{" "}
        </div>
      </div> */}
      <Bracket rounds={newRounds} renderSeedComponent={CustomSeed} />
    </>
  );
};

export default BracketTest;
