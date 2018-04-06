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

