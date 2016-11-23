let https = require('https')
let http = require('http')
let fs = require('fs')
let cheerio = require('cheerio')
let request = require('request')
let iconv = require('iconv-lite')

function load(keyword,extented,url){
  let title = keyword
  let writeStr = ''
  keyword = encodeURIComponent(keyword)
  console.log(keyword)
  if(extented){
    url = `http://www.baidu.com/s?wd=${keyword}`
  }
  http.get(url, function (res) {
    let html = ''
    res.setEncoding('utf-8')
    res.on('data', function(chunk) {
      html += chunk
    })
    res.on('end',function() {
      let $ = cheerio.load(html)
      let advs = $('[data-click*=rsv_srcid]')
      let count = 0
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
        fs.appendFile('./advdata/' + 'data' + '.txt', writeStr, 'utf-8', function (err) {
          if (err) {
              console.log(err);
          }
        });
        if(extented){
          let links = $('#rs').children('table').first().children().first()
          for(let tmp = 0; tmp < 3; tmp++){
            let tr = links.children().first()
            for(let th1 = 0;th1 < 5;th1++){
              let halflink = tr.children().first().attr('href')
              if(halflink){
                let perLink = 'http://www.baidu.com' + halflink
                load(title, false, perLink)
              }
              tr = tr.next();
            }
            links = links.next()
          }
        }
      }
    })
  })
}
// load('手游',true, '')
module.exports = load