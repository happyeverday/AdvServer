var bosonnlp = require('bosonnlp');
class TFIDFMeasure {
    constructor(documents, token) {
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
        //过滤出现频率较低的单词
        // console.log(this._words.length)
        // this._words = this._words.filter(function(ele,index){
        //     return that._wordTotalFreq[index] >= 5
        // })
        // console.log(this._words.length)
        //计算单词频率
        this.GenerateTermFrequency()
        //计算单词权重
        this.GenerateTermWeight()
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
    GetWordFrequency(doc, m) {
        let wordList = []
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
    }
    GenerateTermFrequency() {
        for(let i = 0;i < this._docNum;i++){
            this._maxTermFreq[i] = 0.0
            let doc = this._doc[i]
            let m = new Map()
            if(doc == undefined){
                continue
            }
            this.GetWordFrequency(doc, m)//m代表doc中每个单词出现了几次
            for(let [key, value] of m){
                let index = this._words.indexOf(key)
                if(index == -1){
                    continue
                }
                this._termFreq[index][i] = value
                this._docFreq[index]++
                this._maxTermFreq[i]=Math.max(this._maxTermFreq[i], value)
            }
        }
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
    }
    //获取总的单词数目
    getWordNum(){
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
}

module.exports = TFIDFMeasure