module.exports = app => {

    function existsOrError(value, msg) {
        if (!msg){
            msg = "Value is null or empty!"
        }

        if (!value) throw msg
        if (Array.isArray(value) && value.length === 0) throw msg
        if (typeof value === 'string' && !value.trim()) throw msg
    }
    
    function notExistsOrError(value, msg) {
        try{
            existsOrError(value, msg)
        } catch(msg){
            return 
        }
        throw msg
    }
    
    function equalOrError(valueA, valueB, msg) {
        if(valueA !== valueB) throw msg
    }

    function isExist(value) {
        if (!value) return false
        if (Array.isArray(value) && value.length === 0) return false
        if (typeof value === 'string' && !value.trim()) return false

        return true
    }

    return { existsOrError, notExistsOrError, equalOrError, isExist}
}