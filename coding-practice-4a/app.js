const express = require("express");

const path = require("path");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const app = express();

app.use(express.json());

const filePath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: filePath,

      driver: sqlite3.Database,
    });

    app.listen(3001, () => {
      console.log("Server is running at https://localhost:3000/");
    });
  } catch (e) {
    console.log(`Db error: ${e.message}`);

    process.exit(1);
  }
};

initializeDbAndServer();

// get

app.get("/players/", async (request, response) => {
  const getPlayers = `

    select

        *

    from

        cricket_team

    order by

        player_id;`;

  const playersQuery = await db.all(getPlayers);

  response.send(playersQuery);
});

//post

app.post("/players/", async (request, response) => {
  const playersDetails = request.body;

  const { playerName, jerseyNumber, role } = playersDetails;

  const addPlayers = `

    INSERT INTO

        cricket_team(

            player_name,

            jersey_number,

            role

        )

    VALUES

    (

        '${PlayerName}',

        ${jerseyNumber},

        '${role}'

    );`;

  const dbResponse = await db.run(addPlayers);

  const playerId = dbResponse.lastID;

  response.send("Player Added to Team");
});

//get

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const getPlayerId = `

    select

        *

    from

        cricket_team

    where

        player_id = ${playerId};`;

  const playersId = await db.get(getPlayerId);

  response.send(playersId);
});

// put

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const playersDetails = request.body;

  const { playerName, jerseyNumber, role } = playersDetails;

  const updatePlayersQuery = `

    update

        cricket_team

    set

        player_name = ${playerName},

        jersey_number = ${jerseyNumber},

        role = ${role}

    where

        player_id = ${playerId};`;

  const updateQuery = await db.run(updatePlayersQuery);

  response.send("Player Details Updated");
});

// Delete

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const deletePlayersQuery = `

    DELETE FROM

        cricket_team

    where 

        player_id = ${playerId};`;

  const deletedPlayer = await db.run(deletePlayersQuery);

  response.send("Player Removed");
});

module.exports = express;

module.exports = app;
