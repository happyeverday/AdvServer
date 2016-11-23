let fs = require('fs')
fs.readFile('./advdata/data.txt','utf-8',function(err, data) {
  if(err){
    console.log(err)
  }
  let advs = data.split('\n')
  advs = advs.filter(function(ele,index){
    return ele.includes('{')
  })
  let len = advs.length
  for(let i = 0;i < len;i++){
              //写入文件
          fs.appendFile('./advdata/data/' + Math.floor(i/100) + '.txt', advs[i] + '\n', 'utf-8', function (err) {
            if (err) {
                console.log(err);
            }
          })
  }
})