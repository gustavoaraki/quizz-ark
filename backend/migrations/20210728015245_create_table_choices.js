
exports.up = function(knex) {
    return knex.schema.createTable('choices', table => {
        table.increments('id').primary()
        table.integer('activityId').references('id')
            .inTable('activities').notNull()
        table.integer('questionId').references('id')
            .inTable('questions').notNull()
        table.integer('answerId').references('id')
            .inTable('answers').notNull()    
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('choices')
};
