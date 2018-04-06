"use strict";

require('dotenv').config();

const PORT        = process.env.PORT || 8080;
const ENV         = process.env.ENV || "development";
const express     = require("express");
const bodyParser  = require("body-parser");
const sass        = require("node-sass-middleware");
const app         = express();

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');

// Seperated Routes for each Resource
const usersRoutes = require("./routes/users");

var game_waiting_goofspiel = 0; //= gameid
var history;
var goofspiel_gamecount;
knex('game_state').count('id').then(function(result){
    history = Number(result[0].count);
    goofspiel_gamecount = 1 + history;
});
//Sample gamedatabase, destroyed on turn end.

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

// Mount all resource routes
app.use("/api/users", usersRoutes(knex));


app.get("/", (req, res) => {
  res.render("index");
});

// Create New Game ** temp route by Craig for making UI**
app.get("/game", (req, res) => {
  res.render("game");
})
var player_1 = 'Craig';

// Home Page
app.get("/join/goofspiel", (req, res) => {
  if (game_waiting_goofspiel === 0){
    knex('game_state').insert({
      id: goofspiel_gamecount,
      players:  JSON.stringify([player_1, "incoming two"]),
      player_1_hand: JSON.stringify([1,2,3,4,5,6,7,8,9,10,11,12,13]),
      player_2_hand: JSON.stringify([1,2,3,4,5,6,7,8,9,10,11,12,13]),
      player_scores: JSON.stringify([0, 0]),
      neutral_deck: JSON.stringify([1,2,3,4,5,6,7,8,9,10,11,12,13]),
      status: 'active'}).then();

    game_waiting_goofspiel = goofspiel_gamecount;
    res.redirect("http://localhost:8080/game/"+goofspiel_gamecount);
  } else {
    knex.select('players').where({id: goofspiel_gamecount}).from('game_state')
    .then(function(results) {
      var player_1 = results[0].players;
      var player_2 = 'Brian';
      var array = JSON.parse(results[0].players);
      knex('game_state')
        .update({players: JSON.stringify([array[0], player_2])})
        .where({id: goofspiel_gamecount})
        .then(function(results){
          goofspiel_gamecount++;
        }).catch(function(err){
          console.log(err)});
    });

    res.redirect("http://localhost:8080/game/"+game_waiting_goofspiel);
    game_waiting_goofspiel = 0;

  }
});

app.get("/game/:id", (req, res) => {

  res.render("game");
});

// app.post("/game/:id/update", (req, res) => {
//     gameMath[req.params.id] = {
//     player: req.body.playerNumber = {
//       req.body.cardPlayed;
//     }
//   }
// });

app.put("/game/:id/update", (req, res) => {
    //IF HAS SUBMITTED
   if (gameMath[req.params.id].player = req.body.playerNumber){
    //TRY TO END TURN

    //IF HAS NOT SUBMITTED
   }else{
    //CHECK IF OTHER USER SUBMITTED YET

   }
});



app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
