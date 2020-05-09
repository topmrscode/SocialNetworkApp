var mongodb = require('mongodb');
var app_main = require('./app');
var errors = require('./errors');
var validators = require('./validators');
var utils = require('./utils');
var passwordHash = require('password-hash');
var jwt = require('jsonwebtoken');

// gestion des avatars
var tab_women = [
    "/women1.png", "/women2.png", "/women3.png","/women4.png","/women5.png"
]
var tab_men = [ 
    "/men1.png", "/men2.png", "/men3.png","/men4.png","/men5.png"
]

// CREATE - REGISTER 
app_main.app.post('/users', function (req, res) {

    var rst = {
        data : null,
        error : null
    }
    // etape 1 : recuperer les donnes du formulaire 
    var user = {
        username : req.body.username,
        email : req.body.email,
        password : req.body.password,
        gender : req.body.gender,
        admin : false,
        created_at: Date.now(),
        bio : ""
    }
    if (user.gender == "female") {
        var idx = utils.get_nbr(5)
        user.avatar = tab_women[idx] 
    }
    if (user.gender == "male") {
        var idx = utils.get_nbr(5)
        user.avatar = tab_men[idx]
    }
    // etape 2 : verifier les donnes 
    var err = validators.create_user(user)
    if (err != ""){
        rst.error = err
        res.end(JSON.stringify(rst))
        return
    }

    var password_conf = req.body.password_conf
    if (user.password != password_conf) {
        rst.error = errors.ERROR_INVALID_PASSWORDCONF
        res.end(JSON.stringify(rst))
        return
    }
    user.password = passwordHash.generate(user.password)

    // etape 3 : stocker l utilisateur en base de donnee
    app_main.getDBO().collection("users").insertOne(user, function(err, result){
        if (err || result == null) {
            rst.error = errors.ERROR_INTERNAL_SERVER
            res.end(JSON.stringify(rst))
            return
        }
    // etape 4 : retourner le user cree sous format Json
        rst.data = user
        res.end(JSON.stringify(rst))
        return
    })
}) 


// READ - LIST ALL USERS 
app_main.app.get('/users', app_main.verify_auth, function (req, res) {
    var rst = {
        data : null,
        error : null
    };

    // MAINTENANT :
    // result = [
    //     {
    //         username: "vincent",
    //         id: 1,
    //         email: "vincent@gmail.com"
    //     }
    //     {
    //         username: "laura",
    //         id: 2,
    //         email: "laura@gmail.com"
    //     }
    //     {
    //         username: "laurent",
    //         id: 3,
    //         email: "laurent@gmail.com"
    //     }
    // ]

    // APRES : 
        // result = [
    //     {
    //         username: "vincent",
    //         id: 1,
    //         email: "vincent@gmail.com",
    //         follow_you: true
    //         you_follow: true
    //     }
    //     {
    //         username: "laura",
    //         id: 2,
    //         email: "laura@gmail.com"
    //         follow_you: true
    //         you_follow: false
    //     }
    //     {
    //         username: "laurent",
    //         id: 3,
    //         email: "laurent@gmail.com"
    //         follow_you: false
    //         you_follow: true
    //     }
    // ]

    app_main.getDBO().collection('users').find({}).toArray(function(err, result) {
        if (err || result == null) {
            rst.error = errors.ERROR_INTERNAL_SERVER
            res.end(JSON.stringify(rst))
            return
        }
        result.forEach((element,index) => {
            app_main.getDBO().collection('blocks').find({blocker_id : new mongodb.ObjectID(result[index]._id), blocked_id : new mongodb.ObjectID(res.locals.c_user._id)}).toArray(function(err, result_blocker) {
                if (!err && result_blocker.length != 0) {      
                    result[index].block_you = true;
                }
                else {
                    result[index].block_you = false;
                }  

            })
            app_main.getDBO().collection('blocks').find({blocked_id: new mongodb.ObjectID(result[index]._id), blocker_id : new mongodb.ObjectID(res.locals.c_user._id)}).toArray(function(err, result_blocked) {
                if (!err && result_blocked.length != 0) {      
                    result[index].you_block= true;
                }
                else {
                    result[index].you_block = false;
                }
            })
            app_main.getDBO().collection('follows').find({follower_id: new mongodb.ObjectID(result[index]._id), followed_id : new mongodb.ObjectID(res.locals.c_user._id)}).toArray(function(err, result_follower) {
                if (!err && result_follower.length != 0) {      
                    result[index].follow_you = true;
                }
                else {
                    result[index].follow_you = false;
                }  
            })
            app_main.getDBO().collection('follows').find({followed_id: new mongodb.ObjectID(result[index]._id), follower_id : new mongodb.ObjectID(res.locals.c_user._id)}).toArray(function(err, result_followed) {
                if (!err && result_followed.length != 0) {      
                    result[index].you_follow = true;
                }
                else {
                    result[index].you_follow = false;
                }
                if (index == (result.length - 1)) {
                    setTimeout(function(){
                        rst.data = result;
                        res.end(JSON.stringify(rst));
                        return
                    },500);
                }
            })
        })
    })
})

// READ - GET USER BY ITS ID
// recuperer l'id de l'user d'apres l id dans lurl associe puis les donnees de l'user de cet id
app_main.app.get('/users/:_id', app_main.verify_auth, function (req, res) {
    var rst = {
        data : null,
        error : null
    }

    var user_id = req.params._id
    app_main.getDBO().collection('users').find({_id : new mongodb.ObjectID(user_id)}).toArray(function(err, result) {
        if (err || result == null) {
            rst.error = errors.ERROR_INTERNAL_SERVER
            res.end(JSON.stringify(rst))
            return
        }
        else {
            rst.data = result[0];
            res.end(JSON.stringify(rst))
            return 
        }
    })
})

// UPDATE 
app_main.app.post('/users/:_id', app_main.verify_auth, function (req, res) {
    var rst = {
        data : null,
        error : null
    }

    // etape 1 : recuperation des donnes du formulaire
    var user_id = req.params._id
    var user = {
        username : req.body.username,
        bio : req.body.bio,
        email : req.body.email
    }
    // etape 2 : gestion des erreurs des champs
    var err = validators.modify_user(user)
    if (err != ""){
        rst.error = err
        res.end(JSON.stringify(rst))
        return
    }

    var myquery = { _id: new mongodb.ObjectID(user_id) };
    var newvalues = {$set: user};
    // etape 3 : update de l'user en DB
    app_main.getDBO().collection('users').updateOne(myquery, newvalues, function(err, result) {
        
        if (err || result == null) {  
            rst.error = errors.ERROR_INTERNAL_SERVER
            res.end(JSON.stringify(rst))
            return  
        }
        else {
            rst.data = user
            res.end(JSON.stringify(rst))
        }
    });
})

// DELETE 
app_main.app.delete('/users/:_id', app_main.verify_auth, function (req, res) {
    var rst = {
        data : null,
        error : null
    }

    var user_id = req.params._id
    app_main.getDBO().collection('users').deleteOne({_id: new mongodb.ObjectID(user_id)});
    rst.data = ""
    res.end(JSON.stringify(rst))
})