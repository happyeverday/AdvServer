let store = require('./store.js')

class Screen {
    constructor() {
        this._screenCount = 0
        store.smembers('screens', function(err,reply){
            if(err){
                reject(err)
            }
            this._screenCount = reply.length
        })
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
    createScreen(info){
        this._screenCount++
        info.id = this._screenCount
        info.using = true
        store.multi()
        .hmset(`screen_${info.id}`,info)
        .sadd('screens', info.id)
        .exec(this.multiCallback)
    }
    deleteScreen(id){
        this._screenCount--
        store.hset(`screen_${id}`, 'using', false, callback)
    }
    getScreen(id){
        return new Promise(function(resolve, reject){
            store.hgetall(`screen_${id}`, function(err, reply){
                if(err){
                    console.log(err)
                }
                resolve(reply)
            })
        })
    }
    getScreenCount(){
        return new Promise(function(resolve ,reject){
            store.smembers('screens', function(err,reply){
                if(err){
                    reject(err)
                }
                resolve(reply.length)
            })
        })
    }
    getScreens(){
        let that = this
        return new Promise(function(resolve, reject){
            store.smembers('screens', function(err,reply){
                if(err){
                    reject(err)
                }
                resolve(reply)
            })
        }).then(function(reply){
            let count = reply.length
            let promises = reply.map(function(member){
                return that.getScreen(member)
            })
            return Promise.all(promises)
        })
    }
    positionInterfix(pos){//计算地理位置相似度
        //对于scrrens列表中的每一项进行遍历
        return this.getScreens()
            .then(function(info){
                let lat = (Math.PI / 180) * pos.lat, lng = (Math.PI / 180) * pos.lng
                let distance = info.map(function(ele, index){
                    if(ele.using == 'false'){
                        return -1
                    }
                    let lat1 = (Math.PI / 180) * ele.lat,
                        lng1 = (Math.PI / 180) * ele.lng,
                        R = 6371000
                    return Math.acos(Math.sin(lat1)*Math.sin(lat)+Math.cos(lat1)*Math.cos(lat)*Math.cos(lng1-lng))*R
                })
                let maxDis = Math.max(...distance)
                let list = distance.map(function(ele, index){
                    if(ele == 0) return 0
                    return maxDis / ele
                })
                let maxInterfix = Math.max(...list) + 1
                let interfix = list.map(function(ele){
                    if(ele == 0)
                        return 1
                    return ele / maxInterfix
                })
                return interfix
            })
    }
    peopleFlowInterfix() {//人流量性价比，越大越好，
        return this.getScreens()
            .then(function(info){
                let peopleFlow = info.map(function(ele, index){
                    if(ele.using == 'false'){
                        return -1
                    }
                    return ele.peopleFlow / ele.money
                })
                let maxMoney = Math.max(...peopleFlow)
                let interfix = peopleFlow.map(function(ele, index){
                    return ele / maxMoney
                })
                return interfix
            })
    }
    timeInterfix(adv) {//时间相似度计算,越大越好
        return this.getScreens()
            .then(function(info){
                let len = adv.endhour - adv.beginhour
                let interfix = info.map(function(ele, index){
                    if(ele.using == 'false'){
                        return -1
                    }
                    if(ele.beginhour > adv.endhour || ele.endhour < adv.beginhour){
                        return 0
                    }
                    let time = (Math.min(ele.endhour, adv.endhour) - Math.max(ele.beginhour, adv.beginhour)) / len
                    return time < 0 ? 0 : time
                })
                return interfix
            })
    }
}

module.exports  = new Screen()