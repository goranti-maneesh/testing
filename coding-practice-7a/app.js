const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDBIntoResponse = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};
const convertMatchesDBIntoResponse = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};
const convertMatchesDetailsDBIntoResponse = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
        SELECT 
            *
        FROM 
            player_details;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayers) => convertDBIntoResponse(eachPlayers))
  );
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerIdQuery = `
        SELECT 
            *
        FROM 
            player_details
        WHERE 
            player_id = ${playerId};`;
  const player = await db.get(getPlayerIdQuery);
  response.send(convertDBIntoResponse(player));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayersQuery = `
  UPDATE
    player_details
  SET
    player_name = '${playerName}',
  WHERE
    player_id = ${playerId};
  `;

  await db.run(updatePlayersQuery);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchesQuery = `
        SELECT 
            *
        FROM 
            match_details
        WHERE 
            match_id = ${matchId};`;
  const matchesDetails = await db.get(getMatchesQuery);
  response.send({
    matchId: matchesDetails.match_id,
    match: matchesDetails.match,
    year: matchesDetails.year,
  });
});

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchesDetails = `
        SELECT 
            *
        FROM 
            (player_details INNER JOIN player_match_score
            ON player_details.player_id = player_match_score.player_id) AS T
            INNER JOIN match_details
            ON T.match_id = match_details.match_id;
        WHERE 
            player_id = ${playerId};`;
  const playerMatches = await db.all(getPlayerMatchesDetails);
  response.send(
    playerMatches.map((eachObject) => convertMatchesDBIntoResponse(eachObject))
  );
});

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getMatchesQuery = `
        SELECT 
            *
        FROM 
            (player_details INNER JOIN player_match_score
            ON player_details.player_id = player_match_score.player_id) AS T
            INNER JOIN match_details
            ON T.match_id = match_details.match_id;
        WHERE 
            match_id = ${matchId};`;
  const matches = await db.all(getMatchesQuery);
  response.send(
    matches.map((eachObject) => convertMatchesDetailsDBIntoResponse(eachObject))
  );
});

app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const getMatchPlayersQuery = `
    SELECT
      player_id AS playerId,
      player_name AS playerName,
      SUM(score) AS totalScore,
      SUM(fours) AS totalFours,
      SUM(sixes) AS totalSixes
    FROM player_match_score
      NATURAL JOIN player_details
    WHERE
      player_id = ${playerId};`;
  const playersMatchDetails = await db.get(getMatchPlayersQuery);
  response.send(playersMatchDetails);
});
