var bosonnlp = require('bosonnlp');
// boson = new bosonnlp.BosonNLP('0moxc1w6.10525.DxKWkWWZ-ErV')

class Tokeniser {
    constructor() {
        this.nlp = new bosonnlp.BosonNLP('0moxc1w6.10525.DxKWkWWZ-ErV');
        this._stopWordsList =["的", "我们","要","自己","之","将","“","”","，","（","）","后","应","到","某","后","个","是","位","新","一","两","在","中","或","有","更","好",""]
    }
    cut(adv){
        let text = [adv.title, adv.content]
        var that = this
        this.nlp.boson.tag(text, function(data){
            let words = JSON.parse(data);
            return {
                title: words[0].word,
                content: words[1].word
            }
        })
    }
}

module.exports = Tokeniser
