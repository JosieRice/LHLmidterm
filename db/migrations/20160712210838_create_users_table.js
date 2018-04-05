
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('users', function(table){
      table.increments();
      table.string('name');
      table.string('email');
      table.integer('user_score_goofspiel');
    }),

    knex.schema.createTable('game_state', function(table){
      table.increments();
      table.string('Players');
      table.string('Player_hands');
      table.string('Player_scores');
      table.string('neutral_deck');
      table.string('status');
    })
  ])
};

exports.down = function(knex, Promise) {
   return knex.schema.dropTable('users');
   return knex.schema.dropTable('game_state');
};
