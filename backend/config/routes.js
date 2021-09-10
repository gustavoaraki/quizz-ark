module.exports = app => {
    app.post('/signup', app.api.user.save)
    app.post('/signin', app.api.auth.signin)
    app.post('/validateToken', app.api.auth.validateToken)

    app.route('/users')
        .all(app.config.passport.authenticate())
        .post(app.api.user.save)
        .get(app.api.user.get)
    
    app.route('/users/:id')
        .all(app.config.passport.authenticate())
        .put(app.api.user.save)
        .get(app.api.user.getById)
    
    app.route('/exams')
        .all(app.config.passport.authenticate())
        .get(app.api.exam.get)
        .post(app.api.exam.save)
    
    app.route('/exams/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.exam.getById)
        .put(app.api.exam.update)
        .delete(app.api.exam.remove)

    app.route('/questions')
        .all(app.config.passport.authenticate())
        .get(app.api.question.get)
        .post(app.api.question.save)
    
    app.route('/questions/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.question.getById)
        .put(app.api.question.update)
        .delete(app.api.question.remove)

    app.route('/activities')
        .all(app.config.passport.authenticate())
        .get(app.api.userActivity.get)

    app.route('/activities/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.userActivity.getById)
        .delete(app.api.userActivity.remove)
    
    app.route('/activities/:idExam/nextQuestion')
        .all(app.config.passport.authenticate())
        .get(app.api.userActivity.nextQuestion)

    app.route('/activities/setAnswer')
        .all(app.config.passport.authenticate())
        .post(app.api.userActivity.setAnswer)

}