var bosonnlp = require('bosonnlp');
let fs = require('fs')


class Partition{
  constructor(){
    this.nlp = new bosonnlp.BosonNLP('0moxc1w6.10525.DxKWkWWZ-ErV');
    this.uninclude = ['w','wkz','wky','wyz','wyy','wj','ww','wt','wd','wf','wn','wm','ws','wp','wb','wh',
    'r','p','pba','pbei','c','u','uzhe','ule','uguo','ude','usuo','udeng','uyy','udh','uzhi','ulian']
  }
  //切分句子,分词以及切分句子,adv包含title和content
  cut(adv, wordList) {
      let text = [adv.title, adv.content]
      let that = this
      this.nlp.tag(text, function (data) {
        let words = JSON.parse(data);
        if(words[0]){
          //写入分词文件中
          let advInfo = {}
          advInfo.title = words[0].word.filter(function(ele,i){
            let tag = words[0].tag[i]
            if(that.uninclude.includes(tag)){
              return false
            }
            return true
          })
          advInfo.content = words[1].word.filter(function(ele,i){
            let tag = words[1].tag[i]
            if(that.uninclude.includes(tag)){
              return false
            }
            return true
          })
          let writeStr = JSON.stringify(advInfo) + '\n'
          //写入文件
          fs.appendFile(`./advdata/word/${i}.txt`, writeStr, 'utf-8', function (err) {
            if (err) {
                console.log(err);
            }
          })
        }
      });
  }
}

let p = new Partition()
//把文本读进来
let i = 35
fs.readFile(`./advdata/data/${i}.txt`,'utf-8',function(err, data) {
  if(err){
    console.log(err)
  }
  let advs = data.split('\n')
  advs = advs.filter(function(ele,index){
    return ele.includes('{')
  })
  let advlist = advs.map(function(ele,index){
    if(ele != ''){
      return JSON.parse(ele)
    }
    return false
  })
  for(let adv of advlist){
    p.cut(adv)
  }
})
// p.cut({"title":"专业火锅店管理系统—思迅软件。","words":["火锅店管理系统"],"content":"热点: 火锅店管理系统优势: 专业的售后服务 | 提供专业的总部"})
module.exports = Partition