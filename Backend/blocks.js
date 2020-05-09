var mongodb = require('mongodb');
var app_main = require('./app');
var errors = require('./errors');
var validators = require('./validators');

//READ
// BLOQUER UNE PERSONNE
app_main.app.get('/blocks/:user_id', app_main.verify_auth, function(req, res){

    var rst = {
        data : null,
        error : null
    }

    var blocking = {
        blocked_id : req.params.user_id,
        blocker_id : res.locals.c_user._id
    }

    app_main.getDBO().collection('blocks').insertOne({blocked_id :  new mongodb.ObjectID(blocking.blocked_id), blocker_id :  new mongodb.ObjectID(blocking.blocker_id)}, function(err, result){
        if (err || result == null) {
            rst.error = errors.ERROR_INTERNAL_SERVER
            res.end(JSON.stringify(rst))
            return
        }
        rst.data = blocking
        res.end(JSON.stringify(rst))
        // {
        //     "data": {
        //         "blocked_id": "5ea8775ccc8f482744be9039",
        //         "blocker_id": "5ea4ad000d20c26575f23c70"
        //     },
        //     "error": null
        // }
        return
    })
})

// ARRETER DE BLOQUER UNE PERSONNE
app_main.app.get('/unblock/:user_id', app_main.verify_auth, function(req, res){
    var rst = {
        data : null,
        error : null
    }
    var user_id = req.params.user_id
    var c_user_id = res.locals.c_user._id

    app_main.getDBO().collection('blocks').deleteOne({blocked_id :  new mongodb.ObjectID(user_id), blocker_id :  new mongodb.ObjectID(c_user_id)}, function(err, result){
        if (err || result == null) {
            rst.error = errors.ERROR_INTERNAL_SERVER
            res.end(JSON.stringify(rst))
            return
        }
        rst.data = ""
        res.end(JSON.stringify(rst))
        return
    })    
})


// LISTER TOUTES LES PERSONNES BLOQUEES PAR CURRENT USER
app_main.app.get('/blocking', app_main.verify_auth, function(req, res){
    var rst = {
        data : null,
        error : null
    }
    var c_user_id = res.locals.c_user._id

    app_main.getDBO().collection('blocks').find({blocker_id :  new mongodb.ObjectID(c_user_id)}).toArray(function(err, result){
        if (err || result == null) {
            rst.error = errors.ERROR_INTERNAL_SERVER
            res.end(JSON.stringify(rst))
            return
        }
        result.forEach((element,index) => {
            app_main.getDBO().collection('users').find({_id: new mongodb.ObjectID(result[index].blocked_id)}).toArray(function(err, result_blocked) {
                if (err) {
                    rst.error = errors.ERROR_INTERNAL_SERVER;
                    res.end(JSON.stringify(rst));
                    return
                }
                result[index].blocked = result_blocked[0];
                if (index == (result.length - 1)) {
                    setTimeout(() => {
                        rst.data = result;
                        res.end(JSON.stringify(rst));
                        return
                        // {
                        //     "data": [
                        //         {
                        //             "_id": "5ea93f94fe99845e007f0230",
                        //             "blocked_id": "5ea8775ccc8f482744be9039",
                        //             "blocker_id": "5ea4ad000d20c26575f23c70",
                        //             "blocked": {
                        //                 "_id": "5ea8775ccc8f482744be9039",
                        //                 "username": "caroline",
                        //                 "email": "caroline@gmail.com",
                        //                 "password": "sha1$cd1886af$1$198f8dc6b1d53d74845996fa3988187eb7e028a0",
                        //                 "gender": "female",
                        //                 "admin": false,
                        //                 "created_at": 1588098908670,
                        //                 "bio": "",
                        //                 "avatar": "https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight2&accessoriesType=Blank&hairColor=Red&facialHairType=Blank&clotheType=Overall&clotheColor=PastelGreen&eyeType=Default&eyebrowType=Default&mouthType=Smile&skinColor=Yellow"
                        //             }
                        //         },
                        //         {
                        //             "_id": "5ea93fc6fe99845e007f0231",
                        //             "blocked_id": "5ea801dd3b9a0bed9dc73cd0",
                        //             "blocker_id": "5ea4ad000d20c26575f23c70",
                        //             "blocked": {
                        //                 "_id": "5ea801dd3b9a0bed9dc73cd0",
                        //                 "username": "claire",
                        //                 "email": "claire.baudean@orange.fr",
                        //                 "password": "sha1$44926513$1$0ff945d51bc9de4d0737e6e7fd3be0fab6e4af4a",
                        //                 "gender": "female",
                        //                 "admin": false,
                        //                 "created_at": 1588068829121,
                        //                 "bio": "",
                        //                 "avatar": "https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraightStrand&accessoriesType=Blank&hairColor=SilverGray&facialHairType=Blank&clotheType=Overall&clotheColor=PastelRed&eyeType=Default&eyebrowType=RaisedExcited&mouthType=Default&skinColor=Tanned"
                        //             }
                        //         }
                        //     ],
                        //     "error": null
                        // }
                    }, 1000);
                }
            })
        })
    }) 

    
})


// LISTER TOUTES LES PERSONNES qui ont BLOQUEES le CURRENT USER
app_main.app.get('/users/:user_id/blocking', app_main.verify_auth, function(req, res){
    var rst = {
        data : null,
        error : null
    }
    var user_id = req.params.user_id
    var c_user_id = res.locals.c_user._id

    app_main.getDBO().collection('blocks').find({blocked_id :  new mongodb.ObjectID(c_user_id)}).toArray(function(err, result){
        if (err || result == null) {
            rst.error = errors.ERROR_INTERNAL_SERVER
            res.end(JSON.stringify(rst))
            return
        }
        result.forEach((element,index) => {
            app_main.getDBO().collection('users').find({_id: new mongodb.ObjectID(result[index].blocker_id)}).toArray(function(err, result_blocked) {
                if (err) {
                    rst.error = errors.ERROR_INTERNAL_SERVER;
                    res.end(JSON.stringify(rst));
                    return
                }
                result[index].blocked = result_blocked[0];
                if (index == (result.length - 1)) {
                    setTimeout(() => {
                        rst.data = result;
                        res.end(JSON.stringify(rst));
                        return
                    }, 500);
                }
            })
        })
    }) 
})

