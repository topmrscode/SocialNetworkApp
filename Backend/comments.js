var mongodb = require('mongodb');
var app_main = require('./app');
var errors = require('./errors');
var validators = require('./validators');


// CREATE A NEW COMMENT 
app_main.app.post('/tweets/:tweet_id/comments', app_main.verify_auth, function (req, res) {
    var rst = {
        data : null,
        error : null
    }
    var tweets_id = req.params.tweet_id
    var comment = {
        content : req.body.content,
        created_at: Date.now(),
        user_id: res.locals.c_user._id,
    }

    app_main.getDBO().collection("tweets").find({_id : new mongodb.ObjectID(tweets_id)}).toArray(function(err, result_tweet) {
        if (err || result_tweet == null) {
            rst.error = errors.ERROR_TWEET_NOT_FOUND
            res.end(JSON.stringify(rst))
            return
        }
        comment.tweet_id = new mongodb.ObjectID(result_tweet[0]._id)

        app_main.getDBO().collection("comments").insertOne(comment, function(err, result){
            if (err || result == null) {
                rst.error = errors.ERROR_INTERNAL_SERVER
                res.end(JSON.stringify(rst))
                return
            }

            rst.data = comment;
            res.end(JSON.stringify(rst));
            return
        })
    })
}) 


// READ - LIST ALL COMMENTS FOR A GIVEN TWEET
app_main.app.get('/tweets/:tweet_id/comments', app_main.verify_auth, function (req, res) {
    var rst = {
        data : null,
        error : null
    };
    var tweet_id = req.params.tweet_id
    app_main.getDBO().collection("tweets").find({_id : new mongodb.ObjectID(tweet_id)}).toArray(function(err, result_tweet) {
        if (err || result_tweet == null) {
            rst.error = errors.ERROR_TWEET_NOT_FOUND
            res.end(JSON.stringify(rst))
            return
        }

        app_main.getDBO().collection("comments").find({tweet_id: new mongodb.ObjectID(result_tweet[0]._id)}).toArray(function(err, result){
            if (err || result == null) {
                rst.error = errors.ERROR_INTERNAL_SERVER
                res.end(JSON.stringify(rst))
                return
            }

            rst.data = result;
            res.end(JSON.stringify(rst));
            return
        })
    })
})

// UPDATE 
app_main.app.post('/tweets/:tweet_id/comments/:comment_id', app_main.verify_auth, function (req, res) {
    var rst = {
        data : null,
        error : null
    }

    var comment = {
        content : req.body.content,
    }
    var comment_id = req.params.comment_id
    var myquery = { _id: new mongodb.ObjectID(comment_id) };
    var newvalues = {$set: comment};
    app_main.getDBO().collection('comments').updateOne(myquery, newvalues, function(err, result) {
        if (err || result == null) {  
            rst.error = errors.ERROR_INTERNAL_SERVER
            res.end(JSON.stringify(rst))
            return  
        }
        rst.data = comment
        res.end(JSON.stringify(rst))
        return  
    });
})

// DELETE 
app_main.app.delete('/tweets/:tweet_id/comments/:comment_id', app_main.verify_auth, function (req, res) {
    var rst = {
        data : null,
        error : null
    }
    var comment_id = req.params.comment_id
    app_main.getDBO().collection('comments').deleteOne({_id: new mongodb.ObjectID(comment_id)});
    rst.data = ""
    res.end(JSON.stringify(rst))
})