// waits for DOM to be ready to load this file
$(document).ready(function() {

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

  // finds selected card value in the DOM
  function findCardValue() {
    // includes value and suit
    var cardText = $(this).text().trim();
    // includes just value as string
    var cardRank = cardText.substring(0, cardText.length - 1);
    // Runs function to post value to server
    postPlayedCard(cardRank);
  }

// sets a variable to the game table as stored in the data tag on the body
var gameIDElement = document.getElementById('game-board');
var gameID = gameIDElement.dataset.gameid;
console.log(gameID);

  // posts selected card to update game
  function postPlayedCard(cardRank) {
    // TESTING to check that correct string is passed
    // console.log(cardRank);
    $.ajax({
      url: `/game/${gameID}/update`,
      method: "POST",
      data: cardRank,
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


// 5 second repeating request game data from server
setInterval(function() {
      $.ajax({
      url: `/game/${gameID}/waiting`,
      method: "GET",
      success: updateBoard()
    });
}, 5000);

// to be completed
function updateBoard(){
  // processing the game state data into cards, locations, and scores
}



  // Turns on all event handlers
  loadEventHanders();

});


