const app_main = require('./app')

//------------------------------ CONNEXION DB  ----------------------------
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27042/";
MongoClient.connect(url,function(err, client){
    if (err) {
        console.log("Connection failed.")
    }
    else {
        app_main.setDBO(client.db("MicroBloggos"));
        console.log("Connection successful.")
    }
})