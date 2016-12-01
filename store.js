let redis = require('redis')

client = redis.createClient();
client.on('ready',function(err){
    if(err){
        console.log(err)
    }
    console.log('redis is running')
})
module.exports = client