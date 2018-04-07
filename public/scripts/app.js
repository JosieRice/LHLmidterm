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

  // posts selected card to update game
  function postPlayedCard(cardRank) {
    // TESTING to check that correct string is passed
    // console.log(cardRank);
    $.ajax({
      url: "/game/:id/update",
      method: "POST",
      data: cardRank,
      // moves card in UI after it's sent
      complete: function () {
                            layCard(cardRank);
                            // selectCardDisappear(cardRank);
                        }
    });
  }


  function layCard(cardRank) {
    console.log(cardRank);
    $('.player-downcard').empty();
    $( `  <div class="card rank-${cardRank} spades player-downcard">
            <span class="rank">
              ${cardRank}
            </span>
            <span class="suit">
              &spades;
            </span>
          </div>` ).appendTo( ".player-downcard" );
  }

  function selectCardDisappear(){
    $(this).parent().empty();
  }

  // houses all event handlers in a nice neat package
  function loadEventHanders() {
    // handler for entire players hand
    $( "#player-hand .card" ).on('click', findCardValue);
  }

  // Turns on all event handlers
  loadEventHanders();

});
