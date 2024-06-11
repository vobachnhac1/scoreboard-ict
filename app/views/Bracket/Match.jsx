import React from "react";
import Player from "./Player";

const Match = () => {
  const matches = [1, 2, 3, 4, 5];
  return (
    <>
      {matches.map((item) => {
        return <div>
          <Player />
          <Player />
        </div>;
      })}{" "}
    </>
  );
};

export default Match;
