let fs = require('fs')
let iconv = require('iconv-lite')
let redis = require('redis')
let express = require('express')
let Kmeans = require('./Kmeans.js')
let TFIDFMeasure = require('./TFIDFMeasure.js')
let Tokeniser = require('./Tokeniser.js')
let screen = require('./Screen.js')
let Time = require('./Time.js')
let Advertisement = require('./Advertisement.js')


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
advs = advs.filter(function(ele){
    return ele != undefined
})
let advNum = advs.length
let token = new Tokeniser()
let time = new Time()

//调用tf*idf和kmeans进行聚类的初始化操作
Advertisement.getAdvs()
.then(function(info){
    for(let adv of info){
        if(adv.advWords){
            let words = JSON.parse(adv.advWords)
            advs.push(words)
        }
    }
    return tf = new TFIDFMeasure(advs, token, advNum)
}).catch(err => console.log(err))

var app = express()
app.get('/', function (req, res) {
    //新增了一个广告,在req中的信息
    let adv = {
        beginhour: 10,
        endhour: 16,
        lat: 20,
        lng: 40,
        x: 100,
        y:100,
        money: 100,
        peopleFlow: 100,
        title: '时尚资讯网站，全球时尚设计资讯平台，帮助企业',
        content: '时尚资讯网站，POP服饰流行前线，全球时尚设计资讯平台，设计师选择。提供服装行业专业资讯信息，帮助企业/设计师及时把握未..www.pop-fashion.com 2016-11- 67条评价 - 广告'
    }
    //切分广告文本
    let advWords = {}
    let p1 = token.cut(adv).then(function(advWords){
        return tf.newAdv(advWords)////获取聚类相似度,聚类中心相似度
    }), p2 = screen.positionInterfix(adv)//获取地理位置相似度
    ,p3 = peopleFlowInterfix = screen.peopleFlowInterfix(adv)//人流量约束
    ,p4 = timeInterfix = screen.timeInterfix(adv)//获取时间相似度
    // res.send('hello')
    // p1.then(res => console.log(1,res)).catch(err => console.log(err))
    // p2.then(res => console.log(2,res)).catch(err => console.log(err))
    // p3.then(res => console.log(3,res)).catch(err => console.log(err))
    // p4.then(res => console.log(4,res)).catch(err => console.log(err))
    Promise.all([p1, p2 ,p3, p4])
    .then(function(posts){
        console.log(posts)
        //相关度加权，计算广告与待投放屏幕相关程度，给出相关度最大的前五名，供用户选择
        let result = []
        for(let i = 0;i < posts[0].length;i++){
            if(posts[3][i] > 0){
                result.push({
                    id: i,
                    interfix: posts[0][i] + posts[1][i] + posts[2][i] + posts[3][i]
                })
            }
        }
        res.send(JSON.stringify(result))
        res.end()
    })
})
//广告确定插入,重新计算聚类，跟踪反馈情况
app.get('/insert', function(req,res){
    let adv = {
        id: 1,
        beginhour: 10,
        endhour: 16,
        screenId: 1,
        lat: 20,
        lng: 40,
        x: 100,
        y:100,
        money: 100,
        peopleFlow: 100,
        title: '时尚资讯网站，全球时尚设计资讯平台，帮助企业',
        content: '时尚资讯网站，POP服饰流行前线，全球时尚设计资讯平台，设计师选择。提供服装行业专业资讯信息，帮助企业/设计师及时把握未..www.pop-fashion.com 2016-11- 67条评价 - 广告'
    }
    token.cut(adv).
    then(advWords => tf.insertAdv(adv ,advWords))
    .then(() => {
        res.send('ok')
    })
})
app.listen(3000)