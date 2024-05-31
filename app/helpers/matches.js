export function splitParticipants(players) {
  function createMatch(id, participants) {
    return {
      id: id,
      tournamentRoundText: '1',
      participants: participants.map((p) => ({
        id: p[0].replace('.', '').trim(),
        resultText: null,
        isWinner: false,
        status: null,
        name: `${p[1]} - ${p[2]}`
      }))
    };
  }

  function splitAndCreateMatches(players, matchId) {
    const matches = [];
    const numPlayers = players.length;

    if (numPlayers > 4) {
      const upperCount = Math.floor(numPlayers / 2);
      const lowerCount = numPlayers - upperCount;

      let upperPlayers = players.slice(0, upperCount);
      let lowerPlayers = players.slice(upperCount);

      if (upperPlayers.length % 2 !== 0) {
        matches.push(createMatch(matchId++, [upperPlayers[0]]));
        upperPlayers = upperPlayers.slice(1);
      }

      if (lowerPlayers.length % 2 !== 0) {
        matches.push(createMatch(matchId++, [lowerPlayers[lowerPlayers.length - 1]]));
        lowerPlayers = lowerPlayers.slice(0, -1);
      }

      const upperResult = splitAndCreateMatches(upperPlayers, matchId);
      matches.push(...upperResult.matches);
      matchId = upperResult.matchId;

      const lowerResult = splitAndCreateMatches(lowerPlayers, matchId);
      matches.push(...lowerResult.matches);
      matchId = lowerResult.matchId;
    } else {
      if (numPlayers % 2 !== 0) {
        // Odd number of players
        matches.push({
          id: matchId++,
          tournamentRoundText: '1',
          participants: [
            {
              id: players[numPlayers - 1][0].replace('.', '').trim(),
              resultText: null,
              isWinner: false,
              status: null,
              name: players[numPlayers - 1][1] + ' - ' + players[numPlayers - 1][2]
            }
          ]
        });
        players = players.slice(0, -1);
      }

      for (let i = 0; i < players.length; i += 2) {
        matches.push(createMatch(matchId++, players.slice(i, i + 2)));
      }
    }

    return { matches, matchId };
  }

  return splitAndCreateMatches(players, 1).matches;
}

export function sortMatchesAndUpdateIds(matches) {
  matches.sort((a, b) => {
    const idA = parseInt(a.participants[0].id);
    const idB = parseInt(b.participants[0].id);
    return idA - idB;
  });

  // Cập nhật lại id của từng trận đấu
  matches.forEach((match, index) => {
    match.id = index + 1;
  });

  return matches;
}

export function makeMatchesEven(inputMatches) {
  const matches = [...inputMatches];
  const totalMatches = matches.length;
  const middleIndex = Math.floor(totalMatches / 2);

  const upperBranch = matches.slice(0, middleIndex);
  const lowerBranch = matches.slice(middleIndex);

  if (upperBranch.length < lowerBranch.length) {
    const emptyMatch = {
      id: upperBranch.length + 1,
      tournamentRoundText: '1',
      state: 'WALK_OVER',
      participants: [
        { status: 'WALK_OVER', name: '' },
        { status: 'WALK_OVER', name: '' }
      ]
    };
    upperBranch.push(emptyMatch);
  }

  return updateIds([...upperBranch, ...lowerBranch]);
}

export function updateIds(data) {
  let idCounter = 1;

  data.forEach((obj) => {
    obj.id = idCounter++;
  });

  return data;
}

export function updateWalkOverStatus(matches) {
  matches.forEach((match) => {
    if (match.participants.length === 1) {
      match.state = 'WALK_OVER';
      match.participants[0].status = 'WALK_OVER';
      match.participants[0].resultText = 'WON';
    }
  });
  return matches;
}

export function generateNextMatchIds(matches) {
  let currentId = matches.length + 1;
  let rounds = [matches];
  let nextRound = [];
  let roundNumber = 1;

  // Gán tournamentRoundText cho các trận đấu ban đầu
  matches.forEach((match) => (match.tournamentRoundText = roundNumber.toString()));

  // Tạo nextMatchId cho các trận đấu ban đầu và các vòng tiếp theo
  while (rounds[roundNumber - 1].length > 1) {
    let currentRound = rounds[roundNumber - 1];
    nextRound = [];

    for (let i = 0; i < currentRound.length; i += 2) {
      let nextMatch = {
        id: currentId++,
        nextMatchId: null,
        participants: [],
        tournamentRoundText: (roundNumber + 1).toString()
      };
      currentRound[i].nextMatchId = nextMatch.id;
      if (i + 1 < currentRound.length) {
        currentRound[i + 1].nextMatchId = nextMatch.id;
      }
      nextRound.push(nextMatch);
    }

    rounds.push(nextRound);
    roundNumber++;
  }

  // Kết quả cuối cùng
  let updatedMatches = [].concat(...rounds);
  return updatedMatches;
}
