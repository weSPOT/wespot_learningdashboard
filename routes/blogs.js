var db = require('../dbConnection.js').db;

exports.list = function(req, res){
    db.collection('blogs', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.blogpost = function(req, res){
    var url = decodeURIComponent(req.params.url);
    console.log('Retrieving blogpost: ' + url);
    db.collection('blogs', function(err, collection) {
        collection.findOne({'object': url},function(err, items) {
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.write(JSON.stringify(items));
            res.end();
        });
    });
};

