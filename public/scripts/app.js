// waits for DOM to be ready to load this file
$(document).ready(function() {

  // sets a variable to the game table as stored in the data tag on the body
  var gameIDElement = document.getElementById('game-board');
  var gameID = gameIDElement.dataset.gameid;
  // sets a variable to the user id as stored in teh data tag on the body
  var userID = gameIDElement.dataset.userid;
  // a way to identify if players have joined the game. I don't care for it.
  var opponentToggle = "not found";

  // finds selected card value in the DOM and
  // reduces it to A, J, Q, K, or a number
  function findCardValue() {
    // includes value and suit
    var cardText = $(this).text().trim();
    // includes just value as string
    var cardRank = cardText.substring(0, cardText.length - 1).trim();
    // Runs function to post value to server
    postPlayedCard(cardRank);
    eventHandlersOff();
  }

  // posts selected card to update game
  function postPlayedCard(cardRank) {
    console.log("I'm POSTING ", cardRank);
    $.ajax({
      url: `/game/${gameID}/update/${userID}`,
      method: "POST",
      data: {rank:cardRank},
      // moves card in UI after it's sent
      complete: layCard(cardRank)
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

  // runs the function to parse card data, which runs hand and board update functions
  function updateBoard(data){
    // clears player hand once so it can be repopulated from the database
    clearPlayerHand();
    // clears opponents hand so it can be repopulated from the database
    clearOpponentsHand();
    // clears neutral deck 'stock' so it can be repopulated from the database
    clearNeutralDeck();
    // clears played cards areas
    clearPlayedCards();
    // populates scores
    tallyScore(data);
    // clears scored cards
    clearScoredCards();

    // THIS NEEDS TO MOVE THE CARDS OVER TO THE RIGHT

    // loops over hand array from database to populate both hands
    for (var i = 0; i < data.hand.length; i++) {
      // if the array value is zero (played card), skip that array iteration
      if (data.hand[i] === 0) {
        continue;
      }
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

  // clear played cards
  function clearPlayedCards() {
    $( '.upcard' ).empty();
    $( '.player-downcard' ).empty();
    $( '.opponent-downcard' ).empty();
  }

  // clears scored cards
  function clearScoredCards() {
    $( '.upcard-scored' ).empty();
    $( '.player-downcard-scored' ).empty();
    $( '.opponent-downcard-scored' ).empty();
  }

  // clears players hand, to be used before refreshing players hand
  function clearPlayerHand() {
    $('#player-hand').empty();
  }

  // clears neutral deck
  function clearNeutralDeck() {
    $( '.stock' ).empty();
  }

  // clears opponents hand, to be used before refreshing players hand
  function clearOpponentsHand() {
    $('.opponent-hand').empty();
  }

  // adds scores to score board
  function tallyScore(data) {
    $( '.your-score' ).empty();
    $( '.opponents-score' ).empty();

    $( `<p>Brian:<br> ${(data.scores[1] / 10)}</p>` ).appendTo( ".opponents-score" );
    $( `<p>Craig:<br> ${(data.scores[0] / 10)}</p>` ).appendTo( '.your-score' );
  }

  // flips over random neutral card in center for players to bid on
  // hard coded to diamonds
  function flipNeutralCard (cardRank) {
    lastNeutralCard = cardRank;
    $('.upcard').empty();
      $( `  <div class="card rank-${cardRank} diams">
        <span class="rank">${cardRank}</span>
        <span class="suit">&diams;</span>
      </div>` ).appendTo( ".upcard" );
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

  // IIFE receives initial game state data and runs function to populate the game board
  (function startGameDataPull (){
    $.ajax({
    url: `/game/${gameID}/start/${userID}`,
    method: "GET",
    success: (data) => { updateBoard(data); }
    });
  })();

  // sets an interval ID so that we can stop the repeated database queries
  // for the player check.
  var nIntervId;

  // turns turn status check on timer
  function startOpponentCheckTimer() {
    nIntervId = setInterval(checkForOpponent, 5000);
  }

  // stops turn status check
  function stopOpponentCheckTimer() {
    clearInterval(nIntervId);
  }

  //check if opponent present, if present sets opponent toggle to found,
  //and skips route
  function checkForOpponent() {
    if (opponentToggle === "not found") {
      $.ajax({
        url: `/game/${gameID}/waiting/${userID}`,
        method: "GET",
        success: (data) => { opponentToggle = data; }
      });
    }
    stopOpponentCheckTimer();
  }

  // Clicking the neutral deck in the middle checks if opponent is done
  // and tries to refresh page
  function turnStatusCheck() {
    console.log('turnSTATUSCHECK');
    $.ajax({
      url: `/game/${gameID}/update/${userID}`,
      method: "GET",
      success: (data) => {
        if (data.neutral === 0) {
          console.log("ZERO DATA RECEIVED");
          return;
        } else {
          console.log("WE GOT THE DATA... EVEN IF ITS WRONG");
          updateBoard(data);
        }
      }
    });
  }

  // houses all event handlers in a nice neat package
  function loadEventHanders() {
    // handler for hand to POST card info to server
    $( "#player-hand .card" ).on('click', findCardValue);
    // handler to remove hand cards
    $( "#player-hand .card" ).on('click', selectedCardDisappears);
    $( ".stock" ).off().on('click', turnStatusCheck);
  }

  // turns off event handlers
  function eventHandlersOff() {
    $( "#player-hand .card" ).off('click', findCardValue);
    $( "#player-hand .card" ).off('click', selectedCardDisappears);
  }

  // starts interval checks while waiting for opponent
  startOpponentCheckTimer();
  // Turns on all event handlers
  loadEventHanders();
});
