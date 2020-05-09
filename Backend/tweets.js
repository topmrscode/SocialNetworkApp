var mongodb = require('mongodb');
var app_main = require('./app');
var errors = require('./errors');
var validators = require('./validators');

// CREATE
app_main.app.post('/tweets', app_main.verify_auth, function(req, res){

    var rst = {
        data : null,
        error : null
    }
    // recuperer les donnes du formulaire
    // recuperer l'id de l user grace au token 
    var tweet = {
        content : req.body.content,
        user_id : res.locals.c_user._id,
        created_at: Date.now()
    }
    // verifier les donnes 
    var err = validators.create_tweet(tweet)
    if (err != ""){
        rst.error = err
        res.end(JSON.stringify(rst))
        return
    }
    // stocker en db 
    app_main.getDBO().collection("tweets").insertOne(tweet, function(err, result){
        if (err || result == null) {
            rst.error = errors.ERROR_INTERNAL_SERVER
            res.end(JSON.stringify(rst))
            return
        }
    // retourner le tweet cree sous format Json
        rst.data = tweet
        res.end(JSON.stringify(rst))
        return
    })
})

// UPDATE 
app_main.app.post('/tweets/:tweet_id', app_main.verify_auth, function(req, res){

    var rst = {
        data : null,
        error : null
    }
    // recuperer les donnes du formulaire
    // recuperer l'id de l user grace au token 
    var tweet_id = req.params.tweet_id
    var tweet = {
        content : req.body.content,

    }
    // etape 2 : gestion des erreurs des champs
    var err = validators.create_tweet(tweet)
    if (err != ""){
        rst.error = err
        res.end(JSON.stringify(rst))
        return
    }

    var myquery = { _id: new mongodb.ObjectID(tweet_id) };
    var newvalues = {$set: tweet};
    // etape 3 : update du tweet en DB
    app_main.getDBO().collection('tweets').updateOne(myquery, newvalues, function(err, result) {
        if (err || result == null) {  
            rst.error = errors.ERROR_INTERNAL_SERVER
            res.end(JSON.stringify(rst))
            return  
        }
        else {
            rst.data = tweet
            res.end(JSON.stringify(rst))
        }
    });
})


// READ - LIST ALL TWEETS EN FONCTION DE L'ID DE L'USER
app_main.app.get('/users/:user_id/tweets', app_main.verify_auth, function(req, res){

    var rst = {
        data : null,
        error : null
    }
    var user_id = req.params.user_id
    var tweets = []
    app_main.getDBO().collection("tweets").find({user_id : new mongodb.ObjectID(user_id)}).toArray(function(err, result){
        if (err || result == null){
            rst.error = errors.ERROR_INTERNAL_SERVER
            res.end(JSON.stringify(rst))
            return
        }
        else {
            // tous mes twwets, je les met dans la tableau tweets
            if (result.length == 0) {
                rst.data = []
                res.end(JSON.stringify(rst));
                return
            }
            result.forEach((item, index) => {
                app_main.getDBO().collection('users').find({_id: new mongodb.ObjectID(user_id)}).toArray(function(err, result_tweet_author) {
                    if (err) {
                        rst.error = errors.ERROR_INTERNAL_SERVER
                        res.end(JSON.stringify(rst))
                        return            
                    }

                    item.user = result_tweet_author[0]
                })
                item.comments = [];
                app_main.getDBO().collection('comments').find({tweet_id: new mongodb.ObjectID(item._id)}).toArray(function(err, result_comments) {
                    if (!err) {
                        result_comments.forEach((element, index) => {
                            // Pour chacun de ses tweet, on cherche l'auteur en fonction de son ID
                            app_main.getDBO().collection('users').find({_id: new mongodb.ObjectID(element.user_id)}).toArray(function(err, result_u) {
                                if (!err) {
                                    let usr = result_u[0]
                                    element.user = usr;
                                }
                            });
                        })
                        comments = result_comments;
                        item.comments = comments;
                    }
                    
                });
                if(index == result.length -1){
                    setTimeout(function(){
                        tweets = tweets.concat(result)
                        rst.data = tweets
                        res.end(JSON.stringify(rst));
                        return
                    },500);
                }
            
            });
            

        }
    })
})

// READ - GET TWEET EN FONCTION DE SON ID
app_main.app.get('/tweets/:_id', app_main.verify_auth, function(req, res){

    var rst = {
        data : null,
        error : null
    }
    var tweet_id = req.params._id
    app_main.getDBO().collection("tweets").findOne({_id : new mongodb.ObjectID(tweet_id)}, function(err, result){

        if (err || result == null){
            rst.error = errors.TWEET_NOT_FOUND
            res.end(JSON.stringify(rst))
            return
        }
        rst.data = result
        res.end(JSON.stringify(rst))
        return
    })
})

// DELETE - 
app_main.app.delete('/tweets/:_id', app_main.verify_auth, function(req, res){

    var rst = {
        data : null,
        error : null
    }
    var tweet_id = req.params._id
    app_main.getDBO().collection("tweets").deleteOne({_id : new mongodb.ObjectID(tweet_id)}, function(err, result){
        if (err || result == null){
            rst.error = errors.TWEET_NOT_FOUND
            res.end(JSON.stringify(rst))
            return
        }
        else {
            app_main.getDBO().collection("comments").remove({tweet_id : new mongodb.ObjectID(tweet_id)}, function(err, result){
                if (err || result == null){
                    rst.error = errors.TWEET_NOT_FOUND
                    res.end(JSON.stringify(rst))
                    return
                }       
            })
            rst.data = ""
            res.end(JSON.stringify(rst))
            return
        }
        
    })
})

// SEARCH
app_main.app.get('/search/:tag', app_main.verify_auth, function(req, res){

    var rst = {
        data : null,
        error : null
    }
    var tag = "#" + req.params.tag
    var tweets = []
    app_main.getDBO().collection("tweets").find({content: {$regex: tag}}).toArray(function(err, result) {
        if (result.length == 0) {
            rst.data = []
            res.end(JSON.stringify(rst));
            return
        }
        else {
            result.forEach((item, index) => {
                app_main.getDBO().collection('users').find({_id: new mongodb.ObjectID(item.user_id)}).toArray(function(err, result_tweet_author) {
                    if (err) {
                        rst.error = errors.ERROR_INTERNAL_SERVER
                        res.end(JSON.stringify(rst))
                        return            
                    }
    
                    item.user = result_tweet_author[0]
                })
                item.comments = [];
                app_main.getDBO().collection('comments').find({tweet_id: new mongodb.ObjectID(item._id)}).toArray(function(err, result_comments) {
                    if (!err) {
                        result_comments.forEach((element, index) => {
                            // Pour chacun de ses tweet, on cherche l'auteur en fonction de son ID
                            app_main.getDBO().collection('users').find({_id: new mongodb.ObjectID(element.user_id)}).toArray(function(err, result_u) {
                                if (!err) {
                                    let usr = result_u[0]
                                    element.user = usr;
                                }
                            });
                        })
                        comments = result_comments;
                        item.comments = comments;
                    }
                    
                });
                if(index == result.length -1){
                    setTimeout(function(){
                        tweets = tweets.concat(result)
                        rst.data = tweets
                        res.end(JSON.stringify(rst));
                        return
                    },500);
                }
            
            });
        }
    })
        

})
