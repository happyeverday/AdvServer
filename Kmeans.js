// import { Cluster } from './Cluster.js'

let Cluster = require('./Cluster.js')

class Kmeans {
    constructor(data,K) {
        this._data = data//原始数据
        this._k = K//聚类数量
        this._advCount = data.length//原始数量
        this._clusters = []
        this._distance = []
        this._nearestCluster = []//记录每个文档离那一个聚类中心点最近
        this._clusterAssignments = []
        //初始化每个聚类
        let alreadyChoose = []
        for(let i = 0;i < this._k;i++){
            let tmp = -1
            tmp =  Math.floor(Math.random() * this._advCount)
            while(alreadyChoose.includes(tmp)){
                tmp =  Math.floor(Math.random() * this._advCount)
            }
            alreadyChoose.push(tmp)
            this._clusters.push(new Cluster(tmp, data[tmp]))
            this._clusterAssignments[tmp] = i
        }
    }
    start() {
        let times = 0;
        while(true) {
            console.log(`第${times++}次迭代-------------`)
            for(let i = 0;i < this._k;i++){
                this._clusters[i].update(this._data)
            }
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
                return
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
}

module.exports = Kmeans