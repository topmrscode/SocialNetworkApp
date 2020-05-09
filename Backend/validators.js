var create_user = function create_user_validators(user){
    if (user.username == undefined) {
        return "Username is required"
    }
    if (user.username.length < 2 || user.username.length >20 ){
        return "Username field must have minimum 2 letters"
    }
    if (user.email == undefined) {
        return "Email is required"
    }
    if (user.password == undefined) {
        return "Password is required"
    }
    if (user.password.length < 5) {
        return "Password field must have minimum 5 letters"
    }
    if (user.gender == undefined) {
        return "Gender is required"
    }
    if (user.gender != "male" && user.gender != "female") {
        return "Gender field is not recognized"
    }
    return ""
}

var modify_user = function modify_user_validators(user){
    if (user.username.length < 2 || user.username.length >20 ){
        return "Username field must have minimum 2 letters"
    }
    if (user.email == undefined) {
        return "Email is required"
    }
    return ""
}

var create_tweet = function create_tweet_validators(tweet){
    if (tweet.content.length > 140){
        return "140 characters maximum allowed."
    }
    return ""
}
exports.create_user = create_user;
exports.modify_user = modify_user;
exports.create_tweet = create_tweet;

