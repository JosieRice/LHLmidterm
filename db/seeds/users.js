exports.seed = function(knex, Promise) {
  return knex('users').del()
    .then(function () {
      return Promise.all([
        knex('users').insert({id: 1, name: 'Craig', email: 'Craig@Craig.Craig', user_score_goofspiel: 0}),
        knex('users').insert({id: 2, name: 'Brian', email: 'Brian@Brian.Brian', user_score_goofspiel: 0}),
        knex('users').insert({id: 3, name: 'Andrew', email: 'Andrew@Andrew.Andrew', user_score_goofspiel: 0})
      ]);
    });
};
