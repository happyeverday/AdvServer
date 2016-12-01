let store = require('./store.js')

//同义词
class Thesaurus{
    constructor(){

    }
    getThesaurus(key){
        return new Promise(function(resolve, reject){
            store.hget('Thesaurus', key, function(err, reply){
                resolve(reply)
            })
        })
    }
    createThesaurus(info){
        return new Promise(function(resolve, reject){
            store.hset('Thesaurus', info.key, info.thesaurusList, function(err, reply){
                resolve(reply)
            })
        })
    }
}

module.exports = new Thesaurus()