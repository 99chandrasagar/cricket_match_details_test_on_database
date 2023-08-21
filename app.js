const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;

const initalizeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Error at Database ${e.message}`);
    process.exit(1);
  }
};

initalizeDBAndServer();

//conversion1
const conversion1 = (dbobj1) => {
  return {
    playerId: dbobj1.player_id,
    playerName: dbobj1.player_name,
  };
};

//Returns a list of all the players in the player table
app.get("/players/", async (request, response) => {
  const query = `
    select * from player_details;`;
  const list = await db.all(query);
  response.send(list.map((eachplayer) => conversion1(eachplayer)));
});

//Returns a specific player based on the player ID
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const query2 = `
    select * from player_details
    where player_id = ${playerId}`;
  const list2 = await db.get(query2);
  response.send(conversion1(list2));
});

//Updates the details of a specific player based on the player ID
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const query3 = `
    update player_details
    set
    player_name = '${playerName}'
    where player_id = ${playerId};`;
  await db.run(query3);
  response.send("Player Details Updated");
});

//conversion2
const conversion2 = (dbobj2) => {
  return {
    matchId: dbobj2.match_id,
    match: dbobj2.match,
    year: dbobj2.year,
  };
};

//Returns the match details of a specific match
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const query4 = `
    select * from match_details
    where match_id = ${matchId}`;
  const list4 = await db.get(query4);
  response.send(conversion2(list4));
});

//Returns a list of all the matches of a player
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const query5 = `
    select * from player_match_score natural join match_details
    where player_id = ${playerId};`;
  const list5 = await db.all(query5);
  response.send(list5.map((eachlist) => conversion2(eachlist)));
});

//Returns a list of players of a specific match
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const query6 = `
    select * from player_match_score natural join player_details
    where match_id = ${matchId};`;
  const list6 = await db.all(query6);
  response.send(list6.map((eachone) => conversion1(eachone)));
});

//conversionlast
const conversionlast = (dblast) => {
  return {
    playerId: dblast.player_id,
    playerName: dblast.player_name,
    totalScore: dblast.score,
    totalFours: dblast.fours,
    totalSixes: dblast.sixes,
  };
};

//Returns the statistics of the total score, fours, sixes of a specific player based on the player ID
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  //const { score, fours, sixes } = request.body;
  const query7 = `
    select player_id, player_name, sum(score) as score, sum(fours) as fours, sum(sixes) as sixes from player_details natural join player_match_score
    where player_id = ${playerId}`;
  const list7 = await db.get(query7);
  response.send(conversionlast(list7));
});

module.exports = app;
