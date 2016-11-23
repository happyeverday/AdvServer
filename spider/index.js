let xlsx = require("node-xlsx");
let loader = require('./spider.js')
let list = xlsx.parse('./dataSet.xlsx')
let fs = require('fs')

for(let i of list){
    for(let j of i.data){
        if(j[1]){
            j[1] = j[1].replace('/','')
            loader(j[1],true)
            console.log(`spider.js running on ${j[1]}`)
        }
    }
}

let index = 0

let req = new Promise(function(resolve, reject){
    
})