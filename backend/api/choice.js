module.exports =  app => {

    const Choice = app.mongoose.Schema({
            description: { type: String },
            correct: { type: Boolean,  default: false},
            question: { type: String }
    })

    return { Choice }
}