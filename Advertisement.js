let store = require('./store.js')

class Advertisement{
    constructor(){
        this._advCount = 0
    }
    callback(err,reply){
        if(err){
            console.log(err)
        }
        console.log(reply.toString())
    }
    multiCallback(err, replies){
        if(err){
            console.log(err)
        }
        for(let reply of replies){
            console.log(reply.toString())
        }
    }
    createAdv(info){
        info.comment = 0
        info.sweep = 0
        console.log(info)
        store.multi()
        .hmset(`adv_${info.id}`,info)
        .sadd('advs', info.id)
        .hset('links', info.kmeansId, info.id)
        .exec(this.multiCallback)
    }
    deleteAdv(id){
        store.multi()
        .del(`adv_${id}`)
        .srem('advs', id)
        .hdel('links', info.kmeansId)
        .exec(this.multiCallback)
    }
    getAdv(id){
        return new Promise(function(resolve, reject){
            store.hgetall(`adv_${id}`, function(err, reply){
                if(err){
                    console.log(err)
                }
                resolve(reply)
            })
        })
    }
    getAdvByKmeansId(kmeansId){
        let that = this
        return new Promise(function(resolve, reject){
            store.hget('links', kmeansId, function(err, reply){
                if(err){
                    console.log(err)
                    return
                }
                resolve(reply)
            })
        }).then(function(reply){
            return that.getAdv(reply)
        })
    }
    getAdvs(){
        let that = this
        return new Promise(function(resolve, reject){
            store.smembers('advs', function(err,reply){
                resolve(reply)
            })
        }).then(function(reply){
            let promises = reply.map(function(ele){
                return that.getAdv(ele)
            })
            return Promise.all(promises)
        })
    }
    addComment(id){
        store.hincrby(`adv_${id}`, 'comment', 1, callback)
    }
    addSweep(id){
        store.hincrby(`adv_${id}`, 'sweep', 1, callback)
    }
}

module.exports = new Advertisement()