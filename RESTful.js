var http = require('http');

var RESTful = {};

RESTful.doGET = function(host, path, callback) {

    var options = {
        host: host,
        port: 80,
        path: path,
        method: 'GET'
    };
    var lastChunk = "";
    var totalData = [];
    var dataPerPage = "";


    var fetchRequest = function (result) {

        result.setEncoding('utf8');
        result.on('data', function (chunk) {
            dataPerPage += chunk;
            lastChunk = chunk;

        });
        result.on('end', function () {
            totalData = totalData.concat(JSON.parse(dataPerPage));
            callback(totalData);


        });
    }

    var req = http.request(options, fetchRequest);


    req.end();
    return;
}


exports.RESTful = RESTful;
