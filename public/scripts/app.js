// waits for DOM to be ready to load this file
$(document).ready(function() {

  // sets a variable to the game table as stored in the data tag on the body
  var gameIDElement = document.getElementById('game-board');
  var gameID = gameIDElement.dataset.gameid;
  var userID = gameIDElement.dataset.userid;
  var opponentToggle = "not found";
  var turnToggle = "waiting on both";
  // var userIDElement = document.getElementById('main-container');
  // var userID = gameIDElement.dataset.userid;

  // finds selected card value in the DOM
  function findCardValue() {
    // includes value and suit
    var cardText = $(this).text().trim();
    // includes just value as string
    var cardRank = cardText.substring(0, cardText.length - 1).trim();
    // Runs function to post value to server
    postPlayedCard(cardRank);
  }

  // posts selected card to update game
  function postPlayedCard(cardRank) {
    // TESTING to check that correct string is passed
    $.ajax({
      url: `/game/${gameID}/update/${userID}`,
      method: "POST",
      data: {rank:cardRank},
      // moves card in UI after it's sent
      complete: layCard(cardRank)
      // success goes here
    });
  }

  // puts card choice on play area
  function layCard(cardRank) {
    $('.player-downcard').empty();
    $( `  <div class="card rank-${cardRank} spades">
            <span class="rank">${cardRank}</span>
            <span class="suit">&spades;</span>
          </div>` ).appendTo( ".player-downcard" );
  }

  // removes card from hand that was selected
  function selectedCardDisappears() {
    $(this).parent().empty();
  }

  // moves cards to scored area.
  function moveToScoredArea(owner, cardRank) {
    // code to populate a card in the scored area
    $('.player-downcard').empty();
    $( `  <div class="card rank-${cardRank} spades">
            <span class="rank">${cardRank}</span>
            <span class="suit">&spades;</span>
          </div>` ).appendTo( ".player-downcard" );
  }

  // runs the function to parse card data, which runs hand and board update functions
  function updateBoard(data){
    // clears player hand once
    clearPlayerHand();
    // loops over hand array from database to populate both hands
    for (var i = 0; i < data.hand.length; i++) {
      // updates players hand with correct cards
      updatePlayerHand(parseCardValues(data.hand[i]));
      // updates opponents hand with correct AMOUNT of cards
      updateOpponentHand();
      // updates neutral deck size
      updateNeutralDeck();
    }
    // flips over a neutral card
    flipNeutralCard(parseCardValues(data.neutral));
    // reloads event handers on fresh player hand
    loadEventHanders();
  }

  // returns cardRank parsed into capital letters for face cards and Ace.
  function parseCardValues(cardRank) {
    if (cardRank === 1) {
      cardRank = "A";
    }
    if (cardRank === 2 || 3 || 4 || 5 || 6 || 7 || 8 || 9 || 10) {
      cardRank = cardRank;
    }
    if (cardRank === 11) {
      cardRank = "J";
    }
    if (cardRank === 12) {
      cardRank = "Q";
    }
    if (cardRank === 13) {
      cardRank = "K";
    }
    return cardRank;
  }

  // flips over random neutral card in center for players to bid on
  function flipNeutralCard (cardRank) {
    $('.upcard').empty();
      $( `  <div class="card rank-${cardRank} spades">
        <span class="rank">${cardRank}</span>
        <span class="suit">&spades;</span>
      </div>` ).appendTo( ".upcard" );
  }

  // clears players hand, to be used before refreshing players hand
  function clearPlayerHand() {
    $('#player-hand').empty();
  }

  // updates players hand from database with cards left
  function updatePlayerHand(cardRank) {
    $( `  <li><div class="card rank-${cardRank} spades">
      <span class="rank">${cardRank}</span>
      <span class="suit">&spades;</span>
    </div></li>` ).appendTo( "#player-hand" );
  }

  // updates neutral deck size
  function updateNeutralDeck() {
    $( `<li><div class="card back">*</div></li>` ).appendTo( ".stock" );
  }

  // updates opponents hand with correct amount of cards
  function updateOpponentHand() {
      $(`<li><div class="card back">*</div></li>`).appendTo( ".opponent-hand" );
  }

  // houses all event handlers in a nice neat package
  function loadEventHanders() {
    // handler for hand to POST card info to server
    $( "#player-hand .card" ).on('click', findCardValue);
    // handler to remove hand cards
    $( "#player-hand .card" ).on('click', selectedCardDisappears);
  }

  // IIFE receives initial game state data and runs function to populate the game board
  (function startGameDataPull (){
    $.ajax({
    url: `/game/${gameID}/start/${userID}`,
    method: "GET",
    success: (data) => { updateBoard(data); }
    });
  })();

  // Turns on all event handlers
  loadEventHanders();

  // 5 second repeating request game data from server
  setInterval(function() {
    //check if opponent present, if present sets opponent toggle to found,
    //and skips route
      if (opponentToggle === "not found"){
        $.ajax({
        url: `/game/${gameID}/waiting/${userID}`,
        method: "GET",
        success: (data) => { opponentToggle = data; console.log(data); }
        });
      }
      //checks if opponent has played card and user has not
      //  if only opponent has played, turn toggle will set to "waiting"
      //  if both players have played their card, database will return object
      //  instead of waiting string.
      //  route checks input and does proper actions based on input type
      else if (turnToggle === "waiting on both" || turnToggle === "waiting on you"){
        $.ajax({
        url: `/game/${gameID}/update/${userID}`,
        method: "GET",
        success: (data) => { console.log("first:", data);
          if (data === "waiting on you"){
            console.log("second:");
            //set waiting visual queue
          } else if (data === "waiting on both"){
            console.log("third:");
          } else if (data !== "waiting on you" || data !== "waiting on both"){
            // updateBoard(data);
            console.log("fourth:");
            turnToggle = "waiting on both";
          }
        }
        });
      }
  }, 5000);

});



  // provided code - puts user names on leader-board. modify to to actual leaderboard
  // $(() => {
  //   $.ajax({
  //     method: "GET",
  //     url: "/api/users"
  //   }).done((users) => {
  //     for(user of users) {
  //       $("<div>").text(user.name).appendTo($("#leader-board"));
  //       $("<div>").text(user.email).appendTo($("#leader-board"));
  //       $("<div>").text(user.user_score_goofspiel).appendTo($("#leader-board"));
  //     }
  //   });;
  // });
  // Pulls game state from the server



