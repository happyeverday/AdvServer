let fs = require('fs')
let iconv = require('iconv-lite')
let Kmeans = require('./Kmeans.js')
let TFIDFMeasure = require('./TFIDFMeasure.js')
let Tokeniser = require('./Tokeniser.js')
let Position = require('./Position.js')
let Time = require('./Time.js')


let advs = []
//读取广告信息
// let content = fs.readFileSync('./input.txt')
// let str = iconv.decode(content, 'UTF-8')
// advs = str.split('\n')
// let advNum = advs.length
//读取广告信息
for(let i = 100;i < 101;i++){
    let content = fs.readFileSync(`./spider/advdata/word/${i}.txt`)
    let list = content.toString().split('\n')
    let subAdvs = list.map(function(ele,index) {
        if(ele){
            return JSON.parse(ele)
        }
    })
    advs = advs.concat(subAdvs)
}
let advNum = advs.length
let token = new Tokeniser()
let pos = new Position()
let time = new Time()
let tf = new TFIDFMeasure(advs, token)
let wordNum = tf.getWordNum()
let K = 3
let data = []
for(let i = 0;i < advNum;i++){
    data[i] = tf.GetTermVector(i)
}
console.log(data)
let kmeans = new Kmeans(data, K)
kmeans.start()
let clusters = kmeans._clusters
for(let cluster of clusters){
    console.log('--------------------------')
    console.log(cluster.members)
    for(let member of cluster.members){
        // console.log(advs[member])
    }
}

//新增了一个广告
let adv = {
    x: 100,
    y:100,
    title: '时尚资讯网站，全球时尚设计资讯平台，帮助企业',
    content: '时尚资讯网站，POP服饰流行前线，全球时尚设计资讯平台，设计师选择。提供服装行业专业资讯信息，帮助企业/设计师及时把握未..www.pop-fashion.com 2016-11- 67条评价 - 广告'
}
function postAdv(){
    //切分广告文本
    let advWords = token.cut(adv)
    //获取广告向量
    let advVec = td.newAdv(advWords)
    //由三种相关度加权，计算广告与待投放屏幕相关程度，给出相关度最大的前五名，供用户选择
    let contentInterfix = kmeans.newAdv(advVec)
    let positionInterfix = pos.newAdv(adv)
    let timeInterfix = time.newAdv(adv)
    return [1,2,3,4,5]
}

function createAdv(){

}