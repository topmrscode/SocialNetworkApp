var mongodb = require('mongodb');
var app_main = require('./app');
var errors = require('./errors');
var validators = require('./validators');

//READ
// SUIVRE UNE PERSONNE
app_main.app.get('/follow/:user_id', app_main.verify_auth, function(req, res){

    var rst = {
        data : null,
        error : null
    }

    var following = {
        followed_id : req.params.user_id,
        follower_id : res.locals.c_user._id
    }

    app_main.getDBO().collection('follows').insertOne({followed_id :  new mongodb.ObjectID(following.followed_id), follower_id :  new mongodb.ObjectID(following.follower_id)}, function(err, result){
        if (err || result == null) {
            rst.error = errors.ERROR_INTERNAL_SERVER
            res.end(JSON.stringify(rst))
            return
        }
        rst.data = following
        res.end(JSON.stringify(rst))
        return
    })
})

// ARRETER DE SUIVRE UNE PERSONNE
app_main.app.get('/unfollow/:user_id', app_main.verify_auth, function(req, res){
    var rst = {
        data : null,
        error : null
    }
    var user_id = req.params.user_id
    var c_user_id = res.locals.c_user._id

    app_main.getDBO().collection('follows').deleteOne({followed_id :  new mongodb.ObjectID(user_id), follower_id :  new mongodb.ObjectID(c_user_id)}, function(err, result){
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


// LISTER TOUTES LES PERSONNES QUI SUIVENT CURRENT USER
app_main.app.get('/followers', app_main.verify_auth, function(req, res){
    var rst = {
        data : null,
        error : null
    }
    var c_user_id = res.locals.c_user._id
   
    app_main.getDBO().collection('follows').find({followed_id :  new mongodb.ObjectID(c_user_id)}).toArray(function(err, result){
       
        if (err || result == null) {
            rst.error = errors.ERROR_INTERNAL_SERVER
            res.end(JSON.stringify(rst))
            return
        }
        result.forEach((element,index) => {
            app_main.getDBO().collection('users').find({_id: new mongodb.ObjectID(result[index].follower_id)}).toArray(function(err, result_follower) {
                if (err) {
                    rst.error = errors.ERROR_INTERNAL_SERVER;
                    res.end(JSON.stringify(rst));
                    return
                }
                result[index].follower = result_follower[0];
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

// LISTER TOUTES LES PERSONNES SUIVIES PAR CURRENT USER
app_main.app.get('/following', app_main.verify_auth, function(req, res){
    var rst = {
        data : null,
        error : null
    }
    var c_user_id = res.locals.c_user._id

    app_main.getDBO().collection('follows').find({follower_id :  new mongodb.ObjectID(c_user_id)}).toArray(function(err, result){
        if (err || result == null) {
            rst.error = errors.ERROR_INTERNAL_SERVER
            res.end(JSON.stringify(rst))
            return
        }
        result.forEach((element,index) => {
            app_main.getDBO().collection('users').find({_id: new mongodb.ObjectID(result[index].followed_id)}).toArray(function(err, result_followed) {
                if (err) {
                    rst.error = errors.ERROR_INTERNAL_SERVER;
                    res.end(JSON.stringify(rst));
                    return
                }
                result[index].followed = result_followed[0];
                if (index == (result.length - 1)) {
                    setTimeout(() => {
                        rst.data = result;
                        res.end(JSON.stringify(rst));
                        return
                    }, 1000);
                }
            })
        })
    }) 
})

// LISTER TOUTES LES PERSONNES QUI SUIVENT USER
app_main.app.get('/users/:user_id/followers', app_main.verify_auth, function(req, res){
    var rst = {
        data : null,
        error : null
    }
    var user_id = req.params.user_id
    app_main.getDBO().collection('follows').find({followed_id :  new mongodb.ObjectID(user_id)}).toArray(function(err, result){
        
        if (err || result == null) {
            rst.error = errors.ERROR_INTERNAL_SERVER
            res.end(JSON.stringify(rst))
            return
        }
        result.forEach((element,index) => {
            app_main.getDBO().collection('users').find({_id: new mongodb.ObjectID(result[index].follower_id)}).toArray(function(err, result_follower) {
                if (err) {
                    rst.error = errors.ERROR_INTERNAL_SERVER;
                    res.end(JSON.stringify(rst));
                    return
                }
                result[index].follower = result_follower[0];
                if (index == (result.length - 1)) {
                    setTimeout(() => {
                        rst.data = result;
                        res.end(JSON.stringify(rst));
                        return
                    }, 1000);
                }
            })
        })
    }) 
})

// LISTER TOUTES LES PERSONNES SUIVIES PAR  USER
app_main.app.get('/users/:user_id/following', app_main.verify_auth, function(req, res){
    var rst = {
        data : null,
        error : null
    }
    var user_id = req.params.user_id

    app_main.getDBO().collection('follows').find({follower_id :  new mongodb.ObjectID(user_id)}).toArray(function(err, result){
        if (err || result == null) {
            rst.error = errors.ERROR_INTERNAL_SERVER
            res.end(JSON.stringify(rst))
            return
        }
        result.forEach((element,index) => {
            app_main.getDBO().collection('users').find({_id: new mongodb.ObjectID(result[index].followed_id)}).toArray(function(err, result_followed) {
                if (err) {
                    rst.error = errors.ERROR_INTERNAL_SERVER;
                    res.end(JSON.stringify(rst));
                    return
                }
                result[index].followed = result_followed[0];
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