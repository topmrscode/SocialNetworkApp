var mongodb = require('mongodb');
var app_main = require('./app');
var errors = require('./errors')
var passwordHash = require('password-hash');
var jwt = require('jsonwebtoken');

// LOGIN
app_main.app.post('/login', function(req, res) {
    var user = {
        email : req.body.email,
        password : passwordHash.generate(req.body.password)
    }
    var rst = {
        data : null,
        error : null
    }
    // etape 1 : verifier que l'user existe et que le password correspond
    app_main.getDBO().collection("users").findOne({email : req.body.email}, function(err, result) {
        if (err || result == null) {
            rst.error = errors.ERROR_USER_NOT_FOUND
            res.end(JSON.stringify(rst))
            return
        }
        if (passwordHash.verify(req.body.password, result.password)) {
            var token = jwt.sign({ user: result }, 'keyofjwt');
            rst.data = {
                "token" : token,
                "user" : result
            }               
            // etape 2 : creer une session dans ma collection session
            app_main.getDBO().collection("sessions").insertOne({token : token, user_id : new mongodb.ObjectID(result._id)})
        }
        else {
            rst.error = errors.ERROR_INVALID_PASSWORD
        }
        res.end(JSON.stringify(rst))
    })
})

// LOGOUT
app_main.app.get('/logout', app_main.verify_auth, function(req, res) {
    var rst = {
        data : null,
        error : null
    }
    //  recuperation du token dans l'url
    let tok = req.query.token
    // suppression du token en db
    app_main.getDBO().collection('sessions', function(err, collection) {
        if (err){
            rst.error = errors.ERROR_INTERNAL_SERVER
            res.end(JSON.stringify(rst))
            return
        }
        collection.deleteOne({token: tok});
    });

    rst.data = ""
    res.end(JSON.stringify(rst))
})