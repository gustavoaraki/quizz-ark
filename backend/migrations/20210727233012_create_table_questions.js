
exports.up = function(knex) {
    return knex.schema.createTable('questions', table => {
        table.increments('id').primary()
        table.string('description').notNull()
        table.integer('examId').references('id')
            .inTable('exams').notNull()
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('questions')
};
