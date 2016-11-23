let http = require('http')
let xlsx = require("node-xlsx");
let fs = require('fs')
let cheerio = require('cheerio')
let request = require('request')
let iconv = require('iconv-lite')

let list = xlsx.parse('./dataSet.xlsx')
list = ['网游']
let linkslist = list.map(function(ele){
  let keyword = ele
  keyword = encodeURIComponent(keyword)
  return `http://www.baidu.com/s?wd=${keyword}`
})

let index = 0
let baseLen = linkslist.length

function next(){
  if(index < linkslist.length){
    load(linkslist[index])
    index++;
  }
}
function load(url){
  new Promise(function(resolve, reject) {
      http.get(url, function(res){
      let html = ''
      res.setEncoding('utf-8')
      res.on('data', function(chunk) {
        html += chunk
      })
      res.on('end',function() {
        resolve(html)
      })
    })
  }).then((html) => {
        let $ = cheerio.load(html)
        let advs = $('[data-click*=rsv_srcid]')
        let count = 0
        let writeStr = ''
        advs.each(function(i,elem){
          if(elem.attribs.id){
            count++;
            let info = {}
            let adv = $(`#${elem.attribs.id}`)
            let advTitle = adv.children().first().children().first()
            info.title = advTitle.text()
            // console.log('标题：',advTitle.text())
            let keywords = advTitle.children().first().children('font')
            info.words = []
            keywords.each(function(i,word){
              // console.log(word.children[0].data)
              info.words.push(word.children[0].data)
            })
            let content = adv.children().first().next().children().first()
            info.content = content.text()
            //在文件中写入info
            writeStr += JSON.stringify(info) + '\n'
          }
        })
        console.log(count)
        if(writeStr){
          fs.appendFile('./advdata/' + 'dataSync' + '.txt', writeStr, 'utf-8', function (err) {
            if (err) {
                console.log(err);
            }
          });
          if(index <= baseLen){
            let links = $('#rs').children('table').first().children().first()
            for(let tmp = 0; tmp < 3; tmp++){
              let tr = links.children().first()
              for(let th1 = 0;th1 < 5;th1++){
                let halflink = tr.children().first().attr('href')
                if(halflink){
                  let perLink = 'http://www.baidu.com' + halflink
                  linkslist.push(perLink)
                  // console.log(perLink)
                }
                tr = tr.next();
              }
              links = links.next()
            }
          }
        }
        next()
    })
}

next()