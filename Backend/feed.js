var mongodb = require('mongodb');
var app_main = require('./app');
var errors = require('./errors');


// READ - LIST ALL FEED EN FONCTION DE L'ID DE L'USER et DES GENS QU IL SUIT
app_main.app.get('/feed', app_main.verify_auth, function(req, res){

    var rst = {
        data : null,
        error : null
    }
    var tweets = []

    var user_id = res.locals.c_user._id
    // etape 1 : lister tous mes tweets
    app_main.getDBO().collection("tweets").find({user_id : new mongodb.ObjectID(user_id)}).toArray(function(err, result){
        if (err || result == null){
            rst.error = errors.ERROR_INTERNAL_SERVER
            res.end(JSON.stringify(rst))
            return
        }
        else {
            // tous mes twwets, je les met dans la tableau tweets
            result.forEach((item, index) => {
                item.user = res.locals.c_user;
                item.comments = [];
                app_main.getDBO().collection('comments').find({tweet_id: new mongodb.ObjectID(item._id)}).toArray(function(err, result_comments) {
                    if (!err) {
                        result_comments.forEach((item, index) => {
                            // Pour chacun de ses tweet, on cherche l'auteur en fonction de son ID
                            app_main.getDBO().collection('users').find({_id: new mongodb.ObjectID(item.user_id)}).toArray(function(err, result_u) {
                                if (!err) {
                                    let usr = result_u[0]
                                    item.user = usr;
                                }
                            });
                        })
                        comments = result_comments;
                        item.comments = comments;
                    }
                });
            });
            tweets = tweets.concat(result)
        }
    })
    
     // etape 2  trouver tous les gens que je follow
    app_main.getDBO().collection('follows').find({follower_id : new mongodb.ObjectID(user_id)}).toArray(function(err, result_foll) {
        if(!err && result_foll.lenght != 0 ) {
            // etape 2 : pour chaqye personne que je suis, je recupere tous ses tweets
            result_foll.forEach((item, index)=> {
                app_main.getDBO().collection('tweets').find({user_id : new mongodb.ObjectID(item.followed_id)}).toArray(function(err, result_tweet) {
                    if(!err && result_tweet.lenght != 0 )  {
                        // ce Foreach nous permet de boucler sur tous les tweet d'une personne que l'on follow
                        result_tweet.forEach((item, index) => {
                            // Pour chacun de ses tweet, on cherche l'auteur en fonction de son ID
                            app_main.getDBO().collection('users').find({_id: new mongodb.ObjectID(item.user_id)}).toArray(function(err, result_user) {
                                if (!err) {
                                    let usr = result_user[0];
                                    item.user = usr;
                                }
                            });
                            item.comments = [];
                            app_main.getDBO().collection('comments').find({tweet_id: new mongodb.ObjectID(item._id)}).toArray(function(err, result_comments) {
                                if (!err) {
                                    result_comments.forEach((item, index) => {
                                        // Pour chacun de ses tweet, on cherche l'auteur en fonction de son ID
                                        app_main.getDBO().collection('users').find({_id: new mongodb.ObjectID(item.user_id)}).toArray(function(err, result_u) {
                                            if (!err) {
                                                let usr = result_u[0]
                                                item.user = usr;
                                            }
                                        });
                                    })
                                    comments = result_comments;
                                    item.comments = comments;
                                }
                            });
                        });
                        // je mets tous les tweets de la personne dans le tableau tweets qui contient deja mes tweets
                        tweets = tweets.concat(result_tweet)
                    }
                })
                // retourner que si on a parcouru tout le tableau
                if(index == result_foll.length -1){
                    setTimeout(() => {
                        tweets.sort(function(a, b) {
                            // Compare the 2 dates
                            if (a.created_at < b.created_at) return 1;
                            if (a.created_at > b.created_at) return -1;
                            return 0;
                        });
                        rst.data = tweets
                        res.end(JSON.stringify(rst));
                        return
                    }, 500);
                }
                
            })
        }
    })
        setTimeout(() => {
            tweets.sort(function(a, b) {
                // Compare the 2 dates
                if (a.created_at < b.created_at) return 1;
                if (a.created_at > b.created_at) return -1;
                return 0;
            });
            rst.data = tweets
            res.end(JSON.stringify(rst));
            return
        }, 1000);
})
