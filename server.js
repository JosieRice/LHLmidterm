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
const cookieSession = require('cookie-session');

// Seperated Routes for each Resource
const usersRoutes = require("./routes/users");

var game_waiting_goofspiel = 0; //= gameid
var history;
var goofspiel_gamecount;
var turn = {};

app.use(cookieSession({
  name: 'session',
  keys: ['Lighthouse'],
}));

knex('game_state').count('id').then(function(result){
    history = Number(result[0].count);
    goofspiel_gamecount = 1 + history;
});
//Sample gamedatabase, destroyed on turn end.

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes,
//         yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
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


function cardToNumber(card){
  let result = 0;
  if (card === 'A'){
    result = 1;
  } else
    if (card === 'J'){
    result = 11;
  } else
    if (card === 'Q'){
    result = 12;
  } else
    if (card === 'K'){
    result = 13;
  }else {
    result = Number(card);
  }
  return result;
}

function turnAction(game_id, user, card){
  console.log(card);
  if (Object.keys(turn).length === 0 && turn.constructor === Object) {
    turn[game_id] = {
        user_1 : user,
        user_1_card: card,
        user_2 : '',
        user_2_card : 0
    }
  } else {
    turn[game_id].user_2 = user;
    turn[game_id].user_2_card = card;

    }
  console.log("turn ", turn);
}

// turn = {
//    game_id = {
//      user_1 : 342,
//      user_2 : 234,
//      user_1_card: 2,
//      user_2_card: 3,
//      neutral_card: 3};
//    }
// }

function clientPackageBuilder(id, user, neutralCard){
  let data = {
    neutral : 0,
    hand: [],
    scores: []
  };
  console.log(id);
  knex('game_state')
  .select()
  .where({id: id})
  .then(function(results){
    var players = JSON.parse(results[0].players);
    if (players[0] = user){
      data.hand.push(JSON.parse(results[0].player_1_hand));
    } else if (players[1] = user){
      data.hand.push(JSON.parse(results[0].player_2_hand));
    }
    data.scores.push(JSON.parse(results[0].player_scores));
    data.neutral = neutralCard;
  });
  return data;
}

function pullScore(game_id){
  knex.select('player_scores').where({id: game_id}).from('game_state').then(function(results){
    return results;
  });
}

function setScore(game_id, scores){
  knex('game_state')
  .update({player_scores: scores})
  .where({id: game_id})
  .then()
}

function pullFromDeck(game_id){
knex.select('neutral_deck').where({id: game_id}).from('game_state')
    .then(function(results) {
      var deck = JSON.parse(results[0].neutral_deck);
      var pick = Math.floor(Math.random() * deck.length);
      var draw = deck[pick];
      deck.splice(pick,1);
      knex.update({neutral_deck: JSON.stringify(deck)}).where({id: game_id}).from('game_state').then(
        function(result){
          return draw;
        })
    });
}



// turn[game_id] =
//   user_1 : 342,
//   user_2 : 234,
//   user_1_card: 2,
//   user_2_card: 3,
//   neutral_card: 3};
//   user_1_checkin : boolean;
//   user_2_checkin : boolean;

// Home Page
app.get("/join/goofspiel", (req, res) => {
  if (game_waiting_goofspiel === 0){
    req.session.user = 'Craig';
    var player_1 = req.session.user;
    knex('game_state').insert({
      id: goofspiel_gamecount,
      players:  JSON.stringify([player_1, "incoming two"]),
      player_1_hand: JSON.stringify([1,2,3,4,5,6,7,8,9,10,11,12,13]),
      player_2_hand: JSON.stringify([1,2,3,4,5,6,7,8,9,10,11,12,13]),
      player_scores: JSON.stringify([0, 0]),
      neutral_deck: JSON.stringify([1,2,3,4,5,6,7,8,9,10,11,12,13]),
      status: 'active'}).then();
    turn[goofspiel_gamecount] = {};
    game_waiting_goofspiel = goofspiel_gamecount;
    res.redirect("http://localhost:8080/game/"+goofspiel_gamecount);
  } else {
    req.session.user = 'Brian';
    knex.select('players').where({id: goofspiel_gamecount}).from('game_state')
    .then(function(results) {

      var player_1 = results[0].players;
      var player_2 = req.session.user;
      var array = JSON.parse(results[0].players);

      knex('game_state')
        .update({players: JSON.stringify([array[0], player_2])})
        .where({id: goofspiel_gamecount})
        .then(function(results){

           goofspiel_gamecount++;
         })
    });
    res.redirect("/game/"+game_waiting_goofspiel);
    game_waiting_goofspiel = 0;

  }
});

app.get("/game/:id", (req, res) => {

  res.render("game", {goofspiel_gamecount});
});



app.post("/game/:id/update", (req, res) => {

    console.log(req.body.rank);
    console.log(Object.keys(req.body)[0]);
    turnAction(req.params.id, req.session.user, cardToNumber(req.body.rank));
});




app.get("/game/:id/waiting", (req, res) => {
  knex('game_state')
    .select('players')
    .where({id: req.params.id})
    .then(function(results){
      var users = JSON.parse(results[0].players);
      if (users[1] != 'incoming two'){
        res.send('found');
      } else {
        res.send('not found');
      }
    });
});

app.get("/game/:id/start", (req, res) => {
  var toSend = clientPackageBuilder(req.params.id, req.session.user, pullFromDeck(req.params.id))
  console.log(toSend);
  res.send(toSend);
})

app.get("/game/:id/update", (req, res) => {
  //Turn ready to end
  var game_id = req.params.id
//Turn ready to end, do game logic
  if (turn[game_id].user_2_card && turn[game_id].user_1_card){
    knex.select('players').where({id: game_id}).from('game_state')
    .then(function(results) {
      var orderedPlayers = JSON.parse(results[0].players);
      if (orderedPlayers[0] === turn[game_id].user_2){
        var temp_card = turn[game_id].user_1_card;
        var temp_user = turn[game_id].user_1;
        turn[game_id].user_1_card = turn[game_id].user_2_card;
        turn[game_id].user_1 = turn[game_id].user_2;
        turn[game_id].user_2_card = temp_card;
        turn[game_id].user_2 = temp_user;
      }
    });
    var winner;
    if(turn[game_id].user_2_card > turn[game_id].user_1_card){
      var winner = 2
    }
    else if(turn[game_id].user_1_card > turn[game_id].user_2_card){
      var winner = 1;
    }else if(turn[game_id].user_1_card === turn[game_id].user_2_card)
      var winner = 0;
    }

    var score = JSON.parse(pullScore(game_id));
    if (winner === 1){
      score[0] = score[0] + turn[game_id].neutral_card * 10;
    } else if (winner === 2){
      score[1] = score[1] + turn[game_id].neutral_card * 10;
    } else {
      score[1] = score[1] + (turn[game_id].neutral_card * 10)/2;
      score[0] = score[0] + (turn[game_id].neutral_card * 10)/2;
    }
    setScore(game_id, JSON.stringify(score));

    res.send(clientPackageBuilder(game_id, req.session.user, pullFromDeck()));

  //check if opponent has played card
  if(turn[game_id].user_2 === req.session.user && turn[game_id].user_1_card){
    res.send('waiting');
  }
  else if(turn[game_id].user_1 === req.session.user && turn[game_id].user_2_card){
    res.send('waiting');
  }
});
   // turn[game_id] =
//   user_1 : 342,
//   user_2 : 234,
//   user_1_card: 2,
//   user_2_card: 3,
//   neutral_card: 3};
//   user_1_checkin : boolean;
//   user_2_checkin : boolean;
app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
