var bosonnlp = require('bosonnlp');
let Kmeans = require('./Kmeans.js')
let thesaurus = require('./Thesaurus.js')

class TFIDFMeasure {
    constructor(documents, token, initNum) {
        this._boson = new bosonnlp.BosonNLP('0moxc1w6.10525.DxKWkWWZ-ErV')
        this._doc = documents//初始的广告数据
        this._docNum = documents.length//广告数量
        this._wordNum = 0//单词个数
        this._token = token//单词解析器
        this._words = []//词语列表
        this._wordTotalFreq = []
        this._termFreq = []//二维数组，单词i在文章j中出现的频率
        this._docFreq = []//一维数组，单词在多少篇文章中出现
        this._termWeight = []//二维数组，每个单词在每篇文章中的权重
        this._maxTermFreq = []//文章的最大词频
        this._thesaurus = client
        this._advData = []
        this._kmeans = null
        this._K = 3
        this._initNum = initNum
        this.init()
    }
    init() {
        this.getWords(this._doc, this._words)//获取单词列表
        this._wordNum = this._words.length
        //初始化单词的文章出现频率
        for(let i = 0;i < this._wordNum;i++){
            this._docFreq[i] = 0;
        }

        for(let i = 0;i < this._wordNum;i++){
            this._termFreq[i] = []
            for(let j = 0;j < this._docNum;j++)
                this._termFreq[i][j] = 0
        }
        let that = this
        // 过滤出现频率较低的单词
        // this._words = this._words.filter(function(ele,index){
        //     return that._wordTotalFreq[index] >= 10
        // })
        //计算单词频率
        this.GenerateTermFrequency()
    }
    //获取单词
    getWords(docs, wordList){
        for( let doc of docs){
            if(doc){
                for(let titleWord of doc.title){
                    let lower = titleWord.toLowerCase()
                    if(!wordList.includes(lower)){
                        wordList.push(lower)
                        this._wordTotalFreq[wordList.length-1] = 1
                    }
                    else{
                        let index = wordList.indexOf(lower)
                        if(index == -1){
                            continue
                        }
                        this._wordTotalFreq[index]++
                    }
                }
                for(let contentWord of doc.content){
                    let lower = contentWord.toLowerCase()
                    if(!wordList.includes(lower)){
                        wordList.push(lower)
                    }
                }
            }
        }
    }
    //获取当前文档的word频率
    GetWordFrequency(index) {//doc, m, index, resolve1
        let wordList = [], doc = this._doc[index], that = this, m = new Map()

        for(let titleWord of doc.title){
            let lower = titleWord.toLowerCase()
            if(m.has(lower)){
                m[lower] += 3
            }
            else{
                m.set(lower,3)
            }
        }
        for(let contentWord of doc.content){
            let lower = contentWord.toLowerCase()
            if(m.has(lower)){
                m[lower] += 2
            }
            else{
                m.set(lower,2)
            }
        }
        //同义词拓展
        let arr = [...m]
        arr.sort(function(a,b){
            return a[1] < b[1]
        })
        let lastId = Math.min(5,arr.length)
        let finish = 0,existPromise = []
        for(let i = 0;i < lastId;i++){
            existPromise.push(thesaurus.getThesaurus(arr[i][0]))
        }
        let unexistMap = new Map(), unexistPromises = []
        return Promise.all(existPromise).then(function(posts){
            for(let i = 0;i < lastId;i++){
                if(posts[i]){
                    finish++
                    let list = JSON.parse(posts[i])
                    for(let keyword of list){
                        if(that._words.indexOf(keyword[1]) != -1){
                            if(m.has(keyword[1])){
                                m[keyword[1]] = Math.max(arr[i][1] * keyword[0],m[keyword[1]])
                            }
                            else{
                                m.set(keyword[1],arr[i][1] * keyword[0])
                            }
                        }
                    }
                }
                else{
                    unexistPromises.push(new Promise(function(resolve, reject){
                        that._boson.suggest(arr[i][0], function(result){
                            resolve(result)
                        })
                    }))
                    unexistMap.set(unexistPromises.length - 1 ,i)
                }
            }
            if(unexistPromises.length)
                return Promise.all(unexistPromises)
            return []
        }).then(function(posts){
            for(let i = 0;i < posts.length;i++){
               let list = JSON.parse(posts[i])
                if(list.status != 429){
                    let key = arr[unexistMap[i]][0]
                    thesaurus.createThesaurus({
                        key: key,
                        thesaurusList: posts[i]
                    })
                    for(let keyword of list){
                        if(that._words.indexOf(keyword[1]) != -1){
                            if(m.has(keyword[1])){
                                m[keyword[1]] = Math.max(arr[i][1] * keyword[0],m[keyword[1]])
                            }
                            else{
                                m.set(keyword[1],arr[i][1] * keyword[0])
                            }
                        }
                    }
                }
            }
            return m
        }).then(function(m){//根据map计算
            for(let [key, value] of m){
                let wordindex = that._words.indexOf(key)
                if(wordindex == -1){
                    continue
                }
                that._termFreq[wordindex][index] = value
                that._docFreq[wordindex]++
                that._maxTermFreq[index]=Math.max(that._maxTermFreq[index], value)
            }
        }).catch(err => console.log(err))
    }
    GenerateTermFrequency() {
        let finish = [], promises = [], that = this
        for(let i = 0;i < this._docNum;i++){
            this._maxTermFreq[i] = 0.0
            if(this._doc[i] == undefined){
                continue
            }
            promises.push(this.GetWordFrequency(i))
        }
        return Promise.all(promises).then(function(){
            that.GenerateTermWeight()
        }).catch((err) => console.log(err))
    }
    ComputeTermWeight(term, doc) {
        let tf = this._termFreq[term][doc] / this._maxTermFreq[doc]
        let idf = Math.log(this._docNum / this._docFreq[term])
        return tf * idf
    }
    //计算单词的权重IT_IDF
    GenerateTermWeight() {
        for(let i = 0;i < this._wordNum;i++){
            this._termWeight[i] = []
            for(let j = 0;j < this._docNum;j++){
                this._termWeight[i][j] = this.ComputeTermWeight(i, j)
            }
        }
        this.RunKmeans()
    }
    RunKmeans(){
        //kmeans聚类开始,获取每条广告的向量空间数据
        let that = this
        this._advData = []
        for(let i = 0;i < this._docNum;i++){
            this._advData[i] = this.GetTermVector(i)
        }
        //聚类数据初始化
        this._kmeans = new Kmeans(this._advData, this._K, this._initNum)
        //聚类结束
        this._kmeans.start()
        let clusters = that._kmeans._clusters
        for(let cluster of clusters){
            console.log('--------------------------')
            console.log(cluster.members)
            for(let member of cluster.members){
                // console.log(advs[member])
            }
        }
        console.log('--------------------初始化聚类完成------------------')
    }
    //获取总的单词数目
    GetWordNum(){
        return this._wordNum
    }
    //获取单个文档的特征向量
    GetTermVector(advId) {
        let vec = []
        for(let i = 0;i < this._wordNum;i++){
            vec.push(this._termWeight[i][advId])
        }
        return vec
    }
    newAdv(advWords){
        this._doc.push(advWords)
        let index = this._doc.length - 1, that = this
        let m = new Map()
        this._maxTermFreq[index] = 0
        for(let i = 0;i < that._wordNum;i++){
            that._termFreq[i][index] = 0
        }
        return this.GetWordFrequency(index).then(function(){
            for(let i = 0;i < that._wordNum;i++){
                that._termWeight[i][index] = that.ComputeTermWeight(i, index)
            }
            // console.log(that._termFreq[index])
            let vec = that.GetTermVector(index)
            // console.log(vec)
            that._doc.pop()
            //计算完广告的空间向量,进行kmean归类
            return that._kmeans.addAdv(vec)
        })
    }
    insertAdv(adv, advWords){
        adv.advWords = JSON.stringify(advWords)
        this._doc.push(advWords)
        let index = this._doc.length - 1, that = this
        let m = new Map()
        this._maxTermFreq[index] = 0
        for(let i = 0;i < that._wordNum;i++){
            that._termFreq[i][index] = 0
        }
        return this.GetWordFrequency(index).then(function(){
            for(let i = 0;i < that._wordNum;i++){
                that._termWeight[i][index] = that.ComputeTermWeight(i, index)
            }
            let vec = that.GetTermVector(index)
            //计算完广告的空间向量,进行kmean归类
            return that._kmeans.insertAdv(adv, vec)
        })
    }
}

module.exports = TFIDFMeasure