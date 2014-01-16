


var mongo = require("mongodb");

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;


var mongoserver = new Server('ensor.cs.kuleuven.be', 27017, {auto_reconnect: true}),
    db = new Db("larae03", mongoserver, {safe:false});
var mongoserver2 = new Server('ensor.cs.kuleuven.be', 27017, {auto_reconnect: true}),
    dbBlogs = new Db("chikul13blogs", mongoserver2, {safe:false});

db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'larae03' database");
        db.collection('students_chi13', {strict:true}, function(err, collection) {
            if (err) {
                console.log("The 'students_chi13' collection doesn't exist");

            }
        });
    }
});

dbBlogs.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'chikul13blogs' database");
        db.collection('blogs', {strict:true}, function(err, collection) {
            if (err) {
                console.log("The 'chikul13blogs' collection doesn't exist");

            }
        });
    }
});

exports.db = db;
exports.dbBlogs = dbBlogs;
