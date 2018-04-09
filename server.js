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

//converts string card value into intergers for comparition
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

//populates server database of current turn
function turnAction(game_id, user, card){

  if (turn[game_id].user_1 === user) {
    turn[game_id].user_1_card = card;
    turn[game_id].user_1_submit = "yes";
    knex.select('player_1_hand').where({id: game_id}).from('game_state')
    .then(function(results) {
      var hand = JSON.parse(results[0].player_1_hand);
      hand[card-1] = 0;
      knex.update({player_1_hand: JSON.stringify(hand)})
      .where({id: game_id})
      .from('game_state')
      .then();
    });

  } else {
    turn[game_id].user_2_card = card;
    turn[game_id].user_2_submit = "yes";
    knex.select('player_2_hand').where({id: game_id}).from('game_state')
    .then(function(results) {
      var hand = JSON.parse(results[0].player_2_hand);
      hand[card-1] = 0;
      knex.update({player_2_hand: JSON.stringify(hand)})
      .where({id: game_id})
      .from('game_state')
      .then();
    });
  }
}

// populates new game_state in the database
app.get("/join/goofspiel", (req, res) => {
  if (game_waiting_goofspiel === 0){
    var player_1 = 'Craig';
    knex('game_state').insert({
      id: goofspiel_gamecount,
      players:  JSON.stringify([player_1, "incoming two"]),
      player_1_hand: JSON.stringify([1,2,3,4,5,6,7,8,9,10,11,12,13]),
      player_2_hand: JSON.stringify([1,2,3,4,5,6,7,8,9,10,11,12,13]),
      player_scores: JSON.stringify([0, 0]),
      neutral_deck: JSON.stringify([1,2,3,4,5,6,7,8,9,10,11,12,13]),
      status: 'active'}).then();
    turn[goofspiel_gamecount] = {
        user_1 : player_1,
        user_1_card: 0,
        user_2 : '',
        user_2_card : 0,
        user_1_submit : "no",
        user_2_submit : "no",
        neutral_card : 0,
        user_1_turn_end : "no",
        user_2_turn_end : "no",
        end_game_toggle : "no",
        score_toggle: "no"
      };
    game_waiting_goofspiel = goofspiel_gamecount;
    // res.redirect("/game/"+game_waiting_goofspiel);
    res.redirect("/game/"+goofspiel_gamecount + "/" + player_1);
  } else {
    var player_2 = 'Brian';
    turn[goofspiel_gamecount].user_2 = player_2;
    knex.select('players').where({id: goofspiel_gamecount}).from('game_state')
    .then(function(results) {
      var player_1 = results[0].players;
      var array = JSON.parse(results[0].players);
      knex('game_state')
        .update({players: JSON.stringify([array[0], player_2])})
        .where({id: goofspiel_gamecount})
        .then(function(results){
           goofspiel_gamecount++;
         })
    });
    // res.redirect("/game/"+game_waiting_goofspiel);
    res.redirect("/game/"+game_waiting_goofspiel + "/" + player_2);
    game_waiting_goofspiel = 0;
  }
});

//sends game match id to client
app.get("/game/:id/:user", (req, res) => {
 let vars = {  gameid: goofspiel_gamecount,
               userid: req.params.user
               }
 res.render("game", vars);
});

//checks if both players have joined the game
app.get("/game/:id/waiting/:user", (req, res) => {
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

//sends initial game setup data
app.get("/game/:id/start/:user", (req, res) => {

  knex.select('neutral_deck').where({id: req.params.id}).from('game_state')
    .then(function(results) {
      var deck = JSON.parse(results[0].neutral_deck);
      if (turn[req.params.id].neutral_card === 0){
        var pick = Math.floor(Math.random() * deck.length);
        turn[req.params.id].neutral_card = deck[pick];
        deck.splice(pick,1);
      }
      knex.update({neutral_deck: JSON.stringify(deck)})
      .where({id: req.params.id})
      .from('game_state')
      .then(function(results){
        let data = {
        neutral : 0,
        hand: [],
        scores: []
        };
        knex('game_state')
        .select()
        .where({id: req.params.id})
        .then(function(results){
          var players = JSON.parse(results[0].players);
          if (players[0] = req.params.user){
            data.hand = (JSON.parse(results[0].player_1_hand));
          } else if (players[1] = req.params.user){
            data.hand = (JSON.parse(results[0].player_2_hand));
          }
          data.scores = (JSON.parse(results[0].player_scores));
          data.neutral = turn[req.params.id].neutral_card;
          if (req.params.user === turn[req.params.id].user_1){
                    turn[req.params.id].user_1_turn_end = "yes"
                  } else if (req.params.user === turn[req.params.id].user_2){
                    turn[req.params.id].user_2_turn_end = "yes"
                  }
                  if (turn[req.params.id].user_2_turn_end === "yes" && turn[req.params.id].user_1_turn_end === "yes"){
                    turn[req.params.id].user_1_card = 0;
                    turn[req.params.id].user_2_card = 0;
                    turn[req.params.id].user_1_submit = "no";
                    turn[req.params.id].user_2_submit = "no";
                    turn[req.params.id].user_1_turn_end = "no";
                    turn[req.params.id].user_2_turn_end = "no";
                    turn[req.params.id].neutral_card = 0;
                  }
          res.send(data);
        });
      });
    });
})

//handles turn rollover
app.get("/game/:id/update/:user", (req, res) => {

  let data_fields = {
    players: [],
    neutral_deck: [],
    player_scores: [],
    winner: 0,
    score: [],
    pick: 0

  }
  let data = {
    neutral : 0,
    hand: [],
    scores: [],
    end: false,
    players: []
  };
  var game_id = req.params.id;
  var user = req.params.user;
    knex.select().where({id: game_id}).from('game_state')
    .then(function(results){
      data_fields.players = JSON.parse(results[0].players);
      data_fields.neutral_deck = JSON.parse(results[0].neutral_deck);
      data_fields.player_scores = JSON.parse(results[0].player_scores);
      data_fields.player_1_hand = JSON.parse(results[0].player_1_hand);
      data_fields.player_2_hand = JSON.parse(results[0].player_2_hand);
      console.log(data_fields);

      if (turn[game_id].user_1_submit === "yes" && turn[game_id].user_2_submit === "yes" && turn[game_id].end_game_toggle === "no"){

      if(turn[game_id].user_2_card > turn[game_id].user_1_card){
        data_fields.winner = 2
      }
        else if(turn[game_id].user_1_card > turn[game_id].user_2_card){
          data_fields.winner = 1;
        }else if(turn[game_id].user_1_card === turn[game_id].user_2_card){
          data_fields.winner = 0;
      }
      console.log("winner: ", data_fields.winner);

      if (turn[game_id].score_toggle === "no"){
        if (data_fields.winner === 1){
          data_fields.player_scores[0] = data_fields.player_scores[0] + turn[game_id].neutral_card * 10;
        } else if (data_fields.winner === 2){
          data_fields.player_scores[1] = data_fields.player_scores[1] + turn[game_id].neutral_card * 10;
        } else {
          data_fields.player_scores[1] = data_fields.player_scores[1] + (turn[game_id].neutral_card * 10)/2;
          data_fields.player_scores[0] = data_fields.player_scores[0] + (turn[game_id].neutral_card * 10)/2;
        }
      }

            //If statement to prevent generating two random card, (one for each user)
      if (turn[req.params.id].neutral_card === 0){
        data_fields.pick = Math.floor(Math.random() * data_fields.neutral_deck.length);
        turn[req.params.id].neutral_card = data_fields.neutral_deck[data_fields.pick];
        data_fields.neutral_deck.splice(data_fields.pick,1);
        if (data_fields.deck.length === 0){
          turn[req.params.id].end_game_toggle = "yes";
        }
      }


          //builds new gamestate for client and sends
      if (data_fields.players[0] === user){
        data.hand = data_fields.player_1_hand;
      } else if (data_fields.players[1] === user){
        data.hand = data_fields.player_2_hand;
      }
        data.scores = data_fields.player_scores;
        data.players = data_fields.players;
        data.neutral = turn[req.params.id].neutral_card;

          //resets turn variables
      if (user === turn[req.params.id].user_1){
        turn[req.params.id].user_1_turn_end = "yes"
      } else if (user === turn[req.params.id].user_2){
        turn[req.params.id].user_2_turn_end = "yes"
      }
      if (turn[req.params.id].user_2_turn_end === "yes" && turn[req.params.id].user_1_turn_end === "yes"){
        turn[req.params.id].user_1_card = 0;
        turn[req.params.id].user_2_card = 0;
        turn[req.params.id].user_1_submit = "no";
        turn[req.params.id].user_2_submit = "no";
        turn[req.params.id].user_1_turn_end = "no";
        turn[req.params.id].user_2_turn_end = "no";
        turn[req.params.id].neutral_card = 0;
      }

      knex('game_state')
        .update({neutral_deck: JSON.stringify(data_fields.neutral_deck),
                   player_scores: JSON.stringify(data_fields.player_scores),
                   player_1_hand: JSON.stringify(data_fields.player_1_hand),
                   player_2_hand: JSON.stringify(data_fields.player_2_hand)})
          .where({id: game_id})
          .then()
          console.log("Data:", data)
        res.send(data);
      }


  //handles game end. same as turnroll over,
  //but with no new card drawn from neutral deck
  //also sends end turn flag to make the client handle data properly for end game
  // else if (turn[game_id].user_1_submit === "yes" && turn[game_id].user_2_submit === "yes" && turn[game_id].end_game_toggle === "yes"){
  //   //Matches users to database ordering, then calculate winner
  //   console.log("ishould not be here");
  //   knex.select('players').where({id: game_id}).from('game_state')
  //   .then(function(results) {
  //     if (turn[game_id].score_toggle === "no"){
  //       var winner;
  //       if(turn[game_id].user_2_card > turn[game_id].user_1_card){
  //         var winner = 2
  //       }
  //       else if(turn[game_id].user_1_card > turn[game_id].user_2_card){
  //         var winner = 1;
  //       }else if(turn[game_id].user_1_card === turn[game_id].user_2_card){
  //         var winner = 0;
  //       }
  //     }
  //     knex.select('player_scores')
  //       .where({id: game_id})
  //       .from('game_state')
  //       .then(function(results){
  //         console.log(results);
  //       var score = JSON.parse(results[0].player_scores);
  //       if (turn[game_id].score_toggle === "no"){
  //         if (winner === 1){
  //           score[0] = score[0] + turn[game_id].neutral_card * 10;
  //         } else if (winner === 2){
  //           score[1] = score[1] + turn[game_id].neutral_card * 10;
  //         } else {
  //           score[1] = score[1] + (turn[game_id].neutral_card * 10)/2;
  //           score[0] = score[0] + (turn[game_id].neutral_card * 10)/2;
  //         }
  //         turn[game_id].score_toggle = "yes";
  //       }
  //        //updates scores in database
  //        knex('game_state')
  //         .update({player_scores: JSON.stringify(score)})
  //         .where({id: game_id})
  //         .then(function(results) {
  //           //updates database neutral deck
  //           knex.update({neutral_deck: JSON.stringify(deck)})
  //             .where({id: req.params.id})
  //             .from('game_state')
  //             .then(function(results){
  //             let data = {
  //               neutral : 0,
  //               hand: [],
  //               scores: [],
  //               end: true
  //             };
  //               //builds new gamestate for client and sends
  //               knex('game_state')
  //               .select()
  //               .where({id: req.params.id})
  //               .then(function(results){
  //               var players = JSON.parse(results[0].players);
  //                 if (players[0] === user){
  //                   data.hand = (JSON.parse(results[0].player_1_hand));
  //                 } else if (players[1] === user){
  //                   data.hand = (JSON.parse(results[0].player_2_hand));
  //                 }
  //                 data.scores = (JSON.parse(results[0].player_scores));
  //                 data.neutral = turn[req.params.id].neutral_card;
  //                 //resets turn variables
  //                 if (user === turn[req.params.id].user_1){
  //                   turn[req.params.id].user_1_turn_end = "yes"
  //                 } else if (user === turn[req.params.id].user_2){
  //                   turn[req.params.id].user_2_turn_end = "yes"
  //                 }
  //                 if (turn[req.params.id].user_2_turn_end === "yes" && turn[req.params.id].user_1_turn_end === "yes"){
  //                   turn[req.params.id].user_1_card = 0;
  //                   turn[req.params.id].user_2_card = 0;
  //                   turn[req.params.id].user_1_submit = "no";
  //                   turn[req.params.id].user_2_submit = "no";
  //                   turn[req.params.id].user_1_turn_end = "no";
  //                   turn[req.params.id].user_2_turn_end = "no";
  //                   if (turn[game_id].score_toggle === "yes"){
  //                     turn[game_id].score_toggle = "no";
  //                   }
  //                 }
  //                 res.send(data);
  //               });
  //             });
  //         });
  //     });
  //   });
  // }

  //check if opponent has played card
  else if(turn[game_id].user_2 === user && turn[game_id].user_1_submit === "yes"){
    res.send(data);
  }
  else if(turn[game_id].user_1 === user && turn[game_id].user_2_submit === "yes"){
    res.send(data);
  }else {
    res.send(data);
  }
  });
});

// Client sends card to be played
app.post("/game/:id/update/:user", (req, res) => {
    turnAction(req.params.id, req.params.user, cardToNumber(req.body.rank));
});

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
