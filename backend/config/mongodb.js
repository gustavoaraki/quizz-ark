const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://localhost/quizz-db', { useNewUrlParser: true })
    .catch(e => {
        const msg = 'ERRO! Não foi possível conectar ao MongoDB.'
        console.error('\x1b[41m%s\x1b[37m', msg, '\x1b[0m')
    })

