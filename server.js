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
const goofspiel_gamecount = 1 + knex('game_state').count('id');
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

// Home Page
app.get("/join/goofspiel", (req, res) => {
  if (game_waiting_goofspiel = 0){
    knex('game_state').insert({id: goofspiel_gamecount, Players: [req.body.user], Players_hands: [1,2][1,2,3,4,5,6,7,8,9,10,11,12,13], Players_scores: [0, 0], neutral_deck: [1,2,3,4,5,6,7,8,9,10,11,12,13], status: 'active'})
    game_waiting_goofspiel = goofspiel_gamecount;
    res.redirect("http://localhost:8080/game/"+goofspiel_gamecount);
  } else {
    let players = knex('game_state').select('Players').from('game_state').where(id=goofspiel_gamecount);
    knex('game_state').update({Players: [Players[0], req.body.user]})
    res.redirect("http://localhost:8080/game/"+game_waiting_goofspiel);
    game_waiting_goofspiel = 0;
  }

});

app.get("/game/:id", (req, res) => {

  res.render("/game");
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



app.post("/urls/:id/Delete", (req, res) => {
  if (urlDatabase[req.params.id].user === req.session.user_id){
    delete urlDatabase[req.params.id];
    res.redirect("http://localhost:8080/urls");
  }
  else{
    res.status(403).send('Forbidden');
  }
});


app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
