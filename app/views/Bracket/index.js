import React, { useRef, useState, useEffect } from "react";
import Match from "./Match";
import readXlsxFile from "read-excel-file";
import Player from "./Player";

const Bracket = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [headers, setHeaders] = useState({});

  const [playerList, setPlayerList] = useState([]);

  const data = [
    ["1.", "Nguyễn Văn A1'", "Quận 1"],
    ["2.", "Nguyễn Văn A2'", "Quận 1"],
    ["3.", "Nguyễn Văn A3'", "Quận 1"],
    ["4.", null, null],
    ["5.", null, null],
    ["6.", null, null],
    ["7.", null, null],
    ["8.", null, null],
    ["9.", null, null],
    ["10.", null, null],
    ["11.", null, null],
    ["12.", null, null],
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

  return (
    <>
      <div className="">
        {/* <Match /> */}
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
            <div key={item[0]}>
              <Player item={item} />
            </div>
          ))}{" "}
        </div>
      </div>
    </>
  );
};

export default Bracket;
