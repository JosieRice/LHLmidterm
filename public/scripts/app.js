// waits for DOM to be ready to load this file
$(document).ready(function() {

  // sets a variable to the game table as stored in the data tag on the body
  var gameIDElement = document.getElementById('game-board');
  var gameID = gameIDElement.dataset.gameid;

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
    // lower case for class rank- to match css cards
    lowerCaseCardRank = cardRank.toLowerCase();
    $('.player-downcard').empty();
    $( `  <div class="card rank-${lowerCaseCardRank} spades">
            <span class="rank">${cardRank}</span>
            <span class="suit">&spades;</span>
          </div>` ).appendTo( ".player-downcard" );
  }

  // removes card from hand
  function selectedCardDisappears() {
    $(this).parent().empty();
  }

  // moves cards to scored area.
  function moveToScoredArea(owner, cardRank) {
    // code to populate a card in the scored area
    $('.player-downcard').empty();
    $( `  <div class="card rank-${lowerCaseCardRank} spades">
            <span class="rank">${cardRank}</span>
            <span class="suit">&spades;</span>
          </div>` ).appendTo( ".player-downcard" );

  }

  // houses all event handlers in a nice neat package
  function loadEventHanders() {
    // handler for hand to POST card info to server
    $( "#player-hand .card" ).on('click', findCardValue);
    // handler to remove hand cards
    $( "#player-hand .card" ).on('click', selectedCardDisappears);
  }

  // populates the initial game board
  (function startGameDataPull (){
    $.ajax({
    url: `/game/${gameID}/start`,
    method: "GET",
    success: (data) => { updateBoard(data); }
    });
  })();

  // // 5 second repeating request game data from server
  // setInterval(function() {
  //       $.ajax({
  //       url: `/game/${gameID}/waiting`,
  //       method: "GET",
  //       success: updateBoard()
  //     });
  // }, 5000);

  // runs the function to parse card data, which runs hand and board update functions
  function updateBoard(data){
    // runs function to parse random neutral card
    flipNeutralCard(parseCardValues(data.neutral));
    // console.log('PLAYER HAND ', data.hand)
    // runs function to parse cards remaining in player hand
    // parseCardValues(data.hand);
  }

  // converts card data and runs functions to update board.
  function parseCardValues(cardRank) {
    console.log('cardNumber ', cardRank);
    if (cardRank === 1) {
      cardRank = "A";
    }
    if (cardRank === 2 || 3 || 4 || 5 || 6 || 7 || 8 || 9) {
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
    console.log("cardRANK ", cardRank)
  }

  function flipNeutralCard (cardRank) {
    console.log('hi')
    if (cardRank === "A" || "J" || "Q" || "K") {
      var lowerCaseCardRank = cardRank.toLowerCase();
    }
    if (cardRank === 2 || 3 || 4 || 5 || 6 || 7 || 8 || 9 || 10) {
      var lowerCaseCardRank = cardRank;
    }


    $('.upcard').empty();
    $( `  <div class="card rank-${lowerCaseCardRank} spades">
      <span class="rank">${cardRank}</span>
      <span class="suit">&spades;</span>
    </div>` ).appendTo( ".upcard" );
  }

  function updateHands () {

  }

  // // flips neutral card to be bid on
  // function flipNeutralCardNumber (cardRank) {
  //   if (cardRank === 2 || 3 || 4 || 5 || 6 || 7 || 8 || 9) {
  //    $( `  <div class="card rank-${cardRank} spades">
  //       <span class="rank">${cardRank}</span>
  //       <span class="suit">&spades;</span>
  //     </div>` ).appendTo( ".upcard" );
  //   }
  // }


  // Turns on all event handlers
  loadEventHanders();

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



