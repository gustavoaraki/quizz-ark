
exports.up = function(knex) {
    return knex.schema.createTable('answers', table => {
        table.increments('id').primary()
        table.string('description').notNull()
        table.boolean('correct').notNull().defaultTo(false)
        table.integer('questionId').references('id')
            .inTable('questions').notNull()
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('answers')
};
