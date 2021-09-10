module.exports =  app => {

    const Answer = app.mongoose.Schema({
            description: { type: String },
            correct: { type: Boolean,  default: false}
    })

    return { Answer }
}