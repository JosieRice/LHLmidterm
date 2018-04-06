
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('game_state', function(table){
    })
  ])
};

exports.down = function(knex, Promise) {

   return knex.schema.dropTable('game_state');
};
