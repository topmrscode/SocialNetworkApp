// generer un nombre aleatoire 
var get_nbr = function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

exports.get_nbr = get_nbr;