$(() => {
  $.ajax({
    method: "GET",
    url: "/api/users"
  }).done((users) => {
    for(user of users) {
      $("<div>").text(user.name).appendTo($("body"));
      $("<div>").text(user.email).appendTo($("body"));
      $("<div>").text(user.user_score_goofspiel).appendTo($("body"));
    }
  });;
});
