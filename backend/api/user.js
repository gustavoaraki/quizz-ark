const bcrypt = require('bcrypt-nodejs')

module.exports = app => {
    const { existsOrError, notExistsOrError, equalOrError } = app.api.validation

    const encryptPassword = password => {
        const salt = bcrypt.genSaltSync(10)
        return bcrypt.hashSync(password, salt)
    }

    const save = async (req, res) => {
        const user = { ...req.body}

        if(req.params.id) user.id = req.params.id
        
        console.log(user)

        try{
            existsOrError(user.name, "Nome não informado")
            existsOrError(user.email, "Email não informado")
            existsOrError(user.password, "Senha não informada")
            existsOrError(user.confirmPassword, "Confirmação de senha inválida")
            equalOrError(user.password, user.confirmPassword,
                "Senhas não conferem!")
            
            const userFromDb = await app.db('users')
                .where({ email: user.email }).first()
                        
            if (!user.id){
                notExistsOrError(userFromDb, "Usuário já cadastrado")
            }
        } catch(msg) {
            return res.status(400).send(msg)
        }
        
        user.password = encryptPassword(user.password)

        delete user.confirmPassword

        if (user.id) {
            app.db('users')
                .update(user)
                .where({ id: user.id })
                .then( _ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }else {
            app.db('users')
                .insert(user)
                .then( _ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
    }

    const get = (req, res) => {
        app.db('users')
            .select('id', 'name', 'email', 'admin')
            .then(users => res.json(users))
            .catch(err => res.status(500).send(err))
    }

    const getById = (req, res) => {
        app.db('users')
            .select('id', 'name', 'email', 'admin')
            .where({ id: req.params.id })
            .first()
            .then(users => res.json(users))
            .catch(err => res.status(500).send(err))
    }

    const remove = async (req, res) => {
        try{
            const articles = await app.db('articles')
                .where({ userId: req.params.id })
            
            notExistsOrError(articles, 'Usuário possui artigos.')

            const rowsUpdated = await app.db('users')
                .update({ deletedAt: new Date() })
                .where({ id: req.params.id})

            existsOrError(rowsUpdated, 'Usuário não encontrado.')

            res.status(204).send()
        }catch(msg){
            res.status(400).send(msg)
        }
    }

    const active = (req, res) => {
        app.db('users')
            .update({ deletedAt: null })
            .where({ id: req.params.id })
            .then(_ => res.status(200).send())
            .catch(err => res.status(500).send(err))
    }

    return { save, get, getById, remove, active}
}