
exports.up = function(knex) {
    return knex.schema.createTable('activities', table => {
        table.increments('id').primary()
        table.integer('examId').references('id')
            .inTable('exams').notNull()
        table.integer('userId').references('id')
            .inTable('users').notNull()
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('activities')
};
