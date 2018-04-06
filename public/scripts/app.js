// waits for DOM to be ready to load this file
$(document).ready(function() {

  // provided code - puts user names on leader-board. modify to to actual leaderboard
  $(() => {
    $.ajax({
      method: "GET",
      url: "/api/users"
    }).done((users) => {
      for(user of users) {
        $("<div>").text(user.name).appendTo($("#leader-board"));
        $("<div>").text(user.email).appendTo($("#leader-board"));
        $("<div>").text(user.user_score_goofspiel).appendTo($("#leader-board"));
      }
    });;
  });


  function selectCard() {
    console.log('hi');
  }


  // houses all event handlers in a nice neat package
  function loadEventHanders() {
    // handler for selecting a card to play
    $( "#player-hand" ).on('click', selectCard);
  }

  // Turns on all event handlers
  loadEventHanders();


  //  EXAMPLE EVENT HANDLERS AND SUBMIT BUTTONS

  /*

      // posts tweets
      function postTweet () {
          // tweet text packaged and ready to send
          let serializedTweet = $('#content').serialize();
          // Post to tweet json file
          $.ajax({
                url: "/tweets/",
                method: "POST",
                data: serializedTweet,
                // resets tweets and reloads with fresh data
                complete: function () {
                              resetInput();
                              loadTweets();
                          }
          });
      }
  */


}
