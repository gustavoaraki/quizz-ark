
exports.up = function(knex) {
    return knex.schema.createTable('exams', table => {
        table.increments('id').primary()
        table.string('title').notNull()
        table.string('type').notNull()
        table.string('description').notNull()
        table.integer('userId').references('id')
            .inTable('users').notNull()
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('exams')

};
