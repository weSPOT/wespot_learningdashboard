var http = require('http');

var RESTful = {};

RESTful.doGET = function(res, host, path) {

    var options = {
        host: host,
        port: 80,
        path: path,
        method: 'GET'
    };
    var lastChunk = "";
    var totalData = [];
    var dataPerPage = "";
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });

    var fetchRequest = function (result) {

        result.setEncoding('utf8');
        result.on('data', function (chunk) {
            dataPerPage += chunk;
            lastChunk = chunk;

        });
        result.on('end', function () {
            totalData = totalData.concat(JSON.parse(dataPerPage));

            res.write(JSON.stringify(totalData));
            res.end();
            return;

        });
    }

    var req = http.request(options, fetchRequest);


    req.end();
    return;
}


exports.RESTful = RESTful;
