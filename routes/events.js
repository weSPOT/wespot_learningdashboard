var db = require('../dbConnection.js').db;

exports.list = function(req, res){
    db.collection('events', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.username = function(req, res){
    var username = req.params.username;
    //console.log('Retrieving event: ' + username);
    db.collection('events', function(err, collection) {
        collection.find({'username': username}).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.username_verb = function(req, res){
    var username = req.params.username;
    var verb = req.params.verb;
    //console.log('Retrieving event: ' + username + " " + verb);
    db.collection('events', function(err, collection) {
        collection.find({'username': username, 'verb': verb}).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.verb = function(req, res){
    var verb = req.params.verb;
    //console.log('Retrieving event: ' + verb);
    db.collection('events', function(err, collection) {
        collection.find({'verb': verb}).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.starttime = function(req, res){
    var starttime = req.params.starttime();
    //console.log('Retrieving event: ' + starttime);
    db.collection('events', function(err, collection) {
        collection.find({'starttime': starttime}).toArray(function(err, items) {
            res.send(items);
        });
    });
};

