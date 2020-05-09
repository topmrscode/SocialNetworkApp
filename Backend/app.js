//------------------------------ REQUIRES AND VARIABLES ----------------------------
const express = require('express')
var bodyParser = require('body-parser');
var errors = require('./errors');

const app = express()
const port = 4242


// bodyparser.json() permet de parser le body des requetes PUT, PATCH et POST en JSON
app.use(bodyParser.json());
app.use(function(req, res, next) {
    // Indique au frontend que l'on va lui repondre en JSON
    res.setHeader('Content-Type', 'application/json');
    next();
})
app.use(bodyParser.urlencoded({ extended: true }));
// Ce middleware permet d'accepter les requetes CORS (cross Origin  request security ) : requetes qui viennent dautres domaines
// Ca permet a notre frontend de nous contacter
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Midllware qui permet de verifier que l user est connecte ou non et de lui envoyer une erreur sil ne l'est pas
exports.verify_auth = function(req, res, next){
    var rst = {
        data : null,
        error : null
    }

    // On recupere le token qui est dans l'URL sous la forme d'un query parameter
    // Exemple : https://localhost:4242/users?token=montoken
    let tok = req.query.token
    // Si il y a un token, on va le chercher dans la collection session afin de trouver la session correspondante
    // Une fois que l'on a la session, on va chercher le user associé grace au user_id qui est dans la session
    if (tok == undefined) {
        rst.error = errors.ERROR_NOT_LOG
        res.end(JSON.stringify(rst))
        return
    }    
    dbo.collection("sessions").findOne({token : tok},function(err, result) {
        if (err || result == null){
            rst.error = errors.ERROR_NOT_LOG
            res.end(JSON.stringify(rst))
            return
        }
        dbo.collection("users").findOne({_id: result.user_id}, function(err, rst_user) {
            if (err == null && rst_user != null) {
                // locals => un dictionnaire cree par express qui permet de balader mes variables
                // de mon midllware a mon handler 
                res.locals.c_user = rst_user
                next();
            } else {
                rst.error = errors.ERROR_NOT_LOG
                res.end(JSON.stringify(rst))
                return                
            }
        })
    })
}
// variable pour faire une requete a la db
var dbo;

// permet de recuperer la variable dbo dans les autres fichiers via getDBO
exports.getDBO = function() {
    return dbo;
};

// permet de changer la valeur de la variable dbo dans les autres fichiers via setDBO
exports.setDBO = function(_dbo) {
    dbo = _dbo
};


exports.app = app;

var mongodb = require('./mongodb');
var users = require('./users');
var auth = require('./auth');
var tweets = require('./tweets');
var comments = require('./comments');
var follows = require('./follows'); 
var feed = require('./feed');
var blocks = require('./blocks'); 




app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
