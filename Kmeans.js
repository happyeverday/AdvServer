// import { Cluster } from './Cluster.js'

let Cluster = require('./Cluster.js')
let Advertisement = require('./Advertisement.js')
let Screen = require('./Screen.js')

class Kmeans {
    constructor(data, K, initNum) {
        this._data = data//原始数据
        this._k = K//聚类数量
        this._initCount = initNum
        this._clusters = []
        this._distance = []
        this._nearestCluster = []//记录每个文档离那一个聚类中心点最近
        this._clusterAssignments = []
        this._advs = []
        this.links = new Map()
        this._screenCount = 0
        this._advCount = this._data.length
        //初始化每个聚类
        let alreadyChoose = []
        for(let i = 0;i < this._k;i++){
            let tmp = -1
            tmp =  Math.floor(Math.random() * this._advCount)
            while(alreadyChoose.includes(tmp)){
                tmp =  Math.floor(Math.random() * this._advCount)
            }
            alreadyChoose.push(tmp)
            this._clusters.push(new Cluster(tmp, this._data[tmp]))
            this._clusterAssignments[tmp] = i
        }
    }
    start() {
        let times = 0;
        this._advCount = this._data.length
        while(true) {
            console.log(`第${times++}次迭代-------------`)
            for(let i = 0;i < this._k;i++){
                this._clusters[i].update(this._data)
                // console.log(this._clusters[i].members.length)
            }
            // console.log(this._clusters)
            // 计算每一个数据和每一类中心点的距离
            for(let i = 0;i < this._advCount;i++){
                this._distance[i] = []
                for(let j = 0;j < this._k;j++){
                    this._distance[i][j] = this.getDistance(this._data[i], this._clusters[j].mean)
                }
            }
            //更新最近聚类中心
            for(let i = 0;i < this._advCount;i++){
                this._nearestCluster[i] = this.getNearest(i)
            }

            //检测聚类结束
            let unFinish = 0
            for(let i = 0;i < this._advCount;i++){
                if(this._nearestCluster[i] != this._clusterAssignments[i]){
                    unFinish++
                }
            }
            //聚类结束
            if(unFinish == 0){
                break
            }

            //聚类未结束，重新吧广告划入距离最近的点
            for(let i = 0;i < this._k;i++){
                this._clusters[i].members = []
            }

            for(let i = 0;i < this._advCount;i++){
                let clusterId = this._nearestCluster[i]
                this._clusters[clusterId].members.push(i)
                this._clusterAssignments[i] = clusterId
            }
        }
        //聚类结束，将每个广告属于哪个聚类中心存入
        this.links.clear()
        for(let i = 0;i < this._k;i++){
            for(let index of this._clusters[i].members){
                this.links.set(index, i)
            }
        }
    }
    getDistance(data, center){//获取两个向量之间的距离
        if(data.length != center.length){
            console.log('error:数据点和中心点长度不想等')
            return -1
        }
        let res = 0.0, len = data.length,len1 = 0.0, len2 = 0.0, innerLen = 0.0
        for(let i of data){
            len1 += i * i
        }
        for(let i of center){
            len2 += i * i
        }
        innerLen = Math.sqrt(len1) * Math.sqrt(len2)
        if(innerLen == 0){
            return 1
        }
        for(let i = 0;i < len;i++){
            res += data[i] * center[i]
        }
        return 1 - (res / innerLen)
    }
    getNearest(advIndex) {
        let index = 0,minDis = this._distance[advIndex][0]
        for(let i = 1;i < this._k;i++){
            if(this._distance[advIndex][i] < minDis){
                minDis = this._distance[advIndex][i]
                index = i
            }
        }
        return index
    }
    getAvgInteract(){
        let comment = [],count = [], sweep = [], finish = 0, that = this ,need = 0
        for(let j = 0;j < this._k;j++){
            comment[j] = []
            count[j] = []
            sweep[j] = []
           for(let i = 0;i < this.screenCount;i++){
                comment[j][i] = 0
                count[j][i] = 0
                sweep[j][i] = 0
            }
        }
        return new Promise(function(resolve, reject){
            for(let [key, value] of that.links.entries()){
                if(key >= that._initCount){//获取广告的评论信息
                    need++
                    console.log(key, need)
                    Advertisement.getAdvByKmeansId(key)
                    .then(function(advInfo){
                        finish++;
                        if(advInfo){
                            comment[value][advInfo.screenId] += advInfo.comment
                            count[value][advInfo.screenId] ++
                            sweep[value][advInfo.screenId] += advInfo.sweep
                        }
                        if(finish == need){
                            let info = {
                                comment: comment,//评论情况
                                sweep: sweep,//扫码查看情况
                                count: count//屏幕投放情况
                            }
                            resolve(info)
                        }
                    })
                }
            }
            if(finish == need){
                let info = {
                    comment: comment,//评论情况
                    sweep: sweep,//扫码查看情况
                    count: count//屏幕投放情况
                }
                resolve(info)
            }
        })
    }
    addAdv(vec){
        let distance = [],avgComment = [], avgSweep = [], avgCount = [], info = {},that = this
        let effectComment = 0.3, effectSweep = 0.2, effectCount = 0.5
        for(let i = 0;i < this._k;i++){
            distance.push(this.getDistance(vec, this._clusters[i].mean))
        }
        return Screen.getScreenCount()
        .then(function(screenCount){
            that.screenCount = screenCount
            return that.getAvgInteract()
        })
        .then(function(info){
                avgComment = info.comment
                avgSweep = info.sweep
                avgCount = info.count
                let interfix = []
                for(let i = 0;i < that.screenCount;i++){
                    interfix[i] = 0;
                }
                for(let i = 0;i < that.screenCount;i++){
                    for(let j = 0;j < that._k;j++){
                        let tmpIn = distance[j] *(avgComment[j][i] * effectComment + avgSweep[j][i] * effectSweep + avgCount[j][i] * effectCount)
                        interfix[i] = Math.max(tmpIn,interfix[i])
                    }
                }
                return interfix
            })
    }
    insertAdv(info, vec){
        //重新进行聚类划分
        info.vec = JSON.stringify(vec)
        this._data.push(vec)
        this.start()
        console.log('长度',this._initCount ,this.links)
        info.kmeansId = this.links[this._data.length - 1]
        Advertisement.createAdv(info)
    }
}

module.exports = Kmeans