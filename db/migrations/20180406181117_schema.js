exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('game_state', function(table){
      table.increments();
      table.string('players');
      table.string('player_1_hand');
      table.string('player_2_hand');
      table.string('player_scores');
      table.string('neutral_deck');
      table.string('status');
    })
  ])
};

exports.down = function(knex, Promise) {
   return knex.schema.dropTable('users');
   return knex.schema.dropTable('game_state');
};
