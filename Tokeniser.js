var bosonnlp = require('bosonnlp');
// boson = new bosonnlp.BosonNLP('0moxc1w6.10525.DxKWkWWZ-ErV')

class Tokeniser {
    constructor(){
        this.nlp = new bosonnlp.BosonNLP('0moxc1w6.10525.DxKWkWWZ-ErV');
        this.uninclude = ['w','wkz','wky','wyz','wyy','wj','ww','wt','wd','wf','wn','wm','ws','wp','wb','wh',
        'r','p','pba','pbei','c','u','uzhe','ule','uguo','ude','usuo','udeng','uyy','udh','uzhi','ulian']
    }
  //切分句子,分词以及切分句子,adv包含title和content
      cut(adv) {
          let text = [adv.title, adv.content]
          let that = this
          return new Promise(function(resolve, reject){
              that.nlp.tag(text, function (data) {
                let words = JSON.parse(data);
                let info = {}
                if(words[0]){
                  info.title = words[0].word.filter(function(ele,i){
                    let tag = words[0].tag[i]
                    if(that.uninclude.includes(tag)){
                      return false
                    }
                    return true
                  })
                  info.content = words[1].word.filter(function(ele,i){
                    let tag = words[1].tag[i]
                    if(that.uninclude.includes(tag)){
                      return false
                    }
                    return true
                  })
                }
                resolve(info)
              });
          })
      }
}

module.exports = Tokeniser
