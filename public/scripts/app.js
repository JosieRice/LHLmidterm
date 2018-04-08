// waits for DOM to be ready to load this file
$(document).ready(function() {

  // sets a variable to the game table as stored in the data tag on the body
  var gameIDElement = document.getElementById('game-board');
  var gameID = gameIDElement.dataset.gameid;

  // var userIDElement = document.getElementById('main-container');
  // var userID = gameIDElement.dataset.userid;

  // finds selected card value in the DOM and
  // reduces it to A, J, Q, K, or a number
  function findCardValue(cb) {
    // includes value and suit
    var cardText = $(this).text().trim();
    // includes just value as string
    var cardRank = cardText.substring(0, cardText.length - 1).trim();
    // Runs function to post value to server
    postPlayedCard(cardRank);
    eventHandlersOff();
  }

  // turns off event handlers
  function eventHandlersOff() {
    $( "#player-hand .card" ).off('click', findCardValue);
    $( "#player-hand .card" ).off('click', selectedCardDisappears);
  }

  // posts selected card to update game
  function postPlayedCard(cardRank) {
    $.ajax({
      url: `/game/${gameID}/update`,
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

  // moves cards to scored area - still needs to be changes to take two arguments
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
    // removeOneNeutralDeckCard();
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

  // remove one card from neutral deck - NOT WORKING
  function removeOneNeutralDeckCard() {
    // $('.stock').slice(1);
    // $( ".stock.child" ).slice( 0, 1 ).wrapInner( "<li></li>" );
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
    url: `/game/${gameID}/start`,
    method: "GET",
    success: (data) => { updateBoard(data); }
    });
  })();

  // Turns on all event handlers
  loadEventHanders();

  // // 5 second repeating request game data from server
  // setInterval(function() {
  //       $.ajax({
  //       url: `/game/${gameID}/waiting`,
  //       method: "GET",
  //       success: updateBoard()
  //     });
  // }, 5000);

});

    // $( "#player-hand" ).off( "click", "**" );

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



